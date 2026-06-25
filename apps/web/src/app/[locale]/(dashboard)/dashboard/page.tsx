'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { removeTokens } from '@/lib/auth';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  preferredLang: string;
}

export default function DashboardPage() {
  const tc = useTranslations('common');
  const tn = useTranslations('nav');
  const ta = useTranslations('auth');
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api.get('/users/me')
      .then((res) => setUser(res.data.data))
      .catch(() => router.replace(`/${locale}/login`));
  }, [locale, router]);

  function handleLogout() {
    removeTokens();
    router.push(`/${locale}/login`);
  }

  if (!user) {
    return <div className="p-8 text-center text-gray-500">{tc('loading')}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{tc('welcome')}, {user.firstName}!</h1>
            <p className="text-gray-500 mt-1">{user.email}</p>
          </div>
          <span className="px-3 py-1 bg-fjord-100 text-fjord-800 rounded-full text-sm font-medium">{user.role}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {([
            [ta('firstName'), user.firstName],
            [ta('lastName'), user.lastName],
            [ta('phone'), user.phone],
            [ta('language'), user.preferredLang.toUpperCase()],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
              <p className="font-medium text-gray-800">{value}</p>
            </div>
          ))}
        </div>
        <button onClick={handleLogout} className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition">
          {tn('logout')}
        </button>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => router.push(`/${locale}/bookings`)}
          className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4 hover:shadow-lg transition group text-left">
          <div className="w-12 h-12 bg-fjord-100 rounded-xl flex items-center justify-center text-2xl shrink-0">🎫</div>
          <div>
            <p className="font-semibold text-gray-800 group-hover:text-fjord-700 transition">{tn('bookings')}</p>
            <p className="text-sm text-gray-400">{tc('viewTickets')}</p>
          </div>
        </button>
        <button onClick={() => router.push(`/${locale}/trips`)}
          className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4 hover:shadow-lg transition group text-left">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl shrink-0">🚌</div>
          <div>
            <p className="font-semibold text-gray-800 group-hover:text-green-700 transition">{tn('trips')}</p>
            <p className="text-sm text-gray-400">{tc('findTrip')}</p>
          </div>
        </button>
      </div>
    </div>
  );
}
