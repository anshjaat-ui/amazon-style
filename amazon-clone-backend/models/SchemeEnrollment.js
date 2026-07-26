import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  monthNumber: Number,
  amount: Number,
  paidAt: Date,
  claimed: { type: Boolean, default: false }, // customer ne "paid" bola
  confirmed: { type: Boolean, default: false }, // admin ne verify kiya
  upiRef: String,
})

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },
    payments: [paymentSchema],
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  },
  { timestamps: true }
)

export default mongoose.model('SchemeEnrollment', enrollmentSchema)
