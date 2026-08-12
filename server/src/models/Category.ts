import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICategoryDocument extends Document {
  businessId: mongoose.Types.ObjectId
  name: string
  nameAr?: string
  description?: string
  image?: string
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<ICategoryDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    nameAr: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    description: { type: String, maxlength: 500 },
    image: String,
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

categorySchema.index({ businessId: 1, sortOrder: 1 })
categorySchema.index({ businessId: 1, isActive: 1 })

export const Category: Model<ICategoryDocument> =
  mongoose.models.Category ||
  mongoose.model<ICategoryDocument>('Category', categorySchema)
