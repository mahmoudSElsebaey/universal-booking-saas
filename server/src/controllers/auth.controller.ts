import type { Request, Response } from 'express'
import { authService } from '../services/auth.service.js'
import { asyncHandler } from '../middlewares/asyncHandler.js'
import { env } from '../config/env.js'

const REFRESH_COOKIE = 'refreshToken'
const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body)

  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions)

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  })
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body)

  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions)

  res.json({
    success: true,
    message: 'Logged in successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  })
})

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] || req.body.refreshToken
  const tokens = await authService.refresh(token)

  res.cookie(REFRESH_COOKIE, tokens.refreshToken, cookieOptions)

  res.json({
    success: true,
    data: {
      accessToken: tokens.accessToken,
    },
  })
})

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.userId) {
    await authService.logout(req.user.userId)
  }

  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
  })

  res.json({
    success: true,
    message: 'Logged out successfully',
  })
})

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.userId)
  res.json({
    success: true,
    data: user,
  })
})

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body)
  res.json({
    success: true,
    message: result.message,
  })
})

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.body)
  res.json({
    success: true,
    message: result.message,
  })
})
