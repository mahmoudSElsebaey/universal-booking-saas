/**
 * Design tokens mirrored from CSS for use in JS/TS
 * (e.g. charts, dynamic styles, Framer Motion)
 */
export const colors = {
  primary: {
    DEFAULT: '#155E63',
    dark: '#0F474B',
    light: '#1E7A80',
    50: '#E8F4F5',
    100: '#D0E9EB',
    500: '#155E63',
    700: '#0F3E42',
    900: '#091F21',
  },
  secondary: {
    DEFAULT: '#C6A76A',
    dark: '#A88B4F',
    light: '#D4BC8A',
    50: '#F9F5ED',
  },
  accent: {
    DEFAULT: '#D9826B',
    dark: '#C06A54',
    light: '#E5A08C',
    50: '#FBF0ED',
  },
  background: '#F7F4EE',
  surface: '#FFFFFF',
  text: {
    DEFAULT: '#1F2933',
    secondary: '#52606D',
    muted: '#7B8794',
    inverse: '#FFFFFF',
  },
  border: {
    DEFAULT: '#E5E0D8',
    strong: '#D1CBC0',
    subtle: '#F0EBE3',
  },
  success: '#3F7D5A',
  warning: '#B7791F',
  error: '#B84A4A',
  info: '#155E63',
} as const

export const radius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.25rem',
  full: '9999px',
} as const

export const shadows = {
  xs: '0 1px 2px rgba(31, 41, 51, 0.04)',
  sm: '0 1px 3px rgba(31, 41, 51, 0.06), 0 1px 2px rgba(31, 41, 51, 0.04)',
  md: '0 4px 6px -1px rgba(31, 41, 51, 0.07), 0 2px 4px -2px rgba(31, 41, 51, 0.05)',
  lg: '0 10px 15px -3px rgba(31, 41, 51, 0.08), 0 4px 6px -4px rgba(31, 41, 51, 0.05)',
  xl: '0 20px 25px -5px rgba(31, 41, 51, 0.08), 0 8px 10px -6px rgba(31, 41, 51, 0.04)',
  focus: '0 0 0 3px rgba(21, 94, 99, 0.25)',
} as const
