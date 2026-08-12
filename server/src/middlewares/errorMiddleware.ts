import type { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError.js'
import { env } from '../config/env.js'

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    })
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.message,
    })
  }

  // Duplicate key
  if ((err as any).code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    })
  }

  console.error('[Error]', err)

  return res.status(500).json({
    success: false,
    message:
      env.nodeEnv === 'production'
        ? 'Internal server error'
        : err.message || 'Internal server error',
  })
}
