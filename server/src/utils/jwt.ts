import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { JwtPayload, UserRole } from '../types/user.js'

export function signAccessToken(payload: {
  userId: string
  email: string
  role: UserRole
  businessId?: string
}): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.accessTokenExpiresIn as jwt.SignOptions['expiresIn'],
  })
}

export function signRefreshToken(payload: {
  userId: string
  email: string
  role: UserRole
  businessId?: string
}): string {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenExpiresIn as jwt.SignOptions['expiresIn'],
  })
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtAccessSecret) as JwtPayload
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as JwtPayload
}
