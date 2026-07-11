export const SPECIAL_UNLOCK_DAYS = [6, 12, 18, 24, 30];

const DAY_TO_SCENARIO: Record<number, string> = {
  6: 'pern-pos-scenario-3',
  12: 'mern-tw-scenario-3',
  18: 'nestjs-pos-scenario-3',
  24: 'nextjs-postgres-prisma-3',
  30: 'nextjs-shadcn-ui-scenario-3',
};

export const SCENARIO_3_IDS = new Set(Object.values(DAY_TO_SCENARIO));

export function getSpecialUnlocksForDay(day: number): string[] {
  const id = DAY_TO_SCENARIO[day];
  return id ? [id] : [];
}
