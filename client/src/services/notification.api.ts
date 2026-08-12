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
}
