import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { businessConfig } from '@/config/business'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Mail, MapPin, Phone, CheckCircle2 } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Required'),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10, 'Please write a bit more'),
})

type Form = z.infer<typeof schema>

export default function ContactPage() {
  const { t, i18n } = useTranslation('common')
  const isAr = i18n.language === 'ar'
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (_data: Form) => {
    // No dedicated contact API yet — simulate success for UX
    await new Promise((r) => setTimeout(r, 600))
    setSent(true)
    reset()
  }

  return (
    <div className="container-app py-12">
      <div className="text-center mb-10 max-w-xl mx-auto">
        <h1 className="text-h1 mb-2">{t('contact')}</h1>
        <p className="text-text-secondary">
          {isAr
            ? 'يسعدنا تواصلك معنا — أرسل رسالتك وسنرد في أقرب وقت.'
            : "We'd love to hear from you — send a message and we'll get back soon."}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-text">
                {isAr ? 'البريد الإلكتروني' : 'Email'}
              </p>
              <a
                href={`mailto:${businessConfig.email}`}
                className="text-body-sm text-primary hover:underline"
              >
                {businessConfig.email}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-text">
                {isAr ? 'الهاتف' : 'Phone'}
              </p>
              <a
                href={`tel:${businessConfig.phone.replace(/\s/g, '')}`}
                className="text-body-sm text-primary hover:underline"
              >
                {businessConfig.phone}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-text">
                {isAr ? 'العنوان' : 'Address'}
              </p>
              <p className="text-body-sm text-text-secondary">
                {businessConfig.address}
              </p>
            </div>
          </div>
        </div>

        <Card variant="elevated">
          <CardContent className="pt-5">
            {sent ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-success" />
                <p className="text-body font-medium text-text">
                  {isAr ? 'تم إرسال رسالتك' : 'Message sent'}
                </p>
                <p className="text-body-sm text-text-secondary">
                  {isAr
                    ? 'شكراً لتواصلك. سنرد عليك قريباً.'
                    : "Thanks for reaching out. We'll reply soon."}
                </p>
                <Button variant="outline" onClick={() => setSent(false)}>
                  {isAr ? 'إرسال رسالة أخرى' : 'Send another message'}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label={isAr ? 'الاسم' : 'Name'}
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label={t('email')}
                  type="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label={t('phone')}
                  type="tel"
                  {...register('phone')}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text">
                    {isAr ? 'الرسالة' : 'Message'}
                  </label>
                  <textarea
                    className="w-full min-h-[120px] rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    {...register('message')}
                  />
                  {errors.message?.message && (
                    <p className="mt-1 text-xs text-error">{errors.message.message}</p>
                  )}
                </div>
                <Button type="submit" fullWidth isLoading={isSubmitting}>
                  {t('submit')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
