import { test, expect, Page } from '@playwright/test';
import { registerUser, loginUser, setAuthCookie } from './helpers/auth';
import { setUserRole } from './helpers/db';

const BASE = 'http://localhost:3000/uk';
const SEARCH_LABEL = 'Пошук за іменем, email або телефоном'; // uk admin.searchUsers
const PAGE_SIZE = 20;
const BULK = PAGE_SIZE + 2; // enough users sharing one tag to need a 2nd page

// Letters only, so the tag is a valid, unique last name / first name fragment.
const tag = Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
const bulkLastName = `Pg${tag}`;
const firstName = `Zoryana${tag}`;
const lastName = `Kvitka${tag}`;

/** Body rows of the users table (header cells are columnheaders, so only data rows have cells). */
function bodyRows(page: Page) {
  return page.getByRole('main').getByRole('row').filter({ has: page.getByRole('cell') });
}

async function rowEmails(page: Page): Promise<string[]> {
  return bodyRows(page).evaluateAll((rows) => rows.map((r) => (r as HTMLTableRowElement).cells[1]?.textContent?.trim() ?? ''));
}

function usersResponse(page: Page, predicate: (url: URL) => boolean) {
  return page.waitForResponse((r) => {
    if (!r.url().includes('/api/admin/users') || r.request().method() !== 'GET') return false;
    return predicate(new URL(r.url()));
  });
}

async function search(page: Page, q: string) {
  const res = usersResponse(page, (u) => u.searchParams.get('q') === q);
  await page.getByRole('main').getByRole('searchbox', { name: SEARCH_LABEL }).fill(q);
  expect((await res).ok()).toBeTruthy();
}

test.describe('Admin users — server pagination + search', () => {
  test.describe.configure({ mode: 'serial' });

  let adminEmail: string;
  let adminToken: string;
  let namedEmail: string;
  const bulkEmails: string[] = [];

  test.beforeAll(async ({ request }) => {
    test.setTimeout(90_000);
    const admin = await registerUser(request);
    adminEmail = admin.email;
    await setUserRole(adminEmail, 'ADMIN');
    adminToken = (await loginUser(request, adminEmail))!;
    expect(adminToken).toBeTruthy();

    const named = await registerUser(request, { firstName, lastName });
    expect(named.accessToken).toBeTruthy();
    namedEmail = named.email;

    // Small batches: keeps registration (bcrypt) fast without hammering the API.
    for (let i = 0; i < BULK; i += 6) {
      const batch = await Promise.all(
        Array.from({ length: Math.min(6, BULK - i) }, () => registerUser(request, { lastName: bulkLastName })),
      );
      for (const u of batch) {
        expect(u.accessToken).toBeTruthy();
        bulkEmails.push(u.email);
      }
    }
  });

  test.afterAll(async () => {
    if (adminEmail) await setUserRole(adminEmail, 'PASSENGER');
  });

  test.beforeEach(async ({ context }) => {
    await setAuthCookie(context, adminToken);
  });

  test('searching a unique email shows exactly that user', async ({ page }) => {
    await page.goto(`${BASE}/admin/users`);
    await expect(bodyRows(page).first()).toBeVisible();

    await search(page, namedEmail);
    await expect(bodyRows(page)).toHaveCount(1);
    await expect(bodyRows(page).first()).toContainText(namedEmail);
    await expect(bodyRows(page).first()).toContainText(`${firstName} ${lastName}`);
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText(/Користувачі\s*1$/);
  });

  test('a two-word "First Last" search matches across first and last name', async ({ page }) => {
    await page.goto(`${BASE}/admin/users`);
    await expect(bodyRows(page).first()).toBeVisible();

    await search(page, `${firstName} ${lastName}`);
    await expect(bodyRows(page)).toHaveCount(1);
    await expect(bodyRows(page).first()).toContainText(namedEmail);

    // Every word must match: a second word nobody has yields no rows.
    await search(page, `${firstName} Nomatch${tag}`);
    await expect(bodyRows(page)).toHaveCount(1);
    await expect(bodyRows(page).first()).toHaveText('Немає даних');
  });

  test('page 2 of a filtered list shows the remaining, different users', async ({ page }) => {
    await page.goto(`${BASE}/admin/users`);
    await expect(bodyRows(page).first()).toBeVisible();

    await search(page, bulkLastName);
    await expect(bodyRows(page)).toHaveCount(PAGE_SIZE);
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText(new RegExp(`\\s${BULK}$`));
    const page1 = await rowEmails(page);

    const res = usersResponse(page, (u) => u.searchParams.get('page') === '2' && u.searchParams.get('q') === bulkLastName);
    await page.getByRole('main').getByRole('button', { name: '2', exact: true }).click();
    expect((await res).ok()).toBeTruthy();
    await expect(bodyRows(page)).toHaveCount(BULK - PAGE_SIZE);
    const page2 = await rowEmails(page);

    expect(page2.filter((e) => page1.includes(e))).toEqual([]);
    expect([...page1, ...page2].sort()).toEqual([...bulkEmails].sort());
  });

  test('unfiltered list paginates beyond the newest 20 users', async ({ page }) => {
    const first = usersResponse(page, (u) => u.searchParams.get('page') === '1');
    await page.goto(`${BASE}/admin/users`);
    const total = (await (await first).json()).meta.total as number;
    expect(total).toBeGreaterThan(PAGE_SIZE);
    await expect(bodyRows(page)).toHaveCount(PAGE_SIZE);
    const page1 = await rowEmails(page);

    const res = usersResponse(page, (u) => u.searchParams.get('page') === '2' && !u.searchParams.has('q'));
    await page.getByRole('main').getByRole('button', { name: '2', exact: true }).click();
    expect((await res).ok()).toBeTruthy();
    await expect(bodyRows(page).first()).toBeVisible();
    // Other spec files may register users concurrently, so allow a small shift — but page 2 is not page 1.
    await expect.poll(async () => (await rowEmails(page)).join()).not.toBe(page1.join());
    const page2 = await rowEmails(page);
    expect(page2.filter((e) => !page1.includes(e)).length).toBeGreaterThan(0);
  });
});
