import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

type Props = {
  to?: string
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
  className?: string
}

const sizes = {
  sm: { icon: 'h-8 w-8', text: 'text-base' },
  md: { icon: 'h-9 w-9', text: 'text-lg' },
  lg: { icon: 'h-11 w-11', text: 'text-xl' },
}

export function BrandLogo({
  to = '/',
  size = 'md',
  showWordmark = true,
  className,
}: Props) {
  const { t } = useTranslation('common')
  const s = sizes[size]

  return (
    <Link
      to={to}
      className={cn('inline-flex items-center gap-2.5 group', className)}
    >
      <img
        src="/logo.svg"
        alt={t('appName')}
        className={cn(
          s.icon,
          'shrink-0 drop-shadow-sm transition-transform group-hover:scale-105'
        )}
        width={36}
        height={36}
      />
      {showWordmark && (
        <span className={cn('brand-wordmark font-bold tracking-tight', s.text)}>
          {t('appName')}
        </span>
      )}
    </Link>
  )
}
