import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { catalogApi } from '@/services/catalog.api'
import type { StaffMember } from '@/services/business.api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { User } from 'lucide-react'

const AVATARS = [
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80',
]

export default function StaffPage() {
  const { t, i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    catalogApi
      .getCatalog()
      .then((c) => setStaff(c.staff || []))
      .catch(() => setStaff([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container-app py-12">
      <div className="mb-10 text-center">
        <h1 className="text-h1 mb-2">{t('staff')}</h1>
        <p className="text-text-secondary">
          {isAr ? 'تعرف على فريقنا' : 'Meet our team'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : staff.length === 0 ? (
        <p className="py-12 text-center text-text-muted">No staff listed yet</p>
      ) : (
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((s, i) => (
            <Card key={s._id} className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full bg-primary-50">
                  {s.avatar ? (
                    <img src={s.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <img
                      src={AVATARS[i % AVATARS.length]}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <h3 className="text-h4">
                  {s.firstName} {s.lastName}
                </h3>
                {s.title && (
                  <p className="mb-2 text-body-sm text-primary">{s.title}</p>
                )}
                {s.bio && (
                  <p className="mb-4 text-body-sm text-text-secondary">{s.bio}</p>
                )}
                <Link to="/booking">
                  <Button size="sm" variant="outline">
                    {t('bookNow')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
