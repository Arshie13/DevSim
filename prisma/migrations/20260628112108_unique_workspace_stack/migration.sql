-- Clean up duplicate workspace_stack rows before applying unique constraint.
-- Keeps the earliest row (min id) per workspace_id.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM workspace_stack GROUP BY workspace_id HAVING COUNT(*) > 1
  ) THEN
    DELETE FROM workspace_stack
    WHERE id IN (
      SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY workspace_id ORDER BY id) AS rn
        FROM workspace_stack
      ) sub
      WHERE rn > 1
    );
  END IF;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX "workspace_stack_workspace_id_key" ON "workspace_stack"("workspace_id");
