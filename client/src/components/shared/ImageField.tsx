import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { uploadApi, resolveMediaUrl } from '@/services/upload.api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImagePlus, Loader2, X } from 'lucide-react'

type Props = {
  label?: string
  value?: string
  onChange: (url: string) => void
  /** circular preview for avatars */
  round?: boolean
}

export function ImageField({ label, value, onChange, round }: Props) {
  const { t, i18n } = useTranslation(['dashboard', 'common'])
  const isAr = i18n.language === 'ar'
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const preview = resolveMediaUrl(value)

  const onFile = async (file?: File | null) => {
    if (!file) return
    setError('')
    if (!file.type.startsWith('image/')) {
      setError(isAr ? 'الملف يجب أن يكون صورة' : 'File must be an image')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setError(isAr ? 'الحد الأقصى 3 ميجابايت' : 'Max size is 3MB')
      return
    }
    setUploading(true)
    try {
      const res = await uploadApi.image(file)
      onChange(res.url)
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          (isAr ? 'فشل رفع الصورة' : 'Upload failed')
      )
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-label">{label}</p>}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
        <div
          className={`relative shrink-0 overflow-hidden border border-border bg-surface-muted ${
            round ? 'h-20 w-20 rounded-full' : 'h-24 w-32 rounded-md'
          }`}
        >
          {preview ? (
            <img
              src={preview}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-muted">
              <ImagePlus className="h-6 w-6" />
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {isAr ? 'رفع صورة' : 'Upload image'}
            </Button>
            {value && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange('')}
              >
                <X className="h-4 w-4 me-1" />
                {t('common:remove', { defaultValue: isAr ? 'إزالة' : 'Remove' })}
              </Button>
            )}
          </div>
          <Input
            label={isAr ? 'أو الصق رابط الصورة' : 'Or paste image URL'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          {error && <p className="text-caption text-error">{error}</p>}
        </div>
      </div>
    </div>
  )
}
