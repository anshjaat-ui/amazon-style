import { ArrowLeft, ShoppingBag, ShieldCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function ContinueShopping() {
  const { pathname } = useLocation()
  if (pathname === '/' || pathname === '/login' || pathname === '/signup') return null

  return (
    <div className="border-b border-[#E9E4EF] bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-[#DCD3E5] bg-white px-4 py-2 text-sm font-bold text-[#481F72] hover:bg-[#F7F1FB]">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
        <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1.5"><ShoppingBag size={14} className="text-[#481F72]" /> Easy shopping</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#481F72]" /> Secure checkout</span>
        </div>
      </div>
    </div>
  )
}
