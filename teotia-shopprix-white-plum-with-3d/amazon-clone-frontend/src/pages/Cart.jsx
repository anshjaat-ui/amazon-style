import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Minus, Plus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Cart() {
  const { cart, subtotal, updateQty, removeFromCart, loading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <main className="bg-luxe-bg min-h-[60vh] flex flex-col items-center justify-center gap-3 font-sans">
        <p className="text-slate-500">Sign in to see items in your cart.</p>
        <Link to="/login" className="bg-gold hover:bg-gold-light px-6 py-1.5 rounded-full text-sm font-medium border border-gold/40">
          Sign in
        </Link>
      </main>
    )
  }

  if (loading) {
    return <main className="bg-luxe-bg min-h-[60vh] flex items-center justify-center text-slate-500">Loading cart...</main>
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <main className="bg-luxe-bg min-h-[60vh] flex flex-col items-center justify-center gap-3 font-sans">
        <p className="text-slate-500">Your Teotia Shopprix Cart is empty.</p>
        <Link to="/" className="bg-gold hover:bg-gold-light px-6 py-1.5 rounded-full text-sm font-medium border border-gold/40">
          Continue shopping
        </Link>
      </main>
    )
  }

  return (
    <main className="bg-luxe-bg min-h-[70vh] font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 py-6">
        <div className="lg:col-span-2 bg-luxe-panel border border-gold/20 p-4 rounded-lg">
          <h1 className="text-2xl font-medium mb-4 text-slate-900 border-b pb-3">Shopping Cart</h1>

          {cart.items.map((item) => (
            <div key={`${item.product._id}-${item.size || 'nosize'}`} className="flex gap-4 py-4 border-b last:border-0">
              <img src={item.product.images?.[0]} alt={item.product.name} className="w-24 h-24 object-contain" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1 text-slate-700">{item.product.name}</p>
                <p className="text-blush-from font-medium mb-1">₹{item.product.price.toLocaleString('en-IN')}</p>
                {item.size && <p className="text-xs text-slate-500 mb-2">Size: <span className="font-medium text-slate-700">{item.size}</span></p>}

                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-full overflow-hidden">
                    <button
                      onClick={() => updateQty(item.product._id, Math.max(1, item.qty - 1), item.size || '')}
                      className="px-2 py-1 hover:bg-gray-100"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-sm">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.product._id, item.qty + 1, item.size || '')}
                      className="px-2 py-1 hover:bg-gray-100"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product._id, item.size || '')}
                    className="text-xs text-gold hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-luxe-panel border border-gold/20 p-4 rounded-lg h-fit">
          <p className="text-sm mb-2 text-slate-700">
            Subtotal ({cart.items.reduce((s, i) => s + i.qty, 0)} items):{' '}
            <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
          </p>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-gold hover:bg-gold-light text-white rounded-full py-1.5 text-sm font-medium border border-gold/40"
          >
            Proceed to Buy
          </button>
        </div>
      </div>
    </main>
  )
}
