import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { catalogApi } from '@/services/catalog.api'
import type { Service } from '@/services/business.api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { resolveServiceImage as imageForService } from './home/homeData'



export default function ServicesPage() {
  const { t, i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    catalogApi
      .getCatalog()
      .then((c) => {
        if (c.services?.length) {
          setServices(
            c.services.map((s) => ({
              ...s,
              image: imageForService(s.name, s.image),
            }))
          )
        }
      })
      .catch(() => setServices([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container-app py-12">
      <div className="mb-10 text-center">
        <h1 className="text-h1 mb-2">{t('services')}</h1>
        <p className="text-text-secondary">
          {isAr ? 'جميع خدمات العيادة بأسعار واضحة' : 'All clinic services with clear pricing'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : services.length === 0 ? (
        <p className="py-16 text-center text-text-muted">{t('noServices')}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Card
              key={s._id}
              padding="none"
              className="overflow-hidden transition-shadow hover:shadow-md"
            >
              <div className="aspect-[4/3] overflow-hidden bg-surface-muted">
                <img
                  src={imageForService(s.name, s.image)}
                  alt={isAr ? s.nameAr || s.name : s.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-5">
                <h3 className="text-h4 mb-1">
                  {isAr ? s.nameAr || s.name : s.name}
                </h3>
                {(isAr ? s.descriptionAr || s.description : s.description) && (
                  <p className="mb-3 line-clamp-2 text-body-sm text-text-secondary">
                    {isAr ? s.descriptionAr || s.description : s.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-primary">
                      {s.price} {s.currency || t('currency')}
                    </p>
                    <p className="text-caption">
                      {s.duration} {t('minutes')}
                    </p>
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
