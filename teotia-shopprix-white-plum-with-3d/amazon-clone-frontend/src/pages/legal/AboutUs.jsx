export default function AboutUs() {
  return (
    <main className="bg-luxe-bg min-h-[70vh] font-sans">
      <div className="max-w-3xl mx-auto px-4 py-10 bg-luxe-panel border border-gold/20 my-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-slate-900">About Teotia Shopprix</h1>
        <div className="space-y-4 text-sm text-slate-600">
          <p>
            Teotia Shopprix is an online shopping destination bringing together electronics,
            fashion, home & kitchen essentials, and more — all under one roof, with a focus on
            quality, fast delivery, and a smooth shopping experience.
          </p>
          <p>
            We started with a simple idea: shopping online should feel premium, trustworthy, and
            effortless. From browsing to checkout to delivery, every step is designed with our
            customers in mind.
          </p>
          <p>
            Have questions or feedback? We'd love to hear from you — visit our
            <a href="/contact" className="text-gold hover:underline"> Contact Us</a> page.
          </p>
        </div>
      </div>
    </main>
  )
}
