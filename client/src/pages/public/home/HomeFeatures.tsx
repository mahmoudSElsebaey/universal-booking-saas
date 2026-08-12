import { useTranslation } from 'react-i18next'
import { FEATURES } from './homeData'

export function HomeFeatures() {
  const { i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'

  return (
    <section className="container-app py-16">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary">
              <f.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-h4 mb-1">{isAr ? f.titleAr : f.title}</h3>
              <p className="text-body-sm text-text-secondary">
                {isAr ? f.descAr : f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
