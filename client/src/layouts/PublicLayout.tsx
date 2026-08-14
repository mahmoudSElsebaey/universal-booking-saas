import { Link, NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { useAuth } from '@/store/authStore'
import { Menu, X } from 'lucide-react'
import { BrandLogo } from '@/components/shared/BrandLogo'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function PublicLayout() {
  const { t } = useTranslation('common')
  const { isAuthenticated, user } = useAuth()
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/', label: t('home') },
    { to: '/services', label: t('services') },
    { to: '/staff', label: t('staff') },
    { to: '/about', label: t('about') },
    { to: '/contact', label: t('contact') },
  ]

  const userLabel = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.email
    : ''

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
        <div className="container-app flex h-16 items-center justify-between">
          <BrandLogo size="md" />

          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary border-b-2 border-primary pb-0.5'
                      : 'text-text-secondary hover:text-primary'
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <span className="max-w-[140px] truncate text-sm text-text-secondary">
                  {userLabel}
                </span>
                <Link to="/dashboard">
                  <Button size="sm">{t('dashboard')}</Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    {t('login')}
                  </Button>
                </Link>
                <Link to="/booking">
                  <Button size="sm">{t('bookNow')}</Button>
                </Link>
              </>
            )}
          </div>

          <button type="button" className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div
          className={cn(
            'md:hidden border-t border-border bg-surface overflow-hidden transition-all',
            open ? 'max-h-96' : 'max-h-0'
          )}
        >
          <div className="container-app py-3 space-y-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block rounded-md px-3 py-2.5 text-sm font-medium',
                    isActive
                      ? 'bg-primary-50 text-primary'
                      : 'text-text-secondary hover:bg-surface-muted'
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="flex flex-wrap items-center gap-2 pt-2 px-3">
              <LanguageSwitcher />
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-text-secondary">{userLabel}</span>
                  <Link to="/dashboard" onClick={() => setOpen(false)}>
                    <Button size="sm">{t('dashboard')}</Button>
                  </Link>
                </>
              ) : (
                <Link to="/booking" className="flex-1" onClick={() => setOpen(false)}>
                  <Button size="sm" fullWidth>
                    {t('bookNow')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-surface py-12">
        <div className="container-app grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandLogo size="sm" className="mb-3" />
            <p className="text-body-sm text-text-muted">{t('tagline')}</p>
          </div>
          <div>
            <p className="text-label mb-3">{t('services')}</p>
            <ul className="space-y-2 text-body-sm text-text-secondary">
              <li>
                <Link to="/services" className="hover:text-primary">
                  {t('viewAll')}
                </Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-primary">
                  {t('bookNow')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-label mb-3">{t('about')}</p>
            <ul className="space-y-2 text-body-sm text-text-secondary">
              <li>
                <Link to="/about" className="hover:text-primary">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-label mb-3">{t('contact')}</p>
            <p className="text-body-sm text-text-secondary">hello@bookora.app</p>
            <p className="text-body-sm text-text-secondary">Cairo, Egypt</p>
          </div>
        </div>
        <div className="container-app mt-8 pt-6 border-t border-border text-center text-caption text-text-muted">
          © {new Date().getFullYear()} Bookora
        </div>
      </footer>
    </div>
  )
}
