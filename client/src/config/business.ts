/**
 * Central white-label business configuration.
 * Change these values to rebrand the entire application
 * without touching components.
 */
export const businessConfig = {
  name: 'Bookora',
  tagline: 'Smart Booking for Modern Businesses',
  logo: '/logo.svg',
  favicon: '/favicon.ico',

  // Brand colors (override CSS variables at runtime if needed)
  colors: {
    primary: '#155E63',
    secondary: '#C6A76A',
    accent: '#D9826B',
  },

  // Contact
  phone: '+20 100 000 0000',
  email: 'hello@bookora.app',
  address: 'Cairo, Egypt',
  website: 'https://bookora.app',

  // Localization defaults
  defaultLanguage: 'en' as 'en' | 'ar',
  supportedLanguages: ['en', 'ar'] as const,
  currency: 'EGP',
  currencySymbol: 'E£',
  timezone: 'Africa/Cairo',

  // Social (optional)
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
  },

  // Booking defaults
  booking: {
    minAdvanceHours: 2,
    maxAdvanceDays: 60,
    slotIntervalMinutes: 30,
    defaultBufferMinutes: 10,
  },
} as const

export type BusinessConfig = typeof businessConfig
