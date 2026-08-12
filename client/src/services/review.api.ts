import { api } from './api'

export interface Review {
  _id: string
  businessId: string
  customerName: string
  rating: number
  comment?: string
  isPublished: boolean
  reply?: string
  serviceId?: any
  staffId?: any
  createdAt: string
}

export const reviewApi = {
  list: (
    businessId: string,
    params?: { page?: number; limit?: number; minRating?: number }
  ) =>
    api
      .get<{
        success: boolean
        data: Review[]
        pagination: any
        summary: { averageRating: number; totalReviews: number }
      }>(`/reviews/business/${businessId}`, { params })
      .then((r) => r.data),

  create: (payload: {
    businessId: string
    bookingId?: string
    serviceId?: string
    staffId?: string
    customerName?: string
    rating: number
    comment?: string
  }) =>
    api.post<{ success: boolean; data: Review }>('/reviews', payload).then((r) => r.data.data),

  reply: (businessId: string, id: string, reply: string) =>
    api
      .post(`/reviews/business/${businessId}/${id}/reply`, { reply })
      .then((r) => r.data),

  togglePublish: (businessId: string, id: string, isPublished: boolean) =>
    api
      .patch(`/reviews/business/${businessId}/${id}/publish`, { isPublished })
      .then((r) => r.data),
}
