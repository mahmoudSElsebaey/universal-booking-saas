import rateLimit from 'express-rate-limit'

const isDev = process.env.NODE_ENV !== 'production'

/** General API rate limit */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 5000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
})

/** Stricter limit for auth endpoints */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 200 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
})

/**
 * Only for creating bookings (spam protection).
 * Do NOT apply to GET list/calendar endpoints.
 */
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 500 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many booking attempts, please try again later',
  },
})
