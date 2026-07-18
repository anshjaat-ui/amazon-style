import express from 'express'
import { getHeroSettings, updateHeroSettings } from '../controllers/settingsController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/hero', getHeroSettings)
router.put('/hero', protect, admin, updateHeroSettings)

export default router
