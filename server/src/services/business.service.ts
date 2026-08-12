import { Business } from '../models/Business.js'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import type { z } from 'zod'
import type {
  createBusinessSchema,
  updateBusinessSchema,
} from '../validators/business.validator.js'

type CreateBusinessInput = z.infer<typeof createBusinessSchema>
type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>

export class BusinessService {
  async create(ownerId: string, input: CreateBusinessInput) {
    const existingSlug = await Business.findOne({ slug: input.slug })
    if (existingSlug) {
      throw new ApiError(409, 'Business slug already exists')
    }

    const business = await Business.create({
      ...input,
      ownerId,
    })

    // Link business to owner
    await User.findByIdAndUpdate(ownerId, {
      businessId: business._id,
      role: 'business_owner',
    })

    return business
  }

  async getById(id: string) {
    const business = await Business.findById(id)
    if (!business || !business.isActive) {
      throw new ApiError(404, 'Business not found')
    }
    return business
  }

  async getBySlug(slug: string) {
    const business = await Business.findOne({ slug, isActive: true })
    if (!business) {
      throw new ApiError(404, 'Business not found')
    }
    return business
  }

  async getByOwner(ownerId: string) {
    return Business.find({ ownerId, isActive: true }).sort({ createdAt: -1 })
  }

  async update(id: string, ownerId: string, input: UpdateBusinessInput) {
    const business = await Business.findOne({ _id: id, ownerId })
    if (!business) {
      throw new ApiError(404, 'Business not found')
    }

    if (input.slug && input.slug !== business.slug) {
      const exists = await Business.findOne({ slug: input.slug })
      if (exists) {
        throw new ApiError(409, 'Slug already taken')
      }
    }

    Object.assign(business, input)
    await business.save()
    return business
  }

  async softDelete(id: string, ownerId: string) {
    const business = await Business.findOneAndUpdate(
      { _id: id, ownerId },
      { isActive: false },
      { new: true }
    )
    if (!business) {
      throw new ApiError(404, 'Business not found')
    }
    return business
  }
}

export const businessService = new BusinessService()
