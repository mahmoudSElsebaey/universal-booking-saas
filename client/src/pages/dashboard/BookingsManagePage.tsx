import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useBusinessId } from '@/hooks/useBusinessId'
import { bookingApi, type Booking, type BookingStatus } from '@/services/booking.api'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'

const STATUSES: (BookingStatus | 'all')[] = [
  'all',
  'confirmed',
  'pending',
  'completed',
  'cancelled',
  'no_show',
]

export default function BookingsManagePage() {
  const { t, i18n } = useTranslation(['dashboard', 'common'])
  const isAr = i18n.language === 'ar'
  const { businessId, loading: bizLoading } = useBusinessId()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<BookingStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const { success, error: toastError } = useToast()

  const statusLabel = (s: string) => {
    if (s === 'all') return t('all', { defaultValue: isAr ? 'الكل' : 'All' })
    if (s === 'no_show') return t('noShow')
    return t(s as any) || s
  }

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

  const confirmCancel = async () => {
    if (!businessId || !cancelId) return
    setCancelLoading(true)
    try {
      await bookingApi.cancel(businessId, cancelId, 'Cancelled by admin')
      setCancelId(null)
      await load()
      success(t('cancelledSuccess', { defaultValue: isAr ? 'تم إلغاء الموعد' : 'Booking cancelled' }))
    } catch {
      toastError(t('failedCancel'))
    } finally {
      setCancelLoading(false)
    }
  }

  const complete = async (id: string) => {
    if (!businessId) return
    try {
      await bookingApi.updateStatus(businessId, id, 'completed')
      await load()
      success(t('completedSuccess', { defaultValue: isAr ? 'تم إكمال الموعد' : 'Booking completed' }))
    } catch {
      toastError(t('failedUpdate'))
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
      <div className="text-center py-16 text-text-secondary">{t('noBusiness')}</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-h1">{t('bookings')}</h1>
        <Link to="/dashboard/bookings/new">
          <Button className="w-full sm:w-auto">{t('newBooking')}</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder={t('searchBookings')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
          <Button variant="outline" onClick={load}>
            {t('search')}
          </Button>
        </div>

        {/* Status filters — styled chips */}
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
                status === s
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : 'border-border bg-surface text-text-secondary hover:border-primary/40 hover:text-primary'
              )}
            >
              {statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          {bookings.length === 0 ? (
            <p className="text-center py-10 text-text-muted">{t('noData')}</p>
          ) : (
            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="pb-3 font-medium text-start">{t('customer')}</th>
                    <th className="pb-3 font-medium text-start">{t('service')}</th>
                    <th className="pb-3 font-medium text-start">{t('date')}</th>
                    <th className="pb-3 font-medium text-start">{t('time')}</th>
                    <th className="pb-3 font-medium text-start">{t('status')}</th>
                    <th className="pb-3 font-medium text-start">{t('payment')}</th>
                    <th className="pb-3 font-medium text-end">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const serviceName =
                      typeof b.serviceId === 'object' && b.serviceId
                        ? isAr && b.serviceId.nameAr
                          ? b.serviceId.nameAr
                          : b.serviceId.name
                        : '—'
                    const dateStr = new Date(b.date).toLocaleDateString(
                      isAr ? 'ar-EG' : undefined
                    )
                    return (
                      <tr key={b._id} className="border-b border-border-subtle">
                        <td className="py-3 pe-2">
                          <p className="font-medium">{b.customerName}</p>
                          <p className="text-xs text-text-muted">{b.customerEmail}</p>
                        </td>
                        <td className="py-3 pe-2">{serviceName}</td>
                        <td className="py-3 pe-2 whitespace-nowrap">{dateStr}</td>
                        <td className="py-3 pe-2 whitespace-nowrap">
                          {b.startTime}–{b.endTime}
                        </td>
                        <td className="py-3 pe-2">
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
                            {statusLabel(b.status)}
                          </Badge>
                        </td>
                        <td className="py-3 pe-2">
                          <div className="space-y-0.5">
                            <Badge
                              variant={
                                b.paymentStatus === 'paid' ? 'success' : 'warning'
                              }
                            >
                              {b.paymentStatus === 'paid'
                                ? t('paid')
                                : b.paymentStatus || '—'}
                            </Badge>
                            {b.paymentMethod && (
                              <p className="text-xs text-text-muted">
                                {b.paymentMethod === 'vodafone_cash'
                                  ? t('vodafoneCash', {
                                      defaultValue: isAr
                                        ? 'فودافون كاش'
                                        : 'Vodafone Cash',
                                    })
                                  : b.paymentMethod === 'visa'
                                    ? 'Visa'
                                    : b.paymentMethod}
                              </p>
                            )}
                            {b.price != null && (
                              <p className="text-xs font-medium">
                                {b.price} {b.currency || 'EGP'}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-end">
                          <div className="flex flex-wrap justify-end gap-1">
                            {['confirmed', 'pending'].includes(b.status) && (
                              <>
                                <Button
                                  size="sm"
                                  variant="soft"
                                  onClick={() => complete(b._id)}
                                >
                                  {t('complete', {
                                    defaultValue: isAr ? 'إكمال' : 'Complete',
                                  })}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setCancelId(b._id)}
                                >
                                  {t('common:cancel')}
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
      <ConfirmDialog
        open={!!cancelId}
        title={t('confirmCancel', { defaultValue: isAr ? 'إلغاء الموعد' : 'Cancel booking' })}
        message={isAr ? 'هل أنت متأكد من إلغاء هذا الموعد؟' : 'Are you sure you want to cancel this booking?'}
        confirmLabel={isAr ? 'إلغاء الموعد' : 'Cancel booking'}
        cancelLabel={t('common:close', { defaultValue: isAr ? 'رجوع' : 'Back' })}
        onConfirm={confirmCancel}
        onCancel={() => setCancelId(null)}
        loading={cancelLoading}
      />
    </div>
  )
}
