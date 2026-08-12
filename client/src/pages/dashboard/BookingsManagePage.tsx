import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useBusinessId } from '@/hooks/useBusinessId'
import { bookingApi, type Booking, type BookingStatus } from '@/services/booking.api'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const STATUSES: (BookingStatus | 'all')[] = [
  'all',
  'confirmed',
  'pending',
  'completed',
  'cancelled',
  'no_show',
]

export default function BookingsManagePage() {
  const { t } = useTranslation(['dashboard', 'common'])
  const { businessId, loading: bizLoading } = useBusinessId()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<BookingStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const load = async () => {
    if (!businessId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await bookingApi.list(businessId, {
        limit: 50,
        status: status === 'all' ? undefined : status,
        search: search || undefined,
      })
      setBookings(res.data || [])
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!bizLoading) load()
  }, [businessId, bizLoading, status])

  const cancel = async (id: string) => {
    if (!businessId || !confirm('Cancel this booking?')) return
    try {
      await bookingApi.cancel(businessId, id, 'Cancelled by admin')
      await load()
    } catch {
      alert('Failed to cancel')
    }
  }

  const complete = async (id: string) => {
    if (!businessId) return
    try {
      await bookingApi.updateStatus(businessId, id, 'completed')
      await load()
    } catch {
      alert('Failed to update')
    }
  }

  if (bizLoading || loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!businessId) {
    return (
      <div className="text-center py-16 text-text-secondary">
        {t("dashboard:noBusiness")}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-h1">{t("dashboard:bookings")}</h1>
        <Link to="/dashboard/bookings/new">
          <Button>{t("dashboard:newBooking")}</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder={t("dashboard:searchBookings")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Button variant="outline" onClick={load}>
          Search
        </Button>
        <div className="flex flex-wrap gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                status === s
                  ? 'bg-primary text-white'
                  : 'bg-surface-muted text-text-secondary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          {bookings.length === 0 ? (
            <p className="text-center py-10 text-text-muted">{t("dashboard:noData")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="pb-3 font-medium text-start">{t("dashboard:customer")}</th>
                    <th className="pb-3 font-medium text-start">{t("dashboard:service")}</th>
                    <th className="pb-3 font-medium text-start">{t("dashboard:date")}</th>
                    <th className="pb-3 font-medium text-start">{t("dashboard:time")}</th>
                    <th className="pb-3 font-medium text-start">{t("dashboard:status")}</th>
                    <th className="pb-3 font-medium text-end">{t("dashboard:actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const serviceName =
                      typeof b.serviceId === 'object' ? b.serviceId?.name : '—'
                    const dateStr = new Date(b.date).toLocaleDateString()
                    return (
                      <tr key={b._id} className="border-b border-border-subtle">
                        <td className="py-3">
                          <p className="font-medium">{b.customerName}</p>
                          <p className="text-xs text-text-muted">
                            {b.customerEmail}
                          </p>
                        </td>
                        <td className="py-3">{serviceName}</td>
                        <td className="py-3">{dateStr}</td>
                        <td className="py-3">
                          {b.startTime}–{b.endTime}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={
                              b.status === 'confirmed'
                                ? 'success'
                                : b.status === 'cancelled'
                                  ? 'error'
                                  : b.status === 'pending'
                                    ? 'warning'
                                    : 'muted'
                            }
                          >
                            {b.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-end">
                          <div className="flex justify-end gap-1">
                            {['confirmed', 'pending'].includes(b.status) && (
                              <>
                                <Button size="sm" variant="soft" onClick={() => complete(b._id)}>
                                  Complete
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => cancel(b._id)}>
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
