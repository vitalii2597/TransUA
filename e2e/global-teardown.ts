import { deleteE2eUsers } from './helpers/db';

// Every run registers fresh users; without this they accumulate in the dev DB (120+ after a few runs).
export default async function globalTeardown() {
  const count = await deleteE2eUsers();
  console.log(`[e2e teardown] removed ${count} test account(s)`);
}
