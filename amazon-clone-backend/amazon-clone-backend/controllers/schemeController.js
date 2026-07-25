import Scheme from '../models/Scheme.js'
import SchemeEnrollment from '../models/SchemeEnrollment.js'

// GET /api/schemes - public, active schemes
export async function getActiveSchemes(req, res) {
  const schemes = await Scheme.find({ active: true }).sort({ monthlyAmount: 1 })
  res.json(schemes)
}

// GET /api/schemes/all (admin)
export async function getAllSchemes(req, res) {
  const schemes = await Scheme.find({}).sort({ createdAt: -1 })
  res.json(schemes)
}

export async function createScheme(req, res) {
  const scheme = await Scheme.create(req.body)
  res.status(201).json(scheme)
}

export async function updateScheme(req, res) {
  const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!scheme) return res.status(404).json({ message: 'Scheme not found' })
  res.json(scheme)
}

export async function deleteScheme(req, res) {
  const scheme = await Scheme.findByIdAndDelete(req.params.id)
  if (!scheme) return res.status(404).json({ message: 'Scheme not found' })
  res.json({ message: 'Scheme removed' })
}

// POST /api/schemes/:id/join - customer scheme join karta hai
export async function joinScheme(req, res) {
  const scheme = await Scheme.findById(req.params.id)
  if (!scheme || !scheme.active) {
    return res.status(404).json({ message: 'Scheme not available' })
  }

  const existing = await SchemeEnrollment.findOne({
    user: req.user._id,
    scheme: scheme._id,
    status: 'active',
  })
  if (existing) {
    return res.status(400).json({ message: 'You have already joined this scheme' })
  }

  const enrollment = await SchemeEnrollment.create({
    user: req.user._id,
    scheme: scheme._id,
    payments: [],
  })
  res.status(201).json(enrollment)
}

// GET /api/schemes/my-enrollments
export async function getMyEnrollments(req, res) {
  const enrollments = await SchemeEnrollment.find({ user: req.user._id }).populate('scheme')
  res.json(enrollments)
}

// POST /api/schemes/enrollments/:id/pay - is month ka payment claim karo
export async function claimMonthlyPayment(req, res) {
  const { upiRef } = req.body
  const enrollment = await SchemeEnrollment.findById(req.params.id).populate('scheme')
  if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' })
  if (enrollment.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }
  if (enrollment.status !== 'active') {
    return res.status(400).json({ message: 'This scheme is not active' })
  }

  const confirmedCount = enrollment.payments.filter((p) => p.confirmed).length
  if (confirmedCount >= enrollment.scheme.durationMonths) {
    return res.status(400).json({ message: 'All months already paid' })
  }

  const pendingClaim = enrollment.payments.find((p) => p.claimed && !p.confirmed)
  if (pendingClaim) {
    return res.status(400).json({ message: 'Previous payment claim still pending admin confirmation' })
  }

  enrollment.payments.push({
    monthNumber: confirmedCount + 1,
    amount: enrollment.scheme.monthlyAmount,
    paidAt: new Date(),
    claimed: true,
    confirmed: false,
    upiRef,
  })
  await enrollment.save()
  res.json(enrollment)
}

// GET /api/schemes/enrollments/all (admin) - sab enrollments, users track karne ke liye
export async function getAllEnrollments(req, res) {
  const enrollments = await SchemeEnrollment.find({}).populate('scheme').populate('user', 'name email')
  res.json(enrollments)
}

// PUT /api/schemes/enrollments/:id/confirm-payment (admin) - latest claimed payment confirm karo
export async function confirmMonthlyPayment(req, res) {
  const enrollment = await SchemeEnrollment.findById(req.params.id).populate('scheme')
  if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' })

  const pending = [...enrollment.payments].reverse().find((p) => p.claimed && !p.confirmed)
  if (!pending) {
    return res.status(400).json({ message: 'No pending payment claim to confirm' })
  }
  pending.confirmed = true

  const confirmedCount = enrollment.payments.filter((p) => p.confirmed).length
  if (confirmedCount >= enrollment.scheme.durationMonths) {
    enrollment.status = 'completed'
  }

  await enrollment.save()
  res.json(enrollment)
}
