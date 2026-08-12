import { Staff } from '../models/Staff.js'
import { Business } from '../models/Business.js'
import { ApiError } from '../utils/ApiError.js'
import type { z } from 'zod'
import type {
  createStaffSchema,
  updateStaffSchema,
} from '../validators/business.validator.js'

type CreateStaffInput = z.infer<typeof createStaffSchema>
type UpdateStaffInput = z.infer<typeof updateStaffSchema>

export class StaffService {
  private async ensureBusiness(businessId: string, userId: string) {
    const business = await Business.findOne({ _id: businessId, ownerId: userId })
    if (!business) throw new ApiError(404, 'Business not found')
    return business
  }

  async create(businessId: string, userId: string, input: CreateStaffInput) {
    await this.ensureBusiness(businessId, userId)

    const staff = await Staff.create({
      ...input,
      businessId,
      serviceIds: input.serviceIds || [],
    })
    return staff
  }

  async list(
    businessId: string,
    options: { page?: number; limit?: number; status?: string; search?: string } = {}
  ) {
    const page = options.page || 1
    const limit = Math.min(options.limit || 20, 100)
    const skip = (page - 1) * limit

    const filter: any = { businessId, isActive: true }
    if (options.status) filter.status = options.status
    if (options.search) {
      filter.$or = [
        { firstName: { $regex: options.search, $options: 'i' } },
        { lastName: { $regex: options.search, $options: 'i' } },
        { email: { $regex: options.search, $options: 'i' } },
      ]
    }

    const [items, total] = await Promise.all([
      Staff.find(filter)
        .populate('serviceIds', 'name nameAr duration price')
        .sort({ sortOrder: 1, firstName: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Staff.countDocuments(filter),
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

    const staff = await Staff.findOne(filter).populate(
      'serviceIds',
      'name nameAr duration price'
    )
    if (!staff) throw new ApiError(404, 'Staff not found')
    return staff
  }

  async update(
    id: string,
    businessId: string,
    userId: string,
    input: UpdateStaffInput
  ) {
    await this.ensureBusiness(businessId, userId)

    const staff = await Staff.findOneAndUpdate(
      { _id: id, businessId },
      { $set: input },
      { new: true, runValidators: true }
    )
    if (!staff) throw new ApiError(404, 'Staff not found')
    return staff
  }

  async softDelete(id: string, businessId: string, userId: string) {
    await this.ensureBusiness(businessId, userId)

    const staff = await Staff.findOneAndUpdate(
      { _id: id, businessId },
      { isActive: false, status: 'inactive' },
      { new: true }
    )
    if (!staff) throw new ApiError(404, 'Staff not found')
    return staff
  }

  /** Staff who can perform a given service */
  async getAvailableForService(businessId: string, serviceId: string) {
    return Staff.find({
      businessId,
      isActive: true,
      status: 'active',
      serviceIds: serviceId,
    })
      .select('firstName lastName avatar title workingHours daysOff')
      .lean()
  }
}

export const staffService = new StaffService()
