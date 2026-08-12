import { z } from 'zod'

const dayEnum = z.enum([
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
])

const workingHoursSchema = z.object({
  day: dayEnum,
  isOpen: z.boolean(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
  breaks: z
    .array(
      z.object({
        start: z.string().regex(/^\d{2}:\d{2}$/),
        end: z.string().regex(/^\d{2}:\d{2}$/),
      })
    )
    .optional(),
})

export const createBusinessSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens'),
  type: z.enum([
    'clinic',
    'beauty_salon',
    'barbershop',
    'gym',
    'hotel',
    'restaurant',
    'consultant',
    'lawyer',
    'tutor',
    'fitness_coach',
    'photography',
    'car_rental',
    'sports_field',
    'repair',
    'cleaning',
    'coworking',
    'other',
  ]),
  description: z.string().max(2000).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
})

export const updateBusinessSchema = createBusinessSchema.partial().extend({
  workingHours: z.array(workingHoursSchema).optional(),
  settings: z
    .object({
      currency: z.string().optional(),
      timezone: z.string().optional(),
      defaultLanguage: z.enum(['en', 'ar']).optional(),
      slotIntervalMinutes: z.number().min(5).max(120).optional(),
      minAdvanceHours: z.number().min(0).optional(),
      maxAdvanceDays: z.number().min(1).max(365).optional(),
      cancellationPolicyHours: z.number().min(0).optional(),
      requireStaffSelection: z.boolean().optional(),
      allowOnlineBooking: z.boolean().optional(),
    })
    .optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  nameAr: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  image: z.string().optional(),
  sortOrder: z.number().optional(),
})

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
})

export const createServiceSchema = z.object({
  name: z.string().min(1).max(150),
  nameAr: z.string().max(150).optional(),
  description: z.string().max(2000).optional(),
  descriptionAr: z.string().max(2000).optional(),
  categoryId: z.string().optional(),
  image: z.string().optional(),
  price: z.number().min(0),
  currency: z.string().optional(),
  duration: z.number().min(5).max(480),
  bufferTime: z.number().min(0).max(120).optional(),
  maxBookingsPerSlot: z.number().min(1).optional(),
  staffRequired: z.boolean().optional(),
  assignedStaffIds: z.array(z.string()).optional(),
  location: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft']).optional(),
  sortOrder: z.number().optional(),
})

export const updateServiceSchema = createServiceSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export const createStaffSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  bio: z.string().max(1000).optional(),
  bioAr: z.string().max(1000).optional(),
  title: z.string().max(100).optional(),
  serviceIds: z.array(z.string()).optional(),
  workingHours: z.array(workingHoursSchema).optional(),
  maxBookingsPerDay: z.number().min(1).optional(),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
  sortOrder: z.number().optional(),
  userId: z.string().optional(),
})

export const updateStaffSchema = createStaffSchema.partial().extend({
  daysOff: z.array(z.string().datetime().or(z.string().date())).optional(),
  isActive: z.boolean().optional(),
})
