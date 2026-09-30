-- Learner Pass: split the entitlement from its progress.
--
-- `learner_pass_enrollment` was doing four jobs in one row: the entitlement
-- (payment_id, provider, expiry), progress (`claimed_days` int array), two cached
-- aggregates (`streak`, `last_claimed_at`), and a choice log (`unlock_choices` JSON).
-- Only the entitlement is non-derivable, so it stays; the rest moves to
-- `learner_pass_claims`, one row per claimed allowance day.
--
-- `day_number` is a SLOT IN THE PREPAID ALLOWANCE, not a date, so the natural key is
-- `(enrollment_id, day_number)` and no date/reset gymnastics are involved.
--
-- Backfill notes
-- --------------
--  * `claimed_days` stored no per-day timestamps, so `claimed_at` is SYNTHESISED as
--    `enrollment.created_at + (day_number - 1) days`. Treat it as a lower bound on the
--    real claim instant (a day could only be claimed once it had elapsed, and back-filled
--    days were claimed later still). The true instants are unrecoverable.
--  * Awarded amounts are read from the live `learner_pass_rewards` rows, which are the
--    values each day actually paid at the time of this migration. They are snapshotted
--    here so the ladder can move to code without rewriting history.
--  * `unlock_choices` was a flat list of scenario ids with no day attached, so it is
--    reverse-mapped scenario -> day. That mapping is a bijection, hence deterministic.

-- CreateTable
CREATE TABLE "learner_pass_claims" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "day_number" INTEGER NOT NULL,
    "claimed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coins_awarded" INTEGER NOT NULL,
    "xp_awarded" INTEGER NOT NULL,
    "ai_helps_awarded" INTEGER NOT NULL,
    "unlocked_scenario" TEXT,

    CONSTRAINT "learner_pass_claims_pkey" PRIMARY KEY ("id")
);

-- Abort guards: refuse to migrate data we cannot represent faithfully, rather than
-- silently dropping or corrupting it. (The unique index below would also reject
-- duplicates, but only with an opaque constraint-violation error.)
DO $$
DECLARE
  dup_count   int;
  oob_count   int;
  bad_choices text;
BEGIN
  SELECT count(*) INTO dup_count FROM (
    SELECT e."id", d.day_number
    FROM "learner_pass_enrollments" e
    CROSS JOIN LATERAL unnest(e."claimed_days") AS d(day_number)
    GROUP BY e."id", d.day_number
    HAVING count(*) > 1
  ) dups;
  IF dup_count > 0 THEN
    RAISE EXCEPTION 'Aborting: % duplicate (enrollment_id, day_number) pair(s) in claimed_days; the new unique constraint cannot represent them.', dup_count;
  END IF;

  SELECT count(*) INTO oob_count
  FROM "learner_pass_enrollments" e
  CROSS JOIN LATERAL unnest(e."claimed_days") AS d(day_number)
  WHERE d.day_number < 1 OR d.day_number > 30;
  IF oob_count > 0 THEN
    RAISE EXCEPTION 'Aborting: % claimed day(s) fall outside the 1..30 allowance range.', oob_count;
  END IF;

  SELECT string_agg(DISTINCT c, ', ') INTO bad_choices
  FROM "learner_pass_enrollments" e
  CROSS JOIN LATERAL jsonb_array_elements_text(e."unlock_choices") AS c
  WHERE c NOT IN (
    'pern-pos-scenario-3',
    'mern-tw-scenario-3',
    'nestjs-pos-scenario-3',
    'nextjs-postgres-prisma-3',
    'nextjs-shadcn-ui-scenario-3'
  );
  IF bad_choices IS NOT NULL THEN
    RAISE EXCEPTION 'Aborting: unlock_choices contains scenario id(s) with no known allowance day: %', bad_choices;
  END IF;
END $$;

-- Backfill one claim per claimed allowance day.
INSERT INTO "learner_pass_claims" (
  "id", "enrollment_id", "day_number", "claimed_at",
  "coins_awarded", "xp_awarded", "ai_helps_awarded", "unlocked_scenario"
)
SELECT
  gen_random_uuid()::text,
  e."id",
  d.day_number,
  e."created_at" + ((d.day_number - 1) * INTERVAL '1 day'),
  COALESCE(r."coins", 0),
  COALESCE(r."xp", 0),
  COALESCE(r."ai_helps", 0),
  CASE
    WHEN m.scenario IS NOT NULL AND e."unlock_choices" @> to_jsonb(m.scenario)
      THEN m.scenario
    ELSE NULL
  END
FROM "learner_pass_enrollments" e
CROSS JOIN LATERAL unnest(e."claimed_days") AS d(day_number)
LEFT JOIN "learner_pass_rewards" r ON r."reward_index" = d.day_number
LEFT JOIN (
  VALUES
    ('pern-pos-scenario-3', 6),
    ('mern-tw-scenario-3', 12),
    ('nestjs-pos-scenario-3', 18),
    ('nextjs-postgres-prisma-3', 24),
    ('nextjs-shadcn-ui-scenario-3', 30)
) AS m(scenario, day_number) ON m.day_number = d.day_number;

-- CreateIndex
CREATE INDEX "learner_pass_claims_enrollment_id_claimed_at_idx" ON "learner_pass_claims"("enrollment_id", "claimed_at");

-- CreateIndex
CREATE UNIQUE INDEX "learner_pass_claims_enrollment_id_day_number_key" ON "learner_pass_claims"("enrollment_id", "day_number");

-- AddForeignKey
ALTER TABLE "learner_pass_claims" ADD CONSTRAINT "learner_pass_claims_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "learner_pass_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: progress columns are now derived from learner_pass_claims.
ALTER TABLE "learner_pass_enrollments"
  DROP COLUMN "claimed_days",
  DROP COLUMN "last_claimed_at",
  DROP COLUMN "streak",
  DROP COLUMN "unlock_choices";

-- DropIndex: redundant with the unique constraint on the same column.
DROP INDEX "learner_pass_enrollments_payment_id_idx";

-- DropTable: the reward ladder now lives in code, like the daily-login ladder and the
-- achievements catalog. Keeping it here would mean a join per request, per-environment
-- drift, and a third copy of the day -> scenario mapping.
DROP TABLE "learner_pass_rewards";
