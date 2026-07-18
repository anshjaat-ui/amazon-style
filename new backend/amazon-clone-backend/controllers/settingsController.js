import Settings from '../models/Settings.js'

export async function getHeroSettings(req, res) {
  let settings = await Settings.findOne({ key: 'hero' })
  if (!settings) {
    settings = await Settings.create({ key: 'hero' })
  }
  res.json(settings)
}

export async function updateHeroSettings(req, res) {
  const { heading, subheading, ctaText, bannerImage, highlights } = req.body

  let settings = await Settings.findOne({ key: 'hero' })
  if (!settings) {
    settings = new Settings({ key: 'hero' })
  }

  if (heading !== undefined) settings.heading = heading
  if (subheading !== undefined) settings.subheading = subheading
  if (ctaText !== undefined) settings.ctaText = ctaText
  if (bannerImage !== undefined) settings.bannerImage = bannerImage
  if (highlights !== undefined) settings.highlights = highlights

  await settings.save()
  res.json(settings)
}
