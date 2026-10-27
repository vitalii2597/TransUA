'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { AuthAside } from '@/components/auth/AuthAside';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';

type FormData = { password: string; confirm: string };

function ResetPasswordForm() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const { locale } = useParams<{ locale: string }>();
  const token = useSearchParams().get('token') ?? '';
  const router = useRouter();
  const toast = useToast();
  const [invalidLink, setInvalidLink] = useState(!token);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const schema = z
    .object({
      password: z.string().min(8, t('passwordMin')),
      confirm: z.string(),
    })
    .refine((d) => d.password === d.confirm, { message: t('passwordsMismatch'), path: ['confirm'] });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      toast(t('resetSuccess'), 'success');
      router.push(`/${locale}/login`);
    } catch (err: any) {
      if (err.response?.data?.error?.code === 'INVALID_RESET_TOKEN') setInvalidLink(true);
      else setError(tc('error'));
    }
  }

  if (invalidLink) {
    return (
      <div role="alert">
        <h1 className="font-display text-2xl font-semibold text-ink">{t('resetTitle')}</h1>
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {t('resetInvalid')}
        </div>
        <Button href={`/${locale}/forgot-password`} className="mt-6 w-full" size="lg">
          {t('requestNewLink')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-2xl font-semibold text-ink">{t('resetTitle')}</h1>
      <p className="mt-1.5 text-sm text-slate-500">{t('resetSubtitle')}</p>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Field label={t('newPassword')} htmlFor="password" error={errors.password?.message}>
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

        <Field label={t('confirmPassword')} htmlFor="confirm" error={errors.confirm?.message}>
          <Input
            id="confirm"
            type={showPwd ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('confirm')}
          />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? tc('loading') : t('setNewPassword')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link href={`/${locale}/login`} className="font-medium text-brand-600 hover:text-brand-700">
          {t('backToLogin')}
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations('auth');

  return (
    <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-2">
      <AuthAside title={t('asideTitle')} subtitle={t('asideSubtitle')} />

      <div className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          {/* useSearchParams needs a Suspense boundary to keep the page statically renderable */}
          <Suspense>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
