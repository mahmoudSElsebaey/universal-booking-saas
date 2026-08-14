import { api } from './api'

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'
  | 'rescheduled'

export interface TimeSlot {
  start: string
  end: string
  available: boolean
  staffId?: string
}

export interface Booking {
  _id: string
  businessId: any
  serviceId: any
  staffId?: any
  customerName: string
  customerEmail: string
  customerPhone?: string
  date: string
  startTime: string
  endTime: string
  duration: number
  bufferTime: number
  price: number
  currency: string
  status: BookingStatus
  paymentMethod?: 'visa' | 'vodafone_cash' | 'cash'
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded'
  paidAt?: string
  paymentReference?: string
  notes?: string
  createdAt: string
}

export interface CreateBookingPayload {
  businessId: string
  serviceId: string
  staffId?: string
  date: string
  startTime: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  notes?: string
  paymentMethod?: 'visa' | 'vodafone_cash' | 'cash'
}

export const bookingApi = {
  getAvailability: (params: {
    businessId: string
    serviceId: string
    staffId?: string
    date: string
  }) =>
    api
      .get<{ success: boolean; data: { date: string; slots: TimeSlot[] } }>(
        '/bookings/availability',
        { params }
      )
      .then((r) => r.data.data),

  create: (payload: CreateBookingPayload) =>
    api
      .post<{ success: boolean; data: Booking; message: string }>(
        '/bookings',
        payload
      )
      .then((r) => r.data.data),

  getMyBookings: () =>
    api
      .get<{ success: boolean; data: Booking[] }>('/bookings/me')
      .then((r) => r.data.data),

  list: (
    businessId: string,
    params?: {
      page?: number
      limit?: number
      status?: BookingStatus
      staffId?: string
      serviceId?: string
      dateFrom?: string
      dateTo?: string
      search?: string
    }
  ) =>
    api
      .get<{
        success: boolean
        data: Booking[]
        pagination: {
          page: number
          limit: number
          total: number
          totalPages: number
        }
      }>(`/bookings/business/${businessId}`, { params })
      .then((r) => r.data),

  getById: (businessId: string, id: string) =>
    api
      .get<{ success: boolean; data: Booking }>(
        `/bookings/business/${businessId}/${id}`
      )
      .then((r) => r.data.data),

  updateStatus: (
    businessId: string,
    id: string,
    status: BookingStatus,
    reason?: string
  ) =>
    api
      .patch<{ success: boolean; data: Booking }>(
        `/bookings/business/${businessId}/${id}/status`,
        { status, reason }
      )
      .then((r) => r.data.data),

  cancel: (businessId: string, id: string, reason?: string) =>
    api
      .post<{ success: boolean; data: Booking }>(
        `/bookings/business/${businessId}/${id}/cancel`,
        { reason }
      )
      .then((r) => r.data.data),

  reschedule: (
    businessId: string,
    id: string,
    data: { date: string; startTime: string; staffId?: string }
  ) =>
    api
      .post<{ success: boolean; data: Booking }>(
        `/bookings/business/${businessId}/${id}/reschedule`,
        data
      )
      .then((r) => r.data.data),
}
