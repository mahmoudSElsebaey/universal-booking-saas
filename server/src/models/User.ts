import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcrypt'
import type { UserRole } from '../types/user.js'

export interface IUserDocument extends Document {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  avatar?: string
  isEmailVerified: boolean
  isActive: boolean
  businessId?: mongoose.Types.ObjectId
  refreshToken?: string
  passwordResetToken?: string
  passwordResetExpires?: Date
  emailVerificationToken?: string
  lastLoginAt?: Date
  notificationPreferences?: {
    booking_confirmed: boolean
    booking_reminder: boolean
    booking_cancelled: boolean
    booking_rescheduled: boolean
    review_received: boolean
    emailEnabled: boolean
    smsEnabled: boolean
  }
  comparePassword(candidate: string): Promise<boolean>
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // never return password by default
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['super_admin', 'business_owner', 'manager', 'staff', 'customer'],
      default: 'customer',
      index: true,
    },
    avatar: String,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      index: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    lastLoginAt: Date,
    notificationPreferences: {
      booking_confirmed: { type: Boolean, default: true },
      booking_reminder: { type: Boolean, default: true },
      booking_cancelled: { type: Boolean, default: true },
      booking_rescheduled: { type: Boolean, default: true },
      review_received: { type: Boolean, default: true },
      emailEnabled: { type: Boolean, default: true },
      smsEnabled: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any).password
        delete (ret as any).refreshToken
        delete (ret as any).passwordResetToken
        delete (ret as any).emailVerificationToken
        return ret
      },
    },
  }
)

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password)
}

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', userSchema)
