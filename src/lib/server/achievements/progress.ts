import prisma from "$lib/server/client";

/**
 * Per-user scalar snapshot used to evaluate achievement tier criteria.
 * All values come from existing Prisma sources — see docs/ACHIEVEMENTS_SPEC.md §5.
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
}

export async function getUserProgressSnapshot(userId: string): Promise<UserProgressSnapshot> {
  const [dbUser, streak, tasks, fileEdits, archivedContainers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, coins: true, has_completed_tutorial: true },
    }),
    prisma.daily_login.findUnique({ where: { user_id: userId }, select: { streak: true } }),
    prisma.completed_task.count({ where: { workspace: { user_id: userId } } }),
    prisma.user_file_changes.count({ where: { workspace: { user_id: userId } } }),
    prisma.workspace.findMany({
      where: { user_id: userId, is_archived: true },
      include: {
        workspace_stacks: { select: { stack_name: true } },
      }
    }),
  ]);

  const stackCounts = new Map<string, number>();
  for (const c of archivedContainers) {
    for (const s of c.workspace_stacks) {
      stackCounts.set(s.stack_name, (stackCounts.get(s.stack_name) ?? 0) + 1);
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
    loginStreak: streak?.streak ?? 0,
    tasksCompleted: tasks,
    fileEdits,
    scenariosCompleted: archivedContainers.length,
    distinctStacks: stackCounts.size,
    maxScenariosInAnyStack,
    levelsCompleted,
    tutorialCompleted: dbUser?.has_completed_tutorial ?? false,
  };
}

export interface CriterionProgress {
  current: number;
  target: number;
}

/**
 * Given a tier's JSON criteria and a user snapshot, return (current, target).
 * Unknown criterion types return zero progress — safe fallback.
 */
export function evaluateCriterion(criteria: unknown, snap: UserProgressSnapshot): CriterionProgress {
  if (!criteria || typeof criteria !== "object") return { current: 0, target: 1 };
  const c = criteria as { type?: string; count?: number; days?: number; xp?: number; coins?: number };

  switch (c.type) {
    case "scenarios_in_stack":
      return { current: snap.maxScenariosInAnyStack, target: c.count ?? 1 };
    case "distinct_stacks":
      return { current: snap.distinctStacks, target: c.count ?? 1 };
    case "tasks_completed":
      return { current: snap.tasksCompleted, target: c.count ?? 1 };
    case "levels_completed":
      return { current: snap.levelsCompleted, target: c.count ?? 1 };
    case "scenarios_completed":
      return { current: snap.scenariosCompleted, target: c.count ?? 1 };
    case "login_streak":
      return { current: snap.loginStreak, target: c.days ?? 1 };
    case "xp_total":
      return { current: snap.xp, target: c.xp ?? 1 };
    case "coins_earned":
      return { current: snap.coins, target: c.coins ?? 1 };
    case "file_edits":
      return { current: snap.fileEdits, target: c.count ?? 1 };
    case "tutorial_completed":
      return { current: snap.tutorialCompleted ? 1 : 0, target: 1 };
    default:
      return { current: 0, target: 1 };
  }
}
