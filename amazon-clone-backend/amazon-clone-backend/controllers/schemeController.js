import Scheme from '../models/Scheme.js'
import SchemeEnrollment from '../models/SchemeEnrollment.js'

// GET /api/schemes - public, active schemes
export async function getActiveSchemes(req, res) {
  const schemes = await Scheme.find({ active: true }).sort({ depositAmount: 1 })
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

// POST /api/schemes/:id/join - enrollment banao (coupons pre-generate hote hain, lekin
// tab tak inactive rehte hain jab tak deposit confirm nahi hota)
export async function joinScheme(req, res) {
  const scheme = await Scheme.findById(req.params.id)
  if (!scheme || !scheme.active) {
    return res.status(404).json({ message: 'Scheme not available' })
  }

  const existing = await SchemeEnrollment.findOne({
    user: req.user._id,
    scheme: scheme._id,
    status: { $in: ['pending_deposit', 'active'] },
  })
  if (existing) {
    return res.status(400).json({ message: 'You have already joined this scheme' })
  }

  const coupons = []
  for (let m = 1; m <= scheme.durationMonths; m++) {
    coupons.push({
      monthNumber: m,
      baseAmount: m === scheme.durationMonths ? scheme.finalPayout : scheme.monthlyPayout,
    })
  }

  const enrollment = await SchemeEnrollment.create({
    user: req.user._id,
    scheme: scheme._id,
    coupons,
  })
  res.status(201).json(enrollment)
}

// PUT /api/schemes/enrollments/:id/claim-deposit - customer bolta hai "maine deposit kar diya"
export async function claimDeposit(req, res) {
  const { upiRef } = req.body
  const enrollment = await SchemeEnrollment.findById(req.params.id)
  if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' })
  if (enrollment.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }
  if (enrollment.depositConfirmed) {
    return res.status(400).json({ message: 'Deposit already confirmed' })
  }

  enrollment.depositClaimed = true
  enrollment.depositUpiRef = upiRef || ''
  await enrollment.save()
  res.json(enrollment)
}

// PUT /api/schemes/enrollments/:id/confirm-deposit (admin) - deposit verify karke scheme activate karo
export async function confirmDeposit(req, res) {
  const enrollment = await SchemeEnrollment.findById(req.params.id)
  if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' })
  if (enrollment.depositConfirmed) {
    return res.status(400).json({ message: 'Already confirmed' })
  }

  enrollment.depositConfirmed = true
  enrollment.depositConfirmedAt = new Date()
  enrollment.status = 'active'
  await enrollment.save()
  res.json(enrollment)
}

// Kitne months elapsed hain deposit confirm hone ke baad se (month 1 turant se eligible hai)
function monthsElapsedSince(date) {
  const now = new Date()
  const months =
    (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth()) + 1
  return Math.max(months, 1)
}

// PUT /api/schemes/enrollments/:id/redeem - customer is mahine ka payout redeem karta hai
// (agar pichle mahine miss kiye hain, wo bhi is baar ek saath include ho jaate hain)
export async function redeemCoupon(req, res) {
  const enrollment = await SchemeEnrollment.findById(req.params.id).populate('scheme')
  if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' })
  if (enrollment.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }
  if (enrollment.status !== 'active') {
    return res.status(400).json({ message: 'Deposit not confirmed yet, or scheme not active' })
  }

  const eligibleMonths = monthsElapsedSince(enrollment.depositConfirmedAt)
  const redeemable = enrollment.coupons.filter((c) => !c.redeemed && c.monthNumber <= eligibleMonths)

  if (redeemable.length === 0) {
    return res.status(400).json({ message: 'Is mahine ka coupon abhi eligible nahi hai. Thoda wait karo.' })
  }

  let totalAmount = 0
  redeemable.forEach((c) => {
    c.redeemed = true
    c.redeemedAt = new Date()
    totalAmount += c.baseAmount
  })

  const allRedeemed = enrollment.coupons.every((c) => c.redeemed)
  if (allRedeemed) enrollment.status = 'completed'

  await enrollment.save()
  res.json({ message: `₹${totalAmount} redeem ho gaya, payout pending hai.`, totalAmount, enrollment })
}

// GET /api/schemes/my-enrollments
export async function getMyEnrollments(req, res) {
  const enrollments = await SchemeEnrollment.find({ user: req.user._id }).populate('scheme')
  res.json(enrollments)
}

// GET /api/schemes/enrollments/all (admin)
export async function getAllEnrollments(req, res) {
  const enrollments = await SchemeEnrollment.find({}).populate('scheme').populate('user', 'name email')
  res.json(enrollments)
}

// PUT /api/schemes/enrollments/:id/confirm-payout (admin) - jo coupons redeem ho chuke hain
// unhe "paid out" mark karo (matlab admin ne physically customer ko paisa de diya)
export async function confirmPayout(req, res) {
  const enrollment = await SchemeEnrollment.findById(req.params.id)
  if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' })

  let count = 0
  enrollment.coupons.forEach((c) => {
    if (c.redeemed && !c.paidOut) {
      c.paidOut = true
      c.paidOutAt = new Date()
      count++
    }
  })

  if (count === 0) {
    return res.status(400).json({ message: 'No pending payouts to confirm' })
  }

  await enrollment.save()
  res.json({ message: `${count} payout(s) confirmed`, enrollment })
}
