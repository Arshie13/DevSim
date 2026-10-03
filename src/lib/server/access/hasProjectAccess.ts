import prisma from "$lib/server/client";

/**
 * Check whether a user has access to a given scenario (by DB scenario ID).
 *
 * Access is granted if either:
 *   1. The scenario is not paywalled.
 *   2. The user holds an *active* Learner Pass.
 *
 * There is no permanent, per-scenario unlock any more. Access to a locked scenario is a
 * property of the pass's lifetime: it is granted while a pass is active and revoked once
 * `expires_at` passes, until the user buys another pass. The "latest" enrollment is what
 * matters, because a user can hold several (one per payment) and an older expired row must
 * not shadow a newer active one.
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

  // 2. An active Learner Pass unlocks every paywalled scenario, SCENARIO_3 projects
  //    included. Access is time-bounded by the pass, not recorded per scenario.
  return hasActiveLearnerPass(userId);
}

/**
 * Whether the user currently holds a Learner Pass that has not expired.
 *
 * Picks the enrollment with the furthest `expires_at`, so overlapping or repeat purchases
 * are handled correctly and an older expired row cannot shadow an active one.
 */
export async function hasActiveLearnerPass(userId: string): Promise<boolean> {
  const enrollment = await prisma.learner_pass_enrollment.findFirst({
    where: {
      user_id: userId,
    },
    orderBy: { expires_at: 'desc' },
  });

  if (!enrollment) return false;

  return new Date() <= enrollment.expires_at;
}