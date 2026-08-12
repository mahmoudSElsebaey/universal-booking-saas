import { Review } from '../models/Review.js'
import { Booking } from '../models/Booking.js'
import { ApiError } from '../utils/ApiError.js'

export class ReviewService {
  async create(input: {
    businessId: string
    bookingId?: string
    serviceId?: string
    staffId?: string
    customerId?: string
    customerName: string
    customerEmail?: string
    rating: number
    comment?: string
  }) {
    if (input.rating < 1 || input.rating > 5) {
      throw new ApiError(400, 'Rating must be between 1 and 5')
    }

    // Optional: verify booking belongs to customer and is completed
    if (input.bookingId) {
      const booking = await Booking.findById(input.bookingId)
      if (!booking || booking.businessId.toString() !== input.businessId) {
        throw new ApiError(404, 'Booking not found')
      }
      if (booking.status !== 'completed') {
        throw new ApiError(400, 'Can only review completed bookings')
      }
    }

    const review = await Review.create({
      ...input,
      isPublished: true,
    })

    return review
  }

  async list(
    businessId: string,
    options: {
      page?: number
      limit?: number
      publishedOnly?: boolean
      minRating?: number
    } = {}
  ) {
    const page = options.page || 1
    const limit = Math.min(options.limit || 20, 50)
    const skip = (page - 1) * limit

    const filter: any = { businessId }
    if (options.publishedOnly !== false) filter.isPublished = true
    if (options.minRating) filter.rating = { $gte: options.minRating }

    const [items, total, avgResult] = await Promise.all([
      Review.find(filter)
        .populate('serviceId', 'name nameAr')
        .populate('staffId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
      Review.aggregate([
        { $match: { businessId: businessId as any, isPublished: true } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        averageRating: avgResult[0]
          ? Math.round(avgResult[0].avgRating * 10) / 10
          : 0,
        totalReviews: avgResult[0]?.count || 0,
      },
    }
  }

  async reply(reviewId: string, businessId: string, reply: string) {
    const review = await Review.findOneAndUpdate(
      { _id: reviewId, businessId },
      { reply, repliedAt: new Date() },
      { new: true }
    )
    if (!review) throw new ApiError(404, 'Review not found')
    return review
  }

  async togglePublish(reviewId: string, businessId: string, isPublished: boolean) {
    const review = await Review.findOneAndUpdate(
      { _id: reviewId, businessId },
      { isPublished },
      { new: true }
    )
    if (!review) throw new ApiError(404, 'Review not found')
    return review
  }
}

export const reviewService = new ReviewService()
