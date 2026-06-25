import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import '../globals.css';
import Navbar from '@/components/layout/Navbar';
import CookieBanner from '@/components/CookieBanner';
import { ToastProvider } from '@/components/Toast';
import NextTopLoader from 'nextjs-toploader';

const locales = ['uk', 'no', 'sv', 'pl'];

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'TransUA — Ukraine ↔ Norway / Sweden',
  description: 'Book bus trips and send parcels between Ukraine and Scandinavia. Routes: Kyiv → Oslo, Lviv → Stockholm, Odessa → Bergen.',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: 'TransUA — Ukraine ↔ Norway / Sweden',
    description: 'Book bus trips and send parcels between Ukraine and Scandinavia.',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'TransUA',
  description: 'Bus trips and parcel delivery between Ukraine and Scandinavia',
  url: BASE_URL,
  areaServed: ['Ukraine', 'Norway', 'Sweden'],
  availableLanguage: ['Ukrainian', 'Norwegian', 'Swedish', 'Polish'],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={(metadata.title as string) ?? 'TransUA'} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-screen" style={{ backgroundColor: '#f4f7fb' }}>
        <NextIntlClientProvider messages={messages}>
          <NextTopLoader color="#f59e0b" height={3} showSpinner={false} />
          <ToastProvider>
            <Navbar />
            <main>{children}</main>
            <CookieBanner />
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
