import { LegalPage } from '@/components/legal/LegalPage';

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="Last updated: March 2026"
      sections={[
        {
          heading: '1. Data We Collect',
          body: 'We collect your name, email address, phone number, and preferred language when you register. When you book a trip or send a parcel, we also store booking details, addresses, and payment method (cash only).',
        },
        {
          heading: '2. How We Use Your Data',
          body: 'Your data is used solely to provide the TransUA service — booking trips, processing parcel orders, and communicating with you about your bookings. We do not sell your data to third parties.',
        },
        {
          heading: '3. Data Retention',
          body: 'We retain your account data for as long as your account is active. You may delete your account at any time from your dashboard, which will permanently remove all personal data associated with your account.',
        },
        {
          heading: '4. Your Rights (GDPR)',
          body: 'You have the right to access, correct, or delete your personal data. You may also request a copy of your data or restrict its processing. To exercise these rights, contact us at privacy@transua.no.',
        },
        {
          heading: '5. Cookies',
          body: 'We use only essential cookies necessary for authentication (access token and refresh token). We do not use tracking or advertising cookies.',
        },
        {
          heading: '6. Contact',
          body: 'TransUA · Oslo, Norway · privacy@transua.no',
        },
      ]}
    />
  );
}
