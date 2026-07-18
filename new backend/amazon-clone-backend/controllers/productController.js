import Product from '../models/Product.js'

export async function getProducts(req, res) {
  const pageSize = 12
  const page = Number(req.query.page) || 1

  const filter = {}

  if (req.query.keyword) {
    filter.$text = { $search: req.query.keyword }
  }
  if (req.query.category) {
    filter.category = req.query.category
  }
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {}
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice)
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice)
  }

  const count = await Product.countDocuments(filter)
  const products = await Product.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 })

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  })
}

export async function getSuggestions(req, res) {
  const keyword = req.query.keyword || ''
  if (!keyword.trim()) return res.json([])

  const products = await Product.find({
    name: { $regex: keyword, $options: 'i' },
  })
    .select('name images price category')
    .limit(6)

  res.json(products)
}

export async function getProductById(req, res) {
  const product = await Product.findById(req.params.id)
  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }
  res.json(product)
}

export async function createProduct(req, res) {
  const product = await Product.create(req.body)
  res.status(201).json(product)
}

export async function updateProduct(req, res) {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }
  res.json(product)
}

export async function deleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }
  res.json({ message: 'Product removed' })
}

export async function addReview(req, res) {
  const { rating, comment } = req.body
  const product = await Product.findById(req.params.id)

  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  )
  if (alreadyReviewed) {
    return res.status(400).json({ message: 'You already reviewed this product' })
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  })

  product.numReviews = product.reviews.length
  product.rating =
    product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length

  await product.save()
  res.status(201).json({ message: 'Review added' })
}
