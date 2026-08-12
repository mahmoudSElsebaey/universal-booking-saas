import { Service } from '../models/Service.js'
import { Business } from '../models/Business.js'
import { ApiError } from '../utils/ApiError.js'
import type { z } from 'zod'
import type {
  createServiceSchema,
  updateServiceSchema,
} from '../validators/business.validator.js'

type CreateServiceInput = z.infer<typeof createServiceSchema>
type UpdateServiceInput = z.infer<typeof updateServiceSchema>

export class ServiceService {
  private async ensureBusinessAccess(businessId: string, userId: string) {
    const business = await Business.findOne({
      _id: businessId,
      $or: [{ ownerId: userId }, { isActive: true }],
    })
    if (!business) {
      throw new ApiError(404, 'Business not found')
    }
    // In production check staff/manager membership too
    return business
  }

  async create(businessId: string, userId: string, input: CreateServiceInput) {
    await this.ensureBusinessAccess(businessId, userId)

    const service = await Service.create({
      ...input,
      businessId,
      categoryId: input.categoryId || undefined,
      assignedStaffIds: input.assignedStaffIds || [],
    })

    return service
  }

  async list(
    businessId: string,
    options: {
      page?: number
      limit?: number
      status?: string
      categoryId?: string
      search?: string
    } = {}
  ) {
    const page = options.page || 1
    const limit = Math.min(options.limit || 20, 100)
    const skip = (page - 1) * limit

    const filter: any = { businessId, isActive: true }
    if (options.status) filter.status = options.status
    if (options.categoryId) filter.categoryId = options.categoryId
    if (options.search) {
      filter.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { nameAr: { $regex: options.search, $options: 'i' } },
      ]
    }

    const [items, total] = await Promise.all([
      Service.find(filter)
        .populate('categoryId', 'name nameAr')
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Service.countDocuments(filter),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getById(id: string, businessId?: string) {
    const filter: any = { _id: id, isActive: true }
    if (businessId) filter.businessId = businessId

    const service = await Service.findOne(filter)
      .populate('categoryId', 'name nameAr')
      .populate('assignedStaffIds', 'firstName lastName avatar title')
    if (!service) {
      throw new ApiError(404, 'Service not found')
    }
    return service
  }

  async update(
    id: string,
    businessId: string,
    userId: string,
    input: UpdateServiceInput
  ) {
    await this.ensureBusinessAccess(businessId, userId)

    const service = await Service.findOneAndUpdate(
      { _id: id, businessId },
      { $set: input },
      { new: true, runValidators: true }
    )
    if (!service) {
      throw new ApiError(404, 'Service not found')
    }
    return service
  }

  async softDelete(id: string, businessId: string, userId: string) {
    await this.ensureBusinessAccess(businessId, userId)

    const service = await Service.findOneAndUpdate(
      { _id: id, businessId },
      { isActive: false, status: 'inactive' },
      { new: true }
    )
    if (!service) {
      throw new ApiError(404, 'Service not found')
    }
    return service
  }
}

export const serviceService = new ServiceService()
