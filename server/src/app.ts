import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'

import { env } from './config/env.js'
import { errorMiddleware } from './middlewares/errorMiddleware.js'
import { apiLimiter, authLimiter } from './middlewares/rateLimit.js'
import authRoutes from './routes/auth.routes.js'
import businessRoutes from './routes/business.routes.js'
import bookingRoutes from './routes/booking.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import reviewRoutes from './routes/review.routes.js'
import uploadRoutes from './routes/upload.routes.js'

const app = express()

app.set('trust proxy', 1)

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)

/** Allowed browser origins for CORS (credentials-aware — never "*") */
function buildAllowedOrigins(): string[] {
  const list = new Set<string>()

  if (env.clientUrl) {
    list.add(env.clientUrl.replace(/\/$/, ''))
  }

  for (const origin of env.corsOrigins) {
    list.add(origin.replace(/\/$/, ''))
  }

  if (!env.isProd) {
    list.add('http://localhost:5173')
    list.add('http://127.0.0.1:5173')
  }

  return [...list]
}

const allowedOrigins = buildAllowedOrigins()

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser requests / same-origin requests / health checks
      if (!origin) {
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      callback(null, false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(cookieParser())
app.use(morgan(env.isProd ? 'combined' : 'dev'))

// File uploads use Multer memoryStorage.
// Production uploads should be stored in Cloudinary.
// No local filesystem uploads are used on Vercel.

app.use('/api/', apiLimiter)

// Health
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
  })
})

app.get('/api/v1/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Booking System API is running',
    timestamp: new Date().toISOString(),
    env: env.nodeEnv,
  })
})

// Temporary MongoDB connection test
app.get('/api/v1/db-test', async (_req, res) => {
  try {
    const ping = await mongoose.connection.db?.command({
      ping: 1,
    })

    res.json({
      success: true,
      readyState: mongoose.connection.readyState,
      database: mongoose.connection.name,
      ping,
    })
  } catch (error) {
    console.error('[db-test]', error)

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

// API Routes
app.use('/api/v1/auth', authLimiter, authRoutes)
app.use('/api/v1/businesses', businessRoutes)
app.use('/api/v1/bookings', bookingRoutes)
app.use('/api/v1/analytics', analyticsRoutes)
app.use('/api/v1/notifications', notificationRoutes)
app.use('/api/v1/reviews', reviewRoutes)
app.use('/api/v1/uploads', uploadRoutes)

// 404
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

// Error handler
app.use(errorMiddleware)

export default app