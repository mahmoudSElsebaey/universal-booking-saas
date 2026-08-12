/**
 * Seed script — realistic demo data for development.
 * Run: npm run seed (from server folder)
 *
 * Demo accounts (password for all: Password123):
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

  // Clean existing demo data (optional — comment out to keep data)
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

  // ── Users ──────────────────────────────────────────────
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

  // ── Business ───────────────────────────────────────────
  console.log('🏢 Creating business...')
  const business = await Business.create({
    name: 'Luxe Beauty Salon',
    slug: 'luxe-beauty',
    type: 'beauty_salon',
    description:
      'Premium beauty salon offering hair, nails, and skincare services in Cairo.',
    phone: '+20212345678',
    email: 'hello@luxebeauty.eg',
    address: '12 Nile Street, Zamalek',
    city: 'Cairo',
    country: 'Egypt',
    ownerId: owner._id,
    settings: {
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      defaultLanguage: 'en',
      slotIntervalMinutes: 30,
      minAdvanceHours: 2,
      maxAdvanceDays: 45,
      cancellationPolicyHours: 24,
      requireStaffSelection: true,
      allowOnlineBooking: true,
    },
  })

  await User.findByIdAndUpdate(owner._id, { businessId: business._id })
  await User.findByIdAndUpdate(manager._id, { businessId: business._id })
  await User.findByIdAndUpdate(staffUser._id, { businessId: business._id })

  // ── Categories ─────────────────────────────────────────
  console.log('📁 Creating categories...')
  const catHair = await Category.create({
    businessId: business._id,
    name: 'Hair',
    nameAr: 'شعر',
    sortOrder: 1,
  })
  const catNails = await Category.create({
    businessId: business._id,
    name: 'Nails',
    nameAr: 'أظافر',
    sortOrder: 2,
  })
  const catSkin = await Category.create({
    businessId: business._id,
    name: 'Skincare',
    nameAr: 'عناية بالبشرة',
    sortOrder: 3,
  })

  // ── Services ───────────────────────────────────────────
  console.log('✂️ Creating services...')
  const svcHaircut = await Service.create({
    businessId: business._id,
    categoryId: catHair._id,
    name: 'Haircut & Style',
    nameAr: 'قص وتصفيف',
    description: 'Professional haircut with wash and blow-dry.',
    price: 250,
    currency: 'EGP',
    duration: 45,
    bufferTime: 10,
    staffRequired: true,
    status: 'active',
  })

  const svcColor = await Service.create({
    businessId: business._id,
    categoryId: catHair._id,
    name: 'Hair Coloring',
    nameAr: 'صبغة شعر',
    price: 800,
    currency: 'EGP',
    duration: 120,
    bufferTime: 15,
    staffRequired: true,
    status: 'active',
  })

  const svcManicure = await Service.create({
    businessId: business._id,
    categoryId: catNails._id,
    name: 'Classic Manicure',
    nameAr: 'مانيكير كلاسيك',
    price: 150,
    currency: 'EGP',
    duration: 30,
    bufferTime: 5,
    staffRequired: true,
    status: 'active',
  })

  const svcFacial = await Service.create({
    businessId: business._id,
    categoryId: catSkin._id,
    name: 'Deep Cleansing Facial',
    nameAr: 'تنظيف بشرة عميق',
    price: 400,
    currency: 'EGP',
    duration: 60,
    bufferTime: 10,
    staffRequired: true,
    status: 'active',
  })

  // ── Staff ──────────────────────────────────────────────
  console.log('👥 Creating staff...')
  const staff1 = await Staff.create({
    businessId: business._id,
    userId: staffUser._id,
    firstName: 'Omar',
    lastName: 'Khaled',
    email: 'staff@bookora.app',
    phone: '+201000000003',
    title: 'Senior Stylist',
    bio: '10+ years experience in modern cuts and coloring.',
    serviceIds: [svcHaircut._id, svcColor._id],
    status: 'active',
  })

  const staff2 = await Staff.create({
    businessId: business._id,
    firstName: 'Layla',
    lastName: 'Mostafa',
    email: 'layla@luxebeauty.eg',
    title: 'Nail Artist',
    serviceIds: [svcManicure._id],
    status: 'active',
  })

  const staff3 = await Staff.create({
    businessId: business._id,
    firstName: 'Mona',
    lastName: 'Said',
    title: 'Esthetician',
    serviceIds: [svcFacial._id],
    status: 'active',
  })

  // Link services to staff
  await Service.findByIdAndUpdate(svcHaircut._id, {
    assignedStaffIds: [staff1._id],
  })
  await Service.findByIdAndUpdate(svcColor._id, {
    assignedStaffIds: [staff1._id],
  })
  await Service.findByIdAndUpdate(svcManicure._id, {
    assignedStaffIds: [staff2._id],
  })
  await Service.findByIdAndUpdate(svcFacial._id, {
    assignedStaffIds: [staff3._id],
  })

  // ── Bookings ───────────────────────────────────────────
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
      serviceId: svcHaircut._id,
      staffId: staff1._id,
      customerId: customer._id,
      customerName: 'Nour Ibrahim',
      customerEmail: 'customer@bookora.app',
      customerPhone: '+201000000004',
      date: tomorrow,
      startTime: '10:00',
      endTime: '10:45',
      duration: 45,
      bufferTime: 10,
      price: 250,
      currency: 'EGP',
      status: 'confirmed',
    },
    {
      businessId: business._id,
      serviceId: svcManicure._id,
      staffId: staff2._id,
      customerName: 'Yasmin Farid',
      customerEmail: 'yasmin@example.com',
      date: tomorrow,
      startTime: '11:00',
      endTime: '11:30',
      duration: 30,
      bufferTime: 5,
      price: 150,
      currency: 'EGP',
      status: 'confirmed',
    },
    {
      businessId: business._id,
      serviceId: svcFacial._id,
      staffId: staff3._id,
      customerName: 'Hana Mahmoud',
      customerEmail: 'hana@example.com',
      date: nextWeek,
      startTime: '14:00',
      endTime: '15:00',
      duration: 60,
      bufferTime: 10,
      price: 400,
      currency: 'EGP',
      status: 'confirmed',
    },
    {
      businessId: business._id,
      serviceId: svcHaircut._id,
      staffId: staff1._id,
      customerName: 'Karim Adel',
      customerEmail: 'karim@example.com',
      date: yesterday,
      startTime: '09:00',
      endTime: '09:45',
      duration: 45,
      bufferTime: 10,
      price: 250,
      currency: 'EGP',
      status: 'completed',
    },
    {
      businessId: business._id,
      serviceId: svcColor._id,
      staffId: staff1._id,
      customerName: 'Dina Saleh',
      customerEmail: 'dina@example.com',
      date: yesterday,
      startTime: '12:00',
      endTime: '14:00',
      duration: 120,
      bufferTime: 15,
      price: 800,
      currency: 'EGP',
      status: 'cancelled',
      cancellationReason: 'Customer requested',
      cancelledAt: new Date(),
    },
  ])

  // ── Reviews ────────────────────────────────────────────
  console.log('⭐ Creating reviews...')
  await Review.create([
    {
      businessId: business._id,
      serviceId: svcHaircut._id,
      staffId: staff1._id,
      customerName: 'Karim Adel',
      customerEmail: 'karim@example.com',
      rating: 5,
      comment: 'Excellent haircut, very professional!',
      isPublished: true,
    },
    {
      businessId: business._id,
      serviceId: svcFacial._id,
      staffId: staff3._id,
      customerName: 'Hana Mahmoud',
      rating: 4,
      comment: 'Great facial, will come again.',
      isPublished: true,
    },
  ])

  console.log('\n✅ Seed completed successfully!\n')
  console.log('════════════════════════════════════════')
  console.log(' Demo accounts (password: Password123)')
  console.log('════════════════════════════════════════')
  console.log(' owner@bookora.app     → business_owner')
  console.log(' manager@bookora.app   → manager')
  console.log(' staff@bookora.app     → staff')
  console.log(' customer@bookora.app  → customer')
  console.log('════════════════════════════════════════')
  console.log(` Business slug: luxe-beauty`)
  console.log(` Business ID:   ${business._id}`)
  console.log('════════════════════════════════════════\n')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
