import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { businessConfig } from '@/config/business'
import { Calendar, CheckCircle2, Clock, Users, Sparkles } from 'lucide-react'

export default function App() {
  const { t } = useTranslation('common')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="container-app flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-h4 font-semibold text-text">
              {t('appName')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="outline" size="sm">
              {t('login')}
            </Button>
            <Button size="sm">{t('getStarted')}</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container-app py-16 md:py-24">
        <div className="mx-auto w-full max-w-4xl text-center">
          <Badge className="mb-4">Phase 1 · Design System Ready</Badge>
          <h1 className="text-display text-text mb-4">
            {t('tagline')}
          </h1>
          <p className="text-body-lg text-text-secondary mb-8 max-w-xl mx-auto">
            A production-ready, white-label booking platform with full Arabic &
            English support, RTL/LTR, and a premium design system.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" leftIcon={<Calendar className="h-5 w-5" />}>
              {t('bookNow')}
            </Button>
            <Button variant="outline" size="lg">
              {t('learnMore')}
            </Button>
          </div>
        </div>
      </section>

      {/* Design System Showcase */}
      <section className="container-app pb-20">
        <div className="mb-8 text-center">
          <h2 className="text-h2 mb-2">Design System Showcase</h2>
          <p className="text-body text-text-secondary">
            Colors, typography, components — all token-driven
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>Primary · Secondary · Accent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <div
                  className="h-10 w-10 rounded-md bg-primary shadow-sm"
                  title="Primary"
                />
                <div
                  className="h-10 w-10 rounded-md bg-secondary shadow-sm"
                  title="Secondary"
                />
                <div
                  className="h-10 w-10 rounded-md bg-accent shadow-sm"
                  title="Accent"
                />
                <div
                  className="h-10 w-10 rounded-md bg-success shadow-sm"
                  title="Success"
                />
                <div
                  className="h-10 w-10 rounded-md bg-warning shadow-sm"
                  title="Warning"
                />
                <div
                  className="h-10 w-10 rounded-md bg-error shadow-sm"
                  title="Error"
                />
              </div>
            </CardContent>
          </Card>

          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Variants & sizes</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button size="sm">Primary</Button>
              <Button variant="secondary" size="sm">
                Secondary
              </Button>
              <Button variant="outline" size="sm">
                Outline
              </Button>
              <Button variant="ghost" size="sm">
                Ghost
              </Button>
              <Button variant="danger" size="sm">
                Danger
              </Button>
              <Button variant="soft" size="sm">
                Soft
              </Button>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Status indicators</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Confirmed</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="error">Cancelled</Badge>
              <Badge variant="outline">Outline</Badge>
            </CardContent>
          </Card>

          {/* Input */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Form Inputs</CardTitle>
              <CardDescription>With labels, hints & errors</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Email"
                placeholder="you@example.com"
                hint="We'll never share your email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error="Password must be at least 8 characters"
              />
            </CardContent>
          </Card>

          {/* Feature */}
          <Card variant="elevated">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <CardTitle>Token-driven</CardTitle>
              <CardDescription>
                Every color, radius, shadow comes from the design system. No
                hard-coded values.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Calendar, label: 'Total Bookings', value: '1,284' },
            { icon: Clock, label: "Today's Bookings", value: '24' },
            { icon: Users, label: 'Active Staff', value: '12' },
            { icon: Sparkles, label: 'Services', value: '18' },
          ].map((stat) => (
            <Card key={stat.label} padding="md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-50 text-primary">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-caption text-text-muted">
                    {stat.label}
                  </p>
                  <p className="text-h3 text-text">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8">
        <div className="container-app flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-body-sm text-text-muted">
            © {new Date().getFullYear()} {businessConfig.name}. Phase 1
            complete.
          </p>
          <p className="text-caption text-text-muted">
            Deep Teal · Warm Sand · Muted Coral
          </p>
        </div>
      </footer>
    </div>
  )
}
