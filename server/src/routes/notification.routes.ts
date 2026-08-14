import { Router } from 'express'
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences,
} from '../controllers/notification.controller.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', listNotifications)
router.patch('/:id/read', markAsRead)
router.post('/read-all', markAllAsRead)

router.get('/preferences', getPreferences)
router.patch('/preferences', updatePreferences)

export default router
