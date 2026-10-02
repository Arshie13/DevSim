-- Add created_at / updated_at to the scenario catalog tables.
--
-- `created_at` is `@default(now())`, which Prisma maps to DEFAULT CURRENT_TIMESTAMP, so it
-- can be added straight away and keeps its default.
--
-- `updated_at` is `@updatedAt`: Prisma manages it client-side and declares NO database
-- default, so the generated migration added it as NOT NULL with no default — impossible on
-- these already-populated tables (16 scenarios, 76 levels, 151 tasks, 1080 learning
-- sections, 591 hints, 834 acceptance criteria). Backfill existing rows with
-- CURRENT_TIMESTAMP, then DROP the default so the column matches the schema exactly
-- (a lingering default would show up as drift on the next `migrate dev`).

-- AlterTable
ALTER TABLE "acceptance_criteria" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "acceptance_criteria" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "hints" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "hints" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "learning_sections" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "learning_sections" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "level_tasks" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "level_tasks" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "levels" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "levels" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "scenarios" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "scenarios" ALTER COLUMN "updated_at" DROP DEFAULT;
