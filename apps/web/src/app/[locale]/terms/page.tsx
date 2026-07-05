import { LegalPage } from '@/components/legal/LegalPage';

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="Last updated: March 2026"
      sections={[
        {
          heading: '1. Service',
          body: 'TransUA provides an online platform for booking bus trips and sending parcels between Ukraine and Scandinavia (Norway and Sweden). We act as an intermediary between passengers and carriers.',
        },
        {
          heading: '2. Bookings',
          body: 'Bookings are confirmed upon submission. Payment is made in cash directly to the driver. Cancellations can be made through your account dashboard. No refunds are issued for cash payments in the current version.',
        },
        {
          heading: '3. Parcels',
          body: 'Parcel orders are subject to a maximum weight of 50 kg. Prices are calculated automatically based on weight and destination. Payment is collected on pickup. TransUA is not liable for prohibited or undeclared items.',
        },
        {
          heading: '4. Liability',
          body: 'TransUA is not liable for delays, cancellations, or losses caused by force majeure, border closures, or circumstances beyond our control. Maximum liability is limited to the price paid for the booking or parcel.',
        },
        {
          heading: '5. Account',
          body: 'You are responsible for maintaining the security of your account credentials. You may delete your account at any time. We reserve the right to suspend accounts that violate these terms.',
        },
        {
          heading: '6. Governing Law',
          body: 'These terms are governed by Norwegian law. Disputes shall be resolved in the courts of Oslo, Norway.',
        },
        {
          heading: '7. Contact',
          body: 'TransUA · Oslo, Norway · support@transua.no',
        },
      ]}
    />
  );
}
