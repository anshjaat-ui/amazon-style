import { useEffect, useMemo, useRef, useState } from 'react'
import ProductCard from './ProductCard'

export default function ProductCarousel({ title, subtitle, products = [], speed = 28, reverse = false }) {
  const trackRef = useRef(null)
  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)
  const pausedRef = useRef(false)
  const draggingRef = useRef(false)
  const dragStartRef = useRef(0)
  const scrollStartRef = useRef(0)
  const [paused, setPaused] = useState(false)

  const items = useMemo(() => products.filter(Boolean), [products])

  useEffect(() => {
    const el = trackRef.current
    if (!el || items.length < 2) return

    const tick = (time) => {
      if (lastTimeRef.current == null) lastTimeRef.current = time
      const delta = Math.min(40, time - lastTimeRef.current)
      lastTimeRef.current = time

      if (!pausedRef.current && !draggingRef.current) {
        const amount = (speed * delta) / 1000
        el.scrollLeft += reverse ? -amount : amount

        const half = el.scrollWidth / 2
        if (!reverse && el.scrollLeft >= half) el.scrollLeft -= half
        if (reverse && el.scrollLeft <= 0) el.scrollLeft += half
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = null
    }
  }, [items.length, reverse, speed])

  useEffect(() => {
    const el = trackRef.current
    if (!el || items.length < 2) return
    if (reverse) el.scrollLeft = el.scrollWidth / 2
  }, [items.length, reverse])

  const setPausedState = (value) => {
    pausedRef.current = value
    setPaused(value)
  }

  const move = (direction) => {
    const el = trackRef.current
    if (!el) return
    setPausedState(true)
    el.scrollBy({ left: direction * Math.max(260, el.clientWidth * 0.72), behavior: 'smooth' })
    window.setTimeout(() => setPausedState(false), 700)
  }

  const onPointerDown = (event) => {
    const el = trackRef.current
    if (!el) return
    draggingRef.current = true
    dragStartRef.current = event.clientX
    scrollStartRef.current = el.scrollLeft
    setPausedState(true)
    el.setPointerCapture?.(event.pointerId)
  }

  const onPointerMove = (event) => {
    if (!draggingRef.current) return
    const el = trackRef.current
    if (!el) return
    el.scrollLeft = scrollStartRef.current - (event.clientX - dragStartRef.current)
  }

  const onPointerUp = (event) => {
    draggingRef.current = false
    trackRef.current?.releasePointerCapture?.(event.pointerId)
    setPausedState(false)
  }

  if (!items.length) return null

  // Duplicate the row so it loops seamlessly forever.
  const loopItems = items.length > 1 ? [...items, ...items] : items

  return (
    <section className="max-w-7xl mx-auto px-4 py-7 bg-luxe-bg">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            aria-label={`Previous ${title}`}
            onClick={() => move(-1)}
            className="carousel-arrow"
          >
            ←
          </button>
          <button
            type="button"
            aria-label={`Next ${title}`}
            onClick={() => move(1)}
            className="carousel-arrow"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className={`product-carousel-track ${paused ? 'is-paused' : ''}`}
        onMouseEnter={() => setPausedState(true)}
        onMouseLeave={() => { if (!draggingRef.current) setPausedState(false) }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {loopItems.map((product, index) => (
          <div className="product-carousel-item" key={`${product._id}-${index}`}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
