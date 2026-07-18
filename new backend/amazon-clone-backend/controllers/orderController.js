import crypto from 'crypto'
import Razorpay from 'razorpay'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Cart from '../models/Cart.js'
import Coupon from '../models/Coupon.js'

let razorpay
function getRazorpay() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
  return razorpay
}

export async function createOrder(req, res) {
  const { items, shippingAddress, couponCode } = req.body

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No order items' })
  }

  let itemsPrice = 0
  const verifiedItems = []

  for (const it of items) {
    const product = await Product.findById(it.product)
    if (!product) {
      return res.status(404).json({ message: `Product not found: ${it.product}` })
    }
    if (product.stock < it.qty) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` })
    }
    itemsPrice += product.price * it.qty
    verifiedItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      qty: it.qty,
    })
  }

  const shippingPrice = itemsPrice > 499 ? 0 : 49

  let discountAmount = 0
  let appliedCouponCode
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true })
    if (!coupon) {
      return res.status(400).json({ message: 'Invalid or inactive coupon code' })
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired' })
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'This coupon has reached its usage limit' })
    }
    if (itemsPrice < coupon.minOrderValue) {
      return res.status(400).json({ message: `Minimum order value ₹${coupon.minOrderValue} required for this coupon` })
    }
    discountAmount = coupon.discountType === 'percent'
      ? (itemsPrice * coupon.discountValue) / 100
      : coupon.discountValue
    if (coupon.discountType === 'percent' && coupon.maxDiscount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount)
    }
    discountAmount = Math.round(Math.min(discountAmount, itemsPrice))
    appliedCouponCode = coupon.code
  }

  const totalPrice = Math.max(itemsPrice + shippingPrice - discountAmount, 0)

  const order = await Order.create({
    user: req.user._id,
    items: verifiedItems,
    shippingAddress,
    itemsPrice,
    shippingPrice,
    couponCode: appliedCouponCode,
    discountAmount,
    totalPrice,
  })

  const razorpayOrder = await getRazorpay().orders.create({
    amount: Math.round(totalPrice * 100),
    currency: 'INR',
    receipt: order._id.toString(),
  })

  order.razorpayOrderId = razorpayOrder.id
  await order.save()

  res.status(201).json({
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID,
    discountAmount,
    totalPrice,
  })
}

export async function verifyPayment(req, res) {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

  const order = await Order.findById(orderId)
  if (!order) return res.status(404).json({ message: 'Order not found' })

  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: 'Payment verification failed' })
  }

  order.isPaid = true
  order.paidAt = new Date()
  order.razorpayPaymentId = razorpay_payment_id
  order.status = 'processing'
  await order.save()

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } })
  }
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] })

  if (order.couponCode) {
    await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } })
  }

  res.json({ message: 'Payment verified successfully', order })
}

export async function getMyOrders(req, res) {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json(orders)
}

export async function getOrderById(req, res) {
  const order = await Order.findById(req.params.id).populate('user', 'name email')
  if (!order) return res.status(404).json({ message: 'Order not found' })

  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to view this order' })
  }
  res.json(order)
}

export async function getAllOrders(req, res) {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 })
  res.json(orders)
}

export async function updateOrderStatus(req, res) {
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })

  order.status = req.body.status
  await order.save()
  res.json(order)
}
