import type { Service } from '@/services/business.api'
import { Calendar, Clock, Shield, Users } from 'lucide-react'

export const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=85',
]

/** Reliable clinic service images */
export const SERVICE_IMAGE_BY_KEY: Record<string, string> = {
  general:
    'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=800&q=80',
  followup:
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
  derma:
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
  lab: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
  pediatrics:
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80',
  cardio:
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
  ultrasound:
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
  default:
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
}

export const AVATARS = [
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=80',
]

export const FEATURES = [
  {
    icon: Calendar,
    title: 'Easy booking',
    titleAr: 'حجز سهل',
    desc: 'Book in a few taps.',
    descAr: 'احجز في خطوات بسيطة.',
  },
  {
    icon: Clock,
    title: 'Real-time slots',
    titleAr: 'مواعيد لحظية',
    desc: 'Only open times shown.',
    descAr: 'المواعيد المتاحة فقط.',
  },
  {
    icon: Shield,
    title: 'Trusted care',
    titleAr: 'رعاية موثوقة',
    desc: 'Your data is protected.',
    descAr: 'بياناتك محمية.',
  },
  {
    icon: Users,
    title: 'Expert doctors',
    titleAr: 'أطباء متخصصون',
    desc: 'Choose your doctor.',
    descAr: 'اختار طبيبك.',
  },
]

export const FALLBACK_SERVICES: Partial<Service>[] = [
  {
    _id: '1',
    name: 'General Consultation',
    nameAr: 'كشف عام',
    price: 300,
    duration: 30,
    description: 'Full GP consultation.',
    image: SERVICE_IMAGE_BY_KEY.general,
  },
  {
    _id: '2',
    name: 'Follow-up Visit',
    nameAr: 'زيارة متابعة',
    price: 150,
    duration: 15,
    description: 'Follow-up appointment.',
    image: SERVICE_IMAGE_BY_KEY.followup,
  },
  {
    _id: '3',
    name: 'Dermatology Consultation',
    nameAr: 'كشف جلدية',
    price: 450,
    duration: 30,
    description: 'Skin specialist visit.',
    image: SERVICE_IMAGE_BY_KEY.derma,
  },
  {
    _id: '4',
    name: 'Lab Tests Package',
    nameAr: 'باقة تحاليل',
    price: 600,
    duration: 20,
    description: 'Basic lab diagnostics.',
    image: SERVICE_IMAGE_BY_KEY.lab,
  },
  {
    _id: '5',
    name: 'Pediatrics Consultation',
    nameAr: 'كشف أطفال',
    price: 350,
    duration: 30,
    description: 'Child health check.',
    image: SERVICE_IMAGE_BY_KEY.pediatrics,
  },
  {
    _id: '6',
    name: 'Cardiology Consultation',
    nameAr: 'كشف قلب',
    price: 500,
    duration: 40,
    description: 'Heart check-up.',
    image: SERVICE_IMAGE_BY_KEY.cardio,
  },
  {
    _id: '7',
    name: 'Ultrasound Scan',
    nameAr: 'أشعة تلفزيونية',
    price: 700,
    duration: 25,
    description: 'Diagnostic ultrasound.',
    image: SERVICE_IMAGE_BY_KEY.ultrasound,
  },
]

/** Pick a stable image for a service (fixes broken follow-up etc.) */
export function resolveServiceImage(name = '', image?: string) {
  // Prefer uploaded or absolute custom images
  if (image) {
    if (
      image.startsWith('/uploads/') ||
      image.startsWith('http://') ||
      image.startsWith('https://') ||
      image.startsWith('data:')
    ) {
      // Public pages may need absolute URL for /uploads
      if (image.startsWith('/uploads/')) {
        const apiBase = (import.meta as any).env?.VITE_API_URL || ''
        const origin = String(apiBase).replace(/\/api\/v1\/?$/, '')
        return origin ? `${origin}${image}` : image
      }
      return image
    }
  }
  const n = name.toLowerCase()
  if (
    n.includes('follow') ||
    n.includes('متابع') ||
    n.includes('متابعة') ||
    n.includes('follow-up') ||
    n.includes('follow up')
  )
    return SERVICE_IMAGE_BY_KEY.followup
  if (n.includes('general') || n.includes('كشف عام')) return SERVICE_IMAGE_BY_KEY.general
  if (n.includes('derma') || n.includes('جلد')) return SERVICE_IMAGE_BY_KEY.derma
  if (n.includes('lab') || n.includes('تحليل')) return SERVICE_IMAGE_BY_KEY.lab
  if (n.includes('pediatr') || n.includes('أطفال')) return SERVICE_IMAGE_BY_KEY.pediatrics
  if (n.includes('cardio') || n.includes('قلب')) return SERVICE_IMAGE_BY_KEY.cardio
  if (n.includes('ultra') || n.includes('أشعة') || n.includes('اشعة'))
    return SERVICE_IMAGE_BY_KEY.ultrasound

  // Reject known-broken / weak Unsplash IDs (incl. old follow-up)
  if (
    image &&
    !image.includes('photo-1628348068343') &&
    !image.includes('photo-1581595220892') &&
    !image.includes('photo-1576091160550') &&
    !image.includes('photo-1631217868264-e5b90bb7e133?w=800')
  ) {
    return image
  }
  return SERVICE_IMAGE_BY_KEY.default
}
