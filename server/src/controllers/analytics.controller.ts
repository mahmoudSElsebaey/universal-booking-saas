import type { Request, Response } from 'express'
import { analyticsService } from '../services/analytics.service.js'
import { asyncHandler } from '../middlewares/asyncHandler.js'

export const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const data = await analyticsService.getDashboardOverview(req.params.businessId)
  res.json({ success: true, data })
})

export const getTrends = asyncHandler(async (req: Request, res: Response) => {
  const days = Number(req.query.days) || 30
  const data = await analyticsService.getBookingTrends(req.params.businessId, days)
  res.json({ success: true, data })
})

export const getPopularServices = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 5
  const data = await analyticsService.getPopularServices(req.params.businessId, limit)
  res.json({ success: true, data })
})

export const getStaffPerformance = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10
  const data = await analyticsService.getStaffPerformance(req.params.businessId, limit)
  res.json({ success: true, data })
})

export const getRevenue = asyncHandler(async (req: Request, res: Response) => {
  const data = await analyticsService.getRevenueOverview(req.params.businessId)
  res.json({ success: true, data })
})
