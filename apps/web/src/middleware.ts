import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['uk', 'no', 'sv', 'pl'],
  defaultLocale: 'uk',
});

const protectedPaths = ['/dashboard', '/profile'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localeStripped = pathname.replace(/^\/(uk|no|sv|pl)/, '') || '/';

  if (protectedPaths.some((p) => localeStripped.startsWith(p))) {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      const locale = pathname.match(/^\/(uk|no|sv|pl)/)?.[1] || 'uk';
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
