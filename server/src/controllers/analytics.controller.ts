import type { Request, Response } from 'express'
import { analyticsService } from '../services/analytics.service.js'
import { asyncHandler } from '../middlewares/asyncHandler.js'
import { param } from '../utils/params.js'

export const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const data = await analyticsService.getDashboardOverview(param(req.params.businessId))
  res.json({ success: true, data })
})

export const getTrends = asyncHandler(async (req: Request, res: Response) => {
  const days = Number(req.query.days) || 30
  const data = await analyticsService.getBookingTrends(param(req.params.businessId), days)
  res.json({ success: true, data })
})

export const getPopularServices = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 5
  const data = await analyticsService.getPopularServices(param(req.params.businessId), limit)
  res.json({ success: true, data })
})

export const getStaffPerformance = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10
  const data = await analyticsService.getStaffPerformance(param(req.params.businessId), limit)
  res.json({ success: true, data })
})

export const getRevenue = asyncHandler(async (req: Request, res: Response) => {
  const data = await analyticsService.getRevenueOverview(param(req.params.businessId))
  res.json({ success: true, data })
})
