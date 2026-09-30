import prisma from "$lib/server/client";
import type { AchievementCriterion } from "./definitions";
import { getLoginStreak } from "$lib/server/dailyRewards/queries";

/**
 * Per-user scalar snapshot used to evaluate achievement tier criteria.
 * All values come from existing Prisma sources.
 */
export interface UserProgressSnapshot {
  xp: number;
  coins: number;
  loginStreak: number;
  tasksCompleted: number;
  fileEdits: number;
  scenariosCompleted: number;
  distinctStacks: number;
  maxScenariosInAnyStack: number;
  levelsCompleted: number;
  tutorialCompleted: boolean;
  triviaCorrectCount: number;
}

export async function getUserProgressSnapshot(userId: string): Promise<UserProgressSnapshot> {
  const [dbUser, streak, tasks, fileEdits, archivedContainers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, coins: true, has_completed_tutorial: true, trivia_correct_count: true },
    }),
    getLoginStreak(userId),
    prisma.task_activity.count({ where: { user_id: userId } }),
    prisma.file_changes.count({
      where: {
        workspace: { user_id: userId },
        action: { in: ["WRITE", "RENAME"] },
      },
    }),
    prisma.workspace.findMany({
      where: { user_id: userId, is_archived: true },
      select: { stack_name: true, level: true },
    }),
  ]);

  const stackCounts = new Map<string, number>();
  for (const c of archivedContainers) {
    if (c.stack_name) {
      stackCounts.set(c.stack_name, (stackCounts.get(c.stack_name) ?? 0) + 1);
    }
  }

  const maxScenariosInAnyStack = Array.from(stackCounts.values()).reduce(
    (max, count) => Math.max(max, count),
    0
  );
  const levelsCompleted = archivedContainers.reduce((sum, c) => sum + (c.level ?? 0), 0);

  return {
    xp: dbUser?.xp ?? 0,
    coins: dbUser?.coins ?? 0,
    loginStreak: streak,
    tasksCompleted: tasks,
    fileEdits,
    scenariosCompleted: archivedContainers.length,
    distinctStacks: stackCounts.size,
    maxScenariosInAnyStack,
    levelsCompleted,
    tutorialCompleted: dbUser?.has_completed_tutorial ?? false,
    triviaCorrectCount: dbUser?.trivia_correct_count ?? 0,
  };
}

export interface CriterionProgress {
  current: number;
  target: number;
}

/**
 * Given a typed criterion and a user snapshot, return (current, target).
 *
 * The switch is exhaustive over `AchievementCriterion`: adding a criterion type
 * without handling it here is a *compile* error, not a silently-unearnable
 * achievement (which is what the old `unknown`-typed JSON version allowed).
 */
export function evaluateCriterion(
  c: AchievementCriterion,
  snap: UserProgressSnapshot,
): CriterionProgress {
  switch (c.type) {
    case "scenarios_in_stack":
      return { current: snap.maxScenariosInAnyStack, target: c.count };
    case "distinct_stacks":
      return { current: snap.distinctStacks, target: c.count };
    case "scenarios_completed":
      return { current: snap.scenariosCompleted, target: c.count };
    case "levels_completed":
      return { current: snap.levelsCompleted, target: c.count };
    case "tasks_completed":
      return { current: snap.tasksCompleted, target: c.count };
    case "login_streak":
      return { current: snap.loginStreak, target: c.days };
    case "file_edits":
      return { current: snap.fileEdits, target: c.count };
    case "xp_total":
      return { current: snap.xp, target: c.xp };
    case "coins_earned":
      return { current: snap.coins, target: c.coins };
    case "trivia_correct":
      return { current: snap.triviaCorrectCount, target: c.count };
    case "tutorial_completed":
      return { current: snap.tutorialCompleted ? 1 : 0, target: 1 };
    default: {
      // Exhaustiveness guard — unreachable while every member is handled above.
      const unhandled: never = c;
      console.error("[achievements] unhandled criterion", unhandled);
      return { current: 0, target: Number.POSITIVE_INFINITY };
    }
  }
}
