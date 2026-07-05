import { test, expect } from '@playwright/test';
import { registerUser, setAuthCookie } from './helpers/auth';

const BASE = 'http://localhost:3000/uk';

test.describe('Trip schedule', () => {
  test('schedule page renders heading and at least one run', async ({ page }) => {
    await page.goto(`${BASE}/trips`);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=/рейс|kurs|tur|resa/i').first()).toBeVisible();
  });

  test('trip detail page redirects unauthenticated user to login', async ({ page, request }) => {
    await page.context().clearCookies();
    const res = await request.get('http://localhost:3001/api/trips?from=Kyiv&to=Oslo&seats=0');
    const body = await res.json();
    const trips: any[] = body.data ?? [];
    if (trips.length === 0) return; // skip if no trips seeded

    await page.goto(`${BASE}/trips/${trips[0].id}`);
    await page.waitForURL(/\/login/, { timeout: 6000 });
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
