import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Mail, MapPin, Phone } from 'lucide-react'

export default function ContactPage() {
  const { t, i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'

  return (
    <div className="container-app py-12">
      <div className="text-center mb-10">
        <h1 className="text-h1 mb-2">{t('contact')}</h1>
        <p className="text-text-secondary">
          {isAr ? 'يسعدنا تواصلك معنا' : "We'd love to hear from you"}
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <span>hello@bookora.app</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary" />
            <span>+20 100 000 0000</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Cairo, Egypt</span>
          </div>
        </div>
        <Card>
          <CardContent className="pt-5 space-y-4">
            <Input label={isAr ? 'الاسم' : 'Name'} />
            <Input label="Email" type="email" />
            <Input label={isAr ? 'الرسالة' : 'Message'} />
            <Button fullWidth>{t('submit')}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
