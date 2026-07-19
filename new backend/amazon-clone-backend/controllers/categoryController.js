import Category from '../models/Category.js'

export async function getCategories(req, res) {
  const categories = await Category.find({}).sort({ order: 1, name: 1 })
  res.json(categories)
}

export async function createCategory(req, res) {
  const { name, emoji, order } = req.body
  const exists = await Category.findOne({ name })
  if (exists) {
    return res.status(400).json({ message: 'Category already exists' })
  }
  const category = await Category.create({ name, emoji, order })
  res.status(201).json(category)
}

export async function updateCategory(req, res) {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!category) return res.status(404).json({ message: 'Category not found' })
  res.json(category)
}

export async function deleteCategory(req, res) {
  const category = await Category.findByIdAndDelete(req.params.id)
  if (!category) return res.status(404).json({ message: 'Category not found' })
  res.json({ message: 'Category removed' })
}
