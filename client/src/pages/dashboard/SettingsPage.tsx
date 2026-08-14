import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/authStore'
import { authApi } from '@/services/auth.api'
import {
  notificationApi,
  type NotificationPreferences,
} from '@/services/notification.api'
import {
  businessApi,
  type Business,
  type WorkingHoursSlot,
} from '@/services/business.api'
import { useBusinessId } from '@/hooks/useBusinessId'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { User, Building2, Bell, Shield, Globe } from 'lucide-react'

const DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

const DEFAULT_HOURS: WorkingHoursSlot[] = DAYS.map((day) => ({
  day,
  isOpen: day !== 'friday',
  openTime: '09:00',
  closeTime: '18:00',
}))

const tabs = [
  { id: 'profile', labelKey: 'profile', icon: User },
  { id: 'business', labelKey: 'business', icon: Building2 },
  { id: 'notifications', labelKey: 'notifications', icon: Bell },
  { id: 'security', labelKey: 'security', icon: Shield },
  { id: 'language', labelKey: 'language', icon: Globe },
] as const

type TabId = (typeof tabs)[number]['id']

export default function SettingsPage() {
  const { t, i18n } = useTranslation(['dashboard', 'common', 'auth'])
  const isAr = i18n.language === 'ar'
  const { user, setUser, refreshUser } = useAuth()
  const { businessId, loading: bizLoading } = useBusinessId()
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>({
    booking_confirmed: true,
    booking_reminder: true,
    booking_cancelled: true,
    booking_rescheduled: true,
    review_received: true,
    emailEnabled: true,
    smsEnabled: false,
  })
  const [prefsLoading, setPrefsLoading] = useState(false)

  // Business form state
  const [bizLoadingForm, setBizLoadingForm] = useState(false)
  const [bizName, setBizName] = useState('')
  const [bizSlug, setBizSlug] = useState('')
  const [bizDescription, setBizDescription] = useState('')
  const [bizPhone, setBizPhone] = useState('')
  const [bizEmail, setBizEmail] = useState('')
  const [bizAddress, setBizAddress] = useState('')
  const [bizCity, setBizCity] = useState('')
  const [bizLogo, setBizLogo] = useState('')
  const [hours, setHours] = useState<WorkingHoursSlot[]>(DEFAULT_HOURS)
  const [currency, setCurrency] = useState('EGP')
  const [timezone, setTimezone] = useState('Africa/Cairo')
  const [slotInterval, setSlotInterval] = useState(30)
  const [minAdvance, setMinAdvance] = useState(2)
  const [maxAdvance, setMaxAdvance] = useState(60)
  const [cancelHours, setCancelHours] = useState(24)
  const [allowOnline, setAllowOnline] = useState(true)
  const [requireStaff, setRequireStaff] = useState(true)
  const [defaultLang, setDefaultLang] = useState<'en' | 'ar'>('ar')

  const isAdmin =
    user &&
    ['super_admin', 'business_owner', 'manager'].includes(user.role)

  const visibleTabs = tabs.filter((tab) => {
    if (tab.id === 'business') return isAdmin
    return true
  })

  const dayLabel = (day: string) => {
    const map: Record<string, [string, string]> = {
      sunday: ['Sunday', 'الأحد'],
      monday: ['Monday', 'الاثنين'],
      tuesday: ['Tuesday', 'الثلاثاء'],
      wednesday: ['Wednesday', 'الأربعاء'],
      thursday: ['Thursday', 'الخميس'],
      friday: ['Friday', 'الجمعة'],
      saturday: ['Saturday', 'السبت'],
    }
    return isAr ? map[day]?.[1] || day : map[day]?.[0] || day
  }

  useEffect(() => {
    if (activeTab !== 'notifications') return
    setPrefsLoading(true)
    notificationApi
      .getPreferences()
      .then(setNotifPrefs)
      .catch(() => {})
      .finally(() => setPrefsLoading(false))
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'business' || !businessId || !isAdmin) return
    setBizLoadingForm(true)
    businessApi
      .getById(businessId)
      .then((b: Business) => {
        setBizName(b.name || '')
        setBizSlug(b.slug || '')
        setBizDescription(b.description || '')
        setBizPhone(b.phone || '')
        setBizEmail(b.email || '')
        setBizAddress(b.address || '')
        setBizCity(b.city || '')
        setBizLogo(b.logo || '')
        const filled = DAYS.map((day) => {
          const existing = b.workingHours?.find((h) => h.day === day)
          return (
            existing || {
              day,
              isOpen: day !== 'friday',
              openTime: '09:00',
              closeTime: '18:00',
            }
          )
        })
        setHours(filled)
        setCurrency(b.settings?.currency || 'EGP')
        setTimezone(b.settings?.timezone || 'Africa/Cairo')
        setSlotInterval(b.settings?.slotIntervalMinutes ?? 30)
        setMinAdvance(b.settings?.minAdvanceHours ?? 2)
        setMaxAdvance(b.settings?.maxAdvanceDays ?? 60)
        setCancelHours(b.settings?.cancellationPolicyHours ?? 24)
        setAllowOnline(b.settings?.allowOnlineBooking ?? true)
        setRequireStaff(b.settings?.requireStaffSelection ?? true)
        setDefaultLang(
          (b.settings?.defaultLanguage as 'en' | 'ar') || 'ar'
        )
      })
      .catch(() => {
        setError(t('common:errorGeneric'))
      })
      .finally(() => setBizLoadingForm(false))
  }, [activeTab, businessId, isAdmin])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const updated = await authApi.updateProfile({
        firstName,
        lastName,
        phone,
      })
      setUser(updated)
      await refreshUser()
      setMessage(t('common:profileUpdated'))
    } catch (err: any) {
      setError(err?.response?.data?.message || t('common:errorGeneric'))
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    if (newPassword !== confirmPassword) {
      setError(t('dashboard:passwordMismatch'))
      setSaving(false)
      return
    }
    try {
      await authApi.changePassword({ currentPassword, newPassword })
      setMessage(t('dashboard:passwordUpdated'))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(
        err?.response?.data?.message || t('dashboard:currentPasswordWrong')
      )
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifPrefs = async () => {
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const updated = await notificationApi.updatePreferences(notifPrefs)
      setNotifPrefs(updated)
      setMessage(t('dashboard:settingsSaved'))
    } catch (err: any) {
      setError(err?.response?.data?.message || t('common:errorGeneric'))
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessId) return
    setSaving(true)
    setMessage('')
    setError('')
    try {
      await businessApi.update(businessId, {
        name: bizName,
        description: bizDescription || undefined,
        phone: bizPhone || undefined,
        email: bizEmail || undefined,
        address: bizAddress || undefined,
        city: bizCity || undefined,
        logo: bizLogo || undefined,
        workingHours: hours,
        settings: {
          currency,
          timezone,
          defaultLanguage: defaultLang,
          slotIntervalMinutes: Number(slotInterval),
          minAdvanceHours: Number(minAdvance),
          maxAdvanceDays: Number(maxAdvance),
          cancellationPolicyHours: Number(cancelHours),
          allowOnlineBooking: allowOnline,
          requireStaffSelection: requireStaff,
        },
      } as Partial<Business>)
      setMessage(
        isAr ? 'تم حفظ إعدادات العيادة' : 'Clinic settings saved'
      )
    } catch (err: any) {
      setError(err?.response?.data?.message || t('common:errorGeneric'))
    } finally {
      setSaving(false)
    }
  }

  const updateHour = (
    day: string,
    patch: Partial<WorkingHoursSlot>
  ) => {
    setHours((prev) =>
      prev.map((h) => (h.day === day ? { ...h, ...patch } : h))
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-h1">{t('dashboard:settings')}</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          {t('dashboard:manageProfile')}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <nav className="sm:w-48 shrink-0 space-y-1">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id)
                setMessage('')
                setError('')
              }}
              className={`w-full flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors text-start ${
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary'
                  : 'text-text-secondary hover:bg-surface-muted'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {t(`dashboard:${tab.labelKey}`)}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {message && (
            <div className="mb-4 rounded-md bg-success-light px-3 py-2 text-sm text-success">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-md bg-error-light px-3 py-2 text-sm text-error">
              {error}
            </div>
          )}

          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('common:profile')}</CardTitle>
                <CardDescription>{t('common:personalInfo')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSaveProfile}
                  className="w-full max-w-lg space-y-4"
                >
                  <Input
                    label={t('common:firstName')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <Input
                    label={t('common:lastName')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <Input
                    label={t('auth:email')}
                    type="email"
                    defaultValue={user?.email}
                    disabled
                  />
                  <Input
                    label={t('common:phone')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Button type="submit" isLoading={saving}>
                    {t('common:save')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'business' && isAdmin && (
            <div className="space-y-4">
              {bizLoading || bizLoadingForm ? (
                <div className="flex justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : !businessId ? (
                <Card>
                  <CardContent className="py-10 text-center text-text-muted">
                    {t('dashboard:noBusiness')}
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSaveBusiness} className="space-y-4">
                  {/* Identity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {isAr ? 'بيانات العيادة' : 'Clinic identity'}
                      </CardTitle>
                      <CardDescription>
                        {isAr
                          ? 'الاسم، الوصف، وبيانات التواصل'
                          : 'Name, description, and contact'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 max-w-xl">
                      <Input
                        label={isAr ? 'اسم العيادة' : 'Clinic name'}
                        value={bizName}
                        onChange={(e) => setBizName(e.target.value)}
                        required
                      />
                      <Input
                        label={isAr ? 'الرابط (Slug)' : 'Slug'}
                        value={bizSlug}
                        disabled
                      />
                      <div className="space-y-1.5">
                        <label className="text-label">
                          {isAr ? 'الوصف' : 'Description'}
                        </label>
                        <textarea
                          className="flex min-h-[88px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                          value={bizDescription}
                          onChange={(e) => setBizDescription(e.target.value)}
                        />
                      </div>
                      <Input
                        label={t('common:phone')}
                        value={bizPhone}
                        onChange={(e) => setBizPhone(e.target.value)}
                      />
                      <Input
                        label={t('auth:email')}
                        type="email"
                        value={bizEmail}
                        onChange={(e) => setBizEmail(e.target.value)}
                      />
                      <Input
                        label={isAr ? 'العنوان' : 'Address'}
                        value={bizAddress}
                        onChange={(e) => setBizAddress(e.target.value)}
                      />
                      <Input
                        label={isAr ? 'المدينة' : 'City'}
                        value={bizCity}
                        onChange={(e) => setBizCity(e.target.value)}
                      />
                      <Input
                        label={isAr ? 'رابط الشعار (URL)' : 'Logo URL'}
                        value={bizLogo}
                        onChange={(e) => setBizLogo(e.target.value)}
                        placeholder="https://..."
                      />
                    </CardContent>
                  </Card>

                  {/* Working hours */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {isAr ? 'مواعيد العمل' : 'Working hours'}
                      </CardTitle>
                      <CardDescription>
                        {isAr
                          ? 'حدد أيام وساعات فتح العيادة'
                          : 'Set open days and hours'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {hours.map((h) => (
                        <div
                          key={h.day}
                          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 border-b border-border-subtle pb-3 last:border-0"
                        >
                          <label className="flex items-center gap-2 sm:w-32 shrink-0">
                            <input
                              type="checkbox"
                              checked={h.isOpen}
                              onChange={(e) =>
                                updateHour(h.day, { isOpen: e.target.checked })
                              }
                              className="h-4 w-4 rounded border-border text-primary"
                            />
                            <span className="text-sm font-medium">
                              {dayLabel(h.day)}
                            </span>
                          </label>
                          <div className="flex flex-wrap items-center gap-2 flex-1">
                            <input
                              type="time"
                              disabled={!h.isOpen}
                              value={h.openTime}
                              onChange={(e) =>
                                updateHour(h.day, { openTime: e.target.value })
                              }
                              className="h-9 rounded-md border border-border bg-surface px-2 text-sm disabled:opacity-40"
                            />
                            <span className="text-text-muted text-sm">
                              {isAr ? 'إلى' : 'to'}
                            </span>
                            <input
                              type="time"
                              disabled={!h.isOpen}
                              value={h.closeTime}
                              onChange={(e) =>
                                updateHour(h.day, {
                                  closeTime: e.target.value,
                                })
                              }
                              className="h-9 rounded-md border border-border bg-surface px-2 text-sm disabled:opacity-40"
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Booking rules */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {isAr ? 'قواعد الحجز' : 'Booking rules'}
                      </CardTitle>
                      <CardDescription>
                        {isAr
                          ? 'الفترات، المهلة، والإلغاء'
                          : 'Slots, advance window, cancellation'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 max-w-2xl">
                      <Input
                        label={
                          isAr
                            ? 'مدة الفترة (دقيقة)'
                            : 'Slot interval (min)'
                        }
                        type="number"
                        min={5}
                        max={120}
                        value={slotInterval}
                        onChange={(e) =>
                          setSlotInterval(Number(e.target.value))
                        }
                      />
                      <Input
                        label={
                          isAr
                            ? 'الحد الأدنى قبل الحجز (ساعة)'
                            : 'Min advance (hours)'
                        }
                        type="number"
                        min={0}
                        value={minAdvance}
                        onChange={(e) =>
                          setMinAdvance(Number(e.target.value))
                        }
                      />
                      <Input
                        label={
                          isAr
                            ? 'أقصى حجز مقدماً (يوم)'
                            : 'Max advance (days)'
                        }
                        type="number"
                        min={1}
                        max={365}
                        value={maxAdvance}
                        onChange={(e) =>
                          setMaxAdvance(Number(e.target.value))
                        }
                      />
                      <Input
                        label={
                          isAr
                            ? 'سياسة الإلغاء (ساعة)'
                            : 'Cancellation policy (hours)'
                        }
                        type="number"
                        min={0}
                        value={cancelHours}
                        onChange={(e) =>
                          setCancelHours(Number(e.target.value))
                        }
                      />
                      <Input
                        label={isAr ? 'العملة' : 'Currency'}
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      />
                      <Input
                        label={isAr ? 'المنطقة الزمنية' : 'Timezone'}
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                      />
                      <div className="space-y-1.5">
                        <label className="text-label">
                          {isAr ? 'اللغة الافتراضية' : 'Default language'}
                        </label>
                        <select
                          className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
                          value={defaultLang}
                          onChange={(e) =>
                            setDefaultLang(e.target.value as 'en' | 'ar')
                          }
                        >
                          <option value="ar">العربية</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2 space-y-3 pt-1">
                        <label className="flex items-center justify-between gap-4">
                          <span className="text-sm">
                            {isAr
                              ? 'السماح بالحجز أونلاين'
                              : 'Allow online booking'}
                          </span>
                          <input
                            type="checkbox"
                            checked={allowOnline}
                            onChange={(e) =>
                              setAllowOnline(e.target.checked)
                            }
                            className="h-4 w-4 rounded border-border text-primary"
                          />
                        </label>
                        <label className="flex items-center justify-between gap-4">
                          <span className="text-sm">
                            {isAr
                              ? 'إلزام اختيار الطبيب'
                              : 'Require doctor selection'}
                          </span>
                          <input
                            type="checkbox"
                            checked={requireStaff}
                            onChange={(e) =>
                              setRequireStaff(e.target.checked)
                            }
                            className="h-4 w-4 rounded border-border text-primary"
                          />
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  <Button type="submit" isLoading={saving}>
                    {t('common:save')}
                  </Button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard:notifications')}</CardTitle>
                <CardDescription>{t('common:notifChannels')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {prefsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <>
                    {(
                      [
                        {
                          id: 'booking_confirmed' as const,
                          labelKey: 'bookingConfirmed',
                        },
                        {
                          id: 'booking_reminder' as const,
                          labelKey: 'bookingReminder',
                        },
                        {
                          id: 'booking_cancelled' as const,
                          labelKey: 'bookingCancelled',
                        },
                        {
                          id: 'booking_rescheduled' as const,
                          labelKey: 'bookingRescheduled',
                        },
                        {
                          id: 'review_received' as const,
                          labelKey: 'reviewReceived',
                        },
                      ] as const
                    ).map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center justify-between gap-4 py-2 border-b border-border-subtle"
                      >
                        <span className="text-sm text-text">
                          {t(`dashboard:${item.labelKey}`)}
                        </span>
                        <input
                          type="checkbox"
                          checked={!!notifPrefs[item.id]}
                          onChange={(e) =>
                            setNotifPrefs((p) => ({
                              ...p,
                              [item.id]: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-border text-primary"
                        />
                      </label>
                    ))}
                    <label className="flex items-center justify-between gap-4 py-2 border-b border-border-subtle">
                      <span className="text-sm">{t('dashboard:emailNotif')}</span>
                      <input
                        type="checkbox"
                        checked={!!notifPrefs.emailEnabled}
                        onChange={(e) =>
                          setNotifPrefs((p) => ({
                            ...p,
                            emailEnabled: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-border text-primary"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-4 py-2">
                      <span className="text-sm">{t('dashboard:smsNotif')}</span>
                      <input
                        type="checkbox"
                        checked={!!notifPrefs.smsEnabled}
                        onChange={(e) =>
                          setNotifPrefs((p) => ({
                            ...p,
                            smsEnabled: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-border text-primary"
                      />
                    </label>
                    <Button
                      onClick={handleSaveNotifPrefs}
                      isLoading={saving}
                    >
                      {t('common:save')}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard:security')}</CardTitle>
                <CardDescription>
                  {t('common:passwordSession')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleChangePassword}
                  className="w-full max-w-lg space-y-4"
                >
                  <Input
                    label={t('dashboard:currentPassword')}
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <Input
                    label={t('dashboard:newPassword')}
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Input
                    label={t('dashboard:confirmNewPassword')}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" isLoading={saving}>
                    {t('dashboard:updatePassword')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'language' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('common:language')}</CardTitle>
                <CardDescription>
                  {t('common:interfaceLang')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LanguageSwitcher />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
