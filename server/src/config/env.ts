import dotenv from 'dotenv'

dotenv.config()

const nodeEnv = process.env.NODE_ENV || 'development'
const isProd = nodeEnv === 'production'

/**
 * Prefer real env values. In production, log missing keys instead of throwing
 * at import-time (import throws crash the entire Vercel serverless function).
 */
function pick(name: string, fallback = ''): string {
  const value = process.env[name]
  if (value && value.trim()) return value.trim()
  if (isProd) {
    console.error(`[config] Missing environment variable: ${name}`)
  }
  return fallback
}

const jwtAccess =
  process.env.JWT_ACCESS_SECRET?.trim() ||
  (isProd ? '' : 'dev-access-secret-change-me-min-32-chars!!')
const jwtRefresh =
  process.env.JWT_REFRESH_SECRET?.trim() ||
  (isProd ? '' : 'dev-refresh-secret-change-me-min-32-chars!')

if (isProd) {
  const missing: string[] = []
  if (!process.env.JWT_ACCESS_SECRET) missing.push('JWT_ACCESS_SECRET')
  if (!process.env.JWT_REFRESH_SECRET) missing.push('JWT_REFRESH_SECRET')
  if (!process.env.MONGODB_URI) missing.push('MONGODB_URI')
  if (!process.env.CLIENT_URL) missing.push('CLIENT_URL')
  if (missing.length) {
    console.error(
      `[config] Required production env missing: ${missing.join(', ')}`
    )
  }
}

export const env = {
  nodeEnv,
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongodbUri: pick(
    'MONGODB_URI',
    'mongodb://localhost:27017/booking-system'
  ),
  jwtAccessSecret: jwtAccess,
  jwtRefreshSecret: jwtRefresh,
  clientUrl: pick('CLIENT_URL', 'http://localhost:5173'),
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || 'Bookora <noreply@bookora.app>',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpSecure: process.env.SMTP_SECURE === 'true',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER || 'bookora',
} as const

export function hasCloudinary(): boolean {
  return !!(
    env.cloudinaryCloudName &&
    env.cloudinaryApiKey &&
    env.cloudinaryApiSecret
  )
}

export function assertProdConfig(): void {
  if (!isProd) return
  if (!env.mongodbUri || env.mongodbUri.includes('localhost')) {
    throw new Error('MONGODB_URI is not configured for production')
  }
  if (!env.jwtAccessSecret || !env.jwtRefreshSecret) {
    throw new Error('JWT secrets are not configured for production')
  }
}
