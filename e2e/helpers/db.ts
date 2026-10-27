import { createRequire } from 'module';
import { createHash, randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';

// @prisma/client is a dependency of apps/api, not of the e2e root, so resolve it from there.
const apiDir = path.join(__dirname, '../../apps/api');
const { PrismaClient } = createRequire(path.join(apiDir, 'package.json'))('@prisma/client');

if (!process.env.DATABASE_URL) {
  const env = readFileSync(path.join(apiDir, '.env'), 'utf8');
  process.env.DATABASE_URL = env.match(/^DATABASE_URL="?([^"\r\n]+)"?/m)?.[1];
}

// These helpers promote users to ADMIN and bulk-delete accounts. Refuse to touch anything but a
// local DB, so a stray shell DATABASE_URL (e.g. left over from migrating Railway) can't hit production.
const dbHost = (() => {
  try {
    return new URL(process.env.DATABASE_URL ?? '').hostname;
  } catch {
    return '';
  }
})();
if (!['localhost', '127.0.0.1', '::1', 'postgres'].includes(dbHost)) {
  throw new Error(`e2e DB helpers refuse to run against non-local database host "${dbHost || '(unset)'}"`);
}

/**
 * Issues a password-reset token for `email` straight in the DB and returns the raw token —
 * the e2e suite can't read the reset email, so this stands in for clicking its link.
 */
export async function createResetToken(email: string): Promise<string> {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const token = randomBytes(32).toString('hex');
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: createHash('sha256').update(token).digest('hex'),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    return token;
  } finally {
    await prisma.$disconnect();
  }
}

/** Sets `email`'s role directly in the DB (e.g. to make an ADMIN). Re-login afterwards: the role is baked into the JWT. */
export async function setUserRole(email: string, role: 'PASSENGER' | 'DRIVER' | 'ADMIN'): Promise<void> {
  const prisma = new PrismaClient();
  try {
    await prisma.user.update({ where: { email }, data: { role } });
  } finally {
    await prisma.$disconnect();
  }
}

/** Removes every booking request made by `email`'s account — test cleanup so the local DB stays tidy. */
export async function deleteBookingRequestsByUser(email: string): Promise<void> {
  const prisma = new PrismaClient();
  try {
    await prisma.bookingRequest.deleteMany({ where: { user: { email } } });
  } finally {
    await prisma.$disconnect();
  }
}

/** Returns the statuses logged for a parcel, oldest first — to check a status change appended a ParcelStatusLog. */
export async function getParcelStatusLog(parcelId: string): Promise<string[]> {
  const prisma = new PrismaClient();
  try {
    const logs = await prisma.parcelStatusLog.findMany({ where: { parcelId }, orderBy: { loggedAt: 'asc' } });
    return logs.map((l: { status: string }) => l.status);
  } finally {
    await prisma.$disconnect();
  }
}

/** Deletes a parcel by id (its status logs cascade) — test cleanup so the local DB stays tidy. */
export async function deleteParcel(parcelId: string): Promise<void> {
  const prisma = new PrismaClient();
  try {
    await prisma.parcelOrder.deleteMany({ where: { id: parcelId } });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Deletes every account the suite registered (`e2e_…@test.com`) plus everything they own, in the
 * same FK-safe order as `UsersService.deleteMe` (tokens, booking requests, passengers and parcel
 * status logs cascade). Runs as Playwright's global teardown so test users don't pile up in the dev DB.
 */
export async function deleteE2eUsers(): Promise<number> {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({
      where: { email: { startsWith: 'e2e_', endsWith: '@test.com' } },
      select: { id: true },
    });
    const ids = users.map((u: { id: string }) => u.id);
    if (ids.length === 0) return 0;
    return await prisma.$transaction(async (tx: any) => {
      await tx.trip.updateMany({ where: { driverId: { in: ids } }, data: { driverId: null } });
      const vehicleIds = (await tx.vehicle.findMany({ where: { driverId: { in: ids } }, select: { id: true } })).map(
        (v: { id: string }) => v.id,
      );
      if (vehicleIds.length > 0) {
        await tx.trip.updateMany({ where: { vehicleId: { in: vehicleIds } }, data: { vehicleId: null } });
      }
      await tx.vehicle.deleteMany({ where: { driverId: { in: ids } } });
      await tx.booking.deleteMany({ where: { userId: { in: ids } } });
      await tx.payment.deleteMany({ where: { payerId: { in: ids } } });
      await tx.parcelOrder.deleteMany({ where: { senderId: { in: ids } } });
      const deleted = await tx.user.deleteMany({ where: { id: { in: ids } } });
      return deleted.count;
    });
  } finally {
    await prisma.$disconnect();
  }
}
