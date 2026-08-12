import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { catalogApi } from '@/services/catalog.api'
import type { Service } from '@/services/business.api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

/** Stable, high-quality clinic images (Unsplash) */
export const SERVICE_IMAGE_MAP: Record<string, string> = {
  general: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=800&q=80',
  followup: 'https://images.unsplash.com/photo-1576091160550-2173dba07efd?auto=format&fit=crop&w=800&q=80',
  derma: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80',
  lab: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
  pediatrics: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80',
  cardio: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
  ultrasound: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
}

export function imageForService(name = '', image?: string) {
  if (image && !image.includes('photo-1628348068343') && !image.includes('photo-1581595220892')) {
    return image
  }
  const n = name.toLowerCase()
  if (n.includes('general') || n.includes('كشف عام')) return SERVICE_IMAGE_MAP.general
  if (n.includes('follow') || n.includes('متابع')) return SERVICE_IMAGE_MAP.followup
  if (n.includes('derma') || n.includes('جلد')) return SERVICE_IMAGE_MAP.derma
  if (n.includes('lab') || n.includes('تحليل')) return SERVICE_IMAGE_MAP.lab
  if (n.includes('pediatr') || n.includes('أطفال')) return SERVICE_IMAGE_MAP.pediatrics
  if (n.includes('cardio') || n.includes('قلب')) return SERVICE_IMAGE_MAP.cardio
  if (n.includes('ultra') || n.includes('أشعة') || n.includes('اشعة')) return SERVICE_IMAGE_MAP.ultrasound
  return SERVICE_IMAGE_MAP.default
}

const FALLBACK: Service[] = [
  {
    _id: 'demo-1',
    businessId: 'demo',
    name: 'General Consultation',
    nameAr: 'كشف عام',
    description: 'Full GP consultation and examination.',
    price: 300,
    duration: 30,
    bufferTime: 10,
    staffRequired: true,
    status: 'active',
    sortOrder: 1,
    image: SERVICE_IMAGE_MAP.general,
  },
  {
    _id: 'demo-2',
    businessId: 'demo',
    name: 'Follow-up Visit',
    nameAr: 'زيارة متابعة',
    description: 'Follow-up after previous consultation.',
    price: 150,
    duration: 15,
    bufferTime: 5,
    staffRequired: true,
    status: 'active',
    sortOrder: 2,
    image: SERVICE_IMAGE_MAP.followup,
  },
  {
    _id: 'demo-3',
    businessId: 'demo',
    name: 'Dermatology Consultation',
    nameAr: 'كشف جلدية',
    description: 'Skin examination with a specialist.',
    price: 450,
    duration: 30,
    bufferTime: 10,
    staffRequired: true,
    status: 'active',
    sortOrder: 3,
    image: SERVICE_IMAGE_MAP.derma,
  },
  {
    _id: 'demo-4',
    businessId: 'demo',
    name: 'Lab Tests Package',
    nameAr: 'باقة تحاليل',
    description: 'Basic blood work and lab diagnostics.',
    price: 600,
    duration: 20,
    bufferTime: 5,
    staffRequired: false,
    status: 'active',
    sortOrder: 4,
    image: SERVICE_IMAGE_MAP.lab,
  },
  {
    _id: 'demo-5',
    businessId: 'demo',
    name: 'Pediatrics Consultation',
    nameAr: 'كشف أطفال',
    description: 'Child health check and pediatric care.',
    price: 350,
    duration: 30,
    bufferTime: 10,
    staffRequired: true,
    status: 'active',
    sortOrder: 5,
    image: SERVICE_IMAGE_MAP.pediatrics,
  },
  {
    _id: 'demo-6',
    businessId: 'demo',
    name: 'Cardiology Consultation',
    nameAr: 'كشف قلب',
    description: 'Heart check-up with a cardiologist.',
    price: 500,
    duration: 40,
    bufferTime: 10,
    staffRequired: true,
    status: 'active',
    sortOrder: 6,
    image: SERVICE_IMAGE_MAP.cardio,
  },
  {
    _id: 'demo-7',
    businessId: 'demo',
    name: 'Ultrasound Scan',
    nameAr: 'أشعة تلفزيونية',
    description: 'Diagnostic ultrasound imaging session.',
    price: 700,
    duration: 25,
    bufferTime: 10,
    staffRequired: true,
    status: 'active',
    sortOrder: 7,
    image: SERVICE_IMAGE_MAP.ultrasound,
  },
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
            c.services.map((s) => ({
              ...s,
              image: imageForService(s.name, s.image),
            }))
          )
        }
      })
      .catch(() => setServices(FALLBACK))
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
                {s.description && (
                  <p className="mb-3 line-clamp-2 text-body-sm text-text-secondary">
                    {s.description}
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
