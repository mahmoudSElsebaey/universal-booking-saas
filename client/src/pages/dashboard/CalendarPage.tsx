import { useEffect, useMemo, useState } from 'react'
import { useBusinessId } from '@/hooks/useBusinessId'
import { bookingApi, type Booking } from '@/services/booking.api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

export default function CalendarPage() {
  const { businessId, loading: bizLoading } = useBusinessId()
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  )
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  const load = async () => {
    if (!businessId) {
      setLoading(false)
      return
    }
    const from = new Date(year, month, 1).toISOString().slice(0, 10)
    const to = new Date(year, month + 1, 0).toISOString().slice(0, 10)
    setLoading(true)
    try {
      const res = await bookingApi.list(businessId, {
        limit: 200,
        dateFrom: from,
        dateTo: to,
      })
      setBookings(res.data || [])
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!bizLoading) load()
  }, [businessId, bizLoading, year, month])

  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {}
    for (const b of bookings) {
      const key = new Date(b.date).toISOString().slice(0, 10)
      if (!map[key]) map[key] = []
      map[key].push(b)
    }
    return map
  }, [bookings])

  const cells = useMemo(() => {
    const first = startOfMonth(cursor)
    const startPad = first.getDay() // 0 Sun
    const total = daysInMonth(cursor)
    const items: { date: string | null; day: number | null }[] = []
    for (let i = 0; i < startPad; i++) items.push({ date: null, day: null })
    for (let d = 1; d <= total; d++) {
      const date = new Date(year, month, d).toISOString().slice(0, 10)
      items.push({ date, day: d })
    }
    return items
  }, [cursor, year, month])

  const dayBookings = bookingsByDate[selected] || []

  const prevMonth = () => setCursor(new Date(year, month - 1, 1))
  const nextMonth = () => setCursor(new Date(year, month + 1, 1))

  const monthLabel = cursor.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  if (bizLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!businessId) {
    return (
      <div className="text-center py-16 text-text-secondary">
        No business linked.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-h1">Calendar</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{monthLabel}</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon-sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-muted mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-1 font-medium">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell, i) => {
                if (!cell.date) {
                  return <div key={`pad-${i}`} className="aspect-square" />
                }
                const count = bookingsByDate[cell.date]?.length || 0
                const isSelected = cell.date === selected
                const isToday =
                  cell.date === new Date().toISOString().slice(0, 10)
                return (
                  <button
                    key={cell.date}
                    type="button"
                    onClick={() => setSelected(cell.date!)}
                    className={`aspect-square rounded-md text-sm flex flex-col items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-primary text-white'
                        : isToday
                          ? 'bg-primary-50 text-primary'
                          : 'hover:bg-surface-muted'
                    }`}
                  >
                    <span>{cell.day}</span>
                    {count > 0 && (
                      <span
                        className={`text-[10px] mt-0.5 ${
                          isSelected ? 'text-white/80' : 'text-primary'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {loading && (
              <p className="text-center text-caption mt-3">Loading…</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {new Date(selected + 'T12:00:00').toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {dayBookings.length === 0 ? (
              <p className="text-body-sm text-text-muted text-center py-6">
                No bookings
              </p>
            ) : (
              dayBookings
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((b) => (
                  <div
                    key={b._id}
                    className="rounded-md border border-border p-3"
                  >
                    <div className="flex justify-between gap-2">
                      <p className="font-medium text-sm">{b.customerName}</p>
                      <Badge
                        variant={
                          b.status === 'confirmed'
                            ? 'success'
                            : b.status === 'cancelled'
                              ? 'error'
                              : 'muted'
                        }
                      >
                        {b.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {b.startTime} – {b.endTime}
                      {typeof b.serviceId === 'object' && b.serviceId?.name
                        ? ` · ${b.serviceId.name}`
                        : ''}
                    </p>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
