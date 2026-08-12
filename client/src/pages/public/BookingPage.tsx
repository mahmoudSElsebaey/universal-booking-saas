import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { bookingApi, type TimeSlot } from '@/services/booking.api'
import { businessApi, type Service, type StaffMember } from '@/services/business.api'
import { useBusinessId } from '@/hooks/useBusinessId'
import { Calendar, Check, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = ['service', 'staff', 'date', 'time', 'details', 'review'] as const
type Step = (typeof STEPS)[number]

const detailsSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
})

type DetailsForm = z.infer<typeof detailsSchema>

// Demo fallback when no API business is linked
const DEMO_BUSINESS_ID = localStorage.getItem('businessId') || ''

const DEMO_SERVICES: Service[] = [
  {
    _id: 'demo-1',
    businessId: 'demo',
    name: 'Haircut & Style',
    nameAr: 'قص وتصفيف',
    price: 250,
    duration: 45,
    bufferTime: 10,
    staffRequired: true,
    status: 'active',
    sortOrder: 1,
  },
  {
    _id: 'demo-2',
    businessId: 'demo',
    name: 'Classic Manicure',
    nameAr: 'مانيكير',
    price: 150,
    duration: 30,
    bufferTime: 5,
    staffRequired: true,
    status: 'active',
    sortOrder: 2,
  },
  {
    _id: 'demo-3',
    businessId: 'demo',
    name: 'Deep Facial',
    nameAr: 'تنظيف بشرة',
    price: 400,
    duration: 60,
    bufferTime: 10,
    staffRequired: true,
    status: 'active',
    sortOrder: 3,
  },
]

export default function BookingPage() {
  const { t, i18n } = useTranslation(['booking', 'common'])
  const isAr = i18n.language === 'ar'
  const navigate = useNavigate()

  const { businessId: resolvedBizId } = useBusinessId()
  const [step, setStep] = useState<Step>('service')
  const [businessId, setBusinessId] = useState(DEMO_BUSINESS_ID)

  useEffect(() => {
    if (resolvedBizId) setBusinessId(resolvedBizId)
  }, [resolvedBizId])
  const [services, setServices] = useState<Service[]>(DEMO_SERVICES)
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])

  const [service, setService] = useState<Service | null>(null)
  const [staff, setStaff] = useState<StaffMember | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
  })

  // Load services if businessId exists
  useEffect(() => {
    if (!businessId) return
    businessApi
      .listServices(businessId, { limit: 50, status: 'active' })
      .then((res) => {
        if (res.data?.length) setServices(res.data)
      })
      .catch(() => {
        /* keep demo */
      })
  }, [businessId])

  // Load staff for service
  useEffect(() => {
    if (!service || !businessId || service._id.startsWith('demo')) {
      setStaffList([
        {
          _id: 'demo-staff-1',
          businessId: 'demo',
          firstName: 'Omar',
          lastName: 'Khaled',
          title: 'Senior Stylist',
          workingHours: [],
          status: 'active',
          sortOrder: 1,
        },
        {
          _id: 'demo-staff-2',
          businessId: 'demo',
          firstName: 'Layla',
          lastName: 'Mostafa',
          title: 'Specialist',
          workingHours: [],
          status: 'active',
          sortOrder: 2,
        },
      ])
      return
    }
    businessApi
      .getStaffForService(businessId, service._id)
      .then(setStaffList)
      .catch(() => setStaffList([]))
  }, [service, businessId])

  // Load slots
  useEffect(() => {
    if (!service || !date) return
    if (service._id.startsWith('demo') || !businessId) {
      // Demo slots
      setSlots(
        ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00'].map(
          (s) => ({
            start: s,
            end: s,
            available: true,
            staffId: staff?._id,
          })
        )
      )
      return
    }
    bookingApi
      .getAvailability({
        businessId,
        serviceId: service._id,
        staffId: staff?._id,
        date,
      })
      .then((res) => setSlots(res.slots.filter((s) => s.available)))
      .catch(() => setSlots([]))
  }, [service, staff, date, businessId])

  const stepIndex = STEPS.indexOf(step)

  const goNext = () => {
    const next = STEPS[stepIndex + 1]
    if (next) setStep(next)
  }

  const goBack = () => {
    const prev = STEPS[stepIndex - 1]
    if (prev) setStep(prev)
  }

  const onConfirm = async (details: DetailsForm) => {
    if (!service || !date || !time) return
    setSubmitting(true)
    setError('')

    // Demo mode — no real API
    if (!businessId || service._id.startsWith('demo')) {
      setTimeout(() => {
        setSuccess(true)
        setSubmitting(false)
      }, 800)
      return
    }

    try {
      await bookingApi.create({
        businessId,
        serviceId: service._id,
        staffId: staff?._id,
        date,
        startTime: time,
        ...details,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err?.response?.data?.message || t('common:errorGeneric'))
    } finally {
      setSubmitting(false)
    }
  }

  // Min date = tomorrow-ish (today allowed)
  const minDate = new Date().toISOString().slice(0, 10)

  if (success) {
    return (
      <div className="container-app py-16 max-w-lg mx-auto text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-light text-success">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="text-h1 mb-2">{t('booking:success')}</h1>
        <p className="text-text-secondary mb-6">
          {service && (isAr ? service.nameAr || service.name : service.name)} · {date} · {time}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate('/')}>
            {t('common:home')}
          </Button>
          <Button onClick={() => navigate('/dashboard/my-bookings')}>
            {t('dashboard:bookings', { defaultValue: 'My bookings' })}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container-app mx-auto w-full py-8 md:py-12" style={{ maxWidth: "48rem" }}>
      <h1 className="text-h1 mb-2 text-center">{t('booking:title')}</h1>
      <p className="text-center text-text-secondary mb-8">
        {isAr ? 'اتبع الخطوات لإتمام الحجز' : 'Follow the steps to complete your booking'}
      </p>

      {/* Progress */}
      <div className="mb-8 flex items-center justify-center gap-1 sm:gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 sm:gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
                i < stepIndex
                  ? 'bg-primary text-white'
                  : i === stepIndex
                    ? 'bg-primary text-white ring-4 ring-primary-100'
                    : 'bg-surface-muted text-text-muted'
              )}
            >
              {i < stepIndex ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-4 sm:w-8',
                  i < stepIndex ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-error-light px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}

      <Card variant="elevated">
        <CardContent className="pt-6">
          {/* Step: Service */}
          {step === 'service' && (
            <div className="space-y-3">
              <h2 className="text-h3 mb-4">{t('booking:chooseService')}</h2>
              {services.map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => {
                    setService(s)
                    setStaff(null)
                    setTime('')
                    goNext()
                  }}
                  className={cn(
                    'w-full text-start rounded-md border p-4 transition-all hover:border-primary hover:shadow-sm',
                    service?._id === s._id
                      ? 'border-primary bg-primary-50'
                      : 'border-border'
                  )}
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-medium">{isAr ? s.nameAr || s.name : s.name}</p>
                      <p className="text-body-sm text-text-muted">
                        {s.duration} {t('booking:minutes')}
                      </p>
                    </div>
                    <p className="font-semibold text-primary">
                      {s.price} EGP
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step: Staff */}
          {step === 'staff' && (
            <div className="space-y-3">
              <h2 className="text-h3 mb-4">{t('booking:chooseStaff')}</h2>
              <button
                type="button"
                onClick={() => {
                  setStaff(null)
                  goNext()
                }}
                className="w-full text-start rounded-md border border-border p-4 hover:border-primary"
              >
                <p className="font-medium">{isAr ? 'أي موظف متاح' : 'Any available staff'}</p>
              </button>
              {staffList.map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => {
                    setStaff(s)
                    goNext()
                  }}
                  className={cn(
                    'w-full text-start rounded-md border p-4 transition-all hover:border-primary',
                    staff?._id === s._id
                      ? 'border-primary bg-primary-50'
                      : 'border-border'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {s.firstName} {s.lastName}
                      </p>
                      {s.title && (
                        <p className="text-body-sm text-text-muted">{s.title}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              <Button variant="ghost" onClick={goBack} leftIcon={<ChevronLeft className="h-4 w-4" />}>
                {t('common:back')}
              </Button>
            </div>
          )}

          {/* Step: Date */}
          {step === 'date' && (
            <div className="space-y-4">
              <h2 className="text-h3 mb-4">{t('booking:chooseDate')}</h2>
              <Input
                type="date"
                min={minDate}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  setTime('')
                }}
                leftIcon={<Calendar className="h-4 w-4" />}
              />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={goBack}>
                  {t('common:back')}
                </Button>
                <Button disabled={!date} onClick={goNext}>
                  {t('common:next')}
                </Button>
              </div>
            </div>
          )}

          {/* Step: Time */}
          {step === 'time' && (
            <div className="space-y-4">
              <h2 className="text-h3 mb-4">{t('booking:chooseTime')}</h2>
              {slots.length === 0 ? (
                <p className="text-text-muted text-center py-6">
                  {isAr ? 'لا توجد مواعيد متاحة لهذا اليوم' : 'No available slots for this day'}
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.start}
                      type="button"
                      onClick={() => {
                        setTime(slot.start)
                        goNext()
                      }}
                      className={cn(
                        'rounded-md border px-3 py-2.5 text-sm font-medium transition-all',
                        time === slot.start
                          ? 'border-primary bg-primary text-white'
                          : 'border-border hover:border-primary'
                      )}
                    >
                      {slot.start}
                    </button>
                  ))}
                </div>
              )}
              <Button variant="ghost" onClick={goBack}>
                {t('common:back')}
              </Button>
            </div>
          )}

          {/* Step: Details */}
          {step === 'details' && (
            <form
              className="space-y-4"
              onSubmit={handleSubmit(() => setStep('review'))}
            >
              <h2 className="text-h3 mb-4">{t('booking:yourDetails')}</h2>
              <Input
                label={isAr ? 'الاسم' : 'Full name'}
                error={errors.customerName?.message}
                {...register('customerName')}
              />
              <Input
                label={t('auth:email', { defaultValue: 'Email' })}
                type="email"
                error={errors.customerEmail?.message}
                {...register('customerEmail')}
              />
              <Input
                label={isAr ? 'الهاتف' : 'Phone'}
                {...register('customerPhone')}
              />
              <Input label={isAr ? 'ملاحظات' : 'Notes'} {...register('notes')} />
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={goBack}>
                  {t('common:back')}
                </Button>
                <Button type="submit">{t('common:next')}</Button>
              </div>
            </form>
          )}

          {/* Step: Review */}
          {step === 'review' && service && (
            <div className="space-y-4">
              <h2 className="text-h3 mb-4">{t('booking:review')}</h2>
              <div className="rounded-md bg-surface-muted p-4 space-y-2 text-sm">
                <Row label={t('booking:chooseService')} value={isAr ? service.nameAr || service.name : service.name} />
                <Row
                  label={t('booking:chooseStaff')}
                  value={
                    staff
                      ? `${staff.firstName} ${staff.lastName}`
                      : isAr
                        ? 'أي موظف'
                        : 'Any available'
                  }
                />
                <Row label={t('booking:chooseDate')} value={date} />
                <Row label={t('booking:chooseTime')} value={time} />
                <Row label={t('booking:price')} value={`${service.price} EGP`} />
                <Row label={isAr ? 'الاسم' : 'Name'} value={getValues('customerName')} />
                <Row label="Email" value={getValues('customerEmail')} />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={goBack}>
                  {t('common:back')}
                </Button>
                <Button
                  isLoading={submitting}
                  onClick={handleSubmit(onConfirm)}
                  leftIcon={<Check className="h-4 w-4" />}
                >
                  {t('booking:confirm')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text text-end">{value}</span>
    </div>
  )
}
