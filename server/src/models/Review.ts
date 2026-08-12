import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IReviewDocument extends Document {
  businessId: mongoose.Types.ObjectId
  bookingId?: mongoose.Types.ObjectId
  serviceId?: mongoose.Types.ObjectId
  staffId?: mongoose.Types.ObjectId
  customerId?: mongoose.Types.ObjectId
  customerName: string
  customerEmail?: string
  rating: number // 1-5
  comment?: string
  isPublished: boolean
  reply?: string
  repliedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
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
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: String,
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    reply: String,
    repliedAt: Date,
  },
  { timestamps: true }
)

reviewSchema.index({ businessId: 1, isPublished: 1, createdAt: -1 })
reviewSchema.index({ businessId: 1, rating: -1 })

export const Review: Model<IReviewDocument> =
  mongoose.models.Review || mongoose.model<IReviewDocument>('Review', reviewSchema)
