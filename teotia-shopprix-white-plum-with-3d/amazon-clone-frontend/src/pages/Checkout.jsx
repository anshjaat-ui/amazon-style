import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Truck, RotateCcw, Tag, X, Copy, Check, MapPin } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../api/client'

export default function Checkout() {
  const { cart, subtotal, refreshCart } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [settings, setSettings] = useState(null)
  const [address, setAddress] = useState({
    fullName: user?.name || '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const [deliveryStatus, setDeliveryStatus] = useState('checking') // checking | allowed | denied | error
  const [deliveryMsg, setDeliveryMsg] = useState('')

  const [paymentInfo, setPaymentInfo] = useState(null) // set after order placed for qr/upi
  const [upiRef, setUpiRef] = useState('')
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [copied, setCopied] = useState(false)

  const shippingPrice = subtotal > 499 ? 0 : 49
  const discount = appliedCoupon?.discount || 0
  const total = Math.max(subtotal + shippingPrice - discount, 0)

  useEffect(() => {
    api.get('/settings').then(setSettings).catch(() => {})
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setDeliveryStatus('error')
      setDeliveryMsg('Location access is not supported on this device.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await api.post('/check-delivery', {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
          setDeliveryStatus(data.allowed ? 'allowed' : 'denied')
          setDeliveryMsg(data.message)
        } catch (err) {
          setDeliveryStatus('error')
          setDeliveryMsg(err.message)
        }
      },
      () => {
        setDeliveryStatus('error')
        setDeliveryMsg('Location permission denied. Allow location access to check delivery availability.')
      }
    )
  }, [])

  function handleChange(e) {
    setAddress({ ...address, [e.target.name]: e.target.value })
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return
    setCouponError('')
    setApplyingCoupon(true)
    try {
      const data = await api.post('/coupons/validate', { code: couponInput.trim(), orderValue: subtotal }, true)
      setAppliedCoupon({ code: data.code, discount: data.discount })
    } catch (err) {
      setAppliedCoupon(null)
      setCouponError(err.message)
    } finally {
      setApplyingCoupon(false)
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponError('')
  }

  async function handlePlaceOrder(e) {
    e.preventDefault()
    setError('')
    setPlacing(true)
    try {
      const items = cart.items.map((i) => ({ product: i.product._id, qty: i.qty, size: i.size || undefined }))
      const data = await api.post(
        '/orders',
        { items, shippingAddress: address, couponCode: appliedCoupon?.code, paymentMethod },
        true
      )

      if (paymentMethod === 'cod') {
        showToast('Order placed successfully!')
        await refreshCart()
        navigate('/orders')
      } else {
        setPaymentInfo(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setPlacing(false)
    }
  }

  async function handleClaimPayment() {
    setClaiming(true)
    try {
      await api.put(`/orders/${paymentInfo.orderId}/claim-payment`, { upiRef }, true)
      await refreshCart()
      setClaimed(true)
      showToast('Payment claim sent!')
      setTimeout(() => navigate('/orders'), 1800)
    } catch (err) {
      setError(err.message)
    } finally {
      setClaiming(false)
    }
  }

  function copyUpiId() {
    navigator.clipboard.writeText(paymentInfo.upiId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (!cart.items || cart.items.length === 0) {
    return <main className="bg-luxe-bg min-h-[60vh] flex items-center justify-center text-slate-500">Cart is empty</main>
  }

  // ---- Payment confirmation screen (QR / UPI) ----
  if (paymentInfo) {
    return (
      <main className="bg-luxe-bg min-h-[70vh] font-sans">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-luxe-panel border border-gold/20 rounded-lg p-6 text-center">
            {claimed ? (
              <div className="py-8">
                <Check size={48} className="mx-auto text-green-400 mb-3" />
                <p className="text-slate-900 font-medium">Payment claim bhej diya gaya!</p>
                <p className="text-sm text-slate-500 mt-1">Redirecting to your orders...</p>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-medium text-slate-900 mb-1">Scan & Pay</h1>
                <p className="text-2xl font-bold text-gold mb-4">₹{paymentInfo.totalPrice.toLocaleString('en-IN')}</p>

                <img src={paymentInfo.qrCodeImage} alt="Payment QR" className="mx-auto mb-4 border border-gold/20 rounded" />

                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-sm text-slate-600">{paymentInfo.upiId}</span>
                  <button onClick={copyUpiId} className="text-gold hover:underline flex items-center gap-1 text-xs">
                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <a href={paymentInfo.upiLink} className="block mt-3 bg-gold hover:bg-gold-light text-white rounded-full py-2 text-sm font-medium">
                  Open in UPI App (mobile)
                </a>

                <div className="text-left mt-6 border-t border-gold/10 pt-4">
                  {error && <div className="bg-blush-from/10 border border-blush-from/30 text-blush-from text-sm px-3 py-2 rounded mb-2">{error}</div>}
                  <input
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                    placeholder="UPI transaction ref / UTR number (optional)"
                    className="w-full bg-[#481F72]/5 border border-gold/30 text-slate-900 rounded-sm px-2 py-1.5 text-sm mb-2"
                  />
                  <button
                    onClick={handleClaimPayment}
                    disabled={claiming}
                    className="w-full bg-gold hover:bg-gold-light text-white rounded-full py-2 text-sm font-medium disabled:opacity-60"
                  >
                    {claiming ? 'Sending...' : "I've Paid"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    )
  }

  const checkoutBlocked = deliveryStatus === 'denied'

  return (
    <main className="bg-luxe-bg min-h-[70vh] font-sans">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 py-6">
        <form onSubmit={handlePlaceOrder} className="lg:col-span-2 bg-luxe-panel border border-gold/20 p-5 rounded-lg space-y-3">
          {deliveryStatus === 'checking' && (
            <div className="bg-white/5 border border-gold/20 text-slate-600 text-sm px-3 py-2 rounded flex items-center gap-2">
              <MapPin size={14} className="text-gold" /> Checking delivery availability at your location...
            </div>
          )}
          {deliveryStatus === 'denied' && (
            <div className="bg-blush-from/10 border border-blush-from/30 text-blush-from text-sm px-3 py-2 rounded flex items-center gap-2">
              <MapPin size={14} /> {deliveryMsg}
            </div>
          )}
          {deliveryStatus === 'error' && (
            <div className="bg-gold/10 border border-gold/30 text-gold text-sm px-3 py-2 rounded flex items-center gap-2">
              <MapPin size={14} /> {deliveryMsg}
            </div>
          )}

          <h1 className="text-xl font-medium text-slate-900 mb-2">Shipping Address</h1>

          {error && <div className="bg-blush-from/10 border border-blush-from/30 text-blush-from text-sm px-3 py-2 rounded">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <input name="fullName" required placeholder="Full name" value={address.fullName} onChange={handleChange} className="bg-[#481F72]/5 border border-gold/30 text-slate-900 rounded-sm px-2 py-1.5 col-span-2" />
            <input name="phone" required placeholder="Phone number" value={address.phone} onChange={handleChange} className="bg-[#481F72]/5 border border-gold/30 text-slate-900 rounded-sm px-2 py-1.5 col-span-2" />
            <input name="line1" required placeholder="Address line 1" value={address.line1} onChange={handleChange} className="bg-[#481F72]/5 border border-gold/30 text-slate-900 rounded-sm px-2 py-1.5 col-span-2" />
            <input name="line2" placeholder="Address line 2 (optional)" value={address.line2} onChange={handleChange} className="bg-[#481F72]/5 border border-gold/30 text-slate-900 rounded-sm px-2 py-1.5 col-span-2" />
            <input name="city" required placeholder="City" value={address.city} onChange={handleChange} className="bg-[#481F72]/5 border border-gold/30 text-slate-900 rounded-sm px-2 py-1.5" />
            <input name="state" required placeholder="State" value={address.state} onChange={handleChange} className="bg-[#481F72]/5 border border-gold/30 text-slate-900 rounded-sm px-2 py-1.5" />
            <input name="pincode" required placeholder="Pincode" value={address.pincode} onChange={handleChange} className="bg-[#481F72]/5 border border-gold/30 text-slate-900 rounded-sm px-2 py-1.5 col-span-2" />
          </div>

          <div className="border-t border-gold/10 pt-3">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-1 mb-2">
              <Tag size={14} className="text-gold" /> Have a coupon?
            </label>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-md px-3 py-2 text-sm">
                <span className="text-green-400">"{appliedCoupon.code}" applied — saved ₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                <button type="button" onClick={removeCoupon}><X size={16} className="text-slate-500" /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="Enter coupon code" className="flex-1 bg-[#481F72]/5 border border-gold/30 text-slate-900 rounded-sm px-2 py-1.5 text-sm" />
                <button type="button" onClick={handleApplyCoupon} disabled={applyingCoupon} className="bg-white/5 hover:bg-gold/5 border border-gold/20 text-gold px-4 rounded-sm text-sm disabled:opacity-60">
                  {applyingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-blush-from mt-1">{couponError}</p>}
          </div>

          <div className="border-t border-gold/10 pt-3">
            <label className="text-sm font-medium text-slate-600 block mb-2">Payment Method</label>
            <div className="space-y-2">
              {settings?.qrUpiEnabled !== false && (
                <label className="flex items-center gap-2 bg-[#481F72]/5 border border-gold/20 rounded-md px-3 py-2 cursor-pointer">
                  <input type="radio" name="pm" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                  <span className="text-sm text-slate-700">UPI / QR Code (GPay, PhonePe, Paytm)</span>
                </label>
              )}
              {settings?.codEnabled !== false && (
                <label className="flex items-center gap-2 bg-[#481F72]/5 border border-gold/20 rounded-md px-3 py-2 cursor-pointer">
                  <input type="radio" name="pm" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  <span className="text-sm text-slate-700">Cash on Delivery</span>
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={placing || checkoutBlocked}
            className="w-full bg-gold hover:bg-gold-light rounded-full py-2 text-sm font-medium border border-gold/40 disabled:opacity-50"
          >
            {checkoutBlocked ? 'Delivery not available here' : placing ? 'Processing...' : paymentMethod === 'cod' ? `Place Order — ₹${total.toLocaleString('en-IN')}` : `Continue to Pay ₹${total.toLocaleString('en-IN')}`}
          </button>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gold/10">
            <div className="flex flex-col items-center gap-1 text-slate-500">
              <ShieldCheck size={18} className="text-gold" />
              <span className="text-[10px] text-center">Secure Ordering</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-slate-500">
              <Truck size={18} className="text-gold" />
              <span className="text-[10px] text-center">Local Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-slate-500">
              <RotateCcw size={18} className="text-gold" />
              <span className="text-[10px] text-center">Easy 7-Day Returns</span>
            </div>
          </div>
        </form>

        <div className="bg-luxe-panel border border-gold/20 p-5 rounded-lg h-fit space-y-2 text-sm">
          <h2 className="font-medium text-base mb-2 text-slate-900">Order Summary</h2>
          <div className="flex justify-between text-slate-600"><span>Items:</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between text-slate-600"><span>Shipping:</span><span>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span></div>
          {discount > 0 && <div className="flex justify-between text-green-400"><span>Coupon Discount:</span><span>-₹{discount.toLocaleString('en-IN')}</span></div>}
          <div className="flex justify-between font-bold text-blush-from border-t border-gold/10 pt-2">
            <span>Order Total:</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </main>
  )
}
