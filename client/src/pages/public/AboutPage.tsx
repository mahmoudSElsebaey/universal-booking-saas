import { useTranslation } from 'react-i18next'

export default function AboutPage() {
  const { i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'

  return (
    <div className="container-app py-12 max-w-2xl mx-auto">
      <h1 className="text-h1 mb-4">{isAr ? 'من نحن' : 'About us'}</h1>
      <div className="space-y-4 text-body text-text-secondary">
        {isAr ? (
          <>
            <p>
              عيادة كايرو كير تقدّم رعاية طبية متعددة التخصصات مع حجز مواعيد أونلاين بسهولة.
            </p>
            <p>
              من الطب العام إلى الجلدية والتحاليل — احجز زيارتك في دقائق بالعربي أو الإنجليزي.
            </p>
          </>
        ) : (
          <>
            <p>
              Cairo Care Clinic provides trusted multi-specialty care with easy online appointment booking.
            </p>
            <p>
              From general practice to dermatology and lab diagnostics — book your visit in minutes, in Arabic or English.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
