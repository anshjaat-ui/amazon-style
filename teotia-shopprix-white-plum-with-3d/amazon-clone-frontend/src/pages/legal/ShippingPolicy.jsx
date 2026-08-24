export default function ShippingPolicy() {
  return (
    <main className="bg-luxe-bg min-h-[70vh] font-sans">
      <div className="max-w-3xl mx-auto px-4 py-10 bg-luxe-panel border border-gold/20 my-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-slate-900">Shipping Policy</h1>
        <p className="text-sm text-slate-500 mb-6">Last updated: {new Date().toLocaleDateString('en-IN')}</p>

        <div className="space-y-4 text-sm text-slate-600">
          <h2 className="font-bold text-base mt-6 text-gold">Delivery Areas</h2>
          <p>We currently ship to most serviceable pin codes across India. Delivery availability will be confirmed at checkout based on your address.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Shipping Charges</h2>
          <p>Orders above ₹499 qualify for free shipping. Orders below this amount incur a flat shipping fee of ₹49.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Delivery Timelines</h2>
          <p>Most orders are delivered within 3-7 business days, depending on your location. You will receive order status updates via your account's Orders page.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Order Tracking</h2>
          <p>You can check the current status of your order (Processing, Shipped, Delivered) anytime from the "Your Orders" section of your account.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Delays</h2>
          <p>While we aim to deliver within the estimated timelines, delays may occur due to weather, courier issues, or circumstances beyond our control. We appreciate your patience in such cases.</p>
        </div>
      </div>
    </main>
  )
}
