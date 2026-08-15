import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'
import { getFirebaseAuth } from '../config/firebaseAdmin.js'

// POST /api/auth/signup (legacy email/password endpoint kept for compatibility)
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
    phone: user.phone,
    role: user.role,
    token: generateToken(user._id),
  })
}

// POST /api/auth/login (kept for admin/backward compatibility)
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
    phone: user.phone,
    role: user.role,
    token: generateToken(user._id),
  })
}

// POST /api/auth/phone-login
// Firebase has already verified the SMS OTP on the client.
// The backend verifies the Firebase ID token and then issues the Shopprix JWT.
export async function phoneLogin(req, res) {
  const { idToken, phone, name } = req.body

  if (!idToken) {
    return res.status(400).json({ message: 'Firebase ID token is required' })
  }

  let decoded
  try {
    decoded = await getFirebaseAuth().verifyIdToken(idToken)
  } catch {
    return res.status(401).json({ message: 'Phone verification failed' })
  }

  const firebasePhone = decoded.phone_number
  if (!firebasePhone || (phone && firebasePhone !== phone)) {
    return res.status(401).json({ message: 'Verified phone number does not match' })
  }

  let user = await User.findOne({ phone: firebasePhone })

  if (!user) {
    user = await User.create({
      name: name?.trim() || 'Shopprix Customer',
      phone: firebasePhone,
      role: 'customer',
    })
  } else if (user.role !== 'customer') {
    return res.status(403).json({ message: 'This phone number belongs to an admin account' })
  } else if (name?.trim() && user.name === 'Shopprix Customer') {
    user.name = name.trim()
    await user.save()
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
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
