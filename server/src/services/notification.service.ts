import { Notification } from '../models/Notification.js'
import { User } from '../models/User.js'
import type { NotificationType, NotificationChannel } from '../models/Notification.js'

interface SendNotificationInput {
  userId: string
  businessId?: string
  type: NotificationType
  title: string
  titleAr?: string
  body: string
  bodyAr?: string
  data?: Record<string, any>
  channels?: NotificationChannel[]
}

/**
 * Notification Service
 * Decoupled from controllers — call this from booking service, jobs, etc.
 *
 * Architecture:
 * - Always creates in-app notification
 * - Email / SMS are prepared here (actual sending via provider later)
 */
export class NotificationService {

  async getPreferences(userId: string) {
    const user = await User.findById(userId).select('notificationPreferences')
    const defaults = {
      booking_confirmed: true,
      booking_reminder: true,
      booking_cancelled: true,
      booking_rescheduled: true,
      review_received: true,
      emailEnabled: true,
      smsEnabled: false,
    }
    return { ...defaults, ...(user?.notificationPreferences as any) }
  }

  async updatePreferences(
    userId: string,
    prefs: Partial<{
      booking_confirmed: boolean
      booking_reminder: boolean
      booking_cancelled: boolean
      booking_rescheduled: boolean
      review_received: boolean
      emailEnabled: boolean
      smsEnabled: boolean
    }>
  ) {
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')
    const current = (user.notificationPreferences as any) || {}
    user.notificationPreferences = { ...current, ...prefs } as any
    await user.save()
    return this.getPreferences(userId)
  }

  async send(input: SendNotificationInput) {
    // Respect user notification preferences
    try {
      const prefs = await this.getPreferences(input.userId)
      const typeKey = input.type as keyof typeof prefs
      if (
        typeKey in prefs &&
        typeof (prefs as any)[typeKey] === 'boolean' &&
        !(prefs as any)[typeKey]
      ) {
        return null // user disabled this type
      }
      let channels = input.channels || ['in_app']
      if (!prefs.emailEnabled) channels = channels.filter((c) => c !== 'email')
      if (!prefs.smsEnabled) channels = channels.filter((c) => c !== 'sms')
      if (!channels.includes('in_app')) channels = ['in_app', ...channels]
      input = { ...input, channels }
    } catch {
      /* continue with defaults */
    }

    const channels = input.channels || ['in_app']

    const notification = await Notification.create({
      userId: input.userId,
      businessId: input.businessId,
      type: input.type,
      title: input.title,
      titleAr: input.titleAr,
      body: input.body,
      bodyAr: input.bodyAr,
      data: input.data,
      channels,
    })

    // Email channel (architecture — integrate SMTP/SendGrid later)
    if (channels.includes('email')) {
      await this.queueEmail(notification)
    }

    // SMS channel (architecture — integrate Twilio later)
    if (channels.includes('sms')) {
      await this.queueSms(notification)
    }

    return notification
  }

  async sendBookingConfirmed(params: {
    userId: string
    businessId: string
    bookingId: string
    serviceName: string
    date: string
    time: string
  }) {
    return this.send({
      userId: params.userId,
      businessId: params.businessId,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      titleAr: 'تم تأكيد الحجز',
      body: `Your booking for ${params.serviceName} on ${params.date} at ${params.time} is confirmed.`,
      bodyAr: `تم تأكيد حجزك لـ ${params.serviceName} يوم ${params.date} الساعة ${params.time}.`,
      data: { bookingId: params.bookingId },
      channels: ['in_app', 'email'],
    })
  }

  async sendBookingCancelled(params: {
    userId: string
    businessId: string
    bookingId: string
    serviceName: string
    reason?: string
  }) {
    return this.send({
      userId: params.userId,
      businessId: params.businessId,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      titleAr: 'تم إلغاء الحجز',
      body: `Your booking for ${params.serviceName} has been cancelled.${params.reason ? ` Reason: ${params.reason}` : ''}`,
      bodyAr: `تم إلغاء حجزك لـ ${params.serviceName}.${params.reason ? ` السبب: ${params.reason}` : ''}`,
      data: { bookingId: params.bookingId },
      channels: ['in_app', 'email'],
    })
  }

  async sendBookingRescheduled(params: {
    userId: string
    businessId: string
    bookingId: string
    serviceName: string
    newDate: string
    newTime: string
  }) {
    return this.send({
      userId: params.userId,
      businessId: params.businessId,
      type: 'booking_rescheduled',
      title: 'Booking Rescheduled',
      titleAr: 'تم إعادة جدولة الحجز',
      body: `Your booking for ${params.serviceName} has been moved to ${params.newDate} at ${params.newTime}.`,
      bodyAr: `تم نقل حجزك لـ ${params.serviceName} إلى ${params.newDate} الساعة ${params.newTime}.`,
      data: { bookingId: params.bookingId },
      channels: ['in_app', 'email'],
    })
  }

  async listForUser(
    userId: string,
    options: { page?: number; limit?: number; unreadOnly?: boolean } = {}
  ) {
    const page = options.page || 1
    const limit = Math.min(options.limit || 20, 50)
    const skip = (page - 1) * limit

    const filter: any = { userId }
    if (options.unreadOnly) filter.isRead = false

    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, isRead: false }),
    ])

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      unreadCount,
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    )
  }

  async markAllAsRead(userId: string) {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    )
    return { success: true }
  }

  // Placeholders for external providers
  private async queueEmail(notification: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[EMAIL] To user ${notification.userId}: ${notification.title}`)
    }
    // TODO: integrate SendGrid / Resend / Nodemailer
  }

  private async queueSms(notification: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SMS] To user ${notification.userId}: ${notification.title}`)
    }
    // TODO: integrate Twilio / local SMS gateway
  }
}

export const notificationService = new NotificationService()
