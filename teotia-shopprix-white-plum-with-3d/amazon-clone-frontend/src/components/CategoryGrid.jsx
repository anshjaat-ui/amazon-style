import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const iconFallbacks = {
  toys: '⚽', gifts: '🎁', footwear: '👟', women: '👩', jewelry: '💍',
  'cold drinks': '🥤', stationery: '📚', gents: '👨', 'ice-cream': '🍦',
  'school shoes': '👞', grocery: '🛒', confectionary: '🍬', devotional: '🛕',
  electronics: '📱', fashion: '👗', 'home & kitchen': '🏠', beauty: '🧴',
  'personal care': '🧴', offers: '🏷️',
}

function getIcon(category) {
  if (category.emoji) return category.emoji
  return iconFallbacks[String(category.name || '').trim().toLowerCase()] || '🛍️'
}

export default function CategoryGrid() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    api.get('/categories').then((all) => {
      const roots = (all || []).filter((c) => !c.parent)
      if (!cancelled) setCategories(roots)
    }).catch(() => {
      if (!cancelled) setCategories([])
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  return (
    <section className="bg-white px-3 sm:px-6 lg:px-10 py-7 sm:py-9">
      <div className="max-w-[1320px] mx-auto">
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="hidden sm:block h-px w-14 bg-[#481F72]" />
          <div className="text-center">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-wide text-slate-900">SHOP BY CATEGORY</h2>
            <span className="block text-[#D4AF37] text-lg leading-none mt-0.5">⌁</span>
          </div>
          <span className="hidden sm:block h-px w-14 bg-[#481F72]" />
        </div>

        {loading ? (
          <div className="flex justify-center gap-7 sm:gap-10 overflow-hidden py-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="shrink-0 w-24 sm:w-32 flex flex-col items-center gap-3">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#F7F1FB] border-2 border-[#E9E4EF] animate-pulse" />
                <div className="w-16 h-3 rounded bg-[#E9E4EF]" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-sm text-slate-500">Categories abhi available nahi hain.</p>
        ) : (
          <div className="flex gap-7 sm:gap-10 overflow-x-auto category-scroll pb-2 justify-start lg:justify-center">
            {categories.map((category) => (
              <button key={category._id} type="button" onClick={() => navigate(`/?category=${encodeURIComponent(category.name)}`)} className="group shrink-0 w-[92px] sm:w-[125px] flex flex-col items-center gap-3 text-center" aria-label={`Shop ${category.name}`}>
                <span className="w-[88px] h-[88px] sm:w-[120px] sm:h-[120px] rounded-full bg-[#F7F1FB] border-[3px] border-[#E9E4EF] flex items-center justify-center shadow-sm group-hover:border-[#481F72] group-hover:shadow-lg group-hover:-translate-y-1 transition-all">
                  <span className="text-4xl sm:text-5xl leading-none select-none" aria-hidden="true">{getIcon(category)}</span>
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight group-hover:text-[#481F72]">{category.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
