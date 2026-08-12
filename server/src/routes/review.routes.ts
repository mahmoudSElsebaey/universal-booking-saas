import { Router } from 'express'
import {
  createReview,
  listReviews,
  replyToReview,
  toggleReviewPublish,
} from '../controllers/review.controller.js'
import { authMiddleware, requirePermission } from '../middlewares/authMiddleware.js'
import { validate } from '../middlewares/validateMiddleware.js'
import { z } from 'zod'

const createReviewSchema = z.object({
  businessId: z.string().min(1),
  bookingId: z.string().optional(),
  serviceId: z.string().optional(),
  staffId: z.string().optional(),
  customerName: z.string().min(2).optional(),
  customerEmail: z.string().email().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

const replySchema = z.object({
  reply: z.string().min(1).max(1000),
})

const publishSchema = z.object({
  isPublished: z.boolean(),
})

const router = Router()

// Public list
router.get('/business/:businessId', listReviews)

// Create (auth optional but preferred)
router.post('/', validate(createReviewSchema), createReview)

// Admin
router.post(
  '/business/:businessId/:id/reply',
  authMiddleware,
  requirePermission('settings:update'),
  validate(replySchema),
  replyToReview
)

router.patch(
  '/business/:businessId/:id/publish',
  authMiddleware,
  requirePermission('settings:update'),
  validate(publishSchema),
  toggleReviewPublish
)

export default router
