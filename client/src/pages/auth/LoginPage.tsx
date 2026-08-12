import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { Sparkles, Mail, Lock } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { t } = useTranslation(['auth', 'common'])
  const { login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setServerError('')
    try {
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (err: any) {
      setServerError(err?.response?.data?.message || t('common:errorGeneric'))
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container-app flex h-16 w-full items-center justify-between">
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
              <CardTitle className="text-h2">{t('auth:loginTitle')}</CardTitle>
              <CardDescription>{t('auth:loginSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {serverError && (
                  <div className="rounded-md bg-error-light px-3 py-2 text-sm text-error">
                    {serverError}
                  </div>
                )}

                <Input
                  label={t('auth:email')}
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label={t('auth:password')}
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                  {...register('password')}
                />

                <div className="flex justify-end">
                  <Link
                    to="/auth/forgot-password"
                    className="text-body-sm text-primary hover:underline"
                  >
                    {t('auth:forgotPassword')}
                  </Link>
                </div>

                <Button type="submit" fullWidth isLoading={isSubmitting}>
                  {t('auth:signIn')}
                </Button>
              </form>

              <p className="mt-6 text-center text-body-sm text-text-secondary">
                {t('auth:noAccount')}{' '}
                <Link to="/auth/register" className="font-medium text-primary hover:underline">
                  {t('auth:signUp')}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
