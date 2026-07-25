import mongoose from 'mongoose'

const schemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // "Silver Plan"
    monthlyAmount: { type: Number, required: true },
    durationMonths: { type: Number, required: true },
    rewardAmount: { type: Number, required: true }, // final maturity payout
    description: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

schemeSchema.virtual('totalAmount').get(function () {
  return this.monthlyAmount * this.durationMonths
})
schemeSchema.set('toJSON', { virtuals: true })

export default mongoose.model('Scheme', schemeSchema)
