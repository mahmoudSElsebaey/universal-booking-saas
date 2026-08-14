import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/User.js'
import type { JwtPayload, UserRole, Permission } from '../types/user.js'
import { ROLE_PERMISSIONS } from '../types/user.js'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: string }
    }
  }
}

async function attachUserFromToken(req: Request): Promise<boolean> {
  const authHeader = req.headers.authorization
  const token =
    authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
  if (!token) return false

  const payload = verifyAccessToken(token)
  const user = await User.findById(payload.userId).select(
    '_id email role businessId isActive'
  )
  if (!user || !user.isActive) return false

  req.user = {
    id: user._id.toString(),
    userId: user._id.toString(),
    email: user.email,
    role: user.role as UserRole,
    businessId: user.businessId?.toString(),
  }
  return true
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const ok = await attachUserFromToken(req)
    if (!ok) {
      throw new ApiError(401, 'Authentication required')
    }
    next()
  } catch (error) {
    next(error)
  }
}

/** Attach user if token present; never fail (for public booking etc.) */
export async function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    await attachUserFromToken(req)
  } catch {
    // ignore invalid/expired token on public routes
  }
  next()
}

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'))
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'))
    }
    next()
  }
}

export function requirePermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'))
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || []
    const hasAll = permissions.every((p) => userPermissions.includes(p))

    if (!hasAll) {
      return next(new ApiError(403, 'Insufficient permissions'))
    }
    next()
  }
}
