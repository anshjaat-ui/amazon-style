export default function PressReleases() {
  return (
    <main className="bg-luxe-bg min-h-[70vh] font-sans">
      <div className="max-w-3xl mx-auto px-4 py-10 bg-luxe-panel border border-gold/20 my-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-slate-900">Press Releases</h1>
        <div className="text-sm text-slate-500">
          <p>No press releases published yet. Check back soon for company news and updates.</p>
          <p className="mt-4">
            For media inquiries, please reach out via our
            <a href="/contact" className="text-gold hover:underline"> Contact Us</a> page.
          </p>
        </div>
      </div>
    </main>
  )
}
