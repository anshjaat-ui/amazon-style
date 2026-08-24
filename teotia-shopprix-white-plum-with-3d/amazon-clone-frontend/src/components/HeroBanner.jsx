import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const fallback = {
  heading: 'Shop More, Save More, Smile More',
  subheading: 'Curated picks across electronics, fashion, home & more — delivered fast.',
  ctaText: 'Explore Now',
  bannerImage: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=1600&auto=format&fit=crop',
  highlights: [],
}

export default function HeroBanner() {
  const navigate = useNavigate()
  const [hero, setHero] = useState(fallback)

  useEffect(() => {
    api.get('/settings/hero').then(setHero).catch(() => setHero(fallback))
  }, [])

  return (
    <div className="relative overflow-hidden bg-white">
      <img
        src={hero.bannerImage}
        alt="Store banner"
        loading="lazy"
        className="w-full h-[260px] sm:h-[320px] md:h-[420px] object-cover"
      />
      <div className="px-4 py-5 text-center bg-white border-b border-[#EDEDED]">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          {hero.heading}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mb-4 max-w-2xl mx-auto">
          {hero.subheading}
        </p>

        {hero.highlights?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {hero.highlights.map((h, i) => (
              <span key={i} className="text-xs bg-gold/5 border border-gold/20 text-gold px-3 py-1 rounded-full">
                {h}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="bg-blush-gradient text-white font-semibold px-8 py-3 rounded-full text-sm shadow-goldGlow hover:opacity-90 transition-opacity"
        >
          {hero.ctaText}
        </button>
      </div>
    </div>
  )
}
