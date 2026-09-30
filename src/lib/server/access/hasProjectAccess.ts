import prisma from "$lib/server/client";
import { SCENARIO_3_IDS } from "$lib/server/learnerPass/schedule";

/**
 * Check whether a user has access to a given scenario (by DB scenario ID).
 *
 * Access is granted if any of the following are true:
 *   1. The scenario is not paywalled.
 *   2. The scenario is not a SCENARIO_3 project and the user has an active
 *      Learner Pass enrollment (fast path — no per-row lookup needed).
 *   3. The user has unlocked the scenario by spending a Learner Pass special day on it.
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

    if (enrollment && now <= enrollment.expires_at) {
      return true;
    }
  }

  // 3. An explicit unlock. The grant IS the Learner Pass choice now that
  //    `user_project_access` is gone: spending a special day on a scenario is what unlocks
  //    it, and the unlock outlives the pass (old rows were written with `expires_at = NULL`).
  const unlock = await prisma.learner_pass_claim.findFirst({
    where: {
      unlocked_scenario: scenarioDbId,
      enrollment: { user_id: userId },
    },
    select: { id: true },
  });

  return !!unlock;
}

export async function hasActiveLearnerPass(userId: string): Promise<boolean> {
  const enrollment = await prisma.learner_pass_enrollment.findFirst({
    where: {
      user_id: userId,
    },
  });

  if (!enrollment) return false;

  if (new Date() > enrollment.expires_at) {
    return false;
  }

  return true;
}