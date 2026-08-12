import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
// import 'swiper/css'
// import 'swiper/css/pagination'
// import 'swiper/css/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { catalogApi } from '@/services/catalog.api'
import { reviewApi, type Review } from '@/services/review.api'
import type { Service } from '@/services/business.api'
import {
  Calendar,
  Clock,
  Shield,
  Users,
  CheckCircle2,
  ArrowRight,
  Star,
} from 'lucide-react'

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=85',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&q=85',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1600&q=85',
  'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1600&q=85',
]

const SERVICE_IMAGES = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
  'https://images.unsplash.com/photo-1604654894610-df63bc6f79cf?w=800&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
]

const FEATURES = [
  { icon: Calendar, title: 'Easy Booking', titleAr: 'حجز سهل', desc: 'Book in a few taps.', descAr: 'احجز في خطوات بسيطة.' },
  { icon: Clock, title: 'Real-time Availability', titleAr: 'مواعيد لحظية', desc: 'Only open slots shown.', descAr: 'المواعيد المتاحة فقط.' },
  { icon: Shield, title: 'Trusted & Secure', titleAr: 'آمن وموثوق', desc: 'Your data is protected.', descAr: 'بياناتك محمية.' },
  { icon: Users, title: 'Expert Team', titleAr: 'فريق محترف', desc: 'Choose your specialist.', descAr: 'اختار المتخصص المناسب.' },
]

export default function HomePage() {
  const { t, i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState(0)

  useEffect(() => {
    catalogApi
      .getCatalog()
      .then((c) => {
        setServices(c.services?.slice(0, 4) || [])
        return reviewApi.list(c.business._id, { limit: 6 })
      })
      .then((r) => {
        if (r) {
          setReviews(r.data || [])
          setAvgRating(r.summary?.averageRating || 0)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div>
      {/* Hero Swiper */}
      <section className="relative">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          loop
          className="h-105 md:h-130"
        >
          {HERO_IMAGES.map((src, i) => (
            <SwiperSlide key={i}>
              <div className="relative h-full w-full">
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/35 to-black/20" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center">
          <div className="container-app pointer-events-auto">
            <div className="max-w-xl text-white">
              <Badge className="mb-4 bg-white/15 text-white border-0">
                Premium Booking
              </Badge>
              <h1 className="text-display mb-4 text-white">
                {isAr
                  ? 'احجز موعدك بكل سهولة وثقة'
                  : 'Book appointments with ease'}
              </h1>
              <p className="mb-6 text-body-lg text-white/85">
                {isAr
                  ? 'منصة حجز احترافية — سريعة، آمنة، وبالعربي والإنجليزي.'
                  : 'Professional booking — fast, secure, and bilingual.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/booking">
                  <Button size="lg" leftIcon={<Calendar className="h-5 w-5" />}>
                    {t('bookNow')}
                  </Button>
                </Link>
                <Link to="/services">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    {t('viewAll')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container-app py-16">
        <div className="mb-10 text-center">
          <h2 className="text-h1 mb-2">{t('services')}</h2>
          <p className="text-text-secondary">
            {isAr ? 'خدمات مميزة بأسعار واضحة' : 'Featured services'}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(services.length
            ? services
            : [
                { _id: '1', name: 'Haircut', nameAr: 'قص', price: 250, duration: 45 },
                { _id: '2', name: 'Manicure', nameAr: 'مانيكير', price: 150, duration: 30 },
                { _id: '3', name: 'Facial', nameAr: 'بشرة', price: 400, duration: 60 },
                { _id: '4', name: 'Coloring', nameAr: 'صبغة', price: 800, duration: 120 },
              ]
          ).map((s: any, i: number) => (
            <Card key={s._id} padding="none" className="overflow-hidden">
              <div className="aspect-4/3 overflow-hidden">
                <img
                  src={s.image || SERVICE_IMAGES[i % SERVICE_IMAGES.length]}
                  alt={s.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-h4 mb-1">
                  {isAr ? s.nameAr || s.name : s.name}
                </h3>
                <p className="text-body-sm text-text-muted mb-2">
                  {s.duration} min
                </p>
                <p className="font-semibold text-primary">{s.price} EGP</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/booking">
            <Button>{t('bookNow')}</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-surface py-16">
        <div className="container-app grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-h4 mb-1">{isAr ? f.titleAr : f.title}</h3>
                <p className="text-body-sm text-text-secondary">
                  {isAr ? f.descAr : f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      {(reviews.length > 0 || avgRating > 0) && (
        <section className="container-app py-16">
          <div className="mb-10 text-center">
            <h2 className="text-h1 mb-2">
              {isAr ? 'آراء العملاء' : 'Customer reviews'}
            </h2>
            {avgRating > 0 && (
              <p className="flex items-center justify-center gap-1 text-primary">
                <Star className="h-5 w-5 fill-current" />
                {avgRating} / 5
              </p>
            )}
          </div>
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={16}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            slidesPerView={1}
          >
            {reviews.map((r) => (
              <SwiperSlide key={r._id}>
                <Card className="h-full">
                  <CardContent className="pt-5">
                    <div className="mb-2 flex gap-0.5 text-secondary">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="mb-3 text-body-sm text-text-secondary line-clamp-4">
                      {r.comment || '—'}
                    </p>
                    <p className="text-sm font-medium">{r.customerName}</p>
                  </CardContent>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {/* CTA */}
      <section className="container-app pb-20">
        <div className="rounded-2xl bg-primary px-8 py-12 text-center text-white">
          <CheckCircle2 className="mx-auto mb-4 h-10 w-10 opacity-90" />
          <h2 className="text-h1 mb-3">
            {isAr ? 'جاهز تحجز؟' : 'Ready to book?'}
          </h2>
          <p className="mx-auto mb-6 max-w-md text-body-lg opacity-90">
            {isAr
              ? 'اختر الخدمة والوقت المناسب لك في دقائق.'
              : 'Pick your service and preferred time in minutes.'}
          </p>
          <Link to="/booking">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-primary-50"
            >
              {t('bookNow')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
