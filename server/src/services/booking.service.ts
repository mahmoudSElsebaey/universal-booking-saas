import { Booking } from '../models/Booking.js'
import { Service } from '../models/Service.js'
import { Staff } from '../models/Staff.js'
import { Business } from '../models/Business.js'
import { ApiError } from '../utils/ApiError.js'
import { emailService } from './email.service.js'
import { availabilityService } from './availability.service.js'
import type { CreateBookingInput } from '../types/booking.js'
import type { BookingStatus } from '../types/booking.js'

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function parseDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export class BookingService {
  async create(input: CreateBookingInput, createdBy?: string) {
    const { businessId, serviceId, staffId, date, startTime } = input

    // 1. Validate business
    const business = await Business.findById(businessId)
    if (!business || !business.isActive) {
      throw new ApiError(404, 'Business not found')
    }
    if (!business.settings.allowOnlineBooking) {
      throw new ApiError(403, 'Online booking is disabled for this business')
    }

    // 2. Validate service
    const service = await Service.findById(serviceId)
    if (!service || !service.isActive || service.status !== 'active') {
      throw new ApiError(404, 'Service not found')
    }
    if (service.businessId.toString() !== businessId) {
      throw new ApiError(400, 'Service does not belong to this business')
    }

    // 3. Validate staff if required / provided
    if (service.staffRequired && !staffId) {
      throw new ApiError(400, 'Staff selection is required for this service')
    }

    if (staffId) {
      const staff = await Staff.findOne({
        _id: staffId,
        businessId,
        isActive: true,
        status: 'active',
      })
      if (!staff) throw new ApiError(404, 'Staff not found')
    }

    // 4. Calculate end time
    const startMin = timeToMinutes(startTime)
    const endMin = startMin + service.duration
    const endTime = minutesToTime(endMin)

    // 5. Final conflict check (backend is the authority)
    const conflict = await availabilityService.hasConflict({
      businessId,
      staffId,
      date,
      startTime,
      endTime,
      bufferTime: service.bufferTime || 0,
    })

    if (conflict) {
      throw new ApiError(409, 'This time slot is no longer available')
    }

    // 6. Create booking
    const booking = await Booking.create({
      businessId,
      serviceId,
      staffId: staffId || undefined,
      customerId: input.customerId || undefined,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      date: parseDateOnly(date),
      startTime,
      endTime,
      duration: service.duration,
      bufferTime: service.bufferTime || 0,
      price: service.price,
      currency: service.currency || business.settings.currency || 'EGP',
      status: 'confirmed',
      notes: input.notes,
      createdBy: createdBy || undefined,
    })

    const populated = await Booking.findById(booking._id)
      .populate('serviceId', 'name nameAr duration price')
      .populate('staffId', 'firstName lastName avatar title')
      .populate('businessId', 'name slug')

    // Fire-and-forget confirmation email
    try {
      const svcName =
        typeof populated?.serviceId === 'object' && populated?.serviceId
          ? (populated.serviceId as any).name
          : 'Service'
      const bizName =
        typeof populated?.businessId === 'object' && populated?.businessId
          ? (populated.businessId as any).name
          : 'Business'
      await emailService.sendBookingConfirmed({
        to: input.customerEmail,
        customerName: input.customerName,
        serviceName: svcName,
        date,
        time: startTime,
        businessName: bizName,
      })
    } catch (e) {
      console.error('[booking] email failed', e)
    }

    return populated
  }

  async list(
    businessId: string,
    options: {
      page?: number
      limit?: number
      status?: BookingStatus
      staffId?: string
      serviceId?: string
      dateFrom?: string
      dateTo?: string
      search?: string
      sort?: string
    } = {}
  ) {
    const page = options.page || 1
    const limit = Math.min(options.limit || 20, 100)
    const skip = (page - 1) * limit

    const filter: any = { businessId }

    if (options.status) filter.status = options.status
    if (options.staffId) filter.staffId = options.staffId
    if (options.serviceId) filter.serviceId = options.serviceId

    if (options.dateFrom || options.dateTo) {
      filter.date = {}
      if (options.dateFrom) filter.date.$gte = parseDateOnly(options.dateFrom)
      if (options.dateTo) filter.date.$lte = parseDateOnly(options.dateTo)
    }

    if (options.search) {
      filter.$or = [
        { customerName: { $regex: options.search, $options: 'i' } },
        { customerEmail: { $regex: options.search, $options: 'i' } },
        { customerPhone: { $regex: options.search, $options: 'i' } },
      ]
    }

    const sort: any = options.sort
      ? { [options.sort.replace('-', '')]: options.sort.startsWith('-') ? -1 : 1 }
      : { date: -1, startTime: -1 }

    const [items, total] = await Promise.all([
      Booking.find(filter)
        .populate('serviceId', 'name nameAr duration price')
        .populate('staffId', 'firstName lastName avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getById(id: string, businessId?: string) {
    const filter: any = { _id: id }
    if (businessId) filter.businessId = businessId

    const booking = await Booking.findOne(filter)
      .populate('serviceId', 'name nameAr duration price')
      .populate('staffId', 'firstName lastName avatar title')
      .populate('businessId', 'name slug')

    if (!booking) throw new ApiError(404, 'Booking not found')
    return booking
  }

  async updateStatus(
    id: string,
    businessId: string,
    status: BookingStatus,
    meta?: { reason?: string; cancelledBy?: string }
  ) {
    const booking = await Booking.findOne({ _id: id, businessId })
    if (!booking) throw new ApiError(404, 'Booking not found')

    booking.status = status

    if (status === 'cancelled') {
      booking.cancelledAt = new Date()
      booking.cancellationReason = meta?.reason
      if (meta?.cancelledBy) booking.cancelledBy = meta.cancelledBy as any
    }

    await booking.save()
    return booking
  }

  async cancel(
    id: string,
    businessId: string,
    reason?: string,
    cancelledBy?: string
  ) {
    return this.updateStatus(id, businessId, 'cancelled', {
      reason,
      cancelledBy,
    })
  }

  async reschedule(
    id: string,
    businessId: string,
    newDate: string,
    newStartTime: string,
    newStaffId?: string
  ) {
    const oldBooking = await Booking.findOne({ _id: id, businessId })
    if (!oldBooking) throw new ApiError(404, 'Booking not found')

    if (['cancelled', 'completed', 'no_show'].includes(oldBooking.status)) {
      throw new ApiError(400, 'Cannot reschedule this booking')
    }

    // Create new booking
    const newBooking = await this.create(
      {
        businessId,
        serviceId: oldBooking.serviceId.toString(),
        staffId: newStaffId || oldBooking.staffId?.toString(),
        date: newDate,
        startTime: newStartTime,
        customerName: oldBooking.customerName,
        customerEmail: oldBooking.customerEmail,
        customerPhone: oldBooking.customerPhone,
        notes: oldBooking.notes,
        customerId: oldBooking.customerId?.toString(),
      },
      oldBooking.createdBy?.toString()
    )

    // Mark old as rescheduled
    oldBooking.status = 'rescheduled'
    await oldBooking.save()

    // Link
    if (newBooking) {
      ;(newBooking as any).rescheduledFrom = oldBooking._id
      await (newBooking as any).save?.()
    }

    return newBooking
  }

  async getCustomerBookings(customerEmail: string, businessId?: string) {
    const filter: any = {
      customerEmail: customerEmail.toLowerCase(),
      status: { $nin: ['cancelled'] },
    }
    if (businessId) filter.businessId = businessId

    return Booking.find(filter)
      .populate('serviceId', 'name nameAr duration price')
      .populate('staffId', 'firstName lastName avatar')
      .populate('businessId', 'name slug')
      .sort({ date: 1, startTime: 1 })
      .lean()
  }
}

export const bookingService = new BookingService()
