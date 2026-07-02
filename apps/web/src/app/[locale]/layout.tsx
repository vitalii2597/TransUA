import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import '../globals.css';
import { Inter, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], display: 'swap', variable: '--font-display' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono' });
const fontVars = `${inter.variable} ${bricolage.variable} ${jetbrains.variable}`;

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
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
    <html lang={locale} className={fontVars}>
      <head>
        <meta name="description" content={metadata.description ?? ''} />
        <meta property="og:title" content={(metadata.title as string) ?? 'TransUA'} />
        <meta property="og:description" content={metadata.description ?? ''} />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-screen flex flex-col overflow-x-clip bg-white text-ink antialiased">
        <NextIntlClientProvider messages={messages}>
          <NextTopLoader color="#2563eb" height={2} showSpinner={false} />
          <ToastProvider>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
            <Navbar />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
            <CookieBanner />
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
