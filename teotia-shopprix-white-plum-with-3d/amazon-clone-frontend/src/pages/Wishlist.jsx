import { Link, useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

export default function Wishlist() {
  const { products, loading, error, toggle } = useWishlist()
  const { addToCart } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()

  if (loading) {
    return <main className="bg-luxe-bg min-h-[60vh] flex items-center justify-center text-slate-500">Loading wishlist...</main>
  }

  if (error) {
    return (
      <main className="bg-luxe-bg min-h-[60vh] flex flex-col items-center justify-center gap-2 font-sans">
        <p className="text-blush-from text-sm">Wishlist load nahi ho paayi: {error}</p>
        <p className="text-slate-500 text-xs">Backend chal raha hai aur naya code deploy hua hai, confirm karo.</p>
      </main>
    )
  }

  async function handleRemove(id) {
    try {
      await toggle(id)
      showToast('Removed from wishlist')
    } catch (err) {
      showToast(err.message || 'Could not remove', 'error')
    }
  }

  async function handleAdd(id) {
    try {
      await addToCart(id, 1)
      showToast('Added to cart')
    } catch (err) {
      showToast(err.message || 'Could not add to cart', 'error')
    }
  }

  if (products.length === 0) {
    return (
      <main className="bg-luxe-bg min-h-[60vh] flex flex-col items-center justify-center gap-3 font-sans">
        <Heart size={40} className="text-slate-500" />
        <p className="text-slate-500">Your wishlist is empty.</p>
        <Link to="/" className="bg-gold hover:bg-gold-light px-6 py-1.5 rounded-full text-sm font-medium border border-gold/40">
          Continue shopping
        </Link>
      </main>
    )
  }

  return (
    <main className="bg-luxe-bg min-h-[70vh] font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-slate-900 mb-4">Your Wishlist ({products.length})</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p._id}
              onClick={() => navigate(`/product/${p._id}`)}
              className="relative bg-luxe-panel border border-gold/20 rounded-lg p-3 flex flex-col cursor-pointer hover:border-gold/50 hover:shadow-goldGlow transition-all"
            >
              <button
                onClick={(e) => { e.stopPropagation(); handleRemove(p._id) }}
                className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-[#481F72]/8 flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Heart size={16} className="fill-blush-from text-blush-from" />
              </button>
              <img src={p.images?.[0]} alt={p.name} className="h-40 object-contain mb-3 bg-white rounded" />
              <p className="text-sm text-slate-700 line-clamp-2 mb-2">{p.name}</p>
              <p className="text-lg font-semibold text-slate-900 mb-2">₹{p.price.toLocaleString('en-IN')}</p>
              <button
                onClick={(e) => { e.stopPropagation(); handleAdd(p._id) }}
                className="mt-auto bg-gold hover:bg-gold-light hover:scale-[1.01] text-white text-sm font-semibold py-2 rounded-full transition-all"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
