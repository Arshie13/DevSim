-- Give `user_achievements` a surrogate `id` primary key.
--
-- The Prisma model now declares `id String @id @default(cuid())` and keeps
-- `@@unique([user_id, family, tier])` as the natural key. `cuid()` is generated
-- by the client, not the database, so the column is added nullable, backfilled
-- for existing rows, then promoted to the primary key.
--
-- Hand-written rather than generated: the generated DDL adds `id` as `NOT NULL`
-- directly, which fails on any table that already has rows.
--
-- Without this migration the client selects `user_achievements.id` against a
-- table that has no such column, producing P2022 (42703) on every achievement
-- query — the dashboard and /achievements pages.

-- ── 1. Add nullable so existing rows can be backfilled ──────────────────────
ALTER TABLE "user_achievements" ADD COLUMN "id" TEXT;

-- ── 2. Backfill. `cuid()` is client-side, so existing rows get a UUID instead.
--       `id` is an opaque surrogate, so the exact format is irrelevant.
UPDATE "user_achievements"
SET "id" = gen_random_uuid()::text
WHERE "id" IS NULL;

-- ── 3. Promote `id` to the primary key; demote the natural key to UNIQUE ────
ALTER TABLE "user_achievements" ALTER COLUMN "id" SET NOT NULL;

ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_pkey";

ALTER TABLE "user_achievements"
  ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id");

ALTER TABLE "user_achievements"
  ADD CONSTRAINT "user_achievements_user_id_family_tier_key"
  UNIQUE ("user_id", "family", "tier");
