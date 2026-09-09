import prisma from "$lib/server/client";
import { SCENARIO_3_IDS } from "$lib/utils/reward-constants";

/**
 * Check whether a user has access to a given scenario (by DB scenario ID).
 *
 * Access is granted if any of the following are true:
 *   1. The scenario is not paywalled.
 *   2. The scenario is not a SCENARIO_3 project and the user has an active
 *      Learner Pass enrollment (fast path — no per-row lookup needed).
 *   3. The user has a non-expired row in user_project_access for this scenario.
 *
 * @param userId   - The authenticated user's ID.
 * @param scenarioDbId - The resolved database scenario ID (not the folder name).
 */
export async function hasProjectAccess(
  userId: string,
  scenarioDbId: string,
): Promise<boolean> {
  // 1. Check if the scenario is paywalled. Non-paywalled scenarios are free for all.
  const scenario = await prisma.scenario.findUnique({
    where: { id: scenarioDbId },
    select: { is_paywalled: true },
  });

  if (!scenario?.is_paywalled) {
    return true;
  }

  const now = new Date();

  // 2. Learner Pass fast path (not applicable to SCENARIO_3 projects, which
  //    require an explicit per-scenario unlock even for pass holders).
  if (!SCENARIO_3_IDS.has(scenarioDbId)) {
    const enrollment = await prisma.learner_pass_enrollment.findFirst({
      where: { user_id: userId },
    });

    if (enrollment && (!enrollment.expires_at || now <= enrollment.expires_at)) {
      return true;
    }
  }

  // 3. Per-row access grant — must exist and must not be expired.
  const access = await prisma.user_project_access.findFirst({
    where: {
      user_id: userId,
      project_id: scenarioDbId,
      OR: [
        { expires_at: null },
        { expires_at: { gt: now } },
      ],
    },
  });

  return !!access;
}

export async function hasActiveLearnerPass(userId: string): Promise<boolean> {
  const enrollment = await prisma.learner_pass_enrollment.findFirst({
    where: {
      user_id: userId,
    },
  });

  if (!enrollment) return false;

  if (enrollment.expires_at && new Date() > enrollment.expires_at) {
    return false;
  }

  return true;
}