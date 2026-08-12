import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBusinessId } from '@/hooks/useBusinessId'
import { businessApi, type Service } from '@/services/business.api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const schema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional(),
  price: z.coerce.number().min(0),
  duration: z.coerce.number().min(5).max(480),
  bufferTime: z.coerce.number().min(0).optional(),
  status: z.enum(['active', 'inactive', 'draft']).optional(),
})

type FormData = z.infer<typeof schema>

export default function ServicesManagePage() {
  const { t } = useTranslation(['dashboard', 'common'])
  const { businessId, loading: bizLoading } = useBusinessId()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active', bufferTime: 0 },
  })

  const load = async () => {
    if (!businessId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await businessApi.listServices(businessId, { limit: 100 })
      setServices(res.data || [])
    } catch {
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!bizLoading) load()
  }, [businessId, bizLoading])

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', nameAr: '', price: 0, duration: 30, bufferTime: 0, status: 'active' })
    setModalOpen(true)
  }

  const openEdit = (s: Service) => {
    setEditing(s)
    reset({
      name: s.name,
      nameAr: s.nameAr || '',
      price: s.price,
      duration: s.duration,
      bufferTime: s.bufferTime || 0,
      status: s.status,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data: FormData) => {
    if (!businessId) return
    setError('')
    try {
      if (editing) {
        await businessApi.updateService(businessId, editing._id, data)
      } else {
        await businessApi.createService(businessId, data)
      }
      setModalOpen(false)
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save')
    }
  }

  const onDelete = async (id: string) => {
    if (!businessId || !confirm('Delete this service?')) return
    try {
      await businessApi.deleteService(businessId, id)
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
        No business linked. Login as owner and create a business, or run seed.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h1">{t("dashboard:services")}</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          {t('dashboard:addService')}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          {services.length === 0 ? (
            <p className="text-center py-8 text-text-muted">{t('common:noResults')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted text-start">
                    <th className="pb-3 font-medium text-start">{t("dashboard:name")}</th>
                    <th className="pb-3 font-medium text-start">{t("dashboard:duration")}</th>
                    <th className="pb-3 font-medium text-start">{t("dashboard:price")}</th>
                    <th className="pb-3 font-medium text-start">{t("dashboard:status")}</th>
                    <th className="pb-3 font-medium text-end">{t("dashboard:actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s._id} className="border-b border-border-subtle">
                      <td className="py-3 font-medium">{s.name}</td>
                      <td className="py-3">{s.duration} min</td>
                      <td className="py-3">
                        {s.price} {s.currency || 'EGP'}
                      </td>
                      <td className="py-3">
                        <Badge variant={s.status === 'active' ? 'success' : 'muted'}>
                          {s.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-end">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(s)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => onDelete(s._id)}>
                            <Trash2 className="h-4 w-4 text-error" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <Card className="relative w-full max-w-lg">
            <button
              className="absolute top-4 end-4 p-1"
              onClick={() => setModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <CardHeader>
              <CardTitle>{editing ? t('dashboard:editService') : t('dashboard:addService')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {error && (
                  <p className="text-sm text-error">{error}</p>
                )}
                <Input label={t('common:name')} error={errors.name?.message} {...register('name')} />
                <Input label="الاسم بالعربي" {...register('nameAr')} />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={t('common:price')}
                    type="number"
                    error={errors.price?.message}
                    {...register('price')}
                  />
                  <Input
                    label={t('common:duration')}
                    type="number"
                    error={errors.duration?.message}
                    {...register('duration')}
                  />
                </div>
                <Input label="Buffer (min)" type="number" {...register('bufferTime')} />
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
