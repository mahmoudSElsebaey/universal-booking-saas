import { Router } from 'express'
import {
  getOverview,
  getTrends,
  getPopularServices,
  getStaffPerformance,
  getRevenue,
} from '../controllers/analytics.controller.js'
import { authMiddleware, requirePermission } from '../middlewares/authMiddleware.js'

const router = Router()

router.use(authMiddleware)
router.use(requirePermission('analytics:read'))

router.get('/:businessId/overview', getOverview)
router.get('/:businessId/trends', getTrends)
router.get('/:businessId/popular-services', getPopularServices)
router.get('/:businessId/staff-performance', getStaffPerformance)
router.get('/:businessId/revenue', getRevenue)

export default router
