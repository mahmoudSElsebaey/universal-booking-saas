import type { Request, Response } from 'express'
import { bookingService } from '../services/booking.service.js'
import { availabilityService } from '../services/availability.service.js'
import { asyncHandler } from '../middlewares/asyncHandler.js'
import { param } from '../utils/params.js'

export const getAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { businessId, serviceId, staffId, date } = req.query as {
    businessId: string
    serviceId: string
    staffId?: string
    date: string
  }

  const slots = await availabilityService.getAvailableSlots({
    businessId,
    serviceId,
    staffId,
    date,
  })

  res.json({
    success: true,
    data: {
      date,
      slots,
    },
  })
})

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.create(
    {
      ...req.body,
      customerId: req.user?.userId,
    },
    req.user?.userId
  )

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: booking,
  })
})

export const listBookings = asyncHandler(async (req: Request, res: Response) => {
  const businessId = param(req.params.businessId)
  const result = await bookingService.list(businessId, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    status: req.query.status as any,
    staffId: req.query.staffId as string,
    serviceId: req.query.serviceId as string,
    dateFrom: req.query.dateFrom as string,
    dateTo: req.query.dateTo as string,
    search: req.query.search as string,
    sort: req.query.sort as string,
  })

  res.json({
    success: true,
    data: result.items,
    pagination: result.pagination,
  })
})

export const getBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.getById(
    param(req.params.id),
    param(req.params.businessId)
  )
  res.json({ success: true, data: booking })
})

export const updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.updateStatus(
    param(req.params.id),
    param(req.params.businessId),
    req.body.status,
    {
      reason: req.body.reason,
      cancelledBy: req.user?.userId,
    }
  )
  res.json({
    success: true,
    message: 'Booking status updated',
    data: booking,
  })
})

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.cancel(
    param(req.params.id),
    param(req.params.businessId),
    req.body.reason,
    req.user?.userId
  )
  res.json({
    success: true,
    message: 'Booking cancelled',
    data: booking,
  })
})

export const rescheduleBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.reschedule(
    param(req.params.id),
    param(req.params.businessId),
    req.body.date,
    req.body.startTime,
    req.body.staffId
  )
  res.json({
    success: true,
    message: 'Booking rescheduled',
    data: booking,
  })
})

export const getMyBookings = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.email) {
    return res.status(401).json({ success: false, message: 'Unauthorized' })
  }
  const bookings = await bookingService.getCustomerBookings(req.user.email, {
    customerId: req.user.userId,
  })
  res.json({ success: true, data: bookings })
})
