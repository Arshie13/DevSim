-- Drop the unused `user.titles` column.
--
-- It looks like a leftover from an intended "earned titles" feature: a list of title strings
-- per user. It was never read or written anywhere in the application — no `select`, `create`
-- or `update` referenced it — so it only ever held its empty default. Removing it is a no-op
-- for behaviour.

-- AlterTable
ALTER TABLE "users" DROP COLUMN IF EXISTS "titles";
