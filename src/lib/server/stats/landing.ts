import prisma from "$lib/server/client";
import type { LandingStats } from "$lib/types/dashboard";
import { formatCompact } from "./format";

let cache: { value: LandingStats; expiresAt: number } | null = null;

export async function getLandingStats(): Promise<LandingStats> {
  if (cache && Date.now() < cache.expiresAt) return cache.value;

  const [activeDevs, stackGroups, scenarios] = await Promise.all([
    prisma.user.count(),
    prisma.containerStack.groupBy({ by: ["stackName"] }),
    prisma.scenario.count(),
  ]);

  const value: LandingStats = {
    activeDevs: formatCompact(activeDevs),
    techStacks: formatCompact(stackGroups.length),
    scenarios: formatCompact(scenarios),
    rating: "4.9★",
  };

  cache = { value, expiresAt: Date.now() + 60_000 };
  return value;
}
