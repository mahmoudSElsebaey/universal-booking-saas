import { Business } from '../models/Business.js'
import { Service } from '../models/Service.js'
import { Staff } from '../models/Staff.js'
import { Booking } from '../models/Booking.js'
import { ApiError } from '../utils/ApiError.js'
import type { WorkingHoursSlot } from '../types/business.js'
import type { TimeSlot, DayAvailability } from '../types/booking.js'

const DAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

function parseDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getDayName(date: Date): (typeof DAY_NAMES)[number] {
  return DAY_NAMES[date.getDay()]
}

/**
 * Core Availability Engine
 * Considers:
 * - Business working hours
 * - Staff working hours + breaks + days off
 * - Service duration + buffer
 * - Existing bookings (confirmed / pending)
 * - Slot interval from business settings
 */
export class AvailabilityService {
  async getAvailableSlots(params: {
    businessId: string
    serviceId: string
    staffId?: string
    date: string // YYYY-MM-DD
  }): Promise<TimeSlot[]> {
    const { businessId, serviceId, staffId, date } = params

    const [business, service] = await Promise.all([
      Business.findById(businessId),
      Service.findById(serviceId),
    ])

    if (!business || !business.isActive) {
      throw new ApiError(404, 'Business not found')
    }
    if (!service || !service.isActive || service.status !== 'active') {
      throw new ApiError(404, 'Service not found')
    }
    if (service.businessId.toString() !== businessId) {
      throw new ApiError(400, 'Service does not belong to this business')
    }

    const targetDate = parseDateOnly(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Respect min advance hours & max advance days
    const minAdvanceMs = (business.settings.minAdvanceHours || 0) * 60 * 60 * 1000
    const maxAdvanceDays = business.settings.maxAdvanceDays || 60
    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + maxAdvanceDays)

    if (targetDate < today || targetDate > maxDate) {
      return []
    }

    const dayName = getDayName(targetDate)
    const slotInterval = business.settings.slotIntervalMinutes || 30
    const duration = service.duration
    const buffer = service.bufferTime || 0
    const totalBlock = duration + buffer

    // Resolve staff list
    let staffList: any[] = []

    if (staffId) {
      const staff = await Staff.findOne({
        _id: staffId,
        businessId,
        isActive: true,
        status: 'active',
      })
      if (!staff) throw new ApiError(404, 'Staff not found')
      if (
        service.staffRequired &&
        staff.serviceIds.length > 0 &&
        !staff.serviceIds.some((id: any) => id.toString() === serviceId)
      ) {
        throw new ApiError(400, 'Staff does not offer this service')
      }
      staffList = [staff]
    } else if (service.staffRequired) {
      staffList = await Staff.find({
        businessId,
        isActive: true,
        status: 'active',
        $or: [
          { serviceIds: serviceId },
          { serviceIds: { $size: 0 } }, // staff with no restrictions
        ],
      })
    } else {
      // No staff required — generate slots against business hours only
      staffList = [null]
    }

    if (staffList.length === 0) {
      return []
    }

    // Existing bookings for that day (blocking statuses)
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const existingBookings = await Booking.find({
      businessId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] },
      ...(staffId ? { staffId } : {}),
    }).lean()

    const allSlots: TimeSlot[] = []

    for (const staff of staffList) {
      // Determine working window
      let workingHours: WorkingHoursSlot | undefined

      if (staff) {
        // Check days off
        const isDayOff = (staff.daysOff || []).some((d: Date) =>
          isSameDay(new Date(d), targetDate)
        )
        if (isDayOff) continue

        workingHours = staff.workingHours?.find(
          (wh: WorkingHoursSlot) => wh.day === dayName
        )
      }

      // Fall back to business hours
      if (!workingHours || !workingHours.isOpen) {
        workingHours = business.workingHours?.find(
          (wh) => wh.day === dayName
        )
      }

      if (!workingHours || !workingHours.isOpen) continue

      const openMin = timeToMinutes(workingHours.openTime)
      const closeMin = timeToMinutes(workingHours.closeTime)
      const breaks = workingHours.breaks || []

      // Generate candidate slots
      for (let start = openMin; start + duration <= closeMin; start += slotInterval) {
        const end = start + duration
        const endWithBuffer = start + totalBlock

        // Skip if overlaps a break
        const overlapsBreak = breaks.some((b) => {
          const bStart = timeToMinutes(b.start)
          const bEnd = timeToMinutes(b.end)
          return start < bEnd && end > bStart
        })
        if (overlapsBreak) continue

        // Skip if in the past (for today)
        if (isSameDay(targetDate, today)) {
          const now = new Date()
          const nowMin = now.getHours() * 60 + now.getMinutes()
          const minStart = nowMin + (business.settings.minAdvanceHours || 0) * 60
          if (start < minStart) continue
        }

        // Check conflicts with existing bookings for this staff (or any if no staff)
        const hasConflict = existingBookings.some((b) => {
          if (staff && b.staffId && b.staffId.toString() !== staff._id.toString()) {
            return false
          }
          // If no specific staff requested, still check per-staff conflicts
          if (!staffId && staff && b.staffId && b.staffId.toString() !== staff._id.toString()) {
            return false
          }

          const bStart = timeToMinutes(b.startTime)
          const bEnd = timeToMinutes(b.endTime) + (b.bufferTime || 0)

          // Overlap check (including buffer)
          return start < bEnd && endWithBuffer > bStart
        })

        if (hasConflict) continue

        allSlots.push({
          start: minutesToTime(start),
          end: minutesToTime(end),
          available: true,
          staffId: staff?._id?.toString(),
        })
      }
    }

    // Deduplicate by start time if multiple staff (prefer first available)
    if (!staffId) {
      const seen = new Set<string>()
      return allSlots.filter((s) => {
        if (seen.has(s.start)) return false
        seen.add(s.start)
        return true
      })
    }

    return allSlots
  }

  /**
   * Final conflict check right before saving a booking.
   * This is the backend authority — never trust frontend only.
   */
  async hasConflict(params: {
    businessId: string
    staffId?: string
    date: string
    startTime: string
    endTime: string
    bufferTime: number
    excludeBookingId?: string
  }): Promise<boolean> {
    const { businessId, staffId, date, startTime, endTime, bufferTime, excludeBookingId } =
      params

    const targetDate = parseDateOnly(date)
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const startMin = timeToMinutes(startTime)
    const endMin = timeToMinutes(endTime) + bufferTime

    const filter: any = {
      businessId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] },
    }
    if (staffId) filter.staffId = staffId
    if (excludeBookingId) filter._id = { $ne: excludeBookingId }

    const bookings = await Booking.find(filter).lean()

    return bookings.some((b) => {
      const bStart = timeToMinutes(b.startTime)
      const bEnd = timeToMinutes(b.endTime) + (b.bufferTime || 0)
      return startMin < bEnd && endMin > bStart
    })
  }
}

export const availabilityService = new AvailabilityService()
