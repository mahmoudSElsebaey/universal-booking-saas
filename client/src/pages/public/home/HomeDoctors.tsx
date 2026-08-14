import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
// @ts-ignore
import 'swiper/css'
import type { StaffMember } from '@/services/business.api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AVATARS } from './homeData'
import { resolveMediaUrl } from '@/services/upload.api'

type Props = { doctors: StaffMember[] }

export function HomeDoctors({ doctors }: Props) {
  const { t, i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'

  return (
    <section className="border-y border-border bg-surface py-16">
      <div className="container-app">
        <div className="mb-10 text-center">
          <h2 className="text-h1 mb-2">{t('doctors')}</h2>
          <p className="text-text-secondary">
            {isAr ? 'تعرف على أطباء العيادة' : 'Meet our clinic doctors'}
          </p>
        </div>
        {doctors.length === 0 ? (
          <p className="text-center text-text-muted">
            {isAr ? 'شغّل الـ seed لعرض الأطباء' : 'Run seed to load doctors'}
          </p>
        ) : (
          <Swiper
            modules={[Autoplay]}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={700}
            spaceBetween={20}
            slidesPerView={1.15}
            loop={doctors.length > 3}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="!pb-2"
          >
            {doctors.map((d, i) => (
              <SwiperSlide key={d._id}>
                <Card className="h-full text-center">
                  <CardContent className="pt-6">
                    <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full bg-primary-50 ring-2 ring-primary/10">
                      <img
                        src={d.avatar ? resolveMediaUrl(d.avatar) : AVATARS[i % AVATARS.length]}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="text-h4">
                      {d.firstName} {d.lastName}
                    </h3>
                    {d.title && (
                      <p className="mb-2 text-body-sm text-primary">
                        {isAr && d.titleAr ? d.titleAr : d.title}
                      </p>
                    )}
                    {(d.bio || d.bioAr) && (
                      <p className="mb-3 line-clamp-2 text-body-sm text-text-secondary">
                        {isAr && d.bioAr ? d.bioAr : d.bio}
                      </p>
                    )}
                    <Link to="/booking">
                      <Button size="sm" variant="outline">
                        {t('bookNow')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        <div className="mt-8 text-center">
          <Link to="/staff">
            <Button variant="outline">{t('viewAll')}</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
