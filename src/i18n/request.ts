import {getRequestConfig} from 'next-intl/server';

// Static imports - guaranteed to work in production builds
const messageLoaders: Record<string, () => Promise<any>> = {
  ar: () => import('../../messages/ar.json').then(m => m.default),
  en: () => import('../../messages/en.json').then(m => m.default),
};

const locales = ['ar', 'en'];

export default getRequestConfig(async ({locale}) => {
  // Validate locale - fallback to 'ar' if invalid
  const validLocale = locale && locales.includes(locale) ? locale : 'ar';

  try {
    const loader = messageLoaders[validLocale];
    if (!loader) {
      console.error(`No message loader for locale: ${validLocale}`);
      const arMessages = await messageLoaders['ar']();
      return { locale: 'ar', messages: arMessages };
    }

    const messages = await loader();
    console.log(`[i18n] Loaded messages for locale: ${validLocale}`);
    return {
      locale: validLocale,
      messages
    };
  } catch (e) {
    console.error(`[i18n] Failed to load messages for: ${validLocale}`, e);
    try {
      const arMessages = await messageLoaders['ar']();
      return { locale: 'ar', messages: arMessages };
    } catch {
      return { locale: 'ar', messages: {} };
    }
  }
});
