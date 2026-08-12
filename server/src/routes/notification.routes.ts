import { Router } from 'express'
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', listNotifications)
router.patch('/:id/read', markAsRead)
router.post('/read-all', markAllAsRead)

export default router
