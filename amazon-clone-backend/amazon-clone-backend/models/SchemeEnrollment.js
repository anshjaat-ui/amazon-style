import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
  monthNumber: Number, // 1, 2, 3... durationMonths
  baseAmount: Number, // is mahine ka apna payout (1000 ya last mahine 1500)
  redeemed: { type: Boolean, default: false }, // customer ne "redeem" click kiya
  redeemedAt: Date,
  paidOut: { type: Boolean, default: false }, // admin ne physically paisa de diya, confirm kiya
  paidOutAt: Date,
})

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },

    // Upfront deposit (jaise ₹12000) - pehle ye clear hona zaroori hai coupons active hone se pehle
    depositClaimed: { type: Boolean, default: false }, // customer bola "maine deposit kar diya"
    depositUpiRef: String,
    depositConfirmed: { type: Boolean, default: false }, // admin ne verify kiya paisa aa gaya
    depositConfirmedAt: Date, // isse coupon ke months count hote hain

    coupons: [couponSchema], // durationMonths coupons, join karte hi generate ho jaate hain

    status: { type: String, enum: ['pending_deposit', 'active', 'completed', 'cancelled'], default: 'pending_deposit' },
  },
  { timestamps: true }
)

export default mongoose.model('SchemeEnrollment', enrollmentSchema)
