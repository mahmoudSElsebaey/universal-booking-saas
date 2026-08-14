import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type Props = {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = true,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  const { t, i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="mb-4 flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              destructive ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 pt-0.5">
            <h3 className="text-base font-semibold text-text">
              {title ||
                (isAr ? 'تأكيد العملية' : 'Confirm action')}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              {message}
            </p>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel || t('cancel')}
          </Button>
          <Button
            type="button"
            className={`w-full sm:w-auto ${
              destructive
                ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600'
                : ''
            }`}
            onClick={onConfirm}
            isLoading={loading}
          >
            {confirmLabel ||
              (destructive
                ? isAr
                  ? 'حذف'
                  : 'Delete'
                : isAr
                  ? 'تأكيد'
                  : 'Confirm')}
          </Button>
        </div>
      </div>
    </div>
  )
}
