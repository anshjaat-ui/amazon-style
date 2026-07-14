import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Cart from '../models/Cart.js'

// POST /api/orders -> DB mein order banao aur UPI payment link/QR return karo
export async function createOrder(req, res) {
  const { items, shippingAddress } = req.body

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
  const totalPrice = itemsPrice + shippingPrice

  const order = await Order.create({
    user: req.user._id,
    items: verifiedItems,
    shippingAddress,
    itemsPrice,
    shippingPrice,
    totalPrice,
    paymentMethod: 'upi',
  })

  const upiId = process.env.UPI_ID
  const upiName = process.env.UPI_NAME || 'Store'
  const note = `Order ${order._id.toString().slice(-8)}`

  const upiLink =
    `upi://pay?pa=${encodeURIComponent(upiId)}` +
    `&pn=${encodeURIComponent(upiName)}` +
    `&am=${totalPrice}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(note)}`

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`

  const whatsappNumber = process.env.WHATSAPP_NUMBER
  const waText = `Naya order!\nOrder ID: ${order._id}\nAmount: Rs ${totalPrice}\nCustomer: ${req.user.name} (${req.user.email})\nMain payment karke "I've Paid" bhejunga.`
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waText)}`

  res.status(201).json({
    orderId: order._id,
    amount: totalPrice,
    upiId,
    upiLink,
    qrCodeUrl,
    whatsappLink,
  })
}

// PUT /api/orders/:id/claim-payment
export async function claimPayment(req, res) {
  const { upiRef } = req.body
  const order = await Order.findById(req.params.id)

  if (!order) return res.status(404).json({ message: 'Order not found' })
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }

  order.paymentClaimed = true
  order.upiRef = upiRef || ''
  order.status = 'pending'
  await order.save()

  res.json({ message: 'Payment claim received. Verification pending.', order })
}

// PUT /api/orders/:id/confirm-payment (admin only)
export async function confirmPayment(req, res) {
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })

  if (order.isPaid) {
    return res.status(400).json({ message: 'Order already marked as paid' })
  }

  order.isPaid = true
  order.paidAt = new Date()
  order.status = 'processing'
  await order.save()

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } })
  }
  await Cart.findOneAndUpdate({ user: order.user }, { items: [] })

  res.json({ message: 'Payment confirmed', order })
}

// GET /api/orders/my
export async function getMyOrders(req, res) {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json(orders)
}

// GET /api/orders/:id
export async function getOrderById(req, res) {
  const order = await Order.findById(req.params.id).populate('user', 'name email')
  if (!order) return res.status(404).json({ message: 'Order not found' })

  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to view this order' })
  }
  res.json(order)
}

// GET /api/orders (admin only)
export async function getAllOrders(req, res) {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 })
  res.json(orders)
}

// PUT /api/orders/:id/status (admin only)
export async function updateOrderStatus(req, res) {
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })

  order.status = req.body.status
  await order.save()
  res.json(order)
}
