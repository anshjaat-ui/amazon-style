import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.onrwmnju,
    api_key: process.env.952195923342437,
    api_secret: process.env.kDx2BN1U5d3cD5XhzdYJIJ_eO6E,
  })
  return cloudinary
}

router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(500).json({
      message: 'Image upload configured nahi hai. CLOUDINARY_* env vars Render mein set karo, ya image URL paste karo.',
    })
  }
  if (!req.file) {
    return res.status(400).json({ message: 'Koi file nahi mili' })
  }

  const cld = getCloudinary()
  const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`

  const result = await cld.uploader.upload(base64, { folder: 'teotia-shopprix-products' })
  res.json({ url: result.secure_url })
})

export default router
