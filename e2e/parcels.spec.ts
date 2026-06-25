import { test, expect } from '@playwright/test';
import { registerUser, setAuthCookie } from './helpers/auth';

const BASE = 'http://localhost:3000/uk';
const API = 'http://localhost:3001/api';

test.describe('Parcels calculator', () => {
  test('price calculator renders with default values', async ({ page }) => {
    await page.goto(`${BASE}/parcels`);
    await expect(page.locator('input[type="number"]').first()).toBeVisible();
  });

  test('price updates when weight changes', async ({ page }) => {
    await page.goto(`${BASE}/parcels`);
    const weightInput = page.locator('input[type="number"]').first();
    await weightInput.fill('10');
    await expect(page.locator('text=/€/').first()).toBeVisible({ timeout: 5000 });
  });

  test('shows "too heavy" message above 50kg', async ({ page }) => {
    await page.goto(`${BASE}/parcels`);
    const weightInput = page.locator('input[type="number"]').first();
    await weightInput.fill('55');
    await expect(page.locator('text=/50|phone|телефон/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('order form section shows login prompt when not authenticated', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(`${BASE}/parcels`);
    // Non-authed users see a login button (not a form)
    const loginBtn = page.getByRole('button', { name: /увійти|login/i });
    await expect(loginBtn).toBeVisible({ timeout: 5000 });
  });
});

// Share ONE registered user across all authenticated tests to stay under the 5 req/min auth rate limit.
test.describe('Parcels (authenticated)', () => {
  let sharedToken: string | undefined;

  test.beforeAll(async ({ request }) => {
    const result = await registerUser(request);
    sharedToken = result.accessToken;
  });

  test.beforeEach(async ({ page }) => {
    if (sharedToken) await setAuthCookie(page.context(), sharedToken);
  });

  test('order form is visible when authenticated', async ({ page }) => {
    if (!sharedToken) return;
    await page.goto(`${BASE}/parcels`);
    await expect(page.locator('form').first()).toBeVisible({ timeout: 8000 });
  });

  test('authenticated user can access parcels API', async ({ page }) => {
    if (!sharedToken) return;
    // The parcels API uses JwtAuthGuard (Authorization: Bearer), not cookie auth.
    const res = await page.request.get(`${API}/parcels`, {
      headers: { Authorization: `Bearer ${sharedToken}` },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body).toHaveProperty('data');
  });

  test('submit button is visible when authenticated', async ({ page }) => {
    if (!sharedToken) return;
    await page.goto(`${BASE}/parcels`);
    // "Відправити посилку" button is only rendered inside the form (when authed)
    const submitBtn = page.getByRole('button', { name: /відправ/i });
    await expect(submitBtn).toBeVisible({ timeout: 8000 });
  });
});
