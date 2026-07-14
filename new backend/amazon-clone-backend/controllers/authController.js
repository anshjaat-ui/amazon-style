import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'

// POST /api/auth/signup
export async function signup(req, res) {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill all fields' })
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists with this email' })
  }

  const user = await User.create({ name, email, password })

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  })
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  })
}

// GET /api/auth/profile
export async function getProfile(req, res) {
  res.json(req.user)
}

// PUT /api/auth/profile/address
export async function addAddress(req, res) {
  const user = await User.findById(req.user._id)
  user.addresses.push(req.body)
  await user.save()
  res.status(201).json(user.addresses)
}

// GET /api/auth/users (admin only)
export async function getAllUsers(req, res) {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 })
  res.json(users)
}
