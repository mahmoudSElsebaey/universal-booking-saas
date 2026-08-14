import { z } from 'zod'

export const availabilityQuerySchema = z.object({
  businessId: z.string().min(1),
  serviceId: z.string().min(1),
  staffId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
})

export const createBookingSchema = z.object({
  businessId: z.string().min(1),
  serviceId: z.string().min(1),
  staffId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm'),
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  notes: z.string().max(500).optional(),
  paymentMethod: z.enum(['visa', 'vodafone_cash', 'cash']).optional(),
})

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'cancelled',
    'completed',
    'no_show',
    'rescheduled',
  ]),
  reason: z.string().max(500).optional(),
})

export const rescheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  staffId: z.string().optional(),
})

export const listBookingsQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  status: z
    .enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled'])
    .optional(),
  staffId: z.string().optional(),
  serviceId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
})
