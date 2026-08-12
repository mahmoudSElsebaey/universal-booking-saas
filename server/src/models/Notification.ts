import mongoose, { Schema, Document, Model } from 'mongoose'

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_reminder'
  | 'booking_rescheduled'
  | 'booking_completed'
  | 'new_customer'
  | 'system'
  | 'review_received'

export type NotificationChannel = 'in_app' | 'email' | 'sms'

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId
  businessId?: mongoose.Types.ObjectId
  type: NotificationType
  title: string
  titleAr?: string
  body: string
  bodyAr?: string
  data?: Record<string, any> // bookingId, etc.
  channels: NotificationChannel[]
  isRead: boolean
  readAt?: Date
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      index: true,
    },
    type: {
      type: String,
      enum: [
        'booking_confirmed',
        'booking_cancelled',
        'booking_reminder',
        'booking_rescheduled',
        'booking_completed',
        'new_customer',
        'system',
        'review_received',
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    titleAr: String,
    body: { type: String, required: true },
    bodyAr: String,
    data: { type: Schema.Types.Mixed },
    channels: {
      type: [String],
      enum: ['in_app', 'email', 'sms'],
      default: ['in_app'],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
  },
  { timestamps: true }
)

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })

export const Notification: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>('Notification', notificationSchema)
