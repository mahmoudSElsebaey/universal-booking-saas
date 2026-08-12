import { api } from './api'

export interface DashboardStats {
  totalBookings: number
  todayBookings: number
  upcomingBookings: number
  completedBookings: number
  cancelledBookings: number
  revenue: number
  customers: number
  activeServices: number
  activeStaff: number
}

export interface DashboardOverview {
  stats: DashboardStats
  recentBookings: any[]
  upcomingAppointments: any[]
}

export interface TrendPoint {
  date: string
  bookings: number
  revenue: number
}

export interface PopularService {
  serviceId: string
  name: string
  nameAr?: string
  count: number
  revenue: number
}

export interface StaffPerformance {
  staffId: string
  firstName: string
  lastName: string
  avatar?: string
  bookings: number
  revenue: number
}

export interface RevenueOverview {
  thisMonth: number
  lastMonth: number
  changePercent: number
  thisMonthBookings: number
  lastMonthBookings: number
}

export const analyticsApi = {
  getOverview: (businessId: string) =>
    api
      .get<{ success: boolean; data: DashboardOverview }>(
        `/analytics/${businessId}/overview`
      )
      .then((r) => r.data.data),

  getTrends: (businessId: string, days = 30) =>
    api
      .get<{ success: boolean; data: TrendPoint[] }>(
        `/analytics/${businessId}/trends`,
        { params: { days } }
      )
      .then((r) => r.data.data),

  getPopularServices: (businessId: string, limit = 5) =>
    api
      .get<{ success: boolean; data: PopularService[] }>(
        `/analytics/${businessId}/popular-services`,
        { params: { limit } }
      )
      .then((r) => r.data.data),

  getStaffPerformance: (businessId: string, limit = 10) =>
    api
      .get<{ success: boolean; data: StaffPerformance[] }>(
        `/analytics/${businessId}/staff-performance`,
        { params: { limit } }
      )
      .then((r) => r.data.data),

  getRevenue: (businessId: string) =>
    api
      .get<{ success: boolean; data: RevenueOverview }>(
        `/analytics/${businessId}/revenue`
      )
      .then((r) => r.data.data),
}
