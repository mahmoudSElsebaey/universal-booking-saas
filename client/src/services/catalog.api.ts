import { api } from './api'
import type { Business, Service, StaffMember } from './business.api'
import type { Review } from './review.api'

export interface PublicCatalog {
  business: Business
  services: Service[]
  staff: StaffMember[]
  reviews?: Review[]
  reviewSummary?: {
    averageRating: number
    totalReviews: number
  }
}

export const catalogApi = {
  getDefaultSlug: () =>
    localStorage.getItem('businessSlug') || 'cairo-care',

  getCatalog: async (slug?: string) => {
    const s = slug || catalogApi.getDefaultSlug()
    const { data } = await api.get<{ success: boolean; data: PublicCatalog }>(
      `/businesses/slug/${s}/catalog`
    )
    const catalog = data.data
    if (catalog?.business?._id) {
      localStorage.setItem('businessId', catalog.business._id)
      localStorage.setItem('businessSlug', catalog.business.slug)
    }
    return catalog
  },
}
