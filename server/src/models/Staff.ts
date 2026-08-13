import mongoose, { Schema, Document, Model } from 'mongoose'
import type { WorkingHoursSlot } from '../types/business.js'
import { DEFAULT_WORKING_HOURS } from '../types/business.js'

export type StaffStatus = 'active' | 'inactive' | 'on_leave'

export interface IStaffDocument extends Document {
  businessId: mongoose.Types.ObjectId
  userId?: mongoose.Types.ObjectId // linked user account (optional)
  firstName: string
  lastName: string
  email?: string
  phone?: string
  avatar?: string
  bio?: string
  bioAr?: string
  title?: string // e.g. "Senior Stylist"
  titleAr?: string
  serviceIds: mongoose.Types.ObjectId[]
  workingHours: WorkingHoursSlot[]
  daysOff: Date[] // specific dates off
  maxBookingsPerDay?: number
  status: StaffStatus
  sortOrder: number
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

const staffSchema = new Schema<IStaffDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: String,
    avatar: String,
    bio: { type: String, maxlength: 1000 },
    bioAr: { type: String, maxlength: 1000 },
    title: { type: String, maxlength: 100 },
    titleAr: { type: String, maxlength: 100 },
    serviceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],
    workingHours: {
      type: [workingHoursSchema],
      default: DEFAULT_WORKING_HOURS,
    },
    daysOff: [
      {
        type: Date,
      },
    ],
    maxBookingsPerDay: {
      type: Number,
      min: 1,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave'],
      default: 'active',
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
)

staffSchema.index({ businessId: 1, status: 1, isActive: 1 })
staffSchema.index({ businessId: 1, serviceIds: 1 })
staffSchema.virtual('fullName').get(function (this: IStaffDocument) {
  return `${this.firstName} ${this.lastName}`
})

export const Staff: Model<IStaffDocument> =
  mongoose.models.Staff || mongoose.model<IStaffDocument>('Staff', staffSchema)
