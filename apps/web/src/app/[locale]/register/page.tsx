'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setTokens } from '@/lib/auth';

const schema = z.object({
  firstName: z.string().min(1, 'Required').max(50, 'Max 50 characters'),
  lastName: z.string().min(1, 'Required').max(50, 'Max 50 characters'),
  phone: z.string().regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number (e.g. +380123456789)'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
  preferredLang: z.enum(['uk', 'no', 'sv', 'pl']),
  tosAccepted: z.boolean().refine((v) => v === true, { message: 'You must accept the terms of service' }),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferredLang: (locale as any) || 'uk', tosAccepted: false },
  });

  async function onSubmit(data: FormData) {
    setError('');
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tosAccepted, ...payload } = data;
      const res = await api.post('/auth/register', payload);
      setTokens(res.data.data.accessToken, res.data.data.refreshToken);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      setError(code === 'EMAIL_TAKEN' ? t('emailTaken') : tc('error'));
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('registerTitle')}</h1>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('firstName')}</label>
              <input {...register('firstName')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fjord-500" />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('lastName')}</label>
              <input {...register('lastName')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fjord-500" />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
            <input {...register('phone')} type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fjord-500" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <input {...register('email')} type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fjord-500" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPwd ? 'text' : 'password'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-20 focus:outline-none focus:ring-2 focus:ring-fjord-500"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
              >
                {showPwd ? t('hidePassword') : t('showPassword')}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('language')}</label>
            <select {...register('preferredLang')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fjord-500">
              <option value="uk">🇺🇦 Українська</option>
              <option value="no">🇳🇴 Norsk</option>
              <option value="sv">🇸🇪 Svenska</option>
              <option value="pl">🇵🇱 Polski</option>
            </select>
          </div>
          <div className="flex items-start gap-2">
            <input
              {...register('tosAccepted')}
              type="checkbox"
              id="tosAccepted"
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-fjord-800"
            />
            <label htmlFor="tosAccepted" className="text-sm text-gray-600">
              {t('agreeToTerms')}{' '}
              <Link href={`/${locale}/terms`} className="text-fjord-700 underline" target="_blank">
                {t('termsLink')}
              </Link>
            </label>
          </div>
          {errors.tosAccepted && <p className="text-red-500 text-xs -mt-2">{errors.tosAccepted.message}</p>}
          <button type="submit" disabled={isSubmitting} className="w-full bg-fjord-800 text-white py-2.5 rounded-lg font-semibold hover:bg-fjord-900 transition disabled:opacity-60">
            {isSubmitting ? tc('loading') : t('register')}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-500 text-center">
          {t('hasAccount')}{' '}
          <Link href={`/${locale}/login`} className="text-fjord-700 font-medium hover:underline">{t('login')}</Link>
        </p>
      </div>
    </div>
  );
}
