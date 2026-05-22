import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { PassProgressionService } from '$lib/layers/service/PassProgressionService';
import { SeasonService } from '$lib/layers/service/SeasonService';
import { PassRewardService } from '$lib/layers/service/PassRewardService';
import { AIHelpLimitService } from '$lib/layers/service/AIHelpLimitService';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  
  if (!session?.user?.id) {
    throw redirect(303, '/login');
  }
  
  const userId = session.user.id;
  
  // Initialize services
  const passProgressionService = new PassProgressionService();
  const seasonService = new SeasonService();
  const rewardService = new PassRewardService();
  const aiHelpService = new AIHelpLimitService();
  
  // Load core data
  const [passData, currentSeason, aiHelpStats] = await Promise.all([
    passProgressionService.getUserProgress(userId),
    seasonService.getCurrentSeason(),
    aiHelpService.getRemainingHelps(userId)
  ]);
  
  if (!passData) {
    throw redirect(303, '/'); // Or handle gracefully
  }
  
  // Now fetch claimed rewards for this season (needs seasonId)
  const claimedRewardIds = await rewardService.getClaimedRewards(userId, passData.season.id);
  
  // Inject claimed status into rewards
  passData.availableRewards.free = passData.availableRewards.free.map(r => ({
    ...r,
    claimed: claimedRewardIds.includes(r.id)
  }));
  passData.availableRewards.premium = passData.availableRewards.premium.map(r => ({
    ...r,
    claimed: claimedRewardIds.includes(r.id)
  }));
  
  // Map AI help stats to UI format
  const aiHelpsRemaining = {
    today: Math.max(0, aiHelpStats.limit - aiHelpStats.totalUsed),
    total: aiHelpStats.limit
  };
  
  // Calculate days remaining
  const daysRemaining = currentSeason
    ? Math.ceil((new Date(currentSeason.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  
   return {
     passData,
     season: currentSeason,
     daysRemaining,
     aiHelpsRemaining
   };
 };
