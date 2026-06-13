import { Router } from 'express'
import { forgotPassword, login, resetPassword, signup, verifyOtp } from '../controllers/authController.js'

const router = Router()

router.post('/login', login)
router.post('/signup', signup)
router.post('/forgot-password', forgotPassword)
router.post('/verify-otp', verifyOtp)
router.post('/reset-password', resetPassword)

export default router
