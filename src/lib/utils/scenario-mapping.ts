/**
 * Maps legacy frontend scenario folder names (e.g. "scenario-1") to the actual
 * database scenario IDs used by the current seed files.
 *
 * This is needed because the frontend derives the scenario id from the
 * file-system folder name (scenario-1, scenario-2, …) while the Prisma seed
 * uses explicit, unique ids per stack (e.g. pern-lb-scenario-1).
 */

export const SCENARIO_ID_MAP: Record<string, Record<string, string>> = {
  "react-express-postgres-prisma": {
    "scenario-1": "pern-lb-scenario-1",
    "scenario-2": "pern-oe-scenario-2",
    "scenario-3": "pern-pos-scenario-3",
  },
  "react-express-mongodb": {
    "scenario-1": "mern-rn-scenario-1",
    "scenario-2": "mern-ft-scenario-2",
    "scenario-3": "mern-tw-scenario-3",
  },
  "nestjs-postgres-prisma": {
    "scenario-1": "nestjs-fs-scenario-1",
    "scenario-2": "nestjs-bh-scenario-2",
    "scenario-3": "nestjs-pos-scenario-3",
  },
  "nextjs-postgres-prisma": {
    "scenario-1": "nextjs-postgres-prisma-1",
    "scenario-2": "nextjs-postgres-prisma-2",
    "scenario-3": "nextjs-postgres-prisma-3",
  },
  "nextjs-shadcn-ui": {
    "scenario-1": "nextjs-shadcn-ui-scenario-1",
    "scenario-2": "nextjs-shadcn-ui-scenario-2",
    "scenario-3": "nextjs-shadcn-ui-scenario-3",
  },
};

/**
 * Resolve a frontend scenario folder name to the real database scenario id.
 * Returns the original `scenarioId` if no mapping is found (allowing the
 * caller to fall back to a direct database lookup).
 */
export function resolveScenarioId(
  stackName: string,
  scenarioId: string,
): string {
  return SCENARIO_ID_MAP[stackName]?.[scenarioId] ?? scenarioId;
}
