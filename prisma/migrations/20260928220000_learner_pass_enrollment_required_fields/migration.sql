-- Learner Pass: make the entitlement's identifying facts required.
--
-- `payment_id` and `expires_at` were nullable. Both were non-null in every existing row, so
-- the nullability described possibilities that nothing exercised:
--
--   * `payment_id` NULL was reachable only from `scripts/dev-pass-rewards.ts`, which is
--     test-only tooling. A pass bought through Stripe always carries a PaymentIntent id.
--   * `expires_at` NULL meant "never expires" and was honoured in three read paths, but no
--     creation path could produce such a row.
--
-- Declaring them NOT NULL makes the schema state what the system actually guarantees, and
-- removes two impossible branches from the read paths. If a genuinely non-expiring or
-- comped pass is ever needed, the right shape is an explicit column (e.g. a nullable
-- `payment_id` re-added, or a `lifetime` flag), not a sentinel hidden in a date.

-- Abort guard: `SET NOT NULL` already fails on NULLs, but with an opaque error that does not
-- say which column or how many rows. Fail with something actionable instead.
DO $$
DECLARE
  null_payment int;
  null_expiry  int;
BEGIN
  SELECT count(*) INTO null_payment FROM "learner_pass_enrollments" WHERE "payment_id" IS NULL;
  SELECT count(*) INTO null_expiry  FROM "learner_pass_enrollments" WHERE "expires_at" IS NULL;

  IF null_payment > 0 OR null_expiry > 0 THEN
    RAISE EXCEPTION
      'Aborting: % enrollment(s) have a NULL payment_id and % have a NULL expires_at. Backfill or remove those rows, or leave these columns nullable.',
      null_payment, null_expiry;
  END IF;
END $$;

ALTER TABLE "learner_pass_enrollments" ALTER COLUMN "payment_id" SET NOT NULL;
ALTER TABLE "learner_pass_enrollments" ALTER COLUMN "expires_at" SET NOT NULL;
