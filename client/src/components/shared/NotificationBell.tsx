import { useEffect, useRef, useState } from 'react'
import { notificationApi, type AppNotification } from '@/services/notification.api'
import { useAuth } from '@/store/authStore'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const { i18n } = useTranslation()
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
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-text-secondary" />
        {unread > 0 && (
          <span className="absolute top-1 end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-surface shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="font-medium text-sm">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={markAll}
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-center text-sm text-text-muted py-8">
                No notifications
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
      )}
    </div>
  )
}
