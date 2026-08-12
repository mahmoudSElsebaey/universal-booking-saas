import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { NotificationBell } from '@/components/shared/NotificationBell'
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  UserCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const adminNav = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'overview', end: true },
  { to: '/dashboard/bookings', icon: ClipboardList, labelKey: 'bookings' },
  { to: '/dashboard/calendar', icon: Calendar, labelKey: 'calendar' },
  { to: '/dashboard/services', icon: Scissors, labelKey: 'services' },
  { to: '/dashboard/staff', icon: Users, labelKey: 'staff' },
  { to: '/dashboard/customers', icon: UserCircle, labelKey: 'customers' },
  { to: '/dashboard/analytics', icon: BarChart3, labelKey: 'analytics' },
  { to: '/dashboard/settings', icon: Settings, labelKey: 'settings' },
]

const customerNav = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'overview', end: true },
  { to: '/dashboard/my-bookings', icon: ClipboardList, labelKey: 'bookings' },
  { to: '/dashboard/settings', icon: Settings, labelKey: 'settings' },
]

const SIDEBAR_W = 256 // 16rem

export function DashboardLayout() {
  const { t } = useTranslation(['dashboard', 'common'])
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isAdmin =
    user &&
    ['super_admin', 'business_owner', 'manager', 'staff'].includes(user.role)
  const navItems = isAdmin ? adminNav : customerNav

  const handleLogout = async () => {
    await logout()
    navigate('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/*
        Sidebar: always position:fixed on the inline-start side.
        Desktop (lg+): always visible.
        Mobile: toggle open/closed with transform.
        Works in both LTR and RTL via inset-inline-start.
      */}
      <aside
        className={cn(
          'fixed inset-y-0 z-50 flex w-64 flex-col border-e border-border bg-surface',
          'start-0',
          'transition-transform duration-200 ease-out',
          // Desktop: always shown
          'lg:translate-x-0',
          // Mobile: slide off-canvas when closed
          sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full rtl:translate-x-full lg:translate-x-0 lg:rtl:translate-x-0'
        )}
        style={{ width: SIDEBAR_W }}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-semibold text-text">Bookora</span>
          <button
            type="button"
            className="ms-auto p-1 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary'
                    : 'text-text-secondary hover:bg-surface-muted hover:text-text'
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-2 px-3 py-2">
            <p className="truncate text-sm font-medium text-text">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-text-muted">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            leftIcon={<LogOut className="h-4 w-4" />}
            onClick={handleLogout}
          >
            {t('common:logout', { defaultValue: 'Logout' })}
          </Button>
        </div>
      </aside>

      {/* Main: offset by sidebar width on desktop */}
      <div
        className="flex min-h-screen min-w-0 flex-col"
        style={{
          // Logical property — works LTR and RTL
          paddingInlineStart: undefined,
        }}
      >
        {/* Use Tailwind responsive padding so content isn't under the fixed sidebar on lg+ */}
        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ps-64">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface px-4 lg:px-6">
            <button
              type="button"
              className="-ms-2 p-2 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1" />
            <NotificationBell />
            <LanguageSwitcher />
            <Link to="/">
              <Button variant="outline" size="sm">
                {t('common:home', { defaultValue: 'Home' })}
              </Button>
            </Link>
          </header>

          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
