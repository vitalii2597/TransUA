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
