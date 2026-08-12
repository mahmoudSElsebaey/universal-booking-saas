export type BusinessType =
  | 'clinic'
  | 'beauty_salon'
  | 'barbershop'
  | 'gym'
  | 'hotel'
  | 'restaurant'
  | 'consultant'
  | 'lawyer'
  | 'tutor'
  | 'fitness_coach'
  | 'photography'
  | 'car_rental'
  | 'sports_field'
  | 'repair'
  | 'cleaning'
  | 'coworking'
  | 'other'

export type DayOfWeek =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'

export interface WorkingHoursSlot {
  day: DayOfWeek
  isOpen: boolean
  openTime: string  // "09:00"
  closeTime: string // "18:00"
  breaks?: { start: string; end: string }[]
}

export interface BusinessSettings {
  currency: string
  timezone: string
  defaultLanguage: 'en' | 'ar'
  slotIntervalMinutes: number
  minAdvanceHours: number
  maxAdvanceDays: number
  cancellationPolicyHours: number
  requireStaffSelection: boolean
  allowOnlineBooking: boolean
}

export const DEFAULT_WORKING_HOURS: WorkingHoursSlot[] = [
  { day: 'sunday', isOpen: false, openTime: '09:00', closeTime: '18:00' },
  { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'saturday', isOpen: true, openTime: '10:00', closeTime: '16:00' },
]

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  currency: 'EGP',
  timezone: 'Africa/Cairo',
  defaultLanguage: 'en',
  slotIntervalMinutes: 30,
  minAdvanceHours: 2,
  maxAdvanceDays: 60,
  cancellationPolicyHours: 24,
  requireStaffSelection: true,
  allowOnlineBooking: true,
}
