-- RefreshToken previously stored the raw signed JWT in `token`. A DB leak alone would
-- let an attacker replay any stored token as a live session. Switch to storing a SHA-256
-- hash instead, matching how passwords are never stored in recoverable form.
--
-- Existing rows are truncated rather than backfilled: refresh tokens are short-lived
-- session artifacts, not data worth preserving across this change — affected users
-- simply log in again.

TRUNCATE TABLE "RefreshToken";

ALTER TABLE "RefreshToken" DROP COLUMN "token";
ALTER TABLE "RefreshToken" ADD COLUMN "tokenHash" TEXT NOT NULL;

CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
