/**
 * Seed script — Clinic demo data
 * Run: npm run seed (from server folder)
 *
 * Demo accounts (password: Password123):
 * - owner@bookora.app   → business_owner
 * - manager@bookora.app → manager
 * - staff@bookora.app   → staff
 * - customer@bookora.app → customer
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User } from '../models/User.js'
import { Business } from '../models/Business.js'
import { Category } from '../models/Category.js'
import { Service } from '../models/Service.js'
import { Staff } from '../models/Staff.js'
import { Booking } from '../models/Booking.js'
import { Review } from '../models/Review.js'

dotenv.config()

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/booking-system'

const PASSWORD = 'Password123'

async function seed() {
  console.log('🌱 Connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected')

  console.log('🧹 Clearing collections...')
  await Promise.all([
    User.deleteMany({}),
    Business.deleteMany({}),
    Category.deleteMany({}),
    Service.deleteMany({}),
    Staff.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
  ])

  console.log('👤 Creating users...')
  const owner = await User.create({
    email: 'owner@bookora.app',
    password: PASSWORD,
    firstName: 'Ahmed',
    lastName: 'Hassan',
    phone: '+201000000001',
    role: 'business_owner',
    isEmailVerified: true,
  })

  const manager = await User.create({
    email: 'manager@bookora.app',
    password: PASSWORD,
    firstName: 'Sara',
    lastName: 'Ali',
    phone: '+201000000002',
    role: 'manager',
    isEmailVerified: true,
  })

  const staffUser = await User.create({
    email: 'staff@bookora.app',
    password: PASSWORD,
    firstName: 'Omar',
    lastName: 'Khaled',
    phone: '+201000000003',
    role: 'staff',
    isEmailVerified: true,
  })

  const customer = await User.create({
    email: 'customer@bookora.app',
    password: PASSWORD,
    firstName: 'Nour',
    lastName: 'Ibrahim',
    phone: '+201000000004',
    role: 'customer',
    isEmailVerified: true,
  })

  console.log('🏥 Creating clinic business...')
  const business = await Business.create({
    name: 'Cairo Care Clinic',
    slug: 'cairo-care',
    type: 'clinic',
    description:
      'Multi-specialty medical clinic offering general practice, dermatology, and diagnostics in Cairo.',
    phone: '+20227350000',
    email: 'hello@cairocare.eg',
    address: '15 Medical Center St, Nasr City',
    city: 'Cairo',
    country: 'Egypt',
    ownerId: owner._id,
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&q=80',
    settings: {
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      defaultLanguage: 'en',
      slotIntervalMinutes: 30,
      minAdvanceHours: 1,
      maxAdvanceDays: 60,
      cancellationPolicyHours: 24,
      requireStaffSelection: true,
      allowOnlineBooking: true,
    },
    workingHours: [
      { day: 'sunday', isOpen: true, openTime: '10:00', closeTime: '16:00' },
      { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { day: 'saturday', isOpen: true, openTime: '10:00', closeTime: '16:00' },
    ],
  })

  await User.findByIdAndUpdate(owner._id, { businessId: business._id })
  await User.findByIdAndUpdate(manager._id, { businessId: business._id })
  await User.findByIdAndUpdate(staffUser._id, { businessId: business._id })

  console.log('📁 Creating categories...')
  const catGp = await Category.create({
    businessId: business._id,
    name: 'General Practice',
    nameAr: 'طب عام',
    sortOrder: 1,
  })
  const catDerma = await Category.create({
    businessId: business._id,
    name: 'Dermatology',
    nameAr: 'جلدية',
    sortOrder: 2,
  })
  const catDiag = await Category.create({
    businessId: business._id,
    name: 'Diagnostics',
    nameAr: 'تحاليل وتشخيص',
    sortOrder: 3,
  })

  console.log('🩺 Creating services...')
  const svcConsult = await Service.create({
    businessId: business._id,
    categoryId: catGp._id,
    name: 'General Consultation',
    nameAr: 'كشف عام',
    description: 'Full general practitioner consultation and examination.',
    descriptionAr: 'كشف عام كامل للطبيب العام',
    image: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=800&q=80',
    price: 300,
    currency: 'EGP',
    duration: 30,
    bufferTime: 10,
    staffRequired: true,
    status: 'active',
  })

  const svcFollowUp = await Service.create({
    businessId: business._id,
    categoryId: catGp._id,
    name: 'Follow-up Visit',
    nameAr: 'زيارة متابعة',
    description: 'Follow-up appointment after previous consultation.',
    descriptionAr: 'زيارة متابعة بعد الكشف السابق',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba07efd?auto=format&fit=crop&w=800&q=80',
    price: 150,
    currency: 'EGP',
    duration: 15,
    bufferTime: 5,
    staffRequired: true,
    status: 'active',
  })

  const svcDerma = await Service.create({
    businessId: business._id,
    categoryId: catDerma._id,
    name: 'Dermatology Consultation',
    nameAr: 'كشف جلدية',
    description: 'Skin examination and treatment plan with a specialist.',
    descriptionAr: 'تشخيص الجلدية وخطة العلاج مع المتخصص',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80',
    price: 450,
    currency: 'EGP',
    duration: 30,
    bufferTime: 10,
    staffRequired: true,
    status: 'active',
  })

  const svcLabs = await Service.create({
    businessId: business._id,
    categoryId: catDiag._id,
    name: 'Lab Tests Package',
    nameAr: 'باقة تحاليل',
    description: 'Basic blood work and lab diagnostics package.',
    descriptionAr: 'تحاليل وتشخيص بسيط للدم وباقة تحاليل',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
    price: 600,
    currency: 'EGP',
    duration: 20,
    bufferTime: 5,
    staffRequired: false,
    status: 'active',
  })

  
  const svcPediatrics = await Service.create({
    businessId: business._id,
    categoryId: catGp._id,
    name: 'Pediatrics Consultation',
    nameAr: 'كشف أطفال',
    description: 'Child health check and pediatric consultation.',
    descriptionAr: 'تحاليل وتشخيص بسيط للدم وباقة تحاليل',
    image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80',
    price: 350,
    currency: 'EGP',
    duration: 30,
    bufferTime: 10,
    staffRequired: true,
    status: 'active',
  })

  const svcCardiology = await Service.create({
    businessId: business._id,
    categoryId: catGp._id,
    name: 'Cardiology Consultation',
    nameAr: 'كشف قلب',
    description: 'Heart check-up with a cardiologist.',
    descriptionAr: 'تحاليل وتشخيص بسيط للدم وباقة تحاليل',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    price: 500,
    currency: 'EGP',
    duration: 40,
    bufferTime: 10,
    staffRequired: true,
    status: 'active',
  })

  const svcUltrasound = await Service.create({
    businessId: business._id,
    categoryId: catDiag._id,
    name: 'Ultrasound Scan',
    nameAr: 'أشعة تلفزيونية',
    description: 'Diagnostic ultrasound imaging session.',
    descriptionAr: 'تحاليل وتشخيص بسيط للدم وباقة تحاليل',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    price: 700,
    currency: 'EGP',
    duration: 25,
    bufferTime: 10,
    staffRequired: true,
    status: 'active',
  })

  console.log('👨‍⚕️ Creating staff...')
  const staff1 = await Staff.create({
    businessId: business._id,
    userId: staffUser._id,
    firstName: 'Omar',
    lastName: 'Khaled',
    email: 'staff@bookora.app',
    phone: '+201000000003',
    title: 'General Practitioner',
    bio: '10+ years in family medicine and primary care.',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
    serviceIds: [svcConsult._id, svcFollowUp._id],
    status: 'active',
    isActive: true,
  })

  const staff2 = await Staff.create({
    businessId: business._id,
    firstName: 'Layla',
    lastName: 'Mostafa',
    email: 'layla@cairocare.eg',
    title: 'Dermatologist',
    bio: 'Specialist in clinical and cosmetic dermatology.',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
    serviceIds: [svcDerma._id],
    status: 'active',
    isActive: true,
  })

  const staff3 = await Staff.create({
    businessId: business._id,
    firstName: 'Mona',
    lastName: 'Said',
    title: 'Lab Technician',
    bio: 'Diagnostics and sample collection specialist.',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80',
    serviceIds: [svcLabs._id],
    status: 'active',
    isActive: true,
  })

  await Service.findByIdAndUpdate(svcConsult._id, { assignedStaffIds: [staff1._id] })
  await Service.findByIdAndUpdate(svcFollowUp._id, { assignedStaffIds: [staff1._id] })
  await Service.findByIdAndUpdate(svcDerma._id, { assignedStaffIds: [staff2._id] })
  await Service.findByIdAndUpdate(svcLabs._id, { assignedStaffIds: [staff3._id] })

  
  const staff4 = await Staff.create({
    businessId: business._id,
    firstName: 'Karim',
    lastName: 'Nassar',
    email: 'karim.nassar@cairocare.eg',
    title: 'Pediatrician',
    bio: 'Specialist in child healthcare and vaccinations.',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80',
    serviceIds: [svcPediatrics._id],
    status: 'active',
    isActive: true,
  })

  const staff5 = await Staff.create({
    businessId: business._id,
    firstName: 'Hana',
    lastName: 'Fathy',
    email: 'hana.fathy@cairocare.eg',
    title: 'Cardiologist',
    bio: 'Cardiology and preventive heart care.',
    avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&q=80',
    serviceIds: [svcCardiology._id],
    status: 'active',
    isActive: true,
  })

  await Service.findByIdAndUpdate(svcPediatrics._id, { assignedStaffIds: [staff4._id] })
  await Service.findByIdAndUpdate(svcCardiology._id, { assignedStaffIds: [staff5._id] })
  await Service.findByIdAndUpdate(svcUltrasound._id, { assignedStaffIds: [staff3._id] })

  console.log('📅 Creating bookings...')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  await Booking.create([
    {
      businessId: business._id,
      serviceId: svcConsult._id,
      staffId: staff1._id,
      customerId: customer._id,
      customerName: 'Nour Ibrahim',
      customerEmail: 'customer@bookora.app',
      customerPhone: '+201000000004',
      date: tomorrow,
      startTime: '10:00',
      endTime: '10:30',
      duration: 30,
      bufferTime: 10,
      price: 300,
      currency: 'EGP',
      status: 'confirmed',
    },
    {
      businessId: business._id,
      serviceId: svcDerma._id,
      staffId: staff2._id,
      customerName: 'Yasmin Farid',
      customerEmail: 'yasmin@example.com',
      date: tomorrow,
      startTime: '11:00',
      endTime: '11:30',
      duration: 30,
      bufferTime: 10,
      price: 450,
      currency: 'EGP',
      status: 'confirmed',
    },
    {
      businessId: business._id,
      serviceId: svcLabs._id,
      staffId: staff3._id,
      customerName: 'Hana Mahmoud',
      customerEmail: 'hana@example.com',
      date: nextWeek,
      startTime: '09:00',
      endTime: '09:20',
      duration: 20,
      bufferTime: 5,
      price: 600,
      currency: 'EGP',
      status: 'confirmed',
    },
    {
      businessId: business._id,
      serviceId: svcConsult._id,
      staffId: staff1._id,
      customerName: 'Karim Adel',
      customerEmail: 'karim@example.com',
      date: yesterday,
      startTime: '09:00',
      endTime: '09:30',
      duration: 30,
      bufferTime: 10,
      price: 300,
      currency: 'EGP',
      status: 'completed',
    },
    {
      businessId: business._id,
      serviceId: svcFollowUp._id,
      staffId: staff1._id,
      customerName: 'Dina Saleh',
      customerEmail: 'dina@example.com',
      date: yesterday,
      startTime: '12:00',
      endTime: '12:15',
      duration: 15,
      bufferTime: 5,
      price: 150,
      currency: 'EGP',
      status: 'cancelled',
      cancellationReason: 'Patient requested',
      cancelledAt: new Date(),
    },
    {
      businessId: business._id,
      serviceId: svcPediatrics._id,
      staffId: staff4._id,
      customerName: 'Maya Hassan',
      customerEmail: 'maya@example.com',
      customerPhone: '+201111111111',
      date: nextWeek,
      startTime: '11:00',
      endTime: '11:30',
      duration: 30,
      bufferTime: 10,
      price: 350,
      currency: 'EGP',
      status: 'confirmed',
    },
    {
      businessId: business._id,
      serviceId: svcCardiology._id,
      staffId: staff5._id,
      customerName: 'Tarek Youssef',
      customerEmail: 'tarek@example.com',
      date: tomorrow,
      startTime: '14:00',
      endTime: '14:40',
      duration: 40,
      bufferTime: 10,
      price: 500,
      currency: 'EGP',
      status: 'confirmed',
    },
  ])

  console.log('⭐ Creating reviews...')
  await Review.create([
    {
      businessId: business._id,
      serviceId: svcConsult._id,
      staffId: staff1._id,
      customerName: 'Karim Adel',
      customerEmail: 'karim@example.com',
      rating: 5,
      comment: 'Professional doctor and clean clinic. Highly recommend.',
      isPublished: true,
    },
    {
      businessId: business._id,
      serviceId: svcDerma._id,
      staffId: staff2._id,
      customerName: 'Yasmin Farid',
      rating: 5,
      comment: 'Excellent dermatology consultation, clear treatment plan.',
      isPublished: true,
    },
    {
      businessId: business._id,
      serviceId: svcLabs._id,
      staffId: staff3._id,
      customerName: 'Hana Mahmoud',
      rating: 4,
      comment: 'Fast lab service and friendly staff.',
      isPublished: true,
    },
    {
      businessId: business._id,
      serviceId: svcCardiology._id,
      staffId: staff5._id,
      customerName: 'Tarek Youssef',
      rating: 5,
      comment: 'Thorough cardiac examination and clear advice.',
      isPublished: true,
    },
    {
      businessId: business._id,
      serviceId: svcPediatrics._id,
      staffId: staff4._id,
      customerName: 'Maya Hassan',
      rating: 5,
      comment: 'Great with kids, very reassuring doctor.',
      isPublished: true,
    },
  ])

  console.log('\n✅ Clinic seed completed!\n')
  console.log('════════════════════════════════════════')
  console.log(' Demo accounts (password: Password123)')
  console.log('════════════════════════════════════════')
  console.log(' owner@bookora.app     → business_owner')
  console.log(' manager@bookora.app   → manager')
  console.log(' staff@bookora.app     → staff')
  console.log(' customer@bookora.app  → customer')
  console.log('════════════════════════════════════════')
  console.log(' Clinic: Cairo Care Clinic')
  console.log(' Slug:   cairo-care')
  console.log(` ID:     ${business._id}`)
  console.log('════════════════════════════════════════\n')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
