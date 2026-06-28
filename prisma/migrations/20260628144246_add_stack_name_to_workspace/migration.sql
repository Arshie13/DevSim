-- AlterTable: add stack_name and stack_version columns to workspace
ALTER TABLE "workspace" ADD COLUMN "stack_name" TEXT;
ALTER TABLE "workspace" ADD COLUMN "stack_version" TEXT;

-- Copy data from workspace_stack to workspace
UPDATE "workspace" w
SET 
  "stack_name" = ws."stack_name",
  "stack_version" = ws."stack_version"
FROM "workspace_stack" ws
WHERE w."id" = ws."workspace_id";

-- DropTable
DROP TABLE "workspace_stack";
