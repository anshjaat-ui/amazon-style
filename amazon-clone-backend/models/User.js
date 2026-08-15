import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const addressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  line1: String,
  line2: String,
  city: String,
  state: String,
  pincode: String,
  isDefault: { type: Boolean, default: false },
})

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // Kept optional so existing email/password admin accounts continue working.
    email: { type: String, unique: true, sparse: true, lowercase: true },
    // Customer authentication now uses Firebase Phone Auth + OTP.
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, minlength: 6 },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    addresses: [addressSchema],
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false
  return bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model('User', userSchema)
