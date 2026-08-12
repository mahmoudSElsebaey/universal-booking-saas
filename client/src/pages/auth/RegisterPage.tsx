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
import { Sparkles, Mail, Lock, User } from 'lucide-react'

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Required'),
    lastName: z.string().min(2, 'Required'),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, 'Need uppercase')
      .regex(/[a-z]/, 'Need lowercase')
      .regex(/[0-9]/, 'Need number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { t } = useTranslation(['auth', 'common'])
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setServerError('')
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      navigate('/dashboard')
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
            <CardTitle className="text-h2">{t('auth:registerTitle')}</CardTitle>
            <CardDescription>{t('auth:registerSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="rounded-md bg-error-light px-3 py-2 text-sm text-error">
                  {serverError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t('auth:firstName')}
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
                <Input
                  label={t('auth:lastName')}
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>

              <Input
                label={t('auth:email')}
                type="email"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label={t('auth:password')}
                type="password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label={t('auth:confirmPassword')}
                type="password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button type="submit" fullWidth isLoading={isSubmitting}>
                {t('auth:signUp')}
              </Button>
            </form>

            <p className="mt-6 text-center text-body-sm text-text-secondary">
              {t('auth:hasAccount')}{' '}
              <Link
                to="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                {t('auth:signIn')}
              </Link>
            </p>
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  )
}
