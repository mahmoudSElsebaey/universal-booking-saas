import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { businessApi } from '@/services/business.api'
import { useAuth } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'

const schema = z.object({
  name: z.string().min(2),
  type: z.string().min(1),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().optional(),
  address: z.string().optional(),
})

type Form = z.infer<typeof schema>

const TYPES = [
  { value: 'beauty_salon', label: 'Beauty Salon' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'gym', label: 'Gym / Fitness' },
  { value: 'spa', label: 'Spa' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'other', label: 'Other' },
]

export default function CreateBusinessPage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth() as any
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'beauty_salon' },
  })

  const onSubmit = async (data: Form) => {
    setError('')
    try {
      const business = await businessApi.create({
        ...data,
        email: data.email || undefined,
      })
      localStorage.setItem('businessId', business._id)
      localStorage.setItem('businessSlug', business.slug)
      if (typeof refreshUser === 'function') await refreshUser()
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create business')
    }
  }

  return (
    <div className="mx-auto w-full" style={{ maxWidth: 560 }}>
      <Card variant="elevated" className="w-full">
        <CardHeader>
          <CardTitle className="text-h2">Create your business</CardTitle>
          <CardDescription>
            Set up your workspace to manage services, staff, and bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-error-light px-3 py-2 text-sm text-error">
                {error}
              </div>
            )}
            <Input
              label="Business name"
              error={errors.name?.message}
              required
              {...register('name')}
            />
            <div className="space-y-1.5">
              <label className="text-label text-text">Type</label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
                {...register('type')}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <Input label="Description" {...register('description')} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Phone" {...register('phone')} />
              <Input label="Email" type="email" {...register('email')} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="City" {...register('city')} />
              <Input label="Address" {...register('address')} />
            </div>
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Create business
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
