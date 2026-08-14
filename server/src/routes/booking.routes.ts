import { Router } from 'express'
import {
  getAvailability,
  createBooking,
  listBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
  getMyBookings,
} from '../controllers/booking.controller.js'
import {
  authMiddleware,
  optionalAuthMiddleware,
  requirePermission,
} from '../middlewares/authMiddleware.js'
import { validate } from '../middlewares/validateMiddleware.js'
import { bookingLimiter } from '../middlewares/rateLimit.js'
import {
  availabilityQuerySchema,
  createBookingSchema,
  updateBookingStatusSchema,
  rescheduleSchema,
} from '../validators/booking.validator.js'

const router = Router()

// Public availability (customers need this)
router.get(
  '/availability',
  validate(availabilityQuerySchema, 'query'),
  getAvailability
)

// Create booking (public or authenticated — optionalAuth links customerId when logged in)
router.post(
  '/',
  bookingLimiter,
  optionalAuthMiddleware,
  validate(createBookingSchema),
  createBooking
)

// Customer own bookings
router.get('/me', authMiddleware, getMyBookings)

// Business admin routes
router.get(
  '/business/:businessId',
  authMiddleware,
  requirePermission('booking:read'),
  listBookings
)

router.get(
  '/business/:businessId/:id',
  authMiddleware,
  requirePermission('booking:read'),
  getBooking
)

router.patch(
  '/business/:businessId/:id/status',
  authMiddleware,
  requirePermission('booking:update'),
  validate(updateBookingStatusSchema),
  updateBookingStatus
)

router.post(
  '/business/:businessId/:id/cancel',
  authMiddleware,
  requirePermission('booking:update'),
  cancelBooking
)

router.post(
  '/business/:businessId/:id/reschedule',
  authMiddleware,
  requirePermission('booking:update'),
  validate(rescheduleSchema),
  rescheduleBooking
)

export default router
