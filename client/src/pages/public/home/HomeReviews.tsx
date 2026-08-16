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
import { Star, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

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
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { success, error: toastError } = useToast()
  const canModerate =
    !!user &&
    ['super_admin', 'business_owner', 'manager'].includes(user.role)


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

  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      let businessId = localStorage.getItem('businessId') || ''
      if (!businessId) {
        const c = await catalogApi.getCatalog()
        businessId = c.business?._id || ''
      }
      if (!businessId) throw new Error('No business')
      await reviewApi.delete(businessId, deleteId)
      setDeleteId(null)
      success(isAr ? 'تم حذف التقييم' : 'Review deleted')
      onReviewAdded?.()
    } catch (e: any) {
      toastError(e?.response?.data?.message || t('errorGeneric'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="border-t border-border bg-surface py-16 overflow-hidden">
      <div className="container-app">
        <div className="mb-10 text-center">
          <h2 className="text-h1 mb-2">
            {isAr ? 'آراء عملائنا' : 'What our clients say'}
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
              : 'No reviews yet — be the first to share your experience'}
          </p>
        ) : (
          <div className="reviews-swiper mb-12 max-w-4xl mx-auto">
            <Swiper
              key={`${i18n.language}-${reviews.length}-${reviews.map((r) => r._id).join('-')}`}
              modules={[Autoplay, EffectCoverflow, Pagination]}
              effect="coverflow"
              grabCursor
              centeredSlides
              slidesPerView={1}
              spaceBetween={24}
              observer
              observeParents
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
              className="pb-12!"
            >
              {reviews.map((r) => (
                <SwiperSlide key={`${i18n.language}-${r._id}`}>
                  <Card className="review-card h-full border-border/80 shadow-sm">
                    <CardContent className="pt-6 pb-6 px-6 sm:px-8 relative">
                      {canModerate && (
                        <button
                          type="button"
                          onClick={() => setDeleteId(r._id)}
                          className="absolute top-4 inset-e-4 rounded-md p-1.5 text-text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
                          title={isAr ? 'حذف التقييم' : 'Delete review'}
                          aria-label={isAr ? 'حذف التقييم' : 'Delete review'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <div className="mb-3 flex gap-0.5 text-secondary">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <p className="mb-4 text-body text-text-secondary leading-relaxed min-h-18">
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
      <ConfirmDialog
        open={!!deleteId}
        message={
          isAr
            ? 'هل أنت متأكد من حذف هذا التقييم؟'
            : 'Are you sure you want to delete this review?'
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </section>
  )
}

