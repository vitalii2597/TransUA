import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const used = locale || 'uk';
  return {
    messages: (await import(`./messages/${used}.json`)).default,
  };
});
