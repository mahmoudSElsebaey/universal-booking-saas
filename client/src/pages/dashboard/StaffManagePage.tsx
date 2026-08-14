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
import { ImageField } from '@/components/shared/ImageField'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import { resolveMediaUrl } from '@/services/upload.api'

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  title: z.string().optional(),
  titleAr: z.string().optional(),
  bio: z.string().optional(),
  bioAr: z.string().optional(),
  avatar: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
})

type FormData = z.infer<typeof schema>

export default function StaffManagePage() {
  const { t, i18n } = useTranslation(['dashboard', 'common'])
  const { businessId, loading: bizLoading } = useBusinessId()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<StaffMember | null>(null)
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
    defaultValues: { status: 'active', avatar: '' },
  })
  const avatarValue = watch('avatar')

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
    reset({ firstName: '', lastName: '', email: '', phone: '', title: '', titleAr: '', bio: '', bioAr: '', avatar: '', status: 'active' })
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
      titleAr: s.titleAr || '',
      bio: s.bio || '',
      bioAr: s.bioAr || '',
      avatar: s.avatar || '',
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
      await businessApi.deleteStaff(businessId, deleteId)
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
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-50 text-primary">
                    {s.avatar ? (
                      <img src={resolveMediaUrl(s.avatar)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-body-sm text-text-muted">
                      {(i18n.language === 'ar' && s.titleAr ? s.titleAr : s.title) || '—'}
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
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(s._id)}>
                    <Trash2 className="h-3.5 w-3.5 text-error" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
          <Card className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-b-none sm:rounded-lg">
            <button
              type="button"
              className="absolute top-3 end-3 z-10 p-1.5 rounded-md hover:bg-surface-muted"
              onClick={() => setModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <CardHeader className="shrink-0 pe-12">
              <CardTitle>{editing ? t('dashboard:editStaff') : t('dashboard:addStaff')}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pb-2">
                {error && <p className="text-sm text-error">{error}</p>}
                <ImageField
                  label={t('dashboard:doctorPhoto', { defaultValue: i18n.language === 'ar' ? 'صورة الطبيب' : 'Doctor photo' })}
                  value={avatarValue || ''}
                  onChange={(url) => setValue('avatar', url)}
                  round
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label={t('common:firstName')} error={errors.firstName?.message} {...register('firstName')} />
                  <Input label={t('common:lastName')} error={errors.lastName?.message} {...register('lastName')} />
                </div>
                <Input label={t('common:email')} type="email" {...register('email')} />
                <Input label={t('common:phone')} {...register('phone')} />
                <Input label={t('dashboard:title')} {...register('title')} />
                <Input label={t('dashboard:titleAr')} {...register('titleAr')} />
                <Input label={t('dashboard:bio')} {...register('bio')} />
                <Input label={t('dashboard:bioAr')} {...register('bioAr')} />
                <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 sticky bottom-0 bg-surface pb-1">
                  <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setModalOpen(false)}>
                    {t('common:cancel')}
                  </Button>
                  <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
                    {t('common:save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        message={i18n.language === 'ar' ? 'هل أنت متأكد من حذف هذا الطبيب؟' : 'Are you sure you want to remove this doctor?'}
        onConfirm={onDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  )
}
