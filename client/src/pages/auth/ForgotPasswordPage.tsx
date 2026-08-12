import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/services/auth.api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { Sparkles, Mail } from 'lucide-react'

const schema = z.object({
  email: z.string().email(),
})

type Form = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { t } = useTranslation(['auth', 'common'])
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    setError('')
    try {
      await authApi.forgotPassword(data.email)
      setSent(true)
    } catch (err: any) {
      // Still show success to avoid email enumeration — or show error in dev
      setSent(true)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container-app flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-h4 font-semibold">{t('common:appName')}</span>
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="flex w-full flex-1 items-center justify-center px-4 py-12">
        <div className="w-full" style={{ maxWidth: 448 }}>
          <Card variant="elevated" className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-h2">{t('auth:forgotPassword')}</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <p className="text-body-sm text-text-secondary">
                  If an account exists for that email, a reset link has been sent.
                  Check your inbox (and server logs in development).
                </p>
                <Link to="/auth/login">
                  <Button variant="outline">{t('auth:signIn')}</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <p className="text-sm text-error">{error}</p>
                )}
                <Input
                  label={t('auth:email')}
                  type="email"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" fullWidth isLoading={isSubmitting}>
                  {t('auth:sendResetLink')}
                </Button>
                <p className="text-center text-body-sm">
                  <Link
                    to="/auth/login"
                    className="text-primary hover:underline"
                  >
                    {t('auth:signIn')}
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  )
}
