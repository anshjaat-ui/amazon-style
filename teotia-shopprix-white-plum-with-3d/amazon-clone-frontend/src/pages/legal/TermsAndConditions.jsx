export default function TermsAndConditions() {
  return (
    <main className="bg-luxe-bg min-h-[70vh] font-sans">
      <div className="max-w-3xl mx-auto px-4 py-10 bg-luxe-panel border border-gold/20 my-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-slate-900">Terms and Conditions</h1>
        <p className="text-sm text-slate-500 mb-6">Last updated: {new Date().toLocaleDateString('en-IN')}</p>

        <div className="space-y-4 text-sm text-slate-600">
          <p>By accessing and using Teotia Shopprix, you agree to be bound by these Terms and Conditions.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Use of the Website</h2>
          <p>You must be at least 18 years old, or have parental consent, to make purchases on this website. You agree to provide accurate and complete information when creating an account or placing an order.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Product Listings</h2>
          <p>We strive to display accurate product information, including descriptions, pricing, and availability. However, errors may occur, and we reserve the right to correct any errors and to cancel orders arising from such errors.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Pricing and Payment</h2>
          <p>All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. Payment is processed securely through Razorpay. Orders are confirmed only after successful payment verification.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Order Cancellation</h2>
          <p>We reserve the right to cancel any order due to stock unavailability, pricing errors, or suspected fraudulent activity. In such cases, a full refund will be issued.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Limitation of Liability</h2>
          <p>Teotia Shopprix shall not be liable for any indirect, incidental, or consequential damages arising from the use of this website or products purchased through it.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of the courts in India.</p>

          <h2 className="font-bold text-base mt-6 text-gold">Changes to Terms</h2>
          <p>We may update these terms from time to time. Continued use of the website after changes constitutes acceptance of the updated terms.</p>
        </div>
      </div>
    </main>
  )
}
