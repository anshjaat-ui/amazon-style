// controllers/categoryController.js

import Category from '../models/Category.js'


// 📥 GET all categories
export async function getCategories(req, res) {
  try {
    const categories = await Category.find({})
      .sort({ order: 1, name: 1 })

    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' })
  }
}


// ➕ CREATE new category
export async function createCategory(req, res) {
  try {
    const { name, emoji, order } = req.body

    const exists = await Category.findOne({ name })
    if (exists) {
      return res.status(400).json({ message: 'Category already exists' })
    }

    const category = await Category.create({
      name,
      emoji,
      order
    })

    res.status(201).json(category)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category' })
  }
}


// ✏️ UPDATE category
export async function updateCategory(req, res) {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    res.json(category)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category' })
  }
}


// ❌ DELETE category
export async function deleteCategory(req, res) {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    res.json({ message: 'Category removed' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category' })
  }
}
