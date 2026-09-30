-- Drop `claimed_at`: the table deliberately stores no claim timestamp.
--
-- One column cannot serve both roles. Enforcement needs equality on the *day*, an
-- audit trail needs the *instant*:
--   * store the instant -> uniqueness stops constraining anything, because any two
--                         distinct timestamps pass it and "one reward per day" is
--                         lost (verified: a unique index over `claimed_at` cannot
--                         reject a second claim on the same reward day);
--   * store the day     -> the time is lost.
--
-- The day won: it IS the rule, and it is declaratively enforced by the primary key
-- `(user_id, claimed_on)` rather than by application arithmetic. `claimed_at` was
-- only ever read to populate an informational `lastClaimedAt` response field that
-- no client consumes.
--
-- Consequence to accept: historical claims have no recorded time, and it cannot be
-- reconstructed later. This migration is one-way.
ALTER TABLE "daily_login_claims"
  DROP COLUMN "claimed_at";
