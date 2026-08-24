import { useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, BadgeIndianRupee, Zap, Headphones } from 'lucide-react'
import { api } from '../api/client'

const fallbackSlide = {
  type: 'image',
  url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1800&auto=format&fit=crop',
}

const trustItems = [
  { icon: BadgeIndianRupee, title: 'Premium Quality', text: 'Best quality products' },
  { icon: Zap, title: 'Best Prices', text: 'Unbeatable prices' },
  { icon: ShieldCheck, title: 'Secure Payment', text: '100% secure payment' },
  { icon: Truck, title: 'Fast Delivery', text: 'On time delivery' },
  { icon: Headphones, title: 'Customer Support', text: '24/7 support' },
]

export default function HeroSlider() {
  const [slides, setSlides] = useState([fallbackSlide])
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    api.get('/banners').then((data) => {
      if (Array.isArray(data) && data.length > 0) setSlides(data)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    clearInterval(timerRef.current)
    if (slides.length <= 1) return
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000)
    return () => clearInterval(timerRef.current)
  }, [slides])

  function goTo(i) {
    setIndex(i)
    clearInterval(timerRef.current)
  }

  const slide = slides[index] || fallbackSlide

  return (
    <section className="bg-white">
      {/* Full-clear hero: image is never blurred or darkened */}
      <div className="relative w-full overflow-hidden bg-white">
        {slide.type === 'video' ? (
          <video key={slide.url} src={slide.url} autoPlay muted loop playsInline className="block w-full h-auto object-contain" />
        ) : (
          <img key={slide.url} src={slide.url} alt="Teotia Shopprix offer banner" loading="eager" className="block w-full h-auto object-contain" />
        )}

        {/* Only the delivery offer card remains; no banner heading/description/button overlay */}
        <div className="hidden md:block absolute right-[6%] top-1/2 -translate-y-1/2 w-[220px] lg:w-[260px] rounded-xl bg-white/95 p-5 lg:p-6 shadow-xl border border-white/80">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#481F72]">Special Delivery Offer</p>
          <p className="mt-3 text-2xl lg:text-3xl font-black text-slate-900 leading-tight">FREE<br />DELIVERY</p>
          <p className="mt-3 text-sm font-semibold text-slate-700">On Orders Above ₹999</p>
          <div className="mt-4 h-px bg-[#eadfe5]" />
          <p className="mt-3 text-xs lg:text-sm text-slate-600">Shop your favourites and enjoy convenient doorstep delivery.</p>
        </div>

        {slides.length > 1 && (
          <>
            <button onClick={() => goTo((index - 1 + slides.length) % slides.length)} aria-label="Previous banner" className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 border border-white shadow-md flex items-center justify-center text-gold hover:bg-white"><ChevronLeft size={20} /></button>
            <button onClick={() => goTo((index + 1) % slides.length)} aria-label="Next banner" className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 border border-white shadow-md flex items-center justify-center text-gold hover:bg-white"><ChevronRight size={20} /></button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {slides.map((_, i) => <button key={i} onClick={() => goTo(i)} aria-label={`Banner ${i + 1}`} className={`h-2 rounded-full transition-all ${i === index ? 'bg-[#481F72] w-7' : 'bg-white/90 w-2.5'}`} />)}
            </div>
          </>
        )}
      </div>

      {/* Trust strip */}
      <div className="border-b border-[#E9E4EF] bg-white">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-[#E9E4EF]">
          {trustItems.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 px-4 lg:px-7 py-4 lg:py-5">
              <span className="w-10 h-10 shrink-0 rounded-full bg-[#F7F1FB] border border-[#E9E4EF] flex items-center justify-center text-[#481F72]"><Icon size={20} /></span>
              <div className="min-w-0">
                <p className="text-xs lg:text-sm font-extrabold uppercase text-slate-900 truncate">{title}</p>
                <p className="text-[11px] lg:text-xs text-slate-600 truncate mt-0.5">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
