import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  className?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface p-5 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-caption text-text-muted">{title}</p>
          <p className="mt-1 text-h2 text-text">{value}</p>
          {trend && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                trendUp ? 'text-success' : 'text-error'
              )}
            >
              {trend}
            </p>
          )}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-50 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
