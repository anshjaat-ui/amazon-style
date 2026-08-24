import { useEffect, useState } from 'react'
import { api } from '../api/client'
import OrderTracker from '../components/OrderTracker'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/my', true).then(setOrders).finally(() => setLoading(false))
  }, [])

  if (loading) return <main className="bg-luxe-bg min-h-[60vh] flex items-center justify-center text-slate-500">Loading orders...</main>

  if (orders.length === 0) {
    return <main className="bg-luxe-bg min-h-[60vh] flex items-center justify-center text-slate-500">You have no orders yet.</main>
  }

  return (
    <main className="bg-luxe-bg min-h-[70vh] font-sans max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-medium mb-4 text-slate-900">Your Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-luxe-panel border border-gold/20 rounded-lg p-4">
            <div className="flex justify-between text-sm text-slate-500 border-b border-gold/10 pb-2 mb-2">
              <span>Order #{order._id.slice(-8)}</span>
              <span className={order.isPaid ? 'text-green-500' : 'text-blush-from'}>
                {order.isPaid ? 'Paid' : 'Payment pending'}
              </span>
            </div>

            {order.isPaid && <OrderTracker status={order.status} />}

            {order.items.map((item) => (
              <div key={item.product} className="flex justify-between text-sm py-1 text-slate-600">
                <span>{item.name} × {item.qty}</span>
                <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
              </div>
            ))}

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm py-1 text-green-400">
                <span>Coupon ({order.couponCode})</span>
                <span>-₹{order.discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-sm border-t border-gold/10 pt-2 mt-2 text-slate-900">
              <span>Total</span>
              <span>₹{order.totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
