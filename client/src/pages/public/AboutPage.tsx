import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { businessConfig } from '@/config/business'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { HeartPulse, Clock, Languages, ShieldCheck } from 'lucide-react'

const features = [
  {
    icon: HeartPulse,
    en: { title: 'Multi-specialty care', body: 'General practice, dermatology, diagnostics, and more under one roof.' },
    ar: { title: 'رعاية متعددة التخصصات', body: 'طب عام، جلدية، تحاليل وتشخيص — كل ذلك في مكان واحد.' },
  },
  {
    icon: Clock,
    en: { title: 'Easy online booking', body: 'Pick a service, doctor, and time slot in minutes — no phone queues.' },
    ar: { title: 'حجز أونلاين بسهولة', body: 'اختر الخدمة والطبيب والموعد في دقائق دون انتظار على الهاتف.' },
  },
  {
    icon: Languages,
    en: { title: 'Arabic & English', body: 'Full bilingual experience with RTL support for Arabic.' },
    ar: { title: 'عربي وإنجليزي', body: 'تجربة ثنائية اللغة بالكامل مع دعم اتجاه اليمين لليسار.' },
  },
  {
    icon: ShieldCheck,
    en: { title: 'Trusted & secure', body: 'Your data and appointments are protected with modern security practices.' },
    ar: { title: 'موثوق وآمن', body: 'بياناتك ومواعيدك محمية بممارسات أمان حديثة.' },
  },
]

export default function AboutPage() {
  const { t, i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="container-app py-14 max-w-3xl">
          <p className="text-caption font-medium text-primary mb-2">
            {isAr ? 'من نحن' : 'About us'}
          </p>
          <h1 className="text-h1 text-text mb-4">
            {isAr
              ? 'رعاية طبية موثوقة مع حجز مواعيد بسيط'
              : 'Trusted care with simple appointment booking'}
          </h1>
          <p className="text-body text-text-secondary leading-relaxed">
            {isAr
              ? 'عيادة كايرو كير تقدّم رعاية متعددة التخصصات في القاهرة، مع منصة حجز أونلاين بالعربي والإنجليزي. هدفنا تسهيل وصولك للطبيب المناسب في الوقت المناسب.'
              : 'Cairo Care Clinic delivers multi-specialty medical care in Cairo, with an online booking platform in Arabic and English. Our goal is to connect you with the right doctor at the right time.'}
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container-app py-12">
        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((f) => {
            const copy = isAr ? f.ar : f.en
            const Icon = f.icon
            return (
              <Card key={copy.title} variant="elevated">
                <CardContent className="pt-5 flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-h4 text-text mb-1">{copy.title}</h2>
                    <p className="text-body-sm text-text-secondary">{copy.body}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* How booking works */}
      <section className="container-app py-4 max-w-3xl">
        <h2 className="text-h2 mb-4">{t('howItWorks')}</h2>
        <ol className="space-y-3 text-body text-text-secondary list-decimal list-inside">
          <li>
            <span className="font-medium text-text">{t('howStep1')}: </span>
            {t('howStep1Desc')}
          </li>
          <li>
            <span className="font-medium text-text">{t('howStep2')}: </span>
            {t('howStep2Desc')}
          </li>
          <li>
            <span className="font-medium text-text">{t('howStep3')}: </span>
            {t('howStep3Desc')}
          </li>
        </ol>
      </section>

      {/* Clinic info */}
      <section className="container-app max-w-3xl">
        <Card>
          <CardContent className="pt-6 space-y-3 text-body-sm text-text-secondary">
            <p>
              <span className="font-medium text-text">
                {isAr ? 'العنوان: ' : 'Address: '}
              </span>
              {businessConfig.address}
            </p>
            <p>
              <span className="font-medium text-text">
                {isAr ? 'الهاتف: ' : 'Phone: '}
              </span>
              {businessConfig.phone}
            </p>
            <p>
              <span className="font-medium text-text">
                {isAr ? 'البريد: ' : 'Email: '}
              </span>
              {businessConfig.email}
            </p>
            <div className="pt-4">
              <Link to="/booking">
                <Button>{isAr ? 'احجز موعداً' : 'Book an appointment'}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
