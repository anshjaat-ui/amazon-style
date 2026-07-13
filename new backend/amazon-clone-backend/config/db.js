import mongoose from 'mongoose'

export default async function connectDB() {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI) // 👈 yahan add karo

    const conn = await mongoose.connect(process.env.MONGO_URI)

    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`)
    process.exit(1)
  }
}
