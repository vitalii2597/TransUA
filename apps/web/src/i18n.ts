import { getRequestConfig, requestLocale } from 'next-intl/server';

export default getRequestConfig(async (request) => {
  // Use the new requestLocale helper instead of the deprecated locale parameter
  const locale = await requestLocale(request);
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
