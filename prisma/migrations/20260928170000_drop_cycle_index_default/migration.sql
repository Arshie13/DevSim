-- Drop the vestigial default on `cycle_index`.
--
-- The default was only ever needed to add this column as `NOT NULL` to an already
-- populated table (and, at the time, to feed the old `(user_id, cycle_index,
-- day_index)` primary key). Neither reason applies now — every insert sets the
-- value explicitly from the derived state in `dailyRewards/schedule.ts`.
--
-- Keeping it was worse than nothing: a write path that forgot the field would
-- silently persist a plausible-looking cycle 0 instead of failing on NOT NULL.
-- `day_index` never had a default, so this also makes the two consistent.
ALTER TABLE "daily_login_claims"
  ALTER COLUMN "cycle_index" DROP DEFAULT;
