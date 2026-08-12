import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { CheckCircle2 } from 'lucide-react'

export function HomeCta() {
  const { t, i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'

  return (
    <section className="container-app py-16">
      <div className="rounded-2xl bg-primary px-8 py-12 text-center text-white">
        <CheckCircle2 className="mx-auto mb-4 h-10 w-10 opacity-90" />
        <h2 className="text-h1 mb-3">
          {isAr ? 'جاهز تحجز؟' : 'Ready to book?'}
        </h2>
        <p className="mx-auto mb-6 max-w-md text-body-lg opacity-90">
          {isAr
            ? 'اختر الخدمة والطبيب والوقت المناسب لك.'
            : 'Pick service, doctor, and a time that works for you.'}
        </p>
        <Link to="/booking">
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-primary-50"
          >
            {t('bookNow')}
          </Button>
        </Link>
      </div>
    </section>
  )
}
