import mongoose, { Schema, Document, Model } from 'mongoose'
import type { BookingStatus } from '../types/booking.js'

export interface IBookingDocument extends Document {
  businessId: mongoose.Types.ObjectId
  serviceId: mongoose.Types.ObjectId
  staffId?: mongoose.Types.ObjectId
  customerId?: mongoose.Types.ObjectId
  customerName: string
  customerEmail: string
  customerPhone?: string
  date: Date // start of day UTC or local normalized
  startTime: string // "09:00"
  endTime: string   // "10:00"
  duration: number  // minutes
  bufferTime: number
  price: number
  currency: string
  status: BookingStatus
  paymentMethod?: 'visa' | 'vodafone_cash' | 'cash'
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded'
  paidAt?: Date
  paymentReference?: string
  notes?: string
  cancellationReason?: string
  cancelledAt?: Date
  cancelledBy?: mongoose.Types.ObjectId
  rescheduledFrom?: mongoose.Types.ObjectId
  createdBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const bookingSchema = new Schema<IBookingDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    customerPhone: String,
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    bufferTime: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'EGP',
    },
    paymentMethod: {
      type: String,
      enum: ['visa', 'vodafone_cash', 'cash'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paidAt: Date,
    paymentReference: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled'],
      default: 'confirmed',
      index: true,
    },
    notes: String,
    cancellationReason: String,
    cancelledAt: Date,
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rescheduledFrom: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

// Critical indexes for conflict detection and calendar queries
bookingSchema.index({ businessId: 1, date: 1, status: 1 })
bookingSchema.index({ staffId: 1, date: 1, status: 1 })
bookingSchema.index({ serviceId: 1, date: 1, status: 1 })
bookingSchema.index({ customerEmail: 1, businessId: 1 })
bookingSchema.index({ date: 1, startTime: 1, endTime: 1 })

// Compound index for conflict checks
bookingSchema.index(
  { staffId: 1, date: 1, startTime: 1, endTime: 1, status: 1 },
  { name: 'staff_conflict_idx' }
)

export const Booking: Model<IBookingDocument> =
  mongoose.models.Booking ||
  mongoose.model<IBookingDocument>('Booking', bookingSchema)
