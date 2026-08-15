import express from 'express'
import { signup, login, getProfile, addAddress, getAllUsers } from '../controllers/authController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/profile', protect, getProfile)
router.put('/profile/address', protect, addAddress)
router.get('/users', protect, admin, getAllUsers)

export default router
