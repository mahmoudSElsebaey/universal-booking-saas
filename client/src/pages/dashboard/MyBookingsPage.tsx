import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { bookingApi, type Booking } from '@/services/booking.api'
import { reviewApi } from '@/services/review.api'
import { useAuth } from '@/store/authStore'
import { catalogApi } from '@/services/catalog.api'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Star } from 'lucide-react'

export default function MyBookingsPage() {
  const { t, i18n } = useTranslation(['dashboard', 'common'])
  const isAr = i18n.language === 'ar'
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [businessId, setBusinessId] = useState(
    () => localStorage.getItem('businessId') || ''
  )

  const load = () => {
    setLoading(true)
    bookingApi
      .getMyBookings()
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    if (!businessId) {
      catalogApi.getCatalog().then((c) => {
        if (c.business?._id) setBusinessId(c.business._id)
      }).catch(() => {})
    }
  }, [])

  const upcoming = bookings.filter(
    (b) =>
      ['pending', 'confirmed'].includes(b.status) &&
      new Date(b.date) >= new Date(new Date().setHours(0, 0, 0, 0))
  )
  const past = bookings.filter(
    (b) =>
      !['pending', 'confirmed'].includes(b.status) ||
      new Date(b.date) < new Date(new Date().setHours(0, 0, 0, 0))
  )

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-h1">{t('dashboard:bookings')}</h1>

      <section>
        <h2 className="text-h3 mb-3">{t('dashboard:upcoming')}</h2>
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-text-muted">
              {t('noUpcoming')}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {upcoming.map((b) => (
              <BookingCard key={b._id} booking={b} isAr={isAr} t={t} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-h3 mb-3">{t('dashboard:past')}</h2>
        {past.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-text-muted">
              {t('noPastBookings')}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {past.map((b) => (
              <BookingCard
                key={b._id}
                booking={b}
                isAr={isAr}
                t={t}
                canReview={b.status === 'completed'}
                businessId={businessId || (typeof b.businessId === 'object' ? b.businessId?._id : b.businessId)}
                onReviewed={load}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function BookingCard({
  booking,
  isAr,
  t,
  canReview,
  businessId,
  onReviewed,
}: {
  booking: Booking
  isAr: boolean
  t: (k: string) => string
  canReview?: boolean
  businessId?: string
  onReviewed?: () => void
}) {
  const { user } = useAuth()
  const [openReview, setOpenReview] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')

  const serviceName =
    typeof booking.serviceId === 'object' && booking.serviceId
      ? isAr && booking.serviceId.nameAr
        ? booking.serviceId.nameAr
        : booking.serviceId.name
      : t('service')

  const staffName =
    typeof booking.staffId === 'object' && booking.staffId
      ? `${booking.staffId.firstName} ${booking.staffId.lastName}`
      : null

  const dateStr = new Date(booking.date).toLocaleDateString(
    isAr ? 'ar-EG' : undefined,
    {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  )

  const statusKey =
    booking.status === 'no_show' ? 'noShow' : booking.status
  const statusLabel = t(statusKey as any) || booking.status

  const submitReview = async () => {
    if (!businessId) return
    setSubmitting(true)
    setErr('')
    try {
      await reviewApi.create({
        businessId,
        bookingId: booking._id,
        serviceId:
          typeof booking.serviceId === 'object'
            ? booking.serviceId?._id
            : booking.serviceId,
        staffId:
          typeof booking.staffId === 'object'
            ? booking.staffId?._id
            : booking.staffId,
        customerName: user
          ? `${user.firstName} ${user.lastName}`
          : booking.customerName,
        rating,
        comment: comment || undefined,
      })
      setDone(true)
      setOpenReview(false)
      onReviewed?.()
    } catch (e: any) {
      setErr(e?.response?.data?.message || t('common:errorGeneric'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-medium text-text">{serviceName}</p>
            <p className="text-body-sm text-text-secondary">
              {dateStr} · {booking.startTime} – {booking.endTime}
              {staffName && ` · ${staffName}`}
            </p>
            <p className="text-caption mt-1">
              {booking.price} {booking.currency}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                booking.status === 'confirmed'
                  ? 'success'
                  : booking.status === 'cancelled'
                    ? 'error'
                    : booking.status === 'completed'
                      ? 'muted'
                      : 'warning'
              }
            >
              {statusLabel}
            </Badge>
            {canReview && !done && (
              <Button size="sm" variant="outline" onClick={() => setOpenReview((v) => !v)}>
                {t('dashboard:leaveReview')}
              </Button>
            )}
            {done && (
              <span className="text-caption text-success">{t('common:reviewThanks')}</span>
            )}
          </div>
        </div>

        {openReview && (
          <div className="rounded-md border border-border bg-surface-muted/40 p-4 space-y-3">
            <p className="text-sm font-medium">{t('common:yourRating')}</p>
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
                    className={`h-6 w-6 ${
                      n <= rating ? 'fill-secondary text-secondary' : 'text-border-strong'
                    }`}
                  />
                </button>
              ))}
            </div>
            <Input
              label={t('common:reviewComment')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            {err && <p className="text-sm text-error">{err}</p>}
            <Button size="sm" isLoading={submitting} onClick={submitReview}>
              {t('common:submitReview')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
