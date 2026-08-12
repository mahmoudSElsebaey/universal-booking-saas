import type { Request, Response } from 'express'
import { reviewService } from '../services/review.service.js'
import { asyncHandler } from '../middlewares/asyncHandler.js'

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.create({
    ...req.body,
    customerId: req.user?.userId,
    customerName:
      req.body.customerName ||
      `${req.user?.email || 'Customer'}`,
  })
  res.status(201).json({
    success: true,
    message: 'Review submitted',
    data: review,
  })
})

export const listReviews = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.list(req.params.businessId, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    publishedOnly: req.query.publishedOnly !== 'false',
    minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
  })
  res.json({
    success: true,
    data: result.items,
    pagination: result.pagination,
    summary: result.summary,
  })
})

export const replyToReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.reply(
    req.params.id,
    req.params.businessId,
    req.body.reply
  )
  res.json({ success: true, data: review })
})

export const toggleReviewPublish = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.togglePublish(
    req.params.id,
    req.params.businessId,
    req.body.isPublished
  )
  res.json({ success: true, data: review })
})
