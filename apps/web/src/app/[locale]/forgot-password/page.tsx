'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MailCheck } from 'lucide-react';
import api from '@/lib/api';
import { AuthAside } from '@/components/auth/AuthAside';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const { locale } = useParams<{ locale: string }>();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setError('');
    try {
      await api.post('/auth/forgot-password', { ...data, locale });
      setSent(true);
    } catch {
      setError(tc('error'));
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-2">
      <AuthAside title={t('asideTitle')} subtitle={t('asideSubtitle')} />

      <div className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          {sent ? (
            <div role="status">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <MailCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <h1 className="mt-4 font-display text-2xl font-semibold text-ink">{t('resetSentTitle')}</h1>
              <p className="mt-2 text-sm text-slate-600">{t('resetSentText')}</p>
              <Button href={`/${locale}/login`} variant="secondary" className="mt-6 w-full" size="lg">
                {t('backToLogin')}
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold text-ink">{t('forgotTitle')}</h1>
              <p className="mt-1.5 text-sm text-slate-500">{t('forgotSubtitle')}</p>

              {error && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <Field label={t('email')} htmlFor="email" error={errors.email?.message}>
                  <Input id="email" type="email" autoComplete="email" {...register('email')} />
                </Field>

                <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                  {isSubmitting ? tc('loading') : t('sendResetLink')}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm">
                <Link href={`/${locale}/login`} className="font-medium text-brand-600 hover:text-brand-700">
                  {t('backToLogin')}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
