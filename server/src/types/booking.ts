export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'
  | 'rescheduled'

export interface TimeSlot {
  start: string // "09:00"
  end: string   // "10:00"
  available: boolean
  staffId?: string
}

export interface DayAvailability {
  date: string // YYYY-MM-DD
  slots: TimeSlot[]
}

export interface CreateBookingInput {
  businessId: string
  serviceId: string
  staffId?: string
  date: string       // YYYY-MM-DD
  startTime: string  // HH:mm
  customerName: string
  customerEmail: string
  customerPhone?: string
  notes?: string
  customerId?: string // if logged-in customer
  paymentMethod?: 'visa' | 'vodafone_cash' | 'cash'
}

export interface AvailabilityQuery {
  businessId: string
  serviceId: string
  staffId?: string
  date: string // YYYY-MM-DD
  days?: number // how many days ahead to return (default 1)
}
