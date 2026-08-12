import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { bookingApi, type Booking } from '@/services/booking.api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export default function MyBookingsPage() {
  const { t } = useTranslation(['dashboard', 'common'])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    bookingApi
      .getMyBookings()
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
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
              No upcoming bookings
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {upcoming.map((b) => (
              <BookingCard key={b._id} booking={b} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-h3 mb-3">Past</h2>
        {past.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-text-muted">
              No past bookings
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {past.map((b) => (
              <BookingCard key={b._id} booking={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function BookingCard({ booking }: { booking: Booking }) {
  const serviceName =
    typeof booking.serviceId === 'object'
      ? booking.serviceId?.name
      : 'Service'
  const staffName =
    typeof booking.staffId === 'object' && booking.staffId
      ? `${booking.staffId.firstName} ${booking.staffId.lastName}`
      : null

  const dateStr = new Date(booking.date).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Card>
      <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
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
            {booking.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
