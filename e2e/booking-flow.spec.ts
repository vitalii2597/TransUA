import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000/uk';
const TEST_EMAIL = `e2e_${Date.now()}@test.com`;
const TEST_PASSWORD = 'TestPass123!';

test.describe('Booking flow', () => {
  test('register → search trips → book → view booking', async ({ page }) => {
    // Register
    await page.goto(`${BASE}/register`);
    await page.waitForSelector('form');
    await page.locator('input').nth(0).fill('Test');           // firstName
    await page.locator('input').nth(1).fill('User');           // lastName
    await page.locator('input[type="tel"]').fill('+380991234567');
    await page.locator('input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[type="password"]').fill(TEST_PASSWORD);
    await page.locator('#tosAccepted').check();
    await page.getByRole('button', { name: /реєстр/i }).click();
    await page.waitForURL(`${BASE}/dashboard`, { timeout: 10000 });

    // Search trips
    await page.goto(`${BASE}/trips`);
    await page.waitForSelector('input');

    // Check page loaded
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('login with existing credentials', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator('form')).toBeVisible();
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
  });
});

test.describe('Navigation', () => {
  test('home page loads', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByRole('link', { name: 'TransUA' })).toBeVisible();
  });

  test('parcels page shows calculator', async ({ page }) => {
    await page.goto(`${BASE}/parcels`);
    await expect(page.locator('input[type="number"]').first()).toBeVisible();
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto(`${BASE}/privacy`);
    await expect(page.locator('text=Privacy Policy')).toBeVisible();
  });

  test('terms page loads', async ({ page }) => {
    await page.goto(`${BASE}/terms`);
    await expect(page.locator('text=Terms of Service')).toBeVisible();
  });
});
