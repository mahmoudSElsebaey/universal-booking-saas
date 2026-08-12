export type UserRole =
  | 'super_admin'
  | 'business_owner'
  | 'manager'
  | 'staff'
  | 'customer'

export type Permission =
  | 'booking:create'
  | 'booking:read'
  | 'booking:update'
  | 'booking:delete'
  | 'service:create'
  | 'service:read'
  | 'service:update'
  | 'service:delete'
  | 'staff:create'
  | 'staff:read'
  | 'staff:update'
  | 'staff:delete'
  | 'customer:read'
  | 'customer:update'
  | 'analytics:read'
  | 'settings:read'
  | 'settings:update'
  | 'business:manage'

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'booking:create',
    'booking:read',
    'booking:update',
    'booking:delete',
    'service:create',
    'service:read',
    'service:update',
    'service:delete',
    'staff:create',
    'staff:read',
    'staff:update',
    'staff:delete',
    'customer:read',
    'customer:update',
    'analytics:read',
    'settings:read',
    'settings:update',
    'business:manage',
  ],
  business_owner: [
    'booking:create',
    'booking:read',
    'booking:update',
    'booking:delete',
    'service:create',
    'service:read',
    'service:update',
    'service:delete',
    'staff:create',
    'staff:read',
    'staff:update',
    'staff:delete',
    'customer:read',
    'customer:update',
    'analytics:read',
    'settings:read',
    'settings:update',
    'business:manage',
  ],
  manager: [
    'booking:create',
    'booking:read',
    'booking:update',
    'booking:delete',
    'service:read',
    'service:update',
    'staff:read',
    'staff:update',
    'customer:read',
    'analytics:read',
    'settings:read',
  ],
  staff: [
    'booking:create',
    'booking:read',
    'booking:update',
    'service:read',
    'customer:read',
  ],
  customer: ['booking:create', 'booking:read', 'booking:update'],
}

export interface IUser {
  _id: string
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  avatar?: string
  isEmailVerified: boolean
  isActive: boolean
  businessId?: string
  refreshToken?: string
  passwordResetToken?: string
  passwordResetExpires?: Date
  emailVerificationToken?: string
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface JwtPayload {
  userId: string
  email: string
  role: UserRole
  businessId?: string
}
