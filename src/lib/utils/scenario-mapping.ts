/**
 * Maps legacy frontend scenario folder names (e.g. "scenario-1") to the actual
 * database scenario IDs used by the current seed files.
 *
 * This is needed because the frontend derives the scenario id from the
 * file-system folder name (scenario-1, scenario-2, …) while the Prisma seed
 * uses explicit, unique ids per stack (e.g. pern-lb-scenario-1).
 *
 * New stacks that follow the convention `{stackName}-scenario-{N}` don't need
 * an entry here — `resolveScenarioId` auto-derives the DB ID from the stack
 * name and folder name.
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
  // Newer stacks follow the convention and don't strictly need entries here.
  // Entries below serve as documentation / explicit aliases.
  "svelte-drizzle": {
    "scenario-1": "svelte-drizzle-scenario-1",
  },
};

const LEGACY_REVERSE: Record<string, string> = {};
for (const [stack, scenarios] of Object.entries(SCENARIO_ID_MAP)) {
  for (const dbId of Object.values(scenarios)) {
    LEGACY_REVERSE[dbId] = stack;
  }
}

/**
 * Resolve a frontend scenario folder name to the actual database scenario id.
 *
 * Looks up the legacy map first; if no entry exists, derives the DB ID as
 * `{stackName}-{scenarioId}` (e.g. "svelte-drizzle-scenario-1").
 */
export function resolveScenarioId(
  stackName: string,
  scenarioId: string,
): string {
  return SCENARIO_ID_MAP[stackName]?.[scenarioId] ?? `${stackName}-${scenarioId}`;
}

/**
 * Reverse map: given a DB scenario id, return the tech stack name it belongs to.
 * Checks the legacy map first, then tries the convention pattern
 * `{stackName}-scenario-{N}`.
 */
export function resolveStackName(dbScenarioId: string): string | null {
  const fromLegacy = LEGACY_REVERSE[dbScenarioId];
  if (fromLegacy) return fromLegacy;

  const match = dbScenarioId.match(/^(.+)-scenario-\d+$/);
  return match ? match[1] : null;
}
