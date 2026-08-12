import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/authStore'
import { analyticsApi, type DashboardOverview, type TrendPoint } from '@/services/analytics.api'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Calendar,
  CheckCircle2,
  XCircle,
  DollarSign,
  Users,
  Scissors,
  UserCheck,
  Clock,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Temporary: in real app get businessId from auth/user/business context
const DEMO_BUSINESS_ID = localStorage.getItem('businessId') || ''

export default function OverviewPage() {
  const { t } = useTranslation('dashboard')
  const { user } = useAuth()
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [trends, setTrends] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isCustomer = user?.role === 'customer'
  const businessId = user?.businessId || DEMO_BUSINESS_ID

  useEffect(() => {
    if (isCustomer || !businessId) {
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        const [ov, tr] = await Promise.all([
          analyticsApi.getOverview(businessId),
          analyticsApi.getTrends(businessId, 14),
        ])
        setOverview(ov)
        setTrends(tr)
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [businessId, isCustomer])

  if (isCustomer) {
    return <CustomerOverview />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !overview) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary">
          {error || 'No business linked. Create a business first.'}
        </p>
      </div>
    )
  }

  const { stats, recentBookings, upcomingAppointments } = overview

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(n)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-text">{t('overview')}</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          Welcome back, {user?.firstName}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('totalBookings')}
          value={stats.totalBookings}
          icon={Calendar}
        />
        <StatsCard
          title={t('todayBookings')}
          value={stats.todayBookings}
          icon={Clock}
        />
        <StatsCard
          title={t('revenue')}
          value={formatCurrency(stats.revenue)}
          icon={DollarSign}
        />
        <StatsCard
          title={t('customers')}
          value={stats.customers}
          icon={Users}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Completed"
          value={stats.completedBookings}
          icon={CheckCircle2}
        />
        <StatsCard
          title="Cancelled"
          value={stats.cancelledBookings}
          icon={XCircle}
        />
        <StatsCard
          title="Active Services"
          value={stats.activeServices}
          icon={Scissors}
        />
        <StatsCard
          title="Active Staff"
          value={stats.activeStaff}
          icon={UserCheck}
        />
      </div>

      {/* Charts + lists */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Booking Trends (14 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {trends.length === 0 ? (
              <p className="text-body-sm text-text-muted py-8 text-center">
                No data yet
              </p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#155E63" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#155E63" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#7B8794' }}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#7B8794' }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      stroke="#155E63"
                      fill="url(#colorBookings)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('upcoming')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingAppointments.length === 0 ? (
              <p className="text-body-sm text-text-muted text-center py-4">
                No upcoming appointments
              </p>
            ) : (
              upcomingAppointments.slice(0, 6).map((b: any) => (
                <div
                  key={b._id}
                  className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {b.customerName}
                    </p>
                    <p className="text-xs text-text-muted">
                      {b.serviceId?.name} · {b.startTime}
                    </p>
                  </div>
                  <Badge variant="success">{b.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="text-body-sm text-text-muted text-center py-6">
              No bookings yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-start text-text-muted">
                    <th className="pb-3 font-medium text-start">Customer</th>
                    <th className="pb-3 font-medium text-start">Service</th>
                    <th className="pb-3 font-medium text-start">Staff</th>
                    <th className="pb-3 font-medium text-start">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b: any) => (
                    <tr
                      key={b._id}
                      className="border-b border-border-subtle last:border-0"
                    >
                      <td className="py-3 text-text">{b.customerName}</td>
                      <td className="py-3 text-text-secondary">
                        {b.serviceId?.name || '—'}
                      </td>
                      <td className="py-3 text-text-secondary">
                        {b.staffId
                          ? `${b.staffId.firstName} ${b.staffId.lastName}`
                          : '—'}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={
                            b.status === 'confirmed'
                              ? 'success'
                              : b.status === 'cancelled'
                                ? 'error'
                                : b.status === 'pending'
                                  ? 'warning'
                                  : 'muted'
                          }
                        >
                          {b.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CustomerOverview() {
  const { user } = useAuth()
  const { t } = useTranslation('dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1">Welcome, {user?.firstName}</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          Manage your bookings and profile
        </p>
      </div>
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-text-secondary">
            Go to <strong>{t('bookings')}</strong> to see your appointments.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
