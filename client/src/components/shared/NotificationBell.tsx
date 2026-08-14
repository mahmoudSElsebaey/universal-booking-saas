import { useEffect, useRef, useState } from 'react'
import { notificationApi, type AppNotification } from '@/services/notification.api'
import { useAuth } from '@/store/authStore'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const { t, i18n } = useTranslation(['dashboard', 'common'])
  const isAr = i18n.language === 'ar'
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AppNotification[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const load = async () => {
    if (!isAuthenticated) return
    try {
      const res = await notificationApi.list({ limit: 15 })
      setItems(res.data || [])
      setUnread(res.unreadCount || 0)
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 60000)
    return () => clearInterval(id)
  }, [isAuthenticated])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Lock body scroll when panel open on small screens
  useEffect(() => {
    if (!open) return
    const isNarrow = window.matchMedia('(max-width: 640px)').matches
    if (!isNarrow) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!isAuthenticated) return null

  const markAll = async () => {
    try {
      await notificationApi.markAllAsRead()
      setUnread(0)
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {
      /* ignore */
    }
  }

  const markOne = async (id: string) => {
    try {
      await notificationApi.markAsRead(id)
      setItems((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
      setUnread((u) => Math.max(0, u - 1))
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="relative p-2 rounded-md hover:bg-surface-muted"
        onClick={() => setOpen(!open)}
        aria-label={t('notifications')}
      >
        <Bell className="h-5 w-5 text-text-secondary" />
        {unread > 0 && (
          <span className="absolute top-1 end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 sm:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className={cn(
              'z-50 overflow-hidden border border-border bg-surface shadow-lg',
              // Mobile: full-width bottom sheet style
              'fixed inset-x-3 top-16 max-h-[min(70vh,28rem)] rounded-xl',
              // Desktop: dropdown under bell
              'sm:absolute sm:inset-x-auto sm:top-auto sm:end-0 sm:mt-2 sm:w-80 sm:max-h-96 sm:rounded-lg'
            )}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <p className="font-medium text-sm">{t('notifications')}</p>
              <div className="flex items-center gap-3">
                {unread > 0 && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={markAll}
                  >
                    {t('markAllRead')}
                  </button>
                )}
                <button
                  type="button"
                  className="text-xs text-text-muted sm:hidden"
                  onClick={() => setOpen(false)}
                >
                  {t('common:close', { defaultValue: isAr ? 'إغلاق' : 'Close' })}
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[min(60vh,22rem)] sm:max-h-80">
              {items.length === 0 ? (
                <p className="text-center text-sm text-text-muted py-8">
                  {t('noNotifications')}
                </p>
              ) : (
                items.map((n) => (
                  <button
                    key={n._id}
                    type="button"
                    onClick={() => !n.isRead && markOne(n._id)}
                    className={cn(
                      'w-full text-start px-4 py-3 border-b border-border-subtle hover:bg-surface-muted transition-colors',
                      !n.isRead && 'bg-primary-50/50'
                    )}
                  >
                    <p className="text-sm font-medium text-text">
                      {isAr && n.titleAr ? n.titleAr : n.title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                      {isAr && n.bodyAr ? n.bodyAr : n.body}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
