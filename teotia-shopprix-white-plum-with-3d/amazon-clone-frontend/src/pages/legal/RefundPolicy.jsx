export default function RefundPolicy() {
  return (
    <main className="bg-luxe-bg min-h-[70vh] font-sans">
      <div className="max-w-3xl mx-auto px-4 py-10 bg-luxe-panel border border-gold/20 my-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-slate-900">Refund & Return Policy</h1>
        <p className="text-sm text-slate-500 mb-6">Last updated: {new Date().toLocaleDateString('en-IN')}</p>

        <div className="space-y-4 text-sm text-slate-600">
          <h2 className="font-bold text-base mt-6 text-gold">Returns</h2>
          <p>We accept returns within 7 days of delivery for most items, provided the product is unused, undamaged, and in its original packaging with all tags attached.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Non-Returnable Items</h2>
          <p>Certain items such as perishable goods, personal care products, and items marked "non-returnable" at the time of purchase cannot be returned.</p>

          <h2 className="font-bold text-base mt-6 text-gold">How to Request a Return</h2>
          <p>To initiate a return, please contact our support team via the Contact Us page with your order number and reason for return. We will guide you through the pickup or drop-off process.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Refunds</h2>
          <p>Once we receive and inspect the returned item, we will process your refund within 5-7 business days. Refunds are issued to the original payment method used at checkout via Razorpay.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Damaged or Defective Items</h2>
          <p>If you receive a damaged or defective product, please contact us within 48 hours of delivery with photos of the issue, and we will arrange a replacement or full refund at no additional cost.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Order Cancellations</h2>
          <p>Orders can be cancelled before they are shipped. Once shipped, the order must be returned following the standard return process above.</p>
        </div>
      </div>
    </main>
  )
}
