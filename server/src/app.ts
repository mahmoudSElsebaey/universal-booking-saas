import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import { errorMiddleware } from './middlewares/errorMiddleware.js'
import { apiLimiter, authLimiter, bookingLimiter } from './middlewares/rateLimit.js'
import authRoutes from './routes/auth.routes.js'
import businessRoutes from './routes/business.routes.js'
import bookingRoutes from './routes/booking.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import reviewRoutes from './routes/review.routes.js'

const app = express()

// Trust proxy (Railway / Render / Vercel)
app.set('trust proxy', 1)

// Security
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)

// CORS — production-ready
const allowedOrigins = [
  env.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser / same-origin requests
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '1mb' })) // tighter than 10mb for security
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(cookieParser())
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'))

// Global rate limit
app.use('/api/', apiLimiter)

// Health / readiness
app.get('/api/v1/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Booking System API is running',
    timestamp: new Date().toISOString(),
    env: env.nodeEnv,
  })
})

// API routes with specific limiters
app.use('/api/v1/auth', authLimiter, authRoutes)
app.use('/api/v1/businesses', businessRoutes)
app.use('/api/v1/bookings', bookingLimiter, bookingRoutes)
app.use('/api/v1/analytics', analyticsRoutes)
app.use('/api/v1/notifications', notificationRoutes)
app.use('/api/v1/reviews', reviewRoutes)

// 404
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

// Global error handler
app.use(errorMiddleware)

export default app
