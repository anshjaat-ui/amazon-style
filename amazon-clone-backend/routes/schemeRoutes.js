import express from 'express'
import {
  getActiveSchemes,
  getAllSchemes,
  createScheme,
  updateScheme,
  deleteScheme,
  joinScheme,
  getMyEnrollments,
  claimMonthlyPayment,
  getAllEnrollments,
  confirmMonthlyPayment,
} from '../controllers/schemeController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getActiveSchemes)
router.get('/all', protect, admin, getAllSchemes)
router.post('/', protect, admin, createScheme)
router.put('/:id', protect, admin, updateScheme)
router.delete('/:id', protect, admin, deleteScheme)

router.post('/:id/join', protect, joinScheme)
router.get('/my-enrollments', protect, getMyEnrollments)
router.put('/enrollments/:id/pay', protect, claimMonthlyPayment)
router.get('/enrollments/all', protect, admin, getAllEnrollments)
router.put('/enrollments/:id/confirm-payment', protect, admin, confirmMonthlyPayment)

export default router
