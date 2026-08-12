import crypto from 'crypto'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { emailService } from './email.service.js'
import { env } from '../config/env.js'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js'
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../validators/auth.validator.js'
import type { AuthTokens } from '../types/user.js'

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await User.findOne({ email: input.email })
    if (existing) {
      throw new ApiError(409, 'Email already registered')
    }

    const user = await User.create({
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: input.role || 'customer',
      isEmailVerified: false, // in production send verification email
    })

    const tokens = this.generateTokens(user)

    // Store refresh token
    user.refreshToken = tokens.refreshToken
    await user.save({ validateBeforeSave: false })

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      ...tokens,
    }
  }

  async login(input: LoginInput) {
    const user = await User.findOne({ email: input.email }).select('+password')
    if (!user) {
      throw new ApiError(401, 'Invalid email or password')
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated')
    }

    const isMatch = await user.comparePassword(input.password)
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password')
    }

    const tokens = this.generateTokens(user)

    user.refreshToken = tokens.refreshToken
    user.lastLoginAt = new Date()
    await user.save({ validateBeforeSave: false })

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        businessId: user.businessId?.toString(),
      },
      ...tokens,
    }
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token required')
    }

    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      throw new ApiError(401, 'Invalid or expired refresh token')
    }

    const user = await User.findById(payload.userId).select('+refreshToken')
    if (!user || !user.isActive || user.refreshToken !== refreshToken) {
      throw new ApiError(401, 'Invalid refresh token')
    }

    const tokens = this.generateTokens(user)
    user.refreshToken = tokens.refreshToken
    await user.save({ validateBeforeSave: false })

    return tokens
  }

  async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } })
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await User.findOne({ email: input.email })
    // Always return success to avoid email enumeration
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' }
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    user.passwordResetToken = hashedToken
    user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 30) // 30 min
    await user.save({ validateBeforeSave: false })

    const resetUrl = `${env.clientUrl}/auth/reset-password?token=${resetToken}`
    try {
      await emailService.sendPasswordReset({ to: user.email, resetUrl })
    } catch (e) {
      console.error('[auth] reset email failed', e)
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Password reset link: ${resetUrl}`)
    }

    return { message: 'If the email exists, a reset link has been sent' }
  }

  async resetPassword(input: ResetPasswordInput) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(input.token)
      .digest('hex')

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password')

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token')
    }

    user.password = input.password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    user.refreshToken = undefined // force re-login
    await user.save()

    return { message: 'Password reset successfully' }
  }

  async getMe(userId: string) {
    const user = await User.findById(userId)
    if (!user) {
      throw new ApiError(404, 'User not found')
    }
    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      businessId: user.businessId?.toString(),
    }
  }

  private generateTokens(user: {
    _id: { toString(): string }
    email: string
    role: string
    businessId?: { toString(): string }
  }): AuthTokens {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as any,
      businessId: user.businessId?.toString(),
    }
    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    }
  }
}

export const authService = new AuthService()
