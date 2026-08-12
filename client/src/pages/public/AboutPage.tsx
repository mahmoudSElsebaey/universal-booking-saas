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
              بوكورا منصة حجز شاملة مصممة للصالونات والعيادات والصالات والمراكز المهنية.
            </p>
            <p>
              نساعد الأعمال على إدارة المواعيد والموظفين والخدمات من مكان واحد، مع تجربة سلسة للعملاء بالعربي والإنجليزي.
            </p>
          </>
        ) : (
          <>
            <p>
              Bookora is a universal booking platform built for salons, clinics, gyms, and professional studios.
            </p>
            <p>
              We help businesses manage appointments, staff, and services in one place — with a smooth bilingual experience for customers.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
