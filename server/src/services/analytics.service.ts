import mongoose from 'mongoose'
import { Booking } from '../models/Booking.js'
import { Service } from '../models/Service.js'
import { Staff } from '../models/Staff.js'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export class AnalyticsService {
  async getDashboardOverview(businessId: string) {
    const bizOid = new mongoose.Types.ObjectId(businessId)
    const today = new Date()
    const todayStart = startOfDay(today)
    const todayEnd = endOfDay(today)

    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const monthAgo = new Date(today)
    monthAgo.setDate(monthAgo.getDate() - 30)

    const [
      totalBookings,
      todayBookings,
      upcomingBookings,
      completedBookings,
      cancelledBookings,
      revenueAgg,
      activeServices,
      activeStaff,
      recentBookings,
      upcomingList,
    ] = await Promise.all([
      Booking.countDocuments({ businessId }),
      Booking.countDocuments({
        businessId,
        date: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ['pending', 'confirmed'] },
      }),
      Booking.countDocuments({
        businessId,
        date: { $gte: todayStart },
        status: { $in: ['pending', 'confirmed'] },
      }),
      Booking.countDocuments({ businessId, status: 'completed' }),
      Booking.countDocuments({ businessId, status: 'cancelled' }),
      Booking.aggregate([
        {
          $match: {
            businessId: new mongoose.Types.ObjectId(businessId),
            status: { $in: ['confirmed', 'completed'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$price' } } },
      ]),
      Service.countDocuments({ businessId, isActive: true, status: 'active' }),
      Staff.countDocuments({ businessId, isActive: true, status: 'active' }),
      Booking.find({ businessId })
        .populate('serviceId', 'name')
        .populate('staffId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Booking.find({
        businessId,
        date: { $gte: todayStart },
        status: { $in: ['pending', 'confirmed'] },
      })
        .populate('serviceId', 'name duration')
        .populate('staffId', 'firstName lastName')
        .sort({ date: 1, startTime: 1 })
        .limit(10)
        .lean(),
    ])

    const revenue = revenueAgg[0]?.total || 0

    // Customers count (unique emails)
    const customersAgg = await Booking.aggregate([
      { $match: { businessId: bizOid } },
      { $group: { _id: '$customerEmail' } },
      { $count: 'total' },
    ])
    const customers = customersAgg[0]?.total || 0

    return {
      stats: {
        totalBookings,
        todayBookings,
        upcomingBookings,
        completedBookings,
        cancelledBookings,
        revenue,
        customers,
        activeServices,
        activeStaff,
      },
      recentBookings,
      upcomingAppointments: upcomingList,
    }
  }

  async getBookingTrends(businessId: string, days = 30) {
    const start = new Date()
    start.setDate(start.getDate() - days)
    start.setHours(0, 0, 0, 0)

    const trends = await Booking.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(businessId),
          createdAt: { $gte: start },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $in: ['$status', ['confirmed', 'completed']] },
                '$price',
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return trends.map((t) => ({
      date: t._id,
      bookings: t.count,
      revenue: t.revenue,
    }))
  }

  async getPopularServices(businessId: string, limit = 5) {
    const result = await Booking.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(businessId),
          status: { $in: ['confirmed', 'completed'] },
        },
      },
      {
        $group: {
          _id: '$serviceId',
          count: { $sum: 1 },
          revenue: { $sum: '$price' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'service',
        },
      },
      { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          serviceId: '$_id',
          name: '$service.name',
          nameAr: '$service.nameAr',
          count: 1,
          revenue: 1,
        },
      },
    ])

    return result
  }

  async getStaffPerformance(businessId: string, limit = 10) {
    const result = await Booking.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(businessId),
          staffId: { $exists: true, $ne: null },
          status: { $in: ['confirmed', 'completed'] },
        },
      },
      {
        $group: {
          _id: '$staffId',
          bookings: { $sum: 1 },
          revenue: { $sum: '$price' },
        },
      },
      { $sort: { bookings: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'staffs',
          localField: '_id',
          foreignField: '_id',
          as: 'staff',
        },
      },
      { $unwind: { path: '$staff', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          staffId: '$_id',
          firstName: '$staff.firstName',
          lastName: '$staff.lastName',
          avatar: '$staff.avatar',
          bookings: 1,
          revenue: 1,
        },
      },
    ])

    return result
  }

  async getRevenueOverview(businessId: string) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    const [thisMonth, lastMonth] = await Promise.all([
      Booking.aggregate([
        {
          $match: {
            businessId: new mongoose.Types.ObjectId(businessId),
            status: { $in: ['confirmed', 'completed'] },
            date: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$price' }, count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        {
          $match: {
            businessId: new mongoose.Types.ObjectId(businessId),
            status: { $in: ['confirmed', 'completed'] },
            date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$price' }, count: { $sum: 1 } } },
      ]),
    ])

    const current = thisMonth[0] || { total: 0, count: 0 }
    const previous = lastMonth[0] || { total: 0, count: 0 }

    const changePercent =
      previous.total === 0
        ? current.total > 0
          ? 100
          : 0
        : Math.round(((current.total - previous.total) / previous.total) * 100)

    return {
      thisMonth: current.total,
      lastMonth: previous.total,
      changePercent,
      thisMonthBookings: current.count,
      lastMonthBookings: previous.count,
    }
  }
}

export const analyticsService = new AnalyticsService()
