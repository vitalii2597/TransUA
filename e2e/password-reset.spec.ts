import { test, expect } from '@playwright/test';
import { registerUser, loginUser } from './helpers/auth';
import { createResetToken } from './helpers/db';

const BASE = 'http://localhost:3000/uk';

test.describe('Forgot password', () => {
  test('login page links to forgot password', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByRole('link', { name: 'Забули пароль?' }).click();
    await page.waitForURL(`${BASE}/forgot-password`);
    await expect(page.locator('h1')).toHaveText('Відновлення пароля');
  });

  test('submitting an email shows the check-your-email state', async ({ page }) => {
    await page.goto(`${BASE}/forgot-password`);
    await page.locator('#email').fill(`e2e_nobody_${Date.now()}@test.com`);
    await page.getByRole('button', { name: 'Надіслати посилання' }).click();
    await expect(page.getByRole('heading', { name: 'Перевірте пошту' })).toBeVisible();
  });
});

test.describe('Reset password', () => {
  test('missing token shows invalid-link state', async ({ page }) => {
    await page.goto(`${BASE}/reset-password`);
    await expect(page.getByText('Посилання недійсне або термін його дії минув.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Запросити нове посилання' })).toBeVisible();
  });

  test('mismatched passwords show a validation error', async ({ page }) => {
    await page.goto(`${BASE}/reset-password?token=whatever`);
    await page.locator('#password').fill('NewPass123!');
    await page.locator('#confirm').fill('Different123!');
    await page.getByRole('button', { name: 'Зберегти пароль' }).click();
    await expect(page.getByText('Паролі не збігаються')).toBeVisible();
  });

  test('bogus token is rejected by the API', async ({ page }) => {
    await page.goto(`${BASE}/reset-password?token=not-a-real-token`);
    await page.locator('#password').fill('NewPass123!');
    await page.locator('#confirm').fill('NewPass123!');
    await page.getByRole('button', { name: 'Зберегти пароль' }).click();
    await expect(page.getByText('Посилання недійсне або термін його дії минув.')).toBeVisible();
  });

  test('valid token sets a new password, single use', async ({ page, request }) => {
    const { email } = await registerUser(request);
    const token = await createResetToken(email);

    await page.goto(`${BASE}/reset-password?token=${token}`);
    await page.locator('#password').fill('BrandNew456!');
    await page.locator('#confirm').fill('BrandNew456!');
    await page.getByRole('button', { name: 'Зберегти пароль' }).click();
    await page.waitForURL(`${BASE}/login`);

    expect(await loginUser(request, email, 'BrandNew456!')).toBeTruthy();
    expect(await loginUser(request, email, 'TestPass123!')).toBeFalsy();

    // Same link a second time → rejected.
    await page.goto(`${BASE}/reset-password?token=${token}`);
    await page.locator('#password').fill('Another789!');
    await page.locator('#confirm').fill('Another789!');
    await page.getByRole('button', { name: 'Зберегти пароль' }).click();
    await expect(page.getByText('Посилання недійсне або термін його дії минув.')).toBeVisible();
  });
});
