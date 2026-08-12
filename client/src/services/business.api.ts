import { api } from './api'

export interface WorkingHoursSlot {
  day: string
  isOpen: boolean
  openTime: string
  closeTime: string
  breaks?: { start: string; end: string }[]
}

export interface Business {
  _id: string
  name: string
  slug: string
  type: string
  description?: string
  logo?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  workingHours: WorkingHoursSlot[]
  settings: {
    currency: string
    timezone: string
    defaultLanguage: string
    slotIntervalMinutes: number
    minAdvanceHours: number
    maxAdvanceDays: number
    cancellationPolicyHours: number
    requireStaffSelection: boolean
    allowOnlineBooking: boolean
  }
  isActive: boolean
}

export interface Category {
  _id: string
  businessId: string
  name: string
  nameAr?: string
  description?: string
  image?: string
  sortOrder: number
}

export interface Service {
  _id: string
  businessId: string
  categoryId?: Category | string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  image?: string
  price: number
  currency?: string
  duration: number
  bufferTime: number
  staffRequired: boolean
  assignedStaffIds?: any[]
  status: 'active' | 'inactive' | 'draft'
  sortOrder: number
}

export interface StaffMember {
  _id: string
  businessId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  avatar?: string
  bio?: string
  title?: string
  serviceIds?: Service[] | string[]
  workingHours: WorkingHoursSlot[]
  status: 'active' | 'inactive' | 'on_leave'
  sortOrder: number
}

export const businessApi = {
  create: (data: Partial<Business>) =>
    api.post<{ success: boolean; data: Business }>('/businesses', data).then((r) => r.data.data),

  getMine: () =>
    api.get<{ success: boolean; data: Business[] }>('/businesses/mine').then((r) => r.data.data),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Business }>(`/businesses/${id}`).then((r) => r.data.data),

  getBySlug: (slug: string) =>
    api
      .get<{ success: boolean; data: Business }>(`/businesses/slug/${slug}`)
      .then((r) => r.data.data),

  update: (id: string, data: Partial<Business>) =>
    api
      .patch<{ success: boolean; data: Business }>(`/businesses/${id}`, data)
      .then((r) => r.data.data),

  // Categories
  listCategories: (businessId: string) =>
    api
      .get<{ success: boolean; data: Category[] }>(`/businesses/${businessId}/categories`)
      .then((r) => r.data.data),

  createCategory: (businessId: string, data: Partial<Category>) =>
    api
      .post<{ success: boolean; data: Category }>(
        `/businesses/${businessId}/categories`,
        data
      )
      .then((r) => r.data.data),

  // Services
  listServices: (
    businessId: string,
    params?: { page?: number; limit?: number; status?: string; search?: string }
  ) =>
    api
      .get<{
        success: boolean
        data: Service[]
        pagination: { page: number; limit: number; total: number; totalPages: number }
      }>(`/businesses/${businessId}/services`, { params })
      .then((r) => r.data),

  getService: (businessId: string, id: string) =>
    api
      .get<{ success: boolean; data: Service }>(
        `/businesses/${businessId}/services/${id}`
      )
      .then((r) => r.data.data),

  createService: (businessId: string, data: Partial<Service>) =>
    api
      .post<{ success: boolean; data: Service }>(
        `/businesses/${businessId}/services`,
        data
      )
      .then((r) => r.data.data),

  updateService: (businessId: string, id: string, data: Partial<Service>) =>
    api
      .patch<{ success: boolean; data: Service }>(
        `/businesses/${businessId}/services/${id}`,
        data
      )
      .then((r) => r.data.data),

  deleteService: (businessId: string, id: string) =>
    api.delete(`/businesses/${businessId}/services/${id}`),

  // Staff
  listStaff: (
    businessId: string,
    params?: { page?: number; limit?: number; status?: string; search?: string }
  ) =>
    api
      .get<{
        success: boolean
        data: StaffMember[]
        pagination: { page: number; limit: number; total: number; totalPages: number }
      }>(`/businesses/${businessId}/staff`, { params })
      .then((r) => r.data),

  getStaff: (businessId: string, id: string) =>
    api
      .get<{ success: boolean; data: StaffMember }>(
        `/businesses/${businessId}/staff/${id}`
      )
      .then((r) => r.data.data),

  createStaff: (businessId: string, data: Partial<StaffMember>) =>
    api
      .post<{ success: boolean; data: StaffMember }>(
        `/businesses/${businessId}/staff`,
        data
      )
      .then((r) => r.data.data),

  updateStaff: (businessId: string, id: string, data: Partial<StaffMember>) =>
    api
      .patch<{ success: boolean; data: StaffMember }>(
        `/businesses/${businessId}/staff/${id}`,
        data
      )
      .then((r) => r.data.data),

  deleteStaff: (businessId: string, id: string) =>
    api.delete(`/businesses/${businessId}/staff/${id}`),

  getStaffForService: (businessId: string, serviceId: string) =>
    api
      .get<{ success: boolean; data: StaffMember[] }>(
        `/businesses/${businessId}/services/${serviceId}/staff`
      )
      .then((r) => r.data.data),
}
