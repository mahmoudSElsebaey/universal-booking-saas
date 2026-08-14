import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { CalendarCheck, ClipboardList, UserRound } from 'lucide-react'

const steps = [
  { icon: ClipboardList, titleKey: 'howStep1', descKey: 'howStep1Desc' },
  { icon: UserRound, titleKey: 'howStep2', descKey: 'howStep2Desc' },
  { icon: CalendarCheck, titleKey: 'howStep3', descKey: 'howStep3Desc' },
] as const

export function HomeHowItWorks() {
  const { t } = useTranslation('common')

  return (
    <section className="border-y border-border bg-surface py-16">
      <div className="container-app">
        <div className="mb-12 text-center">
          <h2 className="text-h1 mb-2">{t('howItWorks')}</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.titleKey}
                className="relative rounded-xl border border-border bg-background p-6 pt-10 text-center shadow-sm"
              >
                {/* Professional step number badge */}
                <div
                  className="absolute -top-5 start-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-md ring-4 ring-surface rtl:translate-x-1/2"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary">
                  <Icon className="h-7 w-7" strokeWidth={1.75} />
                </div>
                <h3 className="text-h4 mb-2">{t(step.titleKey)}</h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  {t(step.descKey)}
                </p>
              </div>
            )
          })}
        </div>
        <div className="mt-12 text-center">
          <Link to="/booking">
            <Button size="lg">{t('bookNow')}</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
