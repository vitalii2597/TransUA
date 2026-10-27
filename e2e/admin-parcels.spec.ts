import { test, expect } from '@playwright/test';
import { registerUser, loginUser, setAuthCookie } from './helpers/auth';
import { setUserRole, deleteParcel, getParcelStatusLog } from './helpers/db';

const BASE = 'http://localhost:3000/uk';
const API = 'http://localhost:3001/api';

test.describe('Admin parcels — inline status change', () => {
  let adminEmail: string | undefined;
  let parcelId: string | undefined;

  test.afterEach(async () => {
    if (parcelId) await deleteParcel(parcelId);
    if (adminEmail) await setUserRole(adminEmail, 'PASSENGER');
  });

  test('admin changes a parcel status from the table and it persists after reload', async ({ page, context, request }) => {
    // Passenger creates a parcel via the API.
    const passenger = await registerUser(request);
    expect(passenger.accessToken).toBeTruthy();
    const createRes = await request.post(`${API}/parcels`, {
      headers: { Authorization: `Bearer ${passenger.accessToken}` },
      data: {
        pickupAddress: 'Kyiv, Khreshchatyk 1',
        deliveryAddress: 'Oslo, Karl Johans gate 1, Norway',
        recipientName: 'Olena Test',
        recipientPhone: '+4712345678',
        weightKg: 3,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const parcel = (await createRes.json()).data;
    parcelId = parcel.id as string;
    const trackingCode = parcel.trackingCode as string;
    expect(trackingCode).toMatch(/^TUA-PKG-/);
    expect(parcel.status).toBe('PENDING_PICKUP');

    // Promote a second user to ADMIN; re-login because the role lives in the JWT.
    const admin = await registerUser(request);
    adminEmail = admin.email;
    await setUserRole(adminEmail, 'ADMIN');
    const adminToken = await loginUser(request, adminEmail);
    expect(adminToken).toBeTruthy();
    await setAuthCookie(context, adminToken!);

    await page.goto(`${BASE}/admin/parcels`);
    const row = page.getByRole('main').getByRole('row').filter({ hasText: trackingCode });
    await expect(row).toHaveCount(1);
    const select = row.getByRole('combobox', { name: 'Статус' });
    await expect(select).toHaveValue('PENDING_PICKUP');

    const patched = page.waitForResponse(
      (r) => r.url().endsWith(`/api/parcels/${parcelId}/status`) && r.request().method() === 'PATCH',
    );
    await select.selectOption({ label: '● В дорозі' });
    expect((await patched).ok()).toBeTruthy();
    await expect(select).toHaveValue('IN_TRANSIT');
    await expect(select).toBeEnabled();

    // Survives a reload (i.e. it was persisted, not just local state).
    await page.reload();
    const rowAfter = page.getByRole('main').getByRole('row').filter({ hasText: trackingCode });
    await expect(rowAfter.getByRole('combobox', { name: 'Статус' })).toHaveValue('IN_TRANSIT');
    await expect(rowAfter.getByRole('combobox', { name: 'Статус' }).locator('option:checked')).toHaveText(/В дорозі/);

    // The shared endpoint appends a status log entry.
    expect(await getParcelStatusLog(parcelId)).toEqual(['PENDING_PICKUP', 'IN_TRANSIT']);
  });
});
