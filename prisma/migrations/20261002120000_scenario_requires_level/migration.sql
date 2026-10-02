-- A scenario must own at least one level.
--
-- A plain foreign key can only require "every level has a scenario" — the reverse
-- ("every scenario has a level") is not expressible in Prisma or with a bare FK, since
-- an FK constrains child rows, never the parent.
--
-- Enforce it with DEFERRABLE constraint triggers so a scenario and its first level can
-- be written in the same transaction: the check runs at COMMIT (not per row), so the
-- moment between inserting the scenario and inserting its level is allowed.
--
--   * scenarios AFTER INSERT  -> the newly created scenario must have a level.
--   * levels AFTER DELETE/UPDATE -> the level's former scenario must still have one
--     (skipped when that scenario is itself gone, e.g. ON DELETE CASCADE tearing it down,
--     or when the scenario row is deleted in the same transaction).
--
-- The check is intentionally cheap: it only runs for the scenario(s) affected by the
-- statement, and raises SQLSTATE 23000 (integrity_constraint_violation) so callers can
-- recognise it.

CREATE OR REPLACE FUNCTION assert_scenario_has_level() RETURNS trigger AS $$
DECLARE
  target_scenario TEXT;
BEGIN
  IF TG_TABLE_NAME = 'scenarios' THEN
    target_scenario := NEW.id;
  ELSE
    target_scenario := OLD.scenario_id;
  END IF;

  IF EXISTS (SELECT 1 FROM scenarios WHERE id = target_scenario)
     AND NOT EXISTS (SELECT 1 FROM levels WHERE scenario_id = target_scenario) THEN
    RAISE EXCEPTION 'scenario % must have at least one level', target_scenario
      USING ERRCODE = 'integrity_constraint_violation';
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER "scenarios_require_level"
  AFTER INSERT ON "scenarios"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION assert_scenario_has_level();

CREATE CONSTRAINT TRIGGER "levels_keep_scenario_populated"
  AFTER DELETE OR UPDATE ON "levels"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION assert_scenario_has_level();
