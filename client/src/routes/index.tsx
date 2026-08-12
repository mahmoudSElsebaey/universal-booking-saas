import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import OverviewPage from '@/pages/dashboard/OverviewPage'
import MyBookingsPage from '@/pages/dashboard/MyBookingsPage'
import SettingsPage from '@/pages/dashboard/SettingsPage'
import ServicesManagePage from '@/pages/dashboard/ServicesManagePage'
import StaffManagePage from '@/pages/dashboard/StaffManagePage'
import BookingsManagePage from '@/pages/dashboard/BookingsManagePage'
import CalendarPage from '@/pages/dashboard/CalendarPage'
import CustomersPage from '@/pages/dashboard/CustomersPage'
import CreateBusinessPage from '@/pages/dashboard/CreateBusinessPage'
import CreateBookingPage from '@/pages/dashboard/CreateBookingPage'
import HomePage from '@/pages/public/HomePage'
import ServicesPage from '@/pages/public/ServicesPage'
import StaffPage from '@/pages/public/StaffPage'
import AboutPage from '@/pages/public/AboutPage'
import ContactPage from '@/pages/public/ContactPage'
import BookingPage from '@/pages/public/BookingPage'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="py-12 text-center">
      <h1 className="text-h2 mb-2">{title}</h1>
      <p className="text-text-secondary">Coming soon.</p>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/booking" element={<BookingPage />} />
      </Route>

      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="my-bookings" element={<MyBookingsPage />} />
        <Route path="bookings" element={<BookingsManagePage />} />
        <Route path="bookings/new" element={<CreateBookingPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="services" element={<ServicesManagePage />} />
        <Route path="staff" element={<StaffManagePage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="create-business" element={<CreateBusinessPage />} />
        <Route path="analytics" element={<Placeholder title="Analytics" />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
