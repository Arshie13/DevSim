import type { PageServerLoad } from "./$types";
import { getLandingStats } from "$lib/server/stats/landing";

export const load: PageServerLoad = async () => ({
  landingStats: await getLandingStats(),
});
