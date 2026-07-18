import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'hero', unique: true },
    heading: { type: String, default: 'Shop More, Save More, Smile More' },
    subheading: { type: String, default: 'Curated picks across electronics, fashion, home & more — delivered fast.' },
    ctaText: { type: String, default: 'Explore Now' },
    bannerImage: { type: String, default: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=1600&auto=format&fit=crop' },
    highlights: [{ type: String }],
  },
  { timestamps: true }
)

export default mongoose.model('Settings', settingsSchema)
