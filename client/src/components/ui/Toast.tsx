import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info'

type ToastItem = {
  id: string
  message: string
  variant: ToastVariant
}

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setItems((prev) => [...prev.slice(-4), { id, message, variant }])
    window.setTimeout(() => remove(id), 3200)
  }, [remove])

  const value = useMemo(
    () => ({
      toast,
      success: (m: string) => toast(m, 'success'),
      error: (m: string) => toast(m, 'error'),
      info: (m: string) => toast(m, 'info'),
    }),
    [toast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4"
        aria-live="polite"
      >
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onClose={() => remove(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastCard({
  item,
  onClose,
}: {
  item: ToastItem
  onClose: () => void
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setShow(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const Icon =
    item.variant === 'success'
      ? CheckCircle2
      : item.variant === 'error'
        ? XCircle
        : Info

  return (
    <div
      className={cn(
        'pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md transition-all duration-300',
        show ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        item.variant === 'success' &&
          'border-emerald-200/80 bg-white/95 text-emerald-900',
        item.variant === 'error' &&
          'border-red-200/80 bg-white/95 text-red-900',
        item.variant === 'info' &&
          'border-border bg-white/95 text-text'
      )}
      role="status"
    >
      <Icon
        className={cn(
          'mt-0.5 h-5 w-5 shrink-0',
          item.variant === 'success' && 'text-emerald-600',
          item.variant === 'error' && 'text-red-600',
          item.variant === 'info' && 'text-primary'
        )}
      />
      <p className="flex-1 text-sm font-medium leading-snug">{item.message}</p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-0.5 text-text-muted hover:bg-black/5 hover:text-text"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
