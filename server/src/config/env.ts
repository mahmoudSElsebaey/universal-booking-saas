import dotenv from 'dotenv'

dotenv.config()

const nodeEnv = process.env.NODE_ENV || 'development'
const isProd = nodeEnv === 'production'

function requiredInProd(name: string, value: string | undefined, fallback?: string): string {
  if (value && value.trim()) return value.trim()
  if (isProd) {
    throw new Error(`[config] Missing required environment variable: ${name}`)
  }
  return fallback ?? ''
}

const jwtAccess =
  process.env.JWT_ACCESS_SECRET ||
  (isProd ? '' : 'dev-access-secret-change-me-min-32-chars!!')
const jwtRefresh =
  process.env.JWT_REFRESH_SECRET ||
  (isProd ? '' : 'dev-refresh-secret-change-me-min-32-chars!')

if (isProd) {
  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('[config] JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required in production')
  }
  if (!process.env.MONGODB_URI) {
    throw new Error('[config] MONGODB_URI is required in production')
  }
  if (!process.env.CLIENT_URL) {
    throw new Error('[config] CLIENT_URL is required in production')
  }
}

export const env = {
  nodeEnv,
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongodbUri: requiredInProd(
    'MONGODB_URI',
    process.env.MONGODB_URI,
    'mongodb://localhost:27017/booking-system'
  ),
  jwtAccessSecret: jwtAccess,
  jwtRefreshSecret: jwtRefresh,
  clientUrl: requiredInProd(
    'CLIENT_URL',
    process.env.CLIENT_URL,
    'http://localhost:5173'
  ),
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
