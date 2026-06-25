import { APIRequestContext, BrowserContext } from '@playwright/test';

const API = 'http://localhost:3001/api';

export async function registerUser(request: APIRequestContext, overrides: Record<string, string> = {}) {
  const email = overrides.email ?? `e2e_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@test.com`;
  const res = await request.post(`${API}/auth/register`, {
    data: {
      firstName: 'Test',
      lastName: 'User',
      phone: '+380991234567',
      email,
      password: 'TestPass123!',
      preferredLang: 'uk',
      ...overrides,
    },
  });
  const body = await res.json();
  return { email, accessToken: body.data?.accessToken as string | undefined };
}

export async function loginUser(request: APIRequestContext, email: string, password = 'TestPass123!') {
  const res = await request.post(`${API}/auth/login`, {
    data: { email, password },
  });
  const body = await res.json();
  return body.data?.accessToken as string | undefined;
}

export async function setAuthCookie(context: BrowserContext, accessToken: string) {
  // addCookies: makes the cookie visible to server-side middleware (HTTP Cookie header).
  await context.addCookies([
    { name: 'accessToken', value: accessToken, domain: 'localhost', path: '/', sameSite: 'Lax' },
  ]);
  // addInitScript: sets the cookie via document.cookie before any page JS runs so that
  // client-side js-cookie reads (isAuthenticated()) see it during useEffect.
  await context.addInitScript(({ name, value }) => {
    document.cookie = `${name}=${value}; path=/; samesite=lax`;
  }, { name: 'accessToken', value: accessToken });
}
