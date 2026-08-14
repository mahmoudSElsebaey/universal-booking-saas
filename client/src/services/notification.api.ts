import { api } from './api'

export interface AppNotification {
  _id: string
  type: string
  title: string
  titleAr?: string
  body: string
  bodyAr?: string
  data?: Record<string, any>
  isRead: boolean
  createdAt: string
}

export const notificationApi = {
  list: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api
      .get<{
        success: boolean
        data: AppNotification[]
        pagination: any
        unreadCount: number
      }>('/notifications', { params })
      .then((r) => r.data),

  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () =>
    api.post('/notifications/read-all').then((r) => r.data),

  getPreferences: () =>
    api
      .get<{ success: boolean; data: NotificationPreferences }>('/notifications/preferences')
      .then((r) => r.data.data),

  updatePreferences: (prefs: Partial<NotificationPreferences>) =>
    api
      .patch<{ success: boolean; data: NotificationPreferences }>(
        '/notifications/preferences',
        prefs
      )
      .then((r) => r.data.data),
}

export interface NotificationPreferences {
  booking_confirmed: boolean
  booking_reminder: boolean
  booking_cancelled: boolean
  booking_rescheduled: boolean
  review_received: boolean
  emailEnabled: boolean
  smsEnabled: boolean
}
