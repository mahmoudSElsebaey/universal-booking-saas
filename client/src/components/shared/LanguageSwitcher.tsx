import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Languages } from 'lucide-react'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common')

  const toggleLanguage = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(next)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      leftIcon={<Languages className="h-4 w-4" />}
      aria-label={t('language')}
    >
      {i18n.language === 'ar' ? t('english') : t('arabic')}
    </Button>
  )
}
