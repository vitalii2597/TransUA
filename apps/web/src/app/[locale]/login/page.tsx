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
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setError('');
    try {
      const res = await api.post('/auth/login', data);
      setTokens(res.data.data.accessToken, res.data.data.refreshToken);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      setError(code === 'INVALID_CREDENTIALS' ? t('invalidCredentials') : tc('error'));
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-2">
      <AuthAside title={t('asideTitle')} subtitle={t('asideSubtitle')} />

      <div className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-ink">{t('loginTitle')}</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {t('noAccount')}{' '}
            <Link href={`/${locale}/register`} className="font-medium text-brand-600 hover:text-brand-700">
              {t('register')}
            </Link>
          </p>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <Field label={t('email')} htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
            </Field>

            <Field label={t('password')} htmlFor="password" error={errors.password?.message}>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
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

            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? tc('loading') : t('login')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
