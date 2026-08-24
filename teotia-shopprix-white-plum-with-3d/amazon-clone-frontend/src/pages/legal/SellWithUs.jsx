import { Mail } from 'lucide-react'

export default function SellWithUs() {
  return (
    <main className="bg-luxe-bg min-h-[70vh] font-sans">
      <div className="max-w-3xl mx-auto px-4 py-10 bg-luxe-panel border border-gold/20 my-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-slate-900">Sell on Teotia Shopprix</h1>
        <div className="space-y-4 text-sm text-slate-600">
          <p>
            Are you a manufacturer, wholesaler, or brand looking to reach more customers? Partner
            with Teotia Shopprix and grow your business online.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>Wide customer reach across categories</li>
            <li>Simple onboarding and product listing support</li>
            <li>Secure, fast payments</li>
          </ul>
          <p>Interested in becoming a seller? Reach out to us:</p>
          <a
            href="mailto:sellers@teotiashopprix.com"
            className="inline-flex items-center gap-2 text-gold hover:underline"
          >
            <Mail size={16} /> sellers@teotiashopprix.com
          </a>
        </div>
      </div>
    </main>
  )
}
