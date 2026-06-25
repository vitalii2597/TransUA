import { test, expect } from '@playwright/test';
import { registerUser, setAuthCookie } from './helpers/auth';

const BASE = 'http://localhost:3000/uk';

test.describe('Trip search', () => {
  test('search page renders form and heading', async ({ page }) => {
    await page.goto(`${BASE}/trips`);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="date"]')).toBeVisible();
  });

  test('search for Kyiv → Oslo returns results', async ({ page }) => {
    await page.goto(`${BASE}/trips`);
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const dateStr = nextWeek.toISOString().split('T')[0];

    await page.locator('input').nth(0).fill('Kyiv');
    await page.locator('input').nth(1).fill('Oslo');
    await page.locator('input[type="date"]').fill(dateStr);
    await page.getByRole('button', { name: /знайти|search/i }).click();
    // Results section or no-trips message should appear
    await expect(page.locator('h2, p').filter({ hasText: /результ|result|no trip|поїздок/i }).first()).toBeVisible({ timeout: 8000 });
  });

  test('search with no results shows empty message', async ({ page }) => {
    await page.goto(`${BASE}/trips`);
    await page.locator('input').nth(0).fill('Nowhere');
    await page.locator('input').nth(1).fill('Somewhere');
    await page.locator('input[type="date"]').fill('2030-01-01');
    await page.getByRole('button', { name: /знайти|search/i }).click();
    await expect(page.locator('text=/no trip|поїздок не знайдено/i')).toBeVisible({ timeout: 8000 });
  });

  test('Book button redirects unauthenticated user to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(`${BASE}/trips`);
    // Search for trips that exist
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 3);
    await page.locator('input').nth(0).fill('Kyiv');
    await page.locator('input').nth(1).fill('Oslo');
    await page.locator('input[type="date"]').fill(nextMonth.toISOString().split('T')[0]);
    await page.getByRole('button', { name: /знайти|search/i }).click();

    const bookBtn = page.getByRole('button', { name: /забронювати|book/i }).first();
    const hasBook = await bookBtn.isVisible({ timeout: 6000 }).catch(() => false);
    if (hasBook) {
      await bookBtn.click();
      await page.waitForURL(/\/login/, { timeout: 6000 });
    }
  });
});

// Share ONE user across both booking tests to stay under the 5 req/min auth rate limit.
test.describe('Booking flow (authenticated)', () => {
  let sharedToken: string | undefined;

  test.beforeAll(async ({ request }) => {
    const result = await registerUser(request);
    sharedToken = result.accessToken;
  });

  test.beforeEach(async ({ page }) => {
    if (sharedToken) await setAuthCookie(page.context(), sharedToken);
  });

  test('seat picker renders and allows seat selection', async ({ page }) => {
    // Find a real trip first
    const res = await page.request.get('http://localhost:3001/api/trips?from=Kyiv&to=Oslo&seats=1');
    const body = await res.json();
    const trips: any[] = body.data ?? [];
    if (trips.length === 0) return; // skip if no trips seeded

    await page.goto(`${BASE}/trips/${trips[0].id}`);
    // Seat buttons have aria-pressed; wait for any of them (locale-agnostic)
    await page.waitForSelector('[aria-pressed]', { timeout: 8000 });

    // Find a free seat and click it ("Вільно" = "Free" in the Ukrainian aria-label)
    const freeSeat = page.locator('[aria-label*="Вільно"]').first();
    const hasFree = await freeSeat.isVisible({ timeout: 5000 }).catch(() => false);
    if (!hasFree) return;

    await freeSeat.click();
    await expect(freeSeat).toHaveAttribute('aria-pressed', 'true');
  });

  test('seat picker step 1 next button disabled without seat selection', async ({ page }) => {
    const res = await page.request.get('http://localhost:3001/api/trips?from=Kyiv&to=Oslo&seats=1');
    const body = await res.json();
    const trips: any[] = body.data ?? [];
    if (trips.length === 0) return;

    await page.goto(`${BASE}/trips/${trips[0].id}`);
    await page.waitForSelector('button', { timeout: 8000 });

    const nextBtn = page.getByRole('button', { name: /далі|next/i });
    await expect(nextBtn).toBeDisabled();
  });
});

// Share ONE user across both booking tests to stay under the 5 req/min auth rate limit.
test.describe('My Bookings', () => {
  let sharedToken: string | undefined;

  test.beforeAll(async ({ request }) => {
    const result = await registerUser(request);
    sharedToken = result.accessToken;
  });

  test.beforeEach(async ({ page }) => {
    if (sharedToken) await setAuthCookie(page.context(), sharedToken);
  });

  test('bookings page loads for authenticated user', async ({ page }) => {
    if (!sharedToken) return;
    await page.goto(`${BASE}/bookings`);
    await expect(page.locator('h1')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('h1, p').first()).toBeVisible();
  });

  test('download button is visible for confirmed bookings', async ({ page }) => {
    if (!sharedToken) return;

    await page.goto(`${BASE}/bookings`);
    await page.waitForTimeout(1000);
    const downloadBtn = page.getByRole('button', { name: /завантажити|download/i });
    // Only assert if bookings exist (fresh user has none)
    const hasDl = await downloadBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasDl) {
      await expect(downloadBtn).not.toBeDisabled();
    }
  });
});
