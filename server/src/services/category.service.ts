import { Category } from '../models/Category.js'
import { Business } from '../models/Business.js'
import { ApiError } from '../utils/ApiError.js'
import type { z } from 'zod'
import type {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/business.validator.js'

type CreateCategoryInput = z.infer<typeof createCategorySchema>
type UpdateCategoryInput = z.infer<typeof updateCategorySchema>

export class CategoryService {
  private async ensureBusiness(businessId: string, userId: string) {
    const business = await Business.findOne({ _id: businessId, ownerId: userId })
    if (!business) throw new ApiError(404, 'Business not found')
    return business
  }

  async create(businessId: string, userId: string, input: CreateCategoryInput) {
    await this.ensureBusiness(businessId, userId)
    return Category.create({ ...input, businessId })
  }

  async list(businessId: string) {
    return Category.find({ businessId, isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean()
  }

  async update(
    id: string,
    businessId: string,
    userId: string,
    input: UpdateCategoryInput
  ) {
    await this.ensureBusiness(businessId, userId)
    const category = await Category.findOneAndUpdate(
      { _id: id, businessId },
      { $set: input },
      { new: true }
    )
    if (!category) throw new ApiError(404, 'Category not found')
    return category
  }

  async softDelete(id: string, businessId: string, userId: string) {
    await this.ensureBusiness(businessId, userId)
    const category = await Category.findOneAndUpdate(
      { _id: id, businessId },
      { isActive: false },
      { new: true }
    )
    if (!category) throw new ApiError(404, 'Category not found')
    return category
  }
}

export const categoryService = new CategoryService()
