import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBusinessId } from '@/hooks/useBusinessId'
import { bookingApi, type Booking } from '@/services/booking.api'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

interface CustomerRow {
  email: string
  name: string
  phone?: string
  bookings: number
  lastDate?: string
  totalSpent: number
}

export default function CustomersPage() {
  const { t } = useTranslation(['dashboard', 'common'])
  const { businessId, loading: bizLoading } = useBusinessId()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!businessId) {
      setLoading(false)
      return
    }
    bookingApi
      .list(businessId, { limit: 200 })
      .then((res) => setBookings(res.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [businessId])

  const customers = useMemo(() => {
    const map = new Map<string, CustomerRow>()
    for (const b of bookings) {
      const key = (b.customerEmail || b.customerName).toLowerCase()
      const existing = map.get(key)
      const spent =
        b.status === 'confirmed' || b.status === 'completed' ? b.price : 0
      if (!existing) {
        map.set(key, {
          email: b.customerEmail,
          name: b.customerName,
          phone: b.customerPhone,
          bookings: 1,
          lastDate: b.date,
          totalSpent: spent,
        })
      } else {
        existing.bookings += 1
        existing.totalSpent += spent
        if (b.date > (existing.lastDate || '')) existing.lastDate = b.date
      }
    }
    return Array.from(map.values()).sort((a, b) => b.bookings - a.bookings)
  }, [bookings])

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  )

  if (bizLoading || loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!businessId) {
    return (
      <div className="py-16 text-center text-text-secondary">
        {t("dashboard:noBusiness")}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-h1">{t("dashboard:customers")}</h1>
        <Input
          placeholder={t("dashboard:searchCustomers")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
      </div>

      <Card>
        <CardContent className="pt-4">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-text-muted">{t("dashboard:noData")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="pb-3 text-start font-medium">{t("dashboard:name")}</th>
                    <th className="pb-3 text-start font-medium">{t("dashboard:email")}</th>
                    <th className="pb-3 text-start font-medium">{t("dashboard:bookingCount")}</th>
                    <th className="pb-3 text-start font-medium">{t("dashboard:spent")}</th>
                    <th className="pb-3 text-start font-medium">{t("dashboard:lastVisit")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.email} className="border-b border-border-subtle">
                      <td className="py-3 font-medium">{c.name}</td>
                      <td className="py-3 text-text-secondary">{c.email}</td>
                      <td className="py-3">
                        <Badge>{c.bookings}</Badge>
                      </td>
                      <td className="py-3">{c.totalSpent} EGP</td>
                      <td className="py-3 text-text-muted">
                        {c.lastDate
                          ? new Date(c.lastDate).toLocaleDateString()
                          : '—'}
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
