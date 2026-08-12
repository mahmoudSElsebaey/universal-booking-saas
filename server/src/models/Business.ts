import mongoose, { Schema, Document, Model } from 'mongoose'
import type {
  BusinessType,
  WorkingHoursSlot,
  BusinessSettings,
} from '../types/business.js'
import {
  DEFAULT_WORKING_HOURS,
  DEFAULT_BUSINESS_SETTINGS,
} from '../types/business.js'

export interface IBusinessDocument extends Document {
  name: string
  slug: string
  type: BusinessType
  description?: string
  logo?: string
  coverImage?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  country?: string
  website?: string
  social?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
  ownerId: mongoose.Types.ObjectId
  workingHours: WorkingHoursSlot[]
  settings: BusinessSettings
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const workingHoursSchema = new Schema(
  {
    day: {
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      required: true,
    },
    isOpen: { type: Boolean, default: true },
    openTime: { type: String, default: '09:00' },
    closeTime: { type: String, default: '18:00' },
    breaks: [
      {
        start: String,
        end: String,
      },
    ],
  },
  { _id: false }
)

const businessSchema = new Schema<IBusinessDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'clinic',
        'beauty_salon',
        'barbershop',
        'gym',
        'hotel',
        'restaurant',
        'consultant',
        'lawyer',
        'tutor',
        'fitness_coach',
        'photography',
        'car_rental',
        'sports_field',
        'repair',
        'cleaning',
        'coworking',
        'other',
      ],
      default: 'other',
      index: true,
    },
    description: { type: String, maxlength: 2000 },
    logo: String,
    coverImage: String,
    phone: String,
    email: String,
    address: String,
    city: String,
    country: { type: String, default: 'Egypt' },
    website: String,
    social: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workingHours: {
      type: [workingHoursSchema],
      default: DEFAULT_WORKING_HOURS,
    },
    settings: {
      type: {
        currency: { type: String, default: 'EGP' },
        timezone: { type: String, default: 'Africa/Cairo' },
        defaultLanguage: { type: String, enum: ['en', 'ar'], default: 'en' },
        slotIntervalMinutes: { type: Number, default: 30 },
        minAdvanceHours: { type: Number, default: 2 },
        maxAdvanceDays: { type: Number, default: 60 },
        cancellationPolicyHours: { type: Number, default: 24 },
        requireStaffSelection: { type: Boolean, default: true },
        allowOnlineBooking: { type: Boolean, default: true },
      },
      default: DEFAULT_BUSINESS_SETTINGS,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
)

// Compound indexes
businessSchema.index({ ownerId: 1, isActive: 1 })
businessSchema.index({ type: 1, isActive: 1 })

export const Business: Model<IBusinessDocument> =
  mongoose.models.Business ||
  mongoose.model<IBusinessDocument>('Business', businessSchema)
