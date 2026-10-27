import { test, expect, APIRequestContext } from '@playwright/test';
import { registerUser, loginUser, setAuthCookie } from './helpers/auth';
import { setUserRole, deleteBookingRequestsByUser } from './helpers/db';

const BASE = 'http://localhost:3000/uk';
const API = 'http://localhost:3001/api';

interface RunRow {
  id: string;
  month: string;
  passengersDate: string;
  returnDate: string;
}

async function getRuns(request: APIRequestContext): Promise<RunRow[]> {
  const res = await request.get(`${API}/schedule-runs`);
  expect(res.ok()).toBeTruthy();
  return (await res.json()).data;
}

const todayUtc = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// Uses the existing 2026-11 run: this suite never creates or deletes schedule runs.
async function upcomingRun(request: APIRequestContext): Promise<RunRow> {
  const run = (await getRuns(request)).find((r) => new Date(r.passengersDate) >= todayUtc());
  expect(run, 'expected an upcoming schedule run (e.g. 2026-11) in the DB').toBeTruthy();
  return run!;
}

async function pastRun(request: APIRequestContext): Promise<RunRow> {
  const run = (await getRuns(request)).find((r) => new Date(r.returnDate) < todayUtc());
  expect(run, 'expected a fully past schedule run (e.g. 2026-07) in the DB').toBeTruthy();
  return run!;
}

test.describe.serial('Booking requests', () => {
  let passengerEmail: string;
  let passengerToken: string;
  let adminEmail: string;
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    const passenger = await registerUser(request);
    passengerEmail = passenger.email;
    passengerToken = passenger.accessToken!;
    expect(passengerToken).toBeTruthy();

    const admin = await registerUser(request);
    adminEmail = admin.email;
    await setUserRole(adminEmail, 'ADMIN');
    // Role is carried in the JWT, so log in again after promoting.
    adminToken = (await loginUser(request, adminEmail))!;
    expect(adminToken).toBeTruthy();
  });

  test.afterAll(async () => {
    if (passengerEmail) await deleteBookingRequestsByUser(passengerEmail);
    if (adminEmail) await setUserRole(adminEmail, 'PASSENGER');
  });

  async function adminRequestsFor(request: APIRequestContext, email: string) {
    const res = await request.get(`${API}/admin/booking-requests?limit=100`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.ok()).toBeTruthy();
    return ((await res.json()).data as any[]).filter((r) => r.user.email === email);
  }

  test('trips page shows the book button on an upcoming run only', async ({ page, request }) => {
    const upcoming = await upcomingRun(request);
    const past = await pastRun(request);

    await page.goto(`${BASE}/trips`);
    const bookLink = page.locator(`a[href="/uk/book/${upcoming.id}"]`);
    await expect(bookLink).toBeVisible();
    await expect(bookLink).toHaveText(/Забронювати місце/);
    await expect(page.locator(`a[href="/uk/book/${past.id}"]`)).toHaveCount(0);

    await bookLink.click();
    // Logged out → the book page bounces to login.
    await page.waitForURL(`${BASE}/login`);
  });

  test('book page redirects a logged-out user to login', async ({ page, request }) => {
    const upcoming = await upcomingRun(request);
    await page.context().clearCookies();
    await page.goto(`${BASE}/book/${upcoming.id}`);
    await page.waitForURL(`${BASE}/login`);
  });

  test('unknown run id shows not-found state', async ({ page }) => {
    await setAuthCookie(page.context(), passengerToken);
    await page.goto(`${BASE}/book/00000000-0000-4000-8000-000000000000`);
    await expect(page.getByText('Рейс не знайдено або він уже завершився.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Надіслати заявку' })).toHaveCount(0);
  });

  test('fully past run shows not-found state', async ({ page, request }) => {
    const past = await pastRun(request);
    await setAuthCookie(page.context(), passengerToken);
    await page.goto(`${BASE}/book/${past.id}`);
    await expect(page.getByText('Рейс не знайдено або він уже завершився.')).toBeVisible();
  });

  test('submitting the form creates a request', async ({ page, request }) => {
    const upcoming = await upcomingRun(request);
    await setAuthCookie(page.context(), passengerToken);
    await page.goto(`${BASE}/book/${upcoming.id}`);

    // Phone is prefilled from the profile (registerUser's default phone).
    await expect(page.locator('#phone')).toHaveValue('+380991234567');
    await expect(page.getByRole('radio', { name: /Україна → Норвегія/ })).toBeChecked();

    await page.locator('#passengers').fill('2');
    await page.locator('#fromCity').fill('Київ');
    await page.locator('#toCity').fill('Осло');
    await page.locator('#comment').fill('e2e booking request');
    await page.getByRole('button', { name: 'Надіслати заявку' }).click();

    await expect(page.getByRole('heading', { name: 'Заявку надіслано' })).toBeVisible();

    const mine = await adminRequestsFor(request, passengerEmail);
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({
      direction: 'TO_NORWAY',
      passengers: 2,
      fromCity: 'Київ',
      toCity: 'Осло',
      phone: '+380991234567',
      comment: 'e2e booking request',
      status: 'NEW',
    });
    expect(mine[0].scheduleRun.month).toBe(upcoming.month);
  });

  test('admin page lists the request and changes its status', async ({ page, request }) => {
    const [req] = await adminRequestsFor(request, passengerEmail);
    expect(req, 'request from the previous test should exist').toBeTruthy();

    await setAuthCookie(page.context(), adminToken);
    await page.goto(`${BASE}/admin/booking-requests`);

    const row = page.getByRole('row').filter({ hasText: passengerEmail });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText('Київ → Осло');
    const select = row.getByRole('combobox', { name: 'Статус' });
    await expect(select).toHaveValue('NEW');

    await select.selectOption({ label: 'Підтверджена' });
    await expect(select).toHaveValue('CONFIRMED');

    await expect
      .poll(async () => (await adminRequestsFor(request, passengerEmail))[0]?.status)
      .toBe('CONFIRMED');
  });
});
