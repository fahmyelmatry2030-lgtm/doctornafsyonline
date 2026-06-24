import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['ar', 'en'],

  // Used when no locale matches
  defaultLocale: 'ar',
  
  // localePrefix 'as-needed' = Arabic uses /, English uses /en
  localePrefix: 'as-needed'
});

export const config = {
  // Match all routes including /en and /ar without subpath
  matcher: [
    '/',
    '/(ar|en)',
    '/(ar|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
