import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/services/auth.api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { Sparkles, Lock } from 'lucide-react'

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Need uppercase')
      .regex(/[a-z]/, 'Need lowercase')
      .regex(/[0-9]/, 'Need number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type Form = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    setServerError('')
    if (!token) {
      setServerError('Invalid or missing reset token')
      return
    }
    try {
      await authApi.resetPassword(token, data.password)
      setSuccess(true)
      setTimeout(() => navigate('/auth/login'), 2500)
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message || t('common:errorGeneric')
      )
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
              <CardTitle className="text-h2">{t('auth:resetPassword')}</CardTitle>
              <CardDescription>
                Choose a new password for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!token ? (
                <div className="space-y-4 text-center">
                  <p className="text-body-sm text-error">
                    Invalid or missing reset link. Request a new one.
                  </p>
                  <Link to="/auth/forgot-password">
                    <Button variant="outline">{t('auth:sendResetLink')}</Button>
                  </Link>
                </div>
              ) : success ? (
                <div className="space-y-4 text-center">
                  <p className="text-body-sm text-text-secondary">
                    Password updated successfully. Redirecting to sign in…
                  </p>
                  <Link to="/auth/login">
                    <Button>{t('auth:signIn')}</Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {serverError && (
                    <p className="text-sm text-error">{serverError}</p>
                  )}
                  <Input
                    label={t('auth:password')}
                    type="password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={errors.password?.message}
                    autoComplete="new-password"
                    {...register('password')}
                  />
                  <Input
                    label={t('auth:confirmPassword')}
                    type="password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={errors.confirmPassword?.message}
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                  />
                  <Button type="submit" fullWidth isLoading={isSubmitting}>
                    {t('auth:resetPassword')}
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
