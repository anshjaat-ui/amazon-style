export default function PrivacyPolicy() {
  return (
    <main className="bg-luxe-bg min-h-[70vh] font-sans">
      <div className="max-w-3xl mx-auto px-4 py-10 bg-luxe-panel border border-gold/20 my-6 rounded-lg prose">
        <h1 className="text-2xl font-bold mb-4 text-slate-900">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-6">Last updated: {new Date().toLocaleDateString('en-IN')}</p>

        <div className="space-y-4 text-sm text-slate-600">
          <p>Teotia Shopprix ("we", "us", "our") is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Information We Collect</h2>
          <p>When you create an account, place an order, or contact us, we collect: your name, email address, phone number, shipping address, and order history. Payment details are processed directly by our payment partner (Razorpay) — we do not store your card or bank details.</p>

          <h2 className="font-bold text-base mt-6 text-gold">How We Use Your Information</h2>
          <p>We use your information to process orders, communicate order updates, provide customer support, and improve our services. We do not sell your personal information to third parties.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Data Security</h2>
          <p>We use industry-standard measures, including password hashing and secure connections (HTTPS), to protect your data. However, no method of transmission over the internet is 100% secure.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Cookies</h2>
          <p>We use browser local storage to keep you signed in and remember your cart. We do not use tracking cookies for advertising purposes.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data by contacting us at the email below.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Contact Us</h2>
          <p>For any privacy-related questions, please reach out via our Contact Us page.</p>
        </div>
      </div>
    </main>
  )
}
