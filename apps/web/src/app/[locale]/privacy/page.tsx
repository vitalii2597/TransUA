export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 prose prose-gray">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Privacy Policy</h1>
      <p className="text-gray-500 text-sm mb-8">Last updated: March 2026</p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">1. Data We Collect</h2>
        <p className="text-gray-600 leading-relaxed">We collect your name, email address, phone number, and preferred language when you register. When you book a trip or send a parcel, we also store booking details, addresses, and payment method (cash only).</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">2. How We Use Your Data</h2>
        <p className="text-gray-600 leading-relaxed">Your data is used solely to provide the TransUA service — booking trips, processing parcel orders, and communicating with you about your bookings. We do not sell your data to third parties.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">3. Data Retention</h2>
        <p className="text-gray-600 leading-relaxed">We retain your account data for as long as your account is active. You may delete your account at any time from your dashboard, which will permanently remove all personal data associated with your account.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">4. Your Rights (GDPR)</h2>
        <p className="text-gray-600 leading-relaxed">You have the right to access, correct, or delete your personal data. You may also request a copy of your data or restrict its processing. To exercise these rights, contact us at privacy@transua.no.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">5. Cookies</h2>
        <p className="text-gray-600 leading-relaxed">We use only essential cookies necessary for authentication (access token and refresh token). We do not use tracking or advertising cookies.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">6. Contact</h2>
        <p className="text-gray-600 leading-relaxed">TransUA · Oslo, Norway · privacy@transua.no</p>
      </section>
    </div>
  );
}
