import { Router } from 'express'
import {
  register,
  login,
  refresh,
  logout,
  me,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js'
import { validate } from '../middlewares/validateMiddleware.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/auth.validator.js'

const router = Router()

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.post('/refresh', refresh)
router.post('/logout', authMiddleware, logout)
router.get('/me', authMiddleware, me)
router.patch('/me', authMiddleware, validate(updateProfileSchema), updateMe)
router.post('/change-password', authMiddleware, validate(changePasswordSchema), changePassword)
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), resetPassword)

export default router
