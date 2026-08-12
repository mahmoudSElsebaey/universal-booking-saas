import mongoose, { Schema, Document, Model } from 'mongoose'

export type ServiceStatus = 'active' | 'inactive' | 'draft'

export interface IServiceDocument extends Document {
  businessId: mongoose.Types.ObjectId
  categoryId?: mongoose.Types.ObjectId
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  image?: string
  price: number
  currency?: string
  duration: number // minutes
  bufferTime: number // minutes after service
  maxBookingsPerSlot?: number
  staffRequired: boolean
  assignedStaffIds: mongoose.Types.ObjectId[]
  location?: string
  status: ServiceStatus
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const serviceSchema = new Schema<IServiceDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    nameAr: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    description: { type: String, maxlength: 2000 },
    descriptionAr: { type: String, maxlength: 2000 },
    image: String,
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'EGP',
    },
    duration: {
      type: Number,
      required: true,
      min: 5,
      max: 480, // 8 hours
    },
    bufferTime: {
      type: Number,
      default: 0,
      min: 0,
      max: 120,
    },
    maxBookingsPerSlot: {
      type: Number,
      default: 1,
      min: 1,
    },
    staffRequired: {
      type: Boolean,
      default: true,
    },
    assignedStaffIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Staff',
      },
    ],
    location: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
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

serviceSchema.index({ businessId: 1, status: 1, isActive: 1 })
serviceSchema.index({ businessId: 1, categoryId: 1 })
serviceSchema.index({ assignedStaffIds: 1 })

export const Service: Model<IServiceDocument> =
  mongoose.models.Service ||
  mongoose.model<IServiceDocument>('Service', serviceSchema)
