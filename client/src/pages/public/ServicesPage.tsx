import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { catalogApi } from '@/services/catalog.api'
import type { Service } from '@/services/business.api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const IMAGES = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
  'https://images.unsplash.com/photo-1604654894610-df63bc6f79cf?w=800&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
  'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80',
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80',
]

const FALLBACK: Service[] = [
  { _id: 'demo-1', businessId: 'demo', name: 'Haircut & Style', nameAr: 'قص وتصفيف', description: 'Professional cut with wash and style.', price: 250, duration: 45, bufferTime: 10, staffRequired: true, status: 'active', sortOrder: 1, image: IMAGES[0] },
  { _id: 'demo-2', businessId: 'demo', name: 'Classic Manicure', nameAr: 'مانيكير', description: 'Clean, shape, and polish.', price: 150, duration: 30, bufferTime: 5, staffRequired: true, status: 'active', sortOrder: 2, image: IMAGES[1] },
  { _id: 'demo-3', businessId: 'demo', name: 'Deep Facial', nameAr: 'تنظيف بشرة', description: 'Refreshing facial for glowing skin.', price: 400, duration: 60, bufferTime: 10, staffRequired: true, status: 'active', sortOrder: 3, image: IMAGES[2] },
]

export default function ServicesPage() {
  const { t, i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'
  const [services, setServices] = useState<Service[]>(FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    catalogApi
      .getCatalog()
      .then((c) => {
        if (c.services?.length) {
          setServices(
            c.services.map((s, i) => ({
              ...s,
              image: s.image || IMAGES[i % IMAGES.length],
            }))
          )
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container-app py-12">
      <div className="mb-10 text-center">
        <h1 className="text-h1 mb-2">{t('services')}</h1>
        <p className="text-text-secondary">
          {isAr ? 'اختر من مجموعة خدماتنا' : 'Browse our range of services'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Card key={s._id} padding="none" className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="aspect-[4/3] overflow-hidden bg-surface-muted">
                <img
                  src={s.image || IMAGES[i % IMAGES.length]}
                  alt={s.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-5">
                <h3 className="text-h4 mb-1">{isAr ? s.nameAr || s.name : s.name}</h3>
                {s.description && (
                  <p className="mb-3 line-clamp-2 text-body-sm text-text-secondary">
                    {s.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-primary">
                      {s.price} {s.currency || 'EGP'}
                    </p>
                    <p className="text-caption">{s.duration} min</p>
                  </div>
                  <Link to="/booking">
                    <Button size="sm">{t('bookNow')}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
