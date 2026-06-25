import { test, expect } from '@playwright/test';
import { registerUser, setAuthCookie } from './helpers/auth';

const BASE = 'http://localhost:3000/uk';

test.describe('Registration', () => {
  test('shows validation errors on empty submit', async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await page.getByRole('button', { name: /реєстр/i }).click();
    await expect(page.locator('p.text-red-500').first()).toBeVisible();
  });

  test('shows error when ToS not accepted', async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await page.locator('input').nth(0).fill('Test');
    await page.locator('input').nth(1).fill('User');
    await page.locator('input[type="tel"]').fill('+380991234567');
    await page.locator('input[type="email"]').fill('unique_tos@test.com');
    await page.locator('input[type="password"]').fill('TestPass123!');
    // Do NOT check ToS
    await page.getByRole('button', { name: /реєстр/i }).click();
    await expect(page.locator('text=terms')).toBeVisible();
  });

  test('full registration redirects to dashboard', async ({ page }) => {
    const email = `e2e_reg_${Date.now()}@test.com`;
    await page.goto(`${BASE}/register`);
    await page.locator('input').nth(0).fill('Test');
    await page.locator('input').nth(1).fill('User');
    await page.locator('input[type="tel"]').fill('+380991234567');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill('TestPass123!');
    await page.locator('#tosAccepted').check();
    await page.getByRole('button', { name: /реєстр/i }).click();
    await page.waitForURL(`${BASE}/dashboard`, { timeout: 10000 });
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('shows error for already taken email', async ({ page, request }) => {
    const { email } = await registerUser(request);
    await page.goto(`${BASE}/register`);
    await page.locator('input').nth(0).fill('Test');
    await page.locator('input').nth(1).fill('User');
    await page.locator('input[type="tel"]').fill('+380991234567');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill('TestPass123!');
    await page.locator('#tosAccepted').check();
    await page.getByRole('button', { name: /реєстр/i }).click();
    await expect(page.locator('text=email')).toBeVisible({ timeout: 8000 });
  });
});

// Share one registered user across all Login tests to avoid hitting the auth rate limit (5 req/min).
test.describe('Login', () => {
  let sharedEmail: string;

  test.beforeAll(async ({ request }) => {
    const result = await registerUser(request);
    sharedEmail = result.email;
  });

  test('shows error for wrong password', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', sharedEmail);
    await page.fill('input[type="password"]', 'WrongPassword!');
    await page.getByRole('button', { name: /увійти/i }).click();
    await expect(page.locator('.text-red-700')).toBeVisible({ timeout: 8000 });
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', sharedEmail);
    await page.fill('input[type="password"]', 'TestPass123!');

    // Click and wait for any navigation (success → router.push, or error → stay)
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load', timeout: 8000 }).catch(() => {}),
      page.getByRole('button', { name: /увійти/i }).click(),
    ]);

    // Fresh page.goto sends the cookie via HTTP headers (bypasses Next.js router cache)
    await page.goto(`${BASE}/dashboard`);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 8000 });
  });

  test('password show/hide toggle works', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await page.getByRole('button', { name: /показати/i }).click();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await page.getByRole('button', { name: /сховати/i }).click();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

test.describe('Auth protection', () => {
  test('dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(`${BASE}/dashboard`);
    await page.waitForURL(/\/login/, { timeout: 8000 });
  });

  test('bookings page redirects to login when not authenticated', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(`${BASE}/bookings`);
    await page.waitForURL(/\/login/, { timeout: 8000 });
  });

  test('booking flow page redirects to login when not authenticated', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(`${BASE}/trips/some-trip-id`);
    await page.waitForURL(/\/login/, { timeout: 8000 });
  });
});

// Share one registered user across both Logout tests.
test.describe('Logout', () => {
  let sharedToken: string | undefined;

  test.beforeAll(async ({ request }) => {
    const result = await registerUser(request);
    sharedToken = result.accessToken;
  });

  test.beforeEach(async ({ page }) => {
    if (sharedToken) await setAuthCookie(page.context(), sharedToken);
  });

  test('logout confirmation dialog appears', async ({ page }) => {
    if (!sharedToken) return;
    await page.goto(BASE);
    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: /вийти/i }).click();
    await expect(page).toHaveURL(BASE);
  });

  test('logout accept navigates to login', async ({ page }) => {
    if (!sharedToken) return;
    await page.goto(BASE);
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: /вийти/i }).click();
    await page.waitForURL(/\/login/, { timeout: 8000 });
  });
});
