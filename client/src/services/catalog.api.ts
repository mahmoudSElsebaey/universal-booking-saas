import { api } from './api'
import type { Business, Service, StaffMember } from './business.api'

export interface PublicCatalog {
  business: Business
  services: Service[]
  staff: StaffMember[]
}

const DEFAULT_SLUG = localStorage.getItem('businessSlug') || 'luxe-beauty'

export const catalogApi = {
  getDefaultSlug: () => DEFAULT_SLUG,

  getCatalog: (slug = DEFAULT_SLUG) =>
    api
      .get<{ success: boolean; data: PublicCatalog }>(
        `/businesses/slug/${slug}/catalog`
      )
      .then((r) => {
        localStorage.setItem('businessId', r.data.data.business._id)
        localStorage.setItem('businessSlug', r.data.data.business.slug)
        return r.data.data
      }),
}
