import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Can be imported from a shared config
const locales = ['ar', 'en'];

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  const validLocale = locales.includes(locale as any) ? locale : 'ar';
  
  // If locale is completely invalid (not ar or en), show 404
  if (!locale || (locale !== 'ar' && locale !== 'en' && locale.length < 10)) {
    // Only 404 for clearly invalid locales, default to ar for unknown
  }

  try {
    const messages = (await import(`../../messages/${validLocale}.json`)).default;
    return {
      locale: validLocale as string,
      messages
    };
  } catch (e) {
    console.error(`Failed to load messages for locale: ${validLocale}`, e);
    // Fallback to empty messages rather than crashing
    return {
      locale: 'ar',
      messages: {}
    };
  }
});
