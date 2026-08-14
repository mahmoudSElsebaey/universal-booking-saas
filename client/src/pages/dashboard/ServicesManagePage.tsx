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
import { ImageField } from '@/components/shared/ImageField'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import { resolveMediaUrl } from '@/services/upload.api'

const schema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional(),
  image: z.string().optional(),
  price: z.coerce.number().min(0),
  duration: z.coerce.number().min(5).max(480),
  bufferTime: z.coerce.number().min(0).optional(),
  status: z.enum(['active', 'inactive', 'draft']).optional(),
})

type FormData = z.infer<typeof schema>

export default function ServicesManagePage() {
  const { t, i18n } = useTranslation(['dashboard', 'common'])
  const { businessId, loading: bizLoading } = useBusinessId()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { success, error: toastError } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active', bufferTime: 0, image: '' },
  })
  const imageValue = watch('image')

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
    reset({ name: '', nameAr: '', image: '', price: 0, duration: 30, bufferTime: 0, status: 'active' })
    setModalOpen(true)
  }

  const openEdit = (s: Service) => {
    setEditing(s)
    reset({
      name: s.name,
      nameAr: s.nameAr || '',
      image: s.image || '',
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
      success(t('common:saved', { defaultValue: i18n.language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully' }))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save')
      toastError(err?.response?.data?.message || t('common:errorGeneric'))
    }
  }

  const onDelete = async () => {
    if (!businessId || !deleteId) return
    setDeleting(true)
    try {
      await businessApi.deleteService(businessId, deleteId)
      setDeleteId(null)
      await load()
      success(t('dashboard:deletedSuccess', { defaultValue: i18n.language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully' }))
    } catch {
      toastError(t('dashboard:failedDelete'))
    } finally {
      setDeleting(false)
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
                    <th className="pb-3 font-medium text-start">{t("dashboard:image", { defaultValue: i18n.language === 'ar' ? 'صورة' : 'Image' })}</th>
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
                      <td className="py-3">
                        {s.image ? (
                          <img src={resolveMediaUrl(s.image)} alt="" className="h-10 w-14 rounded object-cover bg-surface-muted" />
                        ) : (
                          <div className="h-10 w-14 rounded bg-surface-muted" />
                        )}
                      </td>
                      <td className="py-3 font-medium">{i18n.language === 'ar' && s.nameAr ? s.nameAr : s.name}</td>
                      <td className="py-3">{s.duration} {t('dashboard:minutes')}</td>
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
                          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(s._id)}>
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

      <ConfirmDialog
        open={!!deleteId}
        message={i18n.language === 'ar' ? 'هل أنت متأكد من حذف هذه الخدمة؟' : 'Are you sure you want to delete this service?'}
        onConfirm={onDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
          <Card className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-b-none sm:rounded-lg">
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
                <ImageField
                  label={t('dashboard:serviceImage', { defaultValue: i18n.language === 'ar' ? 'صورة الخدمة' : 'Service image' })}
                  value={imageValue || ''}
                  onChange={(url) => setValue('image', url)}
                />
                <Input label={t('common:name')} error={errors.name?.message} {...register('name')} />
                <Input label={t("dashboard:nameAr")} {...register('nameAr')} />
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
                    {t('common:cancel')}
                  </Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    {t('common:save')}
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
