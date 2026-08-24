import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Star, ShoppingCart, Truck, ShieldCheck, RotateCcw, Heart } from 'lucide-react'
import { api } from '../api/client'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../context/ToastContext'

function ZoomImage({ src, alt }) {
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [zooming, setZooming] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
    setTilt({ x: (y / 100 - 0.5) * -6, y: (x / 100 - 0.5) * 6 })
  }

  return (
    <div
      className="bg-white rounded-lg overflow-hidden mb-3 aspect-square flex items-center justify-center relative cursor-zoom-in"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setZooming(true)}
      onMouseLeave={() => { setZooming(false); setTilt({ x: 0, y: 0 }) }}
      style={{ perspective: '800px' }}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full object-contain transition-transform duration-150"
        style={
          zooming
            ? {
                transform: `scale(1.8) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              }
            : {}
        }
      />
    </div>
  )
}

// Agar product ki 3+ images hain, unhe drag karke "360 spin" jaisa dekha ja sakta hai
function SpinViewer({ images }) {
  const [index, setIndex] = useState(0)
  const dragging = useRef(false)
  const lastX = useRef(0)

  function handleDown(e) {
    dragging.current = true
    lastX.current = e.clientX ?? e.touches?.[0]?.clientX
  }
  function handleMove(e) {
    if (!dragging.current) return
    const x = e.clientX ?? e.touches?.[0]?.clientX
    const delta = x - lastX.current
    if (Math.abs(delta) > 25) {
      setIndex((i) => (delta > 0 ? (i - 1 + images.length) % images.length : (i + 1) % images.length))
      lastX.current = x
    }
  }
  function handleUp() {
    dragging.current = false
  }

  return (
    <div
      className="bg-white rounded-lg overflow-hidden mb-3 aspect-square flex items-center justify-center relative cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleDown}
      onMouseMove={handleMove}
      onMouseUp={handleUp}
      onMouseLeave={handleUp}
      onTouchStart={handleDown}
      onTouchMove={handleMove}
      onTouchEnd={handleUp}
    >
      <img src={images[index]} alt="" className="max-h-full max-w-full object-contain pointer-events-none" draggable={false} />
      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#481F72]/10 text-gold text-[10px] px-3 py-1 rounded-full">
        Drag to rotate 360°
      </span>
    </div>
  )
}

function ReviewStars({ rating, setRating }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => setRating(n)}>
          <Star size={22} className="text-gold" fill={n <= rating ? '#D4AF37' : 'none'} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { isWishlisted, toggle } = useWishlist()
  const { showToast } = useToast()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImg, setActiveImg] = useState(0)
  const [viewMode, setViewMode] = useState('zoom') // 'zoom' | 'spin'
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [selectedSize, setSelectedSize] = useState('')

  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  function loadProduct() {
    setLoading(true)
    setActiveImg(0)
    setSelectedSize('')
    api
      .get(`/products/${id}`)
      .then(async (data) => {
        setProduct(data)
        // related products same category se, current ko exclude karke
        const list = await api.get(`/products?category=${encodeURIComponent(data.category)}`)
        setRelated(list.products.filter((p) => p._id !== data._id).slice(0, 4))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProduct()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleAddToCart() {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}` } })
      return
    }
    setAdding(true)
    try {
      if (product.hasSizes && !selectedSize) {
        showToast('Please select a size', 'error')
        setAdding(false)
        return
      }
      await addToCart(product._id, 1, selectedSize)
      setAdded(true)
      showToast('Added to cart')
      setTimeout(() => setAdded(false), 1500)
    } catch (err) {
      showToast(err.message || 'Could not add to cart', 'error')
    } finally {
      setAdding(false)
    }
  }

  async function handleWishlist() {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}` } })
      return
    }
    try {
      const added = await toggle(product._id)
      showToast(added ? 'Added to wishlist' : 'Removed from wishlist')
    } catch (err) {
      showToast(err.message || 'Wishlist update failed', 'error')
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault()
    setReviewError('')
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}` } })
      return
    }
    if (reviewRating === 0) {
      setReviewError('Please select a star rating')
      return
    }
    setSubmittingReview(true)
    try {
      await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment }, true)
      setReviewRating(0)
      setReviewComment('')
      showToast('Review submitted, thank you!')
      loadProduct()
    } catch (err) {
      setReviewError(err.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return <main className="bg-luxe-bg min-h-[70vh] flex items-center justify-center text-slate-500">Loading product...</main>
  }

  if (error || !product) {
    return (
      <main className="bg-luxe-bg min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <p>Product nahi mila.</p>
        <button onClick={() => navigate('/')} className="text-gold hover:underline text-sm">Home pe wapas jao</button>
      </main>
    )
  }

  const { name, description, price, mrp, rating = 0, numReviews = 0, images = [], stock, category, subcategory, brand, reviews = [], hasSizes = false, sizes = [] } = product
  const discount = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0
  const wishlisted = isWishlisted(product._id)

  return (
    <main className="bg-luxe-bg min-h-[70vh] font-sans">
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          {viewMode === 'spin' && images.length >= 3 ? (
            <SpinViewer images={images} />
          ) : (
            <ZoomImage src={images[activeImg]} alt={name} />
          )}
          {images.length >= 3 && (
            <button
              onClick={() => setViewMode(viewMode === 'spin' ? 'zoom' : 'spin')}
              className="mb-3 text-xs text-gold border border-gold/30 rounded-full px-3 py-1 hover:bg-gold/10 transition-colors"
            >
              {viewMode === 'spin' ? '🔍 Switch to Zoom View' : '🔄 Switch to 360° View'}
            </button>
          )}
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-md overflow-hidden bg-white border-2 ${
                    activeImg === i ? 'border-gold' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex justify-between items-start">
            <div>
              {category && <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">{category}{brand ? ` · ${brand}` : ''}</p>}
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">{name}</h1>
            </div>
            <button onClick={handleWishlist} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0" aria-label="Wishlist">
              <Heart size={20} className={wishlisted ? 'fill-blush-from text-blush-from' : 'text-slate-600'} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill={i < Math.round(rating) ? '#D4AF37' : 'none'} strokeWidth={1} />
              ))}
            </div>
            <span className="text-sm text-slate-500">({numReviews.toLocaleString('en-IN')} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-3xl font-bold text-slate-900">₹{price.toLocaleString('en-IN')}</span>
            {mrp > price && (
              <>
                <span className="text-slate-500 line-through text-sm">₹{mrp.toLocaleString('en-IN')}</span>
                <span className="text-green-400 text-sm font-medium">{discount}% off</span>
              </>
            )}
          </div>

          <p className={`text-sm mb-4 font-medium ${stock > 5 ? 'text-green-400' : stock > 0 ? 'text-blush-from' : 'text-slate-500'}`}>
            {stock > 5 ? `In stock (${stock} available)` : stock > 0 ? `Only ${stock} left — order soon!` : 'Out of stock'}
          </p>

          <p className="text-sm text-slate-600 leading-relaxed mb-6 whitespace-pre-line">{description}</p>

          {hasSizes && sizes.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-800">Select Size</label>
                {subcategory && <span className="text-xs text-slate-500">{subcategory}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-12 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedSize === size ? 'border-gold bg-gold text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-gold'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={adding || stock === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-white font-semibold px-8 py-3 rounded-full text-sm disabled:opacity-50 transition-colors"
          >
            <ShoppingCart size={18} />
            {added ? 'Added to Cart ✓' : adding ? 'Adding...' : stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          <div className="grid grid-cols-3 gap-3 mt-8 text-center">
            <div className="flex flex-col items-center gap-1 text-slate-500">
              <Truck size={20} className="text-gold" />
              <span className="text-xs">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-slate-500">
              <RotateCcw size={20} className="text-gold" />
              <span className="text-xs">7-Day Returns</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-slate-500">
              <ShieldCheck size={20} className="text-gold" />
              <span className="text-xs">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="max-w-6xl mx-auto px-4 py-6 border-t border-gold/10">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Customer Reviews</h2>

        {reviews.length === 0 ? (
          <p className="text-sm text-slate-500 mb-6">No reviews yet. Be the first to review this product.</p>
        ) : (
          <div className="space-y-4 mb-8">
            {reviews.map((r) => (
              <div key={r._id} className="bg-luxe-panel border border-gold/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex text-gold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill={i < r.rating ? '#D4AF37' : 'none'} strokeWidth={1} />
                    ))}
                  </div>
                  <span className="text-sm text-slate-900 font-medium">{r.name}</span>
                </div>
                {r.comment && <p className="text-sm text-slate-500">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="bg-luxe-panel border border-gold/10 rounded-lg p-4 max-w-md">
          <h3 className="text-sm font-medium text-slate-900 mb-3">Write a review</h3>
          {reviewError && (
            <div className="bg-blush-from/10 border border-blush-from/30 text-blush-from text-xs px-3 py-2 rounded mb-3">
              {reviewError}
            </div>
          )}
          <form onSubmit={handleReviewSubmit} className="space-y-3">
            <ReviewStars rating={reviewRating} setRating={setReviewRating} />
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience with this product (optional)"
              rows={3}
              className="w-full bg-[#481F72]/5 border border-gold/30 text-slate-900 rounded-md px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="bg-gold hover:bg-gold-light text-white text-sm font-medium px-5 py-2 rounded-full disabled:opacity-60"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-6 border-t border-gold/10">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link
                key={p._id}
                to={`/product/${p._id}`}
                className="bg-luxe-panel border border-gold/20 rounded-lg p-3 hover:border-gold/50 transition-colors"
              >
                <img src={p.images?.[0]} alt={p.name} className="h-32 object-contain mb-2 bg-white rounded w-full" />
                <p className="text-xs text-slate-600 line-clamp-2 mb-1">{p.name}</p>
                <p className="text-sm font-semibold text-slate-900">₹{p.price.toLocaleString('en-IN')}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
