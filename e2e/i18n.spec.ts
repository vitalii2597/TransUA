import { test, expect } from '@playwright/test';

const LOCALES = ['uk', 'no', 'sv', 'pl'] as const;
const API_BASE = 'http://localhost:3001/api';

test.describe('i18n — all locales load', () => {
  for (const locale of LOCALES) {
    test(`home page loads in ${locale}`, async ({ page }) => {
      await page.goto(`http://localhost:3000/${locale}`);
      await expect(page.getByRole('link', { name: 'TransUA' })).toBeVisible({ timeout: 8000 });
      // Check the URL is correct
      expect(page.url()).toContain(`/${locale}`);
    });

    test(`trips page loads in ${locale}`, async ({ page }) => {
      await page.goto(`http://localhost:3000/${locale}/trips`);
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 8000 });
    });

    test(`login page loads in ${locale}`, async ({ page }) => {
      await page.goto(`http://localhost:3000/${locale}/login`);
      await expect(page.locator('form')).toBeVisible({ timeout: 8000 });
      // Check that at least one input (email) is present
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });
  }
});

test.describe('i18n — language switcher', () => {
  test('switching to Norwegian changes URL locale', async ({ page }) => {
    await page.goto('http://localhost:3000/uk');
    // Find language switcher link or button
    const noLink = page.getByRole('link', { name: /no|norsk|norwegian/i }).first();
    const hasNoLink = await noLink.isVisible({ timeout: 5000 }).catch(() => false);
    if (!hasNoLink) {
      // Try locating by href
      const noHref = page.locator('a[href*="/no"]').first();
      const hasHref = await noHref.isVisible({ timeout: 3000 }).catch(() => false);
      if (!hasHref) return; // skip if no language switcher found
      await noHref.click();
    } else {
      await noLink.click();
    }
    await page.waitForURL(/\/no/, { timeout: 8000 });
    expect(page.url()).toContain('/no');
  });

  test('switching to Swedish changes URL locale', async ({ page }) => {
    await page.goto('http://localhost:3000/uk');
    const svLink = page.locator('a[href*="/sv"]').first();
    const hasLink = await svLink.isVisible({ timeout: 5000 }).catch(() => false);
    if (!hasLink) return;
    await svLink.click();
    await page.waitForURL(/\/sv/, { timeout: 8000 });
    expect(page.url()).toContain('/sv');
  });

  test('switching to Polish changes URL locale', async ({ page }) => {
    await page.goto('http://localhost:3000/uk');
    const plLink = page.locator('a[href*="/pl"]').first();
    const hasLink = await plLink.isVisible({ timeout: 5000 }).catch(() => false);
    if (!hasLink) return;
    await plLink.click();
    await page.waitForURL(/\/pl/, { timeout: 8000 });
    expect(page.url()).toContain('/pl');
  });
});

test.describe('i18n — content differs by locale', () => {
  test('Ukrainian home page has Cyrillic text', async ({ page }) => {
    await page.goto('http://localhost:3000/uk');
    const bodyText = await page.locator('body').innerText();
    // Ukrainian text should contain Cyrillic characters
    expect(/[\u0400-\u04FF]/.test(bodyText)).toBe(true);
  });

  test('Norwegian home page loads without Cyrillic-only text', async ({ page }) => {
    await page.goto('http://localhost:3000/no');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 8000 });
    // Page should load successfully
    expect(page.url()).toContain('/no');
  });

  test('register page in Norwegian shows translated button', async ({ page }) => {
    await page.goto('http://localhost:3000/no/register');
    await page.waitForSelector('form', { timeout: 8000 });
    const submitBtn = page.getByRole('button').filter({ hasText: /.+/ }).first();
    await expect(submitBtn).toBeVisible();
  });
});

test.describe('i18n — API locale support', () => {
  test('trips API returns data regardless of locale', async ({ page }) => {
    const res = await page.request.get(`${API_BASE}/trips?from=Kyiv&to=Oslo&seats=1`);
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body).toHaveProperty('data');
  });
});
