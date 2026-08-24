import { Mail } from 'lucide-react'

export default function Affiliate() {
  return (
    <main className="bg-luxe-bg min-h-[70vh] font-sans">
      <div className="max-w-3xl mx-auto px-4 py-10 bg-luxe-panel border border-gold/20 my-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-slate-900">Become an Affiliate</h1>
        <div className="space-y-4 text-sm text-slate-600">
          <p>
            Earn commission by promoting Teotia Shopprix products on your blog, YouTube channel,
            or social media. Share your unique link, and earn a percentage on every sale you refer.
          </p>
          <p>Interested in joining our affiliate program? Reach out to us:</p>
          <a
            href="mailto:affiliates@teotiashopprix.com"
            className="inline-flex items-center gap-2 text-gold hover:underline"
          >
            <Mail size={16} /> affiliates@teotiashopprix.com
          </a>
        </div>
      </div>
    </main>
  )
}
