'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import { setTokens } from '@/lib/auth';
import { AuthAside } from '@/components/auth/AuthAside';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';

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

const selectCls =
  'h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-ink ' +
  'transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30';

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
    <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-2">
      <AuthAside title={t('asideTitle')} subtitle={t('asideSubtitle')} />

      <div className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-ink">{t('registerTitle')}</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {t('hasAccount')}{' '}
            <Link href={`/${locale}/login`} className="font-medium text-brand-600 hover:text-brand-700">
              {t('login')}
            </Link>
          </p>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('firstName')} htmlFor="firstName" error={errors.firstName?.message}>
                <Input id="firstName" autoComplete="given-name" {...register('firstName')} />
              </Field>
              <Field label={t('lastName')} htmlFor="lastName" error={errors.lastName?.message}>
                <Input id="lastName" autoComplete="family-name" {...register('lastName')} />
              </Field>
            </div>

            <Field label={t('phone')} htmlFor="phone" error={errors.phone?.message}>
              <Input id="phone" type="tel" autoComplete="tel" {...register('phone')} />
            </Field>

            <Field label={t('email')} htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
            </Field>

            <Field label={t('password')} htmlFor="password" error={errors.password?.message}>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="pr-11"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? t('hidePassword') : t('showPassword')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Field label={t('language')} htmlFor="preferredLang">
              <select id="preferredLang" className={selectCls} {...register('preferredLang')}>
                <option value="uk">🇺🇦 Українська</option>
                <option value="no">🇳🇴 Norsk</option>
                <option value="sv">🇸🇪 Svenska</option>
                <option value="pl">🇵🇱 Polski</option>
              </select>
            </Field>

            <div>
              <div className="flex items-start gap-2.5">
                <input
                  {...register('tosAccepted')}
                  type="checkbox"
                  id="tosAccepted"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-600"
                />
                <label htmlFor="tosAccepted" className="text-sm text-slate-600">
                  {t('agreeToTerms')}{' '}
                  <Link href={`/${locale}/terms`} className="text-brand-600 underline hover:text-brand-700" target="_blank">
                    {t('termsLink')}
                  </Link>
                </label>
              </div>
              {errors.tosAccepted && <p className="mt-1.5 text-xs text-red-600">{errors.tosAccepted.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? tc('loading') : t('register')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
