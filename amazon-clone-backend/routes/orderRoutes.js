import express from 'express'
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)
router.post('/', createOrder)
router.post('/verify', verifyPayment)
router.get('/my', getMyOrders)
router.get('/', admin, getAllOrders)
router.get('/:id', getOrderById)
router.put('/:id/status', admin, updateOrderStatus)

export default router
