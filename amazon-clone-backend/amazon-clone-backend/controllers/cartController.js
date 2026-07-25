import Cart from '../models/Cart.js'

// GET /api/cart
export async function getCart(req, res) {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'name price images stock'
  )
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] })
  }
  res.json(cart)
}

// POST /api/cart  { productId, qty }
export async function addToCart(req, res) {
  const { productId, qty = 1 } = req.body

  let cart = await Cart.findOne({ user: req.user._id })
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] })
  }

  const existingItem = cart.items.find((i) => i.product.toString() === productId)
  if (existingItem) {
    existingItem.qty += qty
  } else {
    cart.items.push({ product: productId, qty })
  }

  await cart.save()
  await cart.populate('items.product', 'name price images stock')
  res.status(201).json(cart)
}

// PUT /api/cart/:productId  { qty }
export async function updateCartItem(req, res) {
  const { qty } = req.body
  const cart = await Cart.findOne({ user: req.user._id })
  if (!cart) return res.status(404).json({ message: 'Cart not found' })

  const item = cart.items.find((i) => i.product.toString() === req.params.productId)
  if (!item) return res.status(404).json({ message: 'Item not in cart' })

  item.qty = qty
  await cart.save()
  await cart.populate('items.product', 'name price images stock')
  res.json(cart)
}

// DELETE /api/cart/:productId
export async function removeCartItem(req, res) {
  const cart = await Cart.findOne({ user: req.user._id })
  if (!cart) return res.status(404).json({ message: 'Cart not found' })

  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId)
  await cart.save()
  await cart.populate('items.product', 'name price images stock')
  res.json(cart)
}
