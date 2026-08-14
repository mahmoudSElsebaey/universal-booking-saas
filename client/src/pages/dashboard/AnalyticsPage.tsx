import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBusinessId } from '@/hooks/useBusinessId'
import {
  analyticsApi,
  type TrendPoint,
  type PopularService,
  type StaffPerformance,
  type RevenueOverview,
} from '@/services/analytics.api'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const DAY_OPTIONS = [7, 14, 30, 90] as const

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(n)
}

export default function AnalyticsPage() {
  const { t, i18n } = useTranslation(['dashboard', 'common'])
  const isAr = i18n.language === 'ar'
  const { businessId, loading: bizLoading } = useBusinessId()

  const [days, setDays] = useState<number>(30)
  const [trends, setTrends] = useState<TrendPoint[]>([])
  const [popular, setPopular] = useState<PopularService[]>([])
  const [staffPerf, setStaffPerf] = useState<StaffPerformance[]>([])
  const [revenue, setRevenue] = useState<RevenueOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!businessId) {
      setLoading(false)
      return
    }

    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [tr, pop, staff, rev] = await Promise.all([
          analyticsApi.getTrends(businessId, days),
          analyticsApi.getPopularServices(businessId, 8),
          analyticsApi.getStaffPerformance(businessId, 10),
          analyticsApi.getRevenue(businessId),
        ])
        if (cancelled) return
        setTrends(tr)
        setPopular(pop)
        setStaffPerf(staff)
        setRevenue(rev)
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || t('common:errorGeneric'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [businessId, days, t])

  if (bizLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!businessId) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary">{t('noBusiness')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-error">{error}</p>
      </div>
    )
  }

  const changeUp = (revenue?.changePercent ?? 0) >= 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h1 text-text">{t('analytics')}</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            {t('analyticsSubtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {DAY_OPTIONS.map((d) => (
            <Button
              key={d}
              size="sm"
              variant={days === d ? 'primary' : 'outline'}
              onClick={() => setDays(d)}
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {/* Revenue summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('thisMonthRevenue')}
          value={formatCurrency(revenue?.thisMonth ?? 0)}
          icon={DollarSign}
          trend={
            revenue
              ? `${changeUp ? '+' : ''}${revenue.changePercent.toFixed(1)}%`
              : undefined
          }
          trendUp={changeUp}
        />
        <StatsCard
          title={t('lastMonthRevenue')}
          value={formatCurrency(revenue?.lastMonth ?? 0)}
          icon={changeUp ? TrendingUp : TrendingDown}
        />
        <StatsCard
          title={t('bookingsThisMonth')}
          value={revenue?.thisMonthBookings ?? 0}
          icon={Calendar}
        />
        <StatsCard
          title={t('bookingsLastMonth')}
          value={revenue?.lastMonthBookings ?? 0}
          icon={Users}
        />
      </div>

      {/* Trends chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('trendsDays', { days })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trends.length === 0 ? (
            <p className="text-body-sm text-text-muted py-12 text-center">
              {t('noData')}
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="analyticsBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#155E63" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#155E63" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C6A76A" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#C6A76A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#7B8794' }}
                    tickFormatter={(v) => String(v).slice(5)}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#7B8794' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#7B8794' }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) =>
                      name === 'revenue' ? formatCurrency(value) : value
                    }
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="bookings"
                    name={isAr ? 'الحجوزات' : 'Bookings'}
                    stroke="#155E63"
                    fill="url(#analyticsBookings)"
                    strokeWidth={2}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name={isAr ? 'الإيراد' : 'Revenue'}
                    stroke="#C6A76A"
                    fill="url(#analyticsRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Popular services */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('popularServices')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {popular.length === 0 ? (
              <p className="text-body-sm text-text-muted py-8 text-center">
                {t('noData')}
              </p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={popular.map((s) => ({
                      name: isAr && s.nameAr ? s.nameAr : s.name,
                      count: s.count,
                      revenue: s.revenue,
                    }))}
                    layout="vertical"
                    margin={{ left: 8, right: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#7B8794' }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fontSize: 11, fill: '#7B8794' }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" name={isAr ? 'الحجوزات' : 'Bookings'} fill="#155E63" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {popular.length > 0 && (
              <ul className="mt-4 space-y-2 border-t border-border pt-4">
                {popular.slice(0, 5).map((s) => (
                  <li
                    key={s.serviceId}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="truncate text-text">
                      {isAr && s.nameAr ? s.nameAr : s.name}
                    </span>
                    <span className="shrink-0 text-text-muted">
                      {s.count} · {formatCurrency(s.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Staff performance */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('staffPerformance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {staffPerf.length === 0 ? (
              <p className="text-body-sm text-text-muted py-8 text-center">
                {t('noData')}
              </p>
            ) : (
              <div className="space-y-3">
                {staffPerf.map((s, idx) => {
                  const maxBookings = Math.max(...staffPerf.map((x) => x.bookings), 1)
                  const pct = Math.round((s.bookings / maxBookings) * 100)
                  return (
                    <div key={s.staffId} className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="font-medium text-text">
                          {idx + 1}. {s.firstName} {s.lastName}
                        </span>
                        <span className="text-text-muted">
                          {s.bookings} · {formatCurrency(s.revenue)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
