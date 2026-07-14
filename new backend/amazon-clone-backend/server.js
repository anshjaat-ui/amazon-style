import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'express-async-errors' // async controller errors ko errorHandler tak pahunchata hai
import connectDB from './config/db.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'
import Product from './models/Product.js'

import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'

dotenv.config()
connectDB()

const app = express()

// CLIENT_URL se sirf ek fixed origin allow hota tha — lekin Vercel har naye deploy
// pe alag preview URL (hash ke saath) banata hai. Isliye ab hum check karte hain ki
// request ka origin CLIENT_URL se match karta hai YA usi Vercel project ke kisi bhi
// deployment se aa raha hai (pattern: project-name-*.vercel.app)
const allowedOrigin = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')
let vercelProjectPattern = null
try {
  const hostname = new URL(allowedOrigin).hostname
  if (hostname.endsWith('.vercel.app')) {
    const projectSlug = hostname.split('.vercel.app')[0].split('-')[0]
    vercelProjectPattern = new RegExp(`^https:\\/\\/${projectSlug}[a-z0-9-]*\\.vercel\\.app$`)
  }
} catch {
  // CLIENT_URL invalid URL hai to bas exact-match wala fallback use hoga
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (origin === allowedOrigin) return callback(null, true)
      if (vercelProjectPattern && vercelProjectPattern.test(origin)) return callback(null, true)
      if (origin === 'http://localhost:5173') return callback(null, true)
      callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => res.json({ status: 'API running' }))

app.get('/api/seed/:key', async (req, res) => {
  if (req.params.key !== process.env.SEED_KEY) {
    return res.status(403).json({ message: 'Invalid seed key' })
  }

  const sampleProducts = [
    {
      name: 'Wireless Bluetooth Headphones with Active Noise Cancellation, 40Hr Battery',
      description: 'Premium over-ear headphones with ANC, 40 hour battery life, and quick charge support.',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600'],
      category: 'Electronics',
      brand: 'SoundPro',
      price: 1799,
      mrp: 4999,
      stock: 50,
    },
    {
      name: 'Smart Watch with Heart Rate Monitor, AMOLED Display, 7-Day Battery Life',
      description: 'Track your fitness with heart rate, SpO2, and sleep monitoring. AMOLED display.',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600'],
      category: 'Electronics',
      brand: 'FitTrack',
      price: 2499,
      mrp: 6999,
      stock: 30,
    },
    {
      name: "Men's Casual Cotton Shirt — Regular Fit, Machine Wash",
      description: '100% cotton casual shirt, breathable fabric, regular fit.',
      images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600'],
      category: 'Fashion',
      brand: 'UrbanFit',
      price: 599,
      mrp: 1299,
      stock: 100,
    },
    {
      name: 'Non-Stick Cookware Set, 5-Piece, Induction Compatible',
      description: 'Durable non-stick cookware set suitable for all stovetops including induction.',
      images: ['https://images.unsplash.com/photo-1584990347449-a5d9f800a783?q=80&w=600'],
      category: 'Home & Kitchen',
      brand: 'HomeChef',
      price: 1249,
      mrp: 2499,
      stock: 40,
    },
  ]

  await Product.deleteMany()
  await Product.insertMany(sampleProducts)
  res.json({ message: `${sampleProducts.length} products inserted successfully!` })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
