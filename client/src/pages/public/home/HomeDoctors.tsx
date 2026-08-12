import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { StaffMember } from '@/services/business.api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AVATARS } from './homeData'

type Props = { doctors: StaffMember[] }

export function HomeDoctors({ doctors }: Props) {
  const { t, i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'

  return (
    <section className="border-y border-border bg-surface py-16">
      <div className="container-app">
        <div className="mb-10 text-center">
          <h2 className="text-h1 mb-2">{t('doctors')}</h2>
          <p className="text-text-secondary">
            {isAr ? 'تعرف على أطباء العيادة' : 'Meet our clinic doctors'}
          </p>
        </div>
        {doctors.length === 0 ? (
          <p className="text-center text-text-muted">
            {isAr ? 'شغّل الـ seed لعرض الأطباء' : 'Run seed to load doctors'}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {doctors.map((d, i) => (
              <Card key={d._id} className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full bg-primary-50">
                    <img
                      src={d.avatar || AVATARS[i % AVATARS.length]}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-h4">
                    {d.firstName} {d.lastName}
                  </h3>
                  {d.title && (
                    <p className="mb-2 text-body-sm text-primary">{d.title}</p>
                  )}
                  {d.bio && (
                    <p className="mb-3 line-clamp-2 text-body-sm text-text-secondary">
                      {d.bio}
                    </p>
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
        <div className="mt-8 text-center">
          <Link to="/staff">
            <Button variant="outline">{t('viewAll')}</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
