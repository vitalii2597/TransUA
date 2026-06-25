export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 prose prose-gray">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Terms of Service</h1>
      <p className="text-gray-500 text-sm mb-8">Last updated: March 2026</p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">1. Service</h2>
        <p className="text-gray-600 leading-relaxed">TransUA provides an online platform for booking bus trips and sending parcels between Ukraine and Scandinavia (Norway and Sweden). We act as an intermediary between passengers and carriers.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">2. Bookings</h2>
        <p className="text-gray-600 leading-relaxed">Bookings are confirmed upon submission. Payment is made in cash directly to the driver. Cancellations can be made through your account dashboard. No refunds are issued for cash payments in the current version.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">3. Parcels</h2>
        <p className="text-gray-600 leading-relaxed">Parcel orders are subject to a maximum weight of 50 kg. Prices are calculated automatically based on weight and destination. Payment is collected on pickup. TransUA is not liable for prohibited or undeclared items.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">4. Liability</h2>
        <p className="text-gray-600 leading-relaxed">TransUA is not liable for delays, cancellations, or losses caused by force majeure, border closures, or circumstances beyond our control. Maximum liability is limited to the price paid for the booking or parcel.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">5. Account</h2>
        <p className="text-gray-600 leading-relaxed">You are responsible for maintaining the security of your account credentials. You may delete your account at any time. We reserve the right to suspend accounts that violate these terms.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">6. Governing Law</h2>
        <p className="text-gray-600 leading-relaxed">These terms are governed by Norwegian law. Disputes shall be resolved in the courts of Oslo, Norway.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">7. Contact</h2>
        <p className="text-gray-600 leading-relaxed">TransUA · Oslo, Norway · support@transua.no</p>
      </section>
    </div>
  );
}
