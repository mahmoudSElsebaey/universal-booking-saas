import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBusinessId } from '@/hooks/useBusinessId'
import { businessApi, type StaffMember } from '@/services/business.api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Plus, Pencil, Trash2, X, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  title: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
})

type FormData = z.infer<typeof schema>

export default function StaffManagePage() {
  const { t } = useTranslation(['dashboard', 'common'])
  const { businessId, loading: bizLoading } = useBusinessId()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active' },
  })

  const load = async () => {
    if (!businessId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await businessApi.listStaff(businessId, { limit: 100 })
      setStaff(res.data || [])
    } catch {
      setStaff([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!bizLoading) load()
  }, [businessId, bizLoading])

  const openCreate = () => {
    setEditing(null)
    reset({ firstName: '', lastName: '', email: '', phone: '', title: '', status: 'active' })
    setModalOpen(true)
  }

  const openEdit = (s: StaffMember) => {
    setEditing(s)
    reset({
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email || '',
      phone: s.phone || '',
      title: s.title || '',
      status: s.status,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data: FormData) => {
    if (!businessId) return
    setError('')
    const payload = {
      ...data,
      email: data.email || undefined,
    }
    try {
      if (editing) {
        await businessApi.updateStaff(businessId, editing._id, payload)
      } else {
        await businessApi.createStaff(businessId, payload)
      }
      setModalOpen(false)
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save')
    }
  }

  const onDelete = async (id: string) => {
    if (!businessId || !confirm('Remove this doctor?')) return
    try {
      await businessApi.deleteStaff(businessId, id)
      await load()
    } catch {
      alert('Failed to delete')
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
        {t('dashboard:noBusiness')}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h1">{t("dashboard:staff")}</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          {t('dashboard:addStaff')}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staff.length === 0 ? (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="py-10 text-center text-text-muted">
              {t('common:noResults')}
            </CardContent>
          </Card>
        ) : (
          staff.map((s) => (
            <Card key={s._id}>
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-body-sm text-text-muted">
                      {s.title || '—'}
                    </p>
                    <Badge
                      className="mt-2"
                      variant={s.status === 'active' ? 'success' : 'muted'}
                    >
                      {s.status}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                    <Pencil className="h-3.5 w-3.5 me-1" /> {t('common:edit')}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(s._id)}>
                    <Trash2 className="h-3.5 w-3.5 text-error" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <Card className="relative w-full max-w-lg">
            <button className="absolute top-4 end-4 p-1" onClick={() => setModalOpen(false)}>
              <X className="h-5 w-5" />
            </button>
            <CardHeader>
              <CardTitle>{editing ? t('dashboard:editStaff') : t('dashboard:addStaff')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {error && <p className="text-sm text-error">{error}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <Input label={t('common:firstName')} error={errors.firstName?.message} {...register('firstName')} />
                  <Input label={t('common:lastName')} error={errors.lastName?.message} {...register('lastName')} />
                </div>
                <Input label={t('common:email')} type="email" {...register('email')} />
                <Input label={t('common:phone')} {...register('phone')} />
                <Input label={t('common:title')} {...register('title')} />
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    Save
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
