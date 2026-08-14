import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules'
// @ts-ignore
import 'swiper/css'
// @ts-ignore
import 'swiper/css/effect-coverflow'
// @ts-ignore
import 'swiper/css/pagination'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Review } from '@/services/review.api'
import { reviewApi } from '@/services/review.api'
import { useAuth } from '@/store/authStore'
import { catalogApi } from '@/services/catalog.api'
import { Star } from 'lucide-react'

type Props = {
  reviews: Review[]
  avgRating: number
  onReviewAdded?: () => void
}

export function HomeReviews({ reviews, avgRating, onReviewAdded }: Props) {
  const { t, i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'
  const { isAuthenticated, user } = useAuth()

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submitReview = async () => {
    setError('')
    setMessage('')
    if (!isAuthenticated || !user) {
      setError(isAr ? 'يجب تسجيل الدخول أولاً' : 'Please sign in first')
      return
    }
    setSubmitting(true)
    try {
      let businessId = localStorage.getItem('businessId') || ''
      if (!businessId) {
        const c = await catalogApi.getCatalog()
        businessId = c.business?._id || ''
      }
      if (!businessId) throw new Error('No business')

      await reviewApi.create({
        businessId,
        customerName: `${user.firstName} ${user.lastName}`.trim(),
        rating,
        comment: comment || undefined,
      })
      setMessage(t('reviewThanks'))
      setComment('')
      setRating(5)
      onReviewAdded?.()
    } catch (e: any) {
      setError(e?.response?.data?.message || t('errorGeneric'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="border-t border-border bg-surface py-16 overflow-hidden">
      <div className="container-app">
        <div className="mb-10 text-center">
          <h2 className="text-h1 mb-2">
            {isAr ? 'آراء المرضى' : 'Patient reviews'}
          </h2>
          {avgRating > 0 && (
            <p className="flex items-center justify-center gap-1 text-primary">
              <Star className="h-5 w-5 fill-current" />
              {avgRating.toFixed(1)} / 5
            </p>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className="text-center text-text-muted mb-10">
            {isAr
              ? 'لا توجد مراجعات بعد — كن أول من يقيّم'
              : 'No reviews yet — be the first to rate'}
          </p>
        ) : (
          <div className="reviews-swiper mb-12 max-w-4xl mx-auto">
            <Swiper
              modules={[Autoplay, EffectCoverflow, Pagination]}
              effect="coverflow"
              grabCursor
              centeredSlides
              slidesPerView={1}
              spaceBetween={24}
              loop={reviews.length > 2}
              autoplay={{
                delay: 4500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              speed={650}
              pagination={{ clickable: true }}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 120,
                modifier: 1.4,
                slideShadows: false,
              }}
              breakpoints={{
                768: {
                  slidesPerView: 1.35,
                },
                1024: {
                  slidesPerView: 1.55,
                },
              }}
              className="!pb-12"
            >
              {reviews.map((r) => (
                <SwiperSlide key={r._id}>
                  <Card className="review-card h-full border-border/80 shadow-sm">
                    <CardContent className="pt-6 pb-6 px-6 sm:px-8">
                      <div className="mb-3 flex gap-0.5 text-secondary">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <p className="mb-4 text-body text-text-secondary leading-relaxed min-h-[4.5rem]">
                        {r.comment || '—'}
                      </p>
                      <p className="text-sm font-semibold text-text">
                        {r.customerName}
                      </p>
                    </CardContent>
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Write a review — requires login */}
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-h4 text-center">{t('writeReview')}</h3>
            {!isAuthenticated ? (
              <div className="text-center space-y-3">
                <p className="text-body-sm text-text-secondary">
                  {isAr
                    ? 'سجّل الدخول لإضافة تقييمك للعيادة والخدمات'
                    : 'Sign in to rate the clinic and services'}
                </p>
                <Link to="/auth/login">
                  <Button size="sm">{t('login')}</Button>
                </Link>
              </div>
            ) : (
              <>
                <div>
                  <p className="mb-2 text-sm font-medium text-text">
                    {t('yourRating')}
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className="p-0.5"
                        aria-label={`${n}`}
                      >
                        <Star
                          className={`h-7 w-7 transition-colors ${
                            n <= rating
                              ? 'fill-secondary text-secondary'
                              : 'text-border-strong'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  label={t('reviewComment')}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                {error && <p className="text-sm text-error">{error}</p>}
                {message && <p className="text-sm text-success">{message}</p>}
                <Button
                  fullWidth
                  isLoading={submitting}
                  onClick={submitReview}
                >
                  {t('submitReview')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
