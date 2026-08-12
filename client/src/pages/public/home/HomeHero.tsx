import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
// @ts-ignore
import 'swiper/css'
// @ts-ignore
import 'swiper/css/pagination'
// @ts-ignore
import 'swiper/css/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Calendar, ArrowRight } from 'lucide-react'
import { HERO_IMAGES } from './homeData'

export function HomeHero() {
  const { t, i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'

  return (
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
            <Badge className="mb-4 border-0 bg-white/15 text-white">
              {isAr ? 'عيادة طبية' : 'Medical Clinic'}
            </Badge>
            <h1 className="text-display mb-4 text-white">
              {isAr
                ? 'احجز موعدك في العيادة بسهولة'
                : 'Book your clinic appointment'}
            </h1>
            <p className="mb-6 text-body-lg text-white/85">
              {isAr
                ? 'رعاية طبية موثوقة — احجز كشفك أونلاين بالعربي والإنجليزي.'
                : 'Trusted medical care — book consultations online.'}
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
  )
}
