import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { businessConfig } from '@/config/business'

import enCommon from './locales/en/common.json'
import arCommon from './locales/ar/common.json'
import enAuth from './locales/en/auth.json'
import arAuth from './locales/ar/auth.json'
import enBooking from './locales/en/booking.json'
import arBooking from './locales/ar/booking.json'
import enDashboard from './locales/en/dashboard.json'
import arDashboard from './locales/ar/dashboard.json'
import enValidation from './locales/en/validation.json'
import arValidation from './locales/ar/validation.json'

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    booking: enBooking,
    dashboard: enDashboard,
    validation: enValidation,
  },
  ar: {
    common: arCommon,
    auth: arAuth,
    booking: arBooking,
    dashboard: arDashboard,
    validation: arValidation,
  },
}

const savedLang =
  typeof window !== 'undefined'
    ? localStorage.getItem('language') || businessConfig.defaultLanguage
    : businessConfig.defaultLanguage

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'auth', 'booking', 'dashboard', 'validation'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

// Keep <html dir> and lang in sync
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.dir = dir
  document.documentElement.lang = lng
  localStorage.setItem('language', lng)
})

// Set initial direction
if (typeof document !== 'undefined') {
  document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = savedLang
}

export default i18n
