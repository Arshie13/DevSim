const KEY_PREFIX = "tutorial-progress:v1";

export type TutorialProgress = {
  stepId: string;
  savedAt: number;
};

function buildKey(userId: string, tutorialKey: string): string {
  return `${KEY_PREFIX}:${userId}:${tutorialKey}`;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function getTutorialProgress(
  userId: string,
  tutorialKey: string,
): TutorialProgress | null {
  if (!canUseStorage() || !userId || !tutorialKey) return null;

  try {
    const raw = window.localStorage.getItem(buildKey(userId, tutorialKey));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { stepId?: unknown; savedAt?: unknown };
    if (typeof parsed.stepId === "string") {
      return {
        stepId: parsed.stepId,
        savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now(),
      };
    }

    window.localStorage.removeItem(buildKey(userId, tutorialKey));
    return null;
  } catch {
    return null;
  }
}

export function setTutorialProgress(
  userId: string,
  tutorialKey: string,
  stepId: string,
): void {
  if (!canUseStorage() || !userId || !tutorialKey || !stepId) return;

  try {
    window.localStorage.setItem(
      buildKey(userId, tutorialKey),
      JSON.stringify({ stepId, savedAt: Date.now() }),
    );
  } catch {
    // Ignore quota / privacy-mode storage failures.
  }
}

export function clearTutorialProgress(
  userId: string,
  tutorialKey: string,
): void {
  if (!canUseStorage() || !userId || !tutorialKey) return;

  try {
    window.localStorage.removeItem(buildKey(userId, tutorialKey));
  } catch {
    // Ignore storage failures.
  }
}
