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

/** Current demo clinic slug (after seed) */
export const DEFAULT_BUSINESS_SLUG = 'cairo-care'

export const catalogApi = {
  getDefaultSlug: () => {
    const stored = localStorage.getItem('businessSlug')
    // Migrate old salon demo slug → clinic
    if (!stored || stored === 'luxe-beauty') {
      localStorage.setItem('businessSlug', DEFAULT_BUSINESS_SLUG)
      return DEFAULT_BUSINESS_SLUG
    }
    return stored
  },

  getCatalog: async (slug?: string) => {
    const s = slug || catalogApi.getDefaultSlug()
    try {
      const { data } = await api.get<{ success: boolean; data: PublicCatalog }>(
        `/businesses/slug/${s}/catalog`
      )
      const catalog = data.data
      if (catalog?.business?._id) {
        localStorage.setItem('businessId', catalog.business._id)
        localStorage.setItem('businessSlug', catalog.business.slug)
      }
      return catalog
    } catch (err: any) {
      // If stored slug 404s, retry with default clinic slug once
      if (s !== DEFAULT_BUSINESS_SLUG && err?.response?.status === 404) {
        localStorage.setItem('businessSlug', DEFAULT_BUSINESS_SLUG)
        localStorage.removeItem('businessId')
        const { data } = await api.get<{ success: boolean; data: PublicCatalog }>(
          `/businesses/slug/${DEFAULT_BUSINESS_SLUG}/catalog`
        )
        const catalog = data.data
        if (catalog?.business?._id) {
          localStorage.setItem('businessId', catalog.business._id)
          localStorage.setItem('businessSlug', catalog.business.slug)
        }
        return catalog
      }
      throw err
    }
  },
}
