import { Mail } from 'lucide-react'

export default function Careers() {
  return (
    <main className="bg-luxe-bg min-h-[70vh] font-sans">
      <div className="max-w-3xl mx-auto px-4 py-10 bg-luxe-panel border border-gold/20 my-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-slate-900">Careers at Teotia Shopprix</h1>
        <div className="space-y-4 text-sm text-slate-600">
          <p>
            We're building something exciting, and we're always open to hearing from talented
            people who want to be part of it.
          </p>
          <p>
            There are no open positions listed right now, but if you'd like to introduce yourself
            and share your resume for future opportunities, we'd be happy to hear from you.
          </p>
          <a
            href="mailto:careers@teotiashopprix.com"
            className="inline-flex items-center gap-2 text-gold hover:underline"
          >
            <Mail size={16} /> careers@teotiashopprix.com
          </a>
        </div>
      </div>
    </main>
  )
}
