import type { Request, Response } from 'express'
import { notificationService } from '../services/notification.service.js'
import { asyncHandler } from '../middlewares/asyncHandler.js'
import { param } from '../utils/params.js'

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const result = await notificationService.listForUser(req.user!.userId, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    unreadOnly: req.query.unreadOnly === 'true',
  })
  res.json({
    success: true,
    data: result.items,
    pagination: result.pagination,
    unreadCount: result.unreadCount,
  })
})

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await notificationService.markAsRead(
    param(req.params.id),
    req.user!.userId
  )
  res.json({ success: true, data: notification })
})

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllAsRead(req.user!.userId)
  res.json({ success: true, message: 'All notifications marked as read' })
})


export const getPreferences = asyncHandler(async (req: Request, res: Response) => {
  const prefs = await notificationService.getPreferences(req.user!.userId)
  res.json({ success: true, data: prefs })
})

export const updatePreferences = asyncHandler(async (req: Request, res: Response) => {
  const prefs = await notificationService.updatePreferences(req.user!.userId, req.body)
  res.json({ success: true, message: 'Preferences updated', data: prefs })
})
