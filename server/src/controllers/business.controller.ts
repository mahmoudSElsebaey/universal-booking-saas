import type { Request, Response } from 'express'
import { businessService } from '../services/business.service.js'
import { categoryService } from '../services/category.service.js'
import { serviceService } from '../services/service.service.js'
import { staffService } from '../services/staff.service.js'
import { asyncHandler } from '../middlewares/asyncHandler.js'

// ─── Business ───────────────────────────────────────────────
export const createBusiness = asyncHandler(async (req: Request, res: Response) => {
  const business = await businessService.create(req.user!.userId, req.body)
  res.status(201).json({
    success: true,
    message: 'Business created successfully',
    data: business,
  })
})

export const getMyBusinesses = asyncHandler(async (req: Request, res: Response) => {
  const businesses = await businessService.getByOwner(req.user!.userId)
  res.json({ success: true, data: businesses })
})

export const getBusiness = asyncHandler(async (req: Request, res: Response) => {
  const business = await businessService.getById(req.params.id)
  res.json({ success: true, data: business })
})

export const getBusinessBySlug = asyncHandler(async (req: Request, res: Response) => {
  const business = await businessService.getBySlug(req.params.slug)
  res.json({ success: true, data: business })
})

export const updateBusiness = asyncHandler(async (req: Request, res: Response) => {
  const business = await businessService.update(
    req.params.id,
    req.user!.userId,
    req.body
  )
  res.json({
    success: true,
    message: 'Business updated',
    data: business,
  })
})

// ─── Categories ─────────────────────────────────────────────
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.create(
    req.params.businessId,
    req.user!.userId,
    req.body
  )
  res.status(201).json({ success: true, data: category })
})

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.list(req.params.businessId)
  res.json({ success: true, data: categories })
})

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.update(
    req.params.id,
    req.params.businessId,
    req.user!.userId,
    req.body
  )
  res.json({ success: true, data: category })
})

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.softDelete(
    req.params.id,
    req.params.businessId,
    req.user!.userId
  )
  res.json({ success: true, message: 'Category deleted' })
})

// ─── Services ───────────────────────────────────────────────
export const createService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.create(
    req.params.businessId,
    req.user!.userId,
    req.body
  )
  res.status(201).json({ success: true, data: service })
})

export const listServices = asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceService.list(req.params.businessId, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    status: req.query.status as string,
    categoryId: req.query.categoryId as string,
    search: req.query.search as string,
  })
  res.json({ success: true, data: result.items, pagination: result.pagination })
})

export const getService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.getById(
    req.params.id,
    req.params.businessId
  )
  res.json({ success: true, data: service })
})

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.update(
    req.params.id,
    req.params.businessId,
    req.user!.userId,
    req.body
  )
  res.json({ success: true, data: service })
})

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  await serviceService.softDelete(
    req.params.id,
    req.params.businessId,
    req.user!.userId
  )
  res.json({ success: true, message: 'Service deleted' })
})

// ─── Staff ──────────────────────────────────────────────────
export const createStaff = asyncHandler(async (req: Request, res: Response) => {
  const staff = await staffService.create(
    req.params.businessId,
    req.user!.userId,
    req.body
  )
  res.status(201).json({ success: true, data: staff })
})

export const listStaff = asyncHandler(async (req: Request, res: Response) => {
  const result = await staffService.list(req.params.businessId, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    status: req.query.status as string,
    search: req.query.search as string,
  })
  res.json({ success: true, data: result.items, pagination: result.pagination })
})

export const getStaff = asyncHandler(async (req: Request, res: Response) => {
  const staff = await staffService.getById(req.params.id, req.params.businessId)
  res.json({ success: true, data: staff })
})

export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
  const staff = await staffService.update(
    req.params.id,
    req.params.businessId,
    req.user!.userId,
    req.body
  )
  res.json({ success: true, data: staff })
})

export const deleteStaff = asyncHandler(async (req: Request, res: Response) => {
  await staffService.softDelete(
    req.params.id,
    req.params.businessId,
    req.user!.userId
  )
  res.json({ success: true, message: 'Staff deleted' })
})

export const getStaffForService = asyncHandler(async (req: Request, res: Response) => {
  const staff = await staffService.getAvailableForService(
    req.params.businessId,
    req.params.serviceId
  )
  res.json({ success: true, data: staff })
})

// ─── Public catalog by slug ─────────────────────────────────
export const getPublicCatalog = asyncHandler(async (req: Request, res: Response) => {
  const business = await businessService.getBySlug(req.params.slug)
  const businessId = business._id

  // Direct queries — more reliable for public site than layered filters
  const { Service } = await import('../models/Service.js')
  const { Staff } = await import('../models/Staff.js')
  const { Review } = await import('../models/Review.js')

  const [services, staff, reviews, reviewAgg] = await Promise.all([
    Service.find({
      businessId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
      status: 'active',
    })
      .sort({ sortOrder: 1, name: 1 })
      .limit(50)
      .lean(),
    Staff.find({
      businessId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
      status: { $in: ['active', 'on_leave'] },
    })
      .sort({ sortOrder: 1, firstName: 1 })
      .limit(50)
      .lean(),
    Review.find({ businessId, isPublished: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean(),
    Review.aggregate([
      { $match: { businessId, isPublished: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
  ])

  res.json({
    success: true,
    data: {
      business,
      services,
      staff,
      reviews,
      reviewSummary: {
        averageRating: reviewAgg[0] ? Math.round(reviewAgg[0].avg * 10) / 10 : 0,
        totalReviews: reviewAgg[0]?.count || 0,
      },
    },
  })
})
