import { useEffect, useState } from 'react'
import { catalogApi } from '@/services/catalog.api'
import { reviewApi, type Review } from '@/services/review.api'
import type { Service, StaffMember } from '@/services/business.api'
import { resolveServiceImage } from './home/homeData'
import { HomeHero } from './home/HomeHero'
import { HomeServices } from './home/HomeServices'
import { HomeDoctors } from './home/HomeDoctors'
import { HomeFeatures } from './home/HomeFeatures'
import { HomeReviews } from './home/HomeReviews'
import { HomeCta } from './home/HomeCta'

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([])
  const [doctors, setDoctors] = useState<StaffMember[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    catalogApi
      .getCatalog()
      .then((c) => {
        if (c.services?.length) {
          setServices(
            c.services.map((s) => ({
              ...s,
              image: resolveServiceImage(s.name, s.image),
            }))
          )
        }
        if (c.staff?.length) setDoctors(c.staff)
        if (c.reviews?.length) {
          setReviews(c.reviews)
          setAvgRating(c.reviewSummary?.averageRating || 0)
        } else if (c.business?._id) {
          reviewApi
            .list(c.business._id, { limit: 8 })
            .then((r) => {
              setReviews(r.data || [])
              setAvgRating(r.summary?.averageRating || 0)
            })
            .catch(() => {})
        }
      })
      .catch((err) => {
        console.error('[catalog]', err?.message || err)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <HomeHero />
      <HomeServices services={services} loading={loading} />
      <HomeDoctors doctors={doctors} />
      <HomeFeatures />
      <HomeReviews reviews={reviews} avgRating={avgRating} />
      <HomeCta />
    </div>
  )
}
