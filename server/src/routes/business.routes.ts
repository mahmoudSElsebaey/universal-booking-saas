import { Router } from 'express'
import {
  createBusiness,
  getMyBusinesses,
  getBusiness,
  getBusinessBySlug,
  updateBusiness,
  createCategory,
  listCategories,
  updateCategory,
  deleteCategory,
  createService,
  listServices,
  getService,
  updateService,
  deleteService,
  createStaff,
  listStaff,
  getStaff,
  updateStaff,
  deleteStaff,
  getStaffForService,
  getPublicCatalog,
} from '../controllers/business.controller.js'
import { authMiddleware, requirePermission } from '../middlewares/authMiddleware.js'
import { validate } from '../middlewares/validateMiddleware.js'
import {
  createBusinessSchema,
  updateBusinessSchema,
  createCategorySchema,
  updateCategorySchema,
  createServiceSchema,
  updateServiceSchema,
  createStaffSchema,
  updateStaffSchema,
} from '../validators/business.validator.js'

const router = Router()

// Public
router.get('/slug/:slug', getBusinessBySlug)
router.get('/slug/:slug/catalog', getPublicCatalog)

// Authenticated
router.use(authMiddleware)

// Business
router.post(
  '/',
  requirePermission('business:manage'),
  validate(createBusinessSchema),
  createBusiness
)
router.get('/mine', getMyBusinesses)
router.get('/:id', getBusiness)
router.patch(
  '/:id',
  requirePermission('business:manage'),
  validate(updateBusinessSchema),
  updateBusiness
)

// Categories
router.post(
  '/:businessId/categories',
  requirePermission('service:create'),
  validate(createCategorySchema),
  createCategory
)
router.get('/:businessId/categories', listCategories)
router.patch(
  '/:businessId/categories/:id',
  requirePermission('service:update'),
  validate(updateCategorySchema),
  updateCategory
)
router.delete(
  '/:businessId/categories/:id',
  requirePermission('service:delete'),
  deleteCategory
)

// Services
router.post(
  '/:businessId/services',
  requirePermission('service:create'),
  validate(createServiceSchema),
  createService
)
router.get('/:businessId/services', listServices)
router.get('/:businessId/services/:id', getService)
router.patch(
  '/:businessId/services/:id',
  requirePermission('service:update'),
  validate(updateServiceSchema),
  updateService
)
router.delete(
  '/:businessId/services/:id',
  requirePermission('service:delete'),
  deleteService
)

// Staff
router.post(
  '/:businessId/staff',
  requirePermission('staff:create'),
  validate(createStaffSchema),
  createStaff
)
router.get('/:businessId/staff', listStaff)
router.get('/:businessId/staff/:id', getStaff)
router.patch(
  '/:businessId/staff/:id',
  requirePermission('staff:update'),
  validate(updateStaffSchema),
  updateStaff
)
router.delete(
  '/:businessId/staff/:id',
  requirePermission('staff:delete'),
  deleteStaff
)
router.get(
  '/:businessId/services/:serviceId/staff',
  getStaffForService
)

export default router
