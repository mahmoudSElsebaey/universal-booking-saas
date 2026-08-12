import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
// @ts-ignore
import 'swiper/css'
// @ts-ignore
import 'swiper/css/pagination'
import { Card, CardContent } from '@/components/ui/Card'
import type { Review } from '@/services/review.api'
import { Star } from 'lucide-react'

type Props = {
  reviews: Review[]
  avgRating: number
}

export function HomeReviews({ reviews, avgRating }: Props) {
  const { i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'

  return (
    <section className="border-t border-border bg-surface py-16">
      <div className="container-app">
        <div className="mb-10 text-center">
          <h2 className="text-h1 mb-2">
            {isAr ? 'آراء المرضى' : 'Patient reviews'}
          </h2>
          {avgRating > 0 && (
            <p className="flex items-center justify-center gap-1 text-primary">
              <Star className="h-5 w-5 fill-current" />
              {avgRating} / 5
            </p>
          )}
        </div>
        {reviews.length === 0 ? (
          <p className="text-center text-text-muted">
            {isAr
              ? 'لا توجد مراجعات بعد — شغّل seed'
              : 'No reviews yet — run seed'}
          </p>
        ) : (
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
                    <p className="mb-3 line-clamp-4 text-body-sm text-text-secondary">
                      {r.comment || '—'}
                    </p>
                    <p className="text-sm font-medium">{r.customerName}</p>
                  </CardContent>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  )
}
