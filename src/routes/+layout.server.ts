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
  // Skip the public landing page (route '/'): achievement toasts belong inside
  // the app, and detection *persists* the unlock, so running it here would
  // consume the unlock and the toast would never reach the dashboard. Leaving it
  // un-persisted lets the next in-app navigation detect and surface it.
  if (session?.user?.id && event.route.id !== '/') {
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
