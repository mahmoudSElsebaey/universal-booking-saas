import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Service } from '@/services/business.api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { resolveServiceImage } from './homeData'

type Props = {
  services: Service[]
  loading: boolean
}

export function HomeServices({ services, loading }: Props) {
  const { t, i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'
  const display = services

  const serviceName = (s: Service) => (isAr ? s.nameAr || s.name : s.name)
  const serviceDesc = (s: Service & { descriptionAr?: string }) =>
    isAr ? s.descriptionAr || s.description : s.description

  return (
    <section className="container-app py-16">
      <div className="mb-10 text-center">
        <h2 className="text-h1 mb-2">{t('services')}</h2>
        <p className="text-text-secondary">
          {isAr
            ? 'جميع خدمات العيادة بأسعار واضحة'
            : 'All clinic services with clear pricing'}
        </p>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : display.length === 0 ? (
        <p className="py-12 text-center text-text-muted">{t('noServices')}</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {display.map((s) => (
            <Card
              key={s._id}
              padding="none"
              className="overflow-hidden transition-shadow hover:shadow-md"
            >
              <div className="aspect-4/3 overflow-hidden bg-surface-muted">
                <img
                  src={resolveServiceImage(s.name, s.image)}
                  alt={serviceName(s)}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-h4 mb-1">{serviceName(s)}</h3>
                {serviceDesc(s) && (
                  <p className="mb-2 text-body-sm text-text-muted line-clamp-2">
                    {serviceDesc(s)}
                  </p>
                )}
                <div className="flex items-center justify-between gap-2">
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
      <div className="mt-8 text-center">
        <Link to="/services">
          <Button variant="outline">{t('viewAll')}</Button>
        </Link>
      </div>
    </section>
  )
}
