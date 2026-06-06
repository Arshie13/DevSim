import type { LayoutServerLoad } from './$types';
import { detectNewlyUnlockedAchievements } from '$lib/server/achievements/unlocks';

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.auth();

  // Touch the pathname so this load re-runs on every navigation. That makes it a
  // catch-all for achievement unlocks triggered by actions that don't otherwise
  // refresh the page (login streak, coin/XP awards, file edits, …): on the next
  // navigation we detect, persist, and hand the new unlocks to the client to toast.
  void event.url.pathname;

  let newlyUnlocked: Awaited<ReturnType<typeof detectNewlyUnlockedAchievements>> = [];
  if (session?.user?.id) {
    try {
      newlyUnlocked = await detectNewlyUnlockedAchievements(session.user.id);
    } catch (err) {
      console.error('[layout] achievement detection failed:', err);
    }
  }

  return {
    session,
    newlyUnlocked
  };
};
