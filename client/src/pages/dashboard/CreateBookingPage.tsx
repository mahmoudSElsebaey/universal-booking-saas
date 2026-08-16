import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBusinessId } from '@/hooks/useBusinessId'
import { businessApi, type Service, type StaffMember } from '@/services/business.api'
import { bookingApi, type TimeSlot } from '@/services/booking.api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

const schema = z.object({
  serviceId: z.string().min(1),
  staffId: z.string().optional(),
  date: z.string().min(1),
  startTime: z.string().min(1),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
})

type Form = z.infer<typeof schema>

export default function CreateBookingPage() {
  const { t, i18n } = useTranslation(['dashboard', 'common'])
  const isAr = i18n.language === 'ar'
  const navigate = useNavigate()
  const { businessId, loading: bizLoading } = useBusinessId()
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [error, setError] = useState('')

  const mapApiError = (msg?: string) => {
    if (!msg) return t('common:errorGeneric')
    const m = msg.toLowerCase()
    if (
      m.includes('staff selection is required') ||
      m.includes('no_staff_available')
    ) {
      return isAr
        ? 'لا يوجد طبيب متاح لهذا الموعد. جرّب وقتاً آخر أو اختر طبيباً محدداً.'
        : 'No doctor is available for this slot. Try another time or pick a doctor.'
    }
    if (m.includes('slot_unavailable') || m.includes('no longer available')) {
      return isAr
        ? 'هذا الموعد لم يعد متاحاً. اختر وقتاً آخر.'
        : 'This time slot is no longer available. Please choose another.'
    }
    if (m.includes('staff not found')) {
      return isAr ? 'الطبيب غير موجود أو غير متاح.' : 'Doctor not found or unavailable.'
    }
    return msg
  }

  const [loadingSlots, setLoadingSlots] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const serviceId = watch('serviceId')
  const staffId = watch('staffId')
  const date = watch('date')
  const startTime = watch('startTime')

  useEffect(() => {
    if (!businessId) return
    businessApi
      .listServices(businessId, { status: 'active', limit: 50 })
      .then((r) => setServices(r.data || []))
      .catch(() => setServices([]))
  }, [businessId])

  useEffect(() => {
    if (!businessId || !serviceId) {
      setStaff([])
      return
    }
    businessApi
      .getStaffForService(businessId, serviceId)
      .then(setStaff)
      .catch(() => {
        // Fallback: all active staff
        businessApi
          .listStaff(businessId, { limit: 50 })
          .then((r) => setStaff(r.data || []))
          .catch(() => setStaff([]))
      })
  }, [businessId, serviceId])

  useEffect(() => {
    if (!businessId || !serviceId || !date) {
      setSlots([])
      return
    }
    setLoadingSlots(true)
    setValue('startTime', '')
    bookingApi
      .getAvailability({
        businessId,
        serviceId,
        staffId: staffId || undefined,
        date,
      })
      .then((r) => setSlots((r.slots || []).filter((s) => s.available)))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [businessId, serviceId, staffId, date])

  const onSubmit = async (data: Form) => {
    if (!businessId) return
    setError('')
    try {
      await bookingApi.create({
        businessId,
        serviceId: data.serviceId,
        staffId: data.staffId || undefined,
        date: data.date,
        startTime: data.startTime,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        notes: data.notes,
        paymentMethod: 'cash',
      })
      navigate('/dashboard/bookings')
    } catch (err: any) {
      setError(mapApiError(err?.response?.data?.message))
    }
  }

  if (bizLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!businessId) {
    return (
      <div className="py-16 text-center text-text-secondary">
        {t('noBusiness')}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full space-y-6" style={{ maxWidth: 560 }}>
      <h1 className="text-h1">{t('newBooking')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('bookingDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800 shadow-sm">
                <span className="mt-0.5 font-semibold">!</span>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-label">{t('service')}</label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
                {...register('serviceId')}
              >
                <option value="">{t('selectService')}</option>
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {(isAr && s.nameAr ? s.nameAr : s.name)} — {s.price} EGP
                  </option>
                ))}
              </select>
              {errors.serviceId && (
                <p className="text-caption text-error">
                  {errors.serviceId.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-label">{t('staffOptional')}</label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
                {...register('staffId')}
              >
                <option value="">{t('anyAvailable')}</option>
                {staff.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.firstName} {s.lastName}
                    {s.title
                      ? ` — ${isAr && s.titleAr ? s.titleAr : s.title}`
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label={t('date')}
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              error={errors.date?.message}
              {...register('date')}
            />

            <div className="space-y-1.5">
              <label className="text-label">{t('availableSlots')}</label>
              {loadingSlots ? (
                <p className="text-body-sm text-text-muted">
                  {t('common:loading')}
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.length === 0 ? (
                    <p className="col-span-full text-body-sm text-text-muted">
                      {date ? t('noSlots') : t('pickDateFirst')}
                    </p>
                  ) : (
                    slots.map((slot) => (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() =>
                          setValue('startTime', slot.start, {
                            shouldValidate: true,
                          })
                        }
                        className={`rounded-md border px-2 py-2 text-sm transition-colors ${
                          startTime === slot.start
                            ? 'border-primary bg-primary text-white'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        {slot.start}
                      </button>
                    ))
                  )}
                </div>
              )}
              <input type="hidden" {...register('startTime')} />
              {errors.startTime && (
                <p className="text-caption text-error">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <Input
              label={t('customerName')}
              error={errors.customerName?.message}
              {...register('customerName')}
            />
            <Input
              label={t('customerEmail')}
              type="email"
              error={errors.customerEmail?.message}
              {...register('customerEmail')}
            />
            <Input
              label={t('common:phone')}
              {...register('customerPhone')}
            />
            <Input label={t('common:notes')} {...register('notes')} />

            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => navigate(-1)}
              >
                {t('common:cancel')}
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full sm:w-auto"
              >
                {t('newBooking')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
