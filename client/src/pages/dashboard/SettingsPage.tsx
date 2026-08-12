import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/authStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { User, Building2, Bell, Shield, Globe } from 'lucide-react'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'language', label: 'Language', icon: Globe },
] as const

type TabId = (typeof tabs)[number]['id']

export default function SettingsPage() {
  const { t } = useTranslation(['dashboard', 'common', 'auth'])
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const isAdmin =
    user &&
    ['super_admin', 'business_owner', 'manager'].includes(user.role)

  const visibleTabs = tabs.filter((tab) => {
    if (tab.id === 'business') return isAdmin
    return true
  })

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    // Profile update API can be wired later
    setTimeout(() => {
      setMessage('Settings saved (UI ready — API can be extended)')
      setSaving(false)
    }, 600)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-h1">{t('dashboard:settings')}</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          Manage your account and business preferences
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Tabs */}
        <nav className="sm:w-48 shrink-0 space-y-1">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors text-start ${
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary'
                  : 'text-text-secondary hover:bg-surface-muted'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {message && (
            <div className="mb-4 rounded-md bg-success-light px-3 py-2 text-sm text-success">
              {message}
            </div>
          )}

          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="w-full max-w-lg space-y-4">
                  <Input
                    label="First name"
                    defaultValue={user?.firstName}
                    name="firstName"
                  />
                  <Input
                    label="Last name"
                    defaultValue={user?.lastName}
                    name="lastName"
                  />
                  <Input
                    label={t('auth:email')}
                    type="email"
                    defaultValue={user?.email}
                    disabled
                  />
                  <Input label="Phone" defaultValue={user?.phone || ''} name="phone" />
                  <Button type="submit" isLoading={saving}>
                    {t('common:save')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'business' && isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Name, contact, working hours, booking rules — managed via Business API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-body-sm text-text-secondary">
                <p>
                  Update business name, logo, working hours, currency, timezone, and
                  cancellation policy through the Business settings endpoints.
                </p>
                <p>
                  Fields ready in the model: workingHours, settings.slotIntervalMinutes,
                  minAdvanceHours, maxAdvanceDays, cancellationPolicyHours, allowOnlineBooking.
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  In-app, email, and SMS channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: 'booking_confirmed', label: 'Booking confirmed' },
                  { id: 'booking_reminder', label: 'Booking reminders' },
                  { id: 'booking_cancelled', label: 'Cancellations' },
                  { id: 'booking_rescheduled', label: 'Reschedules' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center justify-between gap-4 py-2 border-b border-border-subtle last:border-0"
                  >
                    <span className="text-sm text-text">{item.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-border text-primary"
                    />
                  </label>
                ))}
                <Button onClick={handleSaveProfile} isLoading={saving}>
                  {t('common:save')}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Password and session</CardDescription>
              </CardHeader>
              <CardContent className="w-full max-w-lg space-y-4">
                <Input label="Current password" type="password" />
                <Input label="New password" type="password" />
                <Input label="Confirm new password" type="password" />
                <Button onClick={handleSaveProfile} isLoading={saving}>
                  Update password
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'language' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('common:language')}</CardTitle>
                <CardDescription>Interface language (EN / AR + RTL)</CardDescription>
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
