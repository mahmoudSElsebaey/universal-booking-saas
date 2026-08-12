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
  const navigate = useNavigate()
  const { businessId } = useBusinessId()
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [error, setError] = useState('')

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

  useEffect(() => {
    if (!businessId) return
    businessApi.listServices(businessId, { status: 'active', limit: 50 }).then((r) => {
      setServices(r.data || [])
    })
  }, [businessId])

  useEffect(() => {
    if (!businessId || !serviceId) return
    businessApi
      .getStaffForService(businessId, serviceId)
      .then(setStaff)
      .catch(() => setStaff([]))
  }, [businessId, serviceId])

  useEffect(() => {
    if (!businessId || !serviceId || !date) return
    bookingApi
      .getAvailability({
        businessId,
        serviceId,
        staffId: staffId || undefined,
        date,
      })
      .then((r) => setSlots(r.slots.filter((s) => s.available)))
      .catch(() => setSlots([]))
  }, [businessId, serviceId, staffId, date])

  const onSubmit = async (data: Form) => {
    if (!businessId) return
    setError('')
    try {
      await bookingApi.create({
        businessId,
        ...data,
        staffId: data.staffId || undefined,
      })
      navigate('/dashboard/bookings')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create booking')
    }
  }

  if (!businessId) {
    return (
      <div className="py-16 text-center text-text-secondary">
        Create a business first.
      </div>
    )
  }

  return (
    <div className="mx-auto w-full space-y-6" style={{ maxWidth: 560 }}>
      <h1 className="text-h1">New booking</h1>
      <Card>
        <CardHeader>
          <CardTitle>Booking details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-error-light px-3 py-2 text-sm text-error">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-label">Service</label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
                {...register('serviceId')}
              >
                <option value="">Select service</option>
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} — {s.price} EGP
                  </option>
                ))}
              </select>
              {errors.serviceId && (
                <p className="text-caption text-error">{errors.serviceId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-label">Staff (optional)</label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
                {...register('staffId')}
              >
                <option value="">Any available</option>
                {staff.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Date"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              error={errors.date?.message}
              {...register('date')}
            />

            <div className="space-y-1.5">
              <label className="text-label">Time</label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.length === 0 ? (
                  <p className="col-span-full text-body-sm text-text-muted">
                    {date ? 'No slots' : 'Pick a date first'}
                  </p>
                ) : (
                  slots.map((slot) => (
                    <button
                      key={slot.start}
                      type="button"
                      onClick={() => setValue('startTime', slot.start, { shouldValidate: true })}
                      className="rounded-md border border-border px-2 py-2 text-sm hover:border-primary"
                    >
                      {slot.start}
                    </button>
                  ))
                )}
              </div>
              <input type="hidden" {...register('startTime')} />
              {errors.startTime && (
                <p className="text-caption text-error">{errors.startTime.message}</p>
              )}
            </div>

            <Input
              label="Customer name"
              error={errors.customerName?.message}
              {...register('customerName')}
            />
            <Input
              label="Customer email"
              type="email"
              error={errors.customerEmail?.message}
              {...register('customerEmail')}
            />
            <Input label="Phone" {...register('customerPhone')} />
            <Input label="Notes" {...register('notes')} />

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Create booking
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
