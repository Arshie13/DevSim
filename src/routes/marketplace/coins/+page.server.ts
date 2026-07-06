import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import prisma from "$lib/server/client";
import { UserDataAccess } from "$lib/layers/data-access/UserDataAccess";
import { COINS_PER_AI_HELP_CREDIT } from "$lib/utils/aiHelpConstants";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  const userData = session?.user;

  if (!userData || !userData.id) {
    throw redirect(303, '/');
  }

  const user = await prisma.user.findUnique({
    where: { id: userData.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      coins: true,
      xp: true,
      level: true,
      ai_help_credits: true,
      owned_avatars: true,
      has_completed_tutorial: true,
    }
  });

  if (!user) {
    throw redirect(303, '/');
  }

  return {
    user: {
      ...user,
      aiHelpCredits: user.ai_help_credits,
      ownedAvatars: user.owned_avatars,
      hasCompletedTutorial: user.has_completed_tutorial,
    }
  };
};

export const actions: Actions = {
  // Exchange coins for AI help credits at COINS_PER_AI_HELP_CREDIT coins each.
  buyAiHelpCredits: async (event) => {
    const session = await event.locals.auth();
    const userId = session?.user?.id;

    if (!userId) {
      return fail(401, { error: 'You must be logged in to exchange coins.' });
    }

    const formData = await event.request.formData();
    const credits = Math.floor(Number(formData.get('credits')));

    if (!Number.isFinite(credits) || credits < 1) {
      return fail(400, { error: 'Enter at least 1 AI help credit.' });
    }

    const coinCost = credits * COINS_PER_AI_HELP_CREDIT;
    const result = await new UserDataAccess().convertCoinsToAiHelpCredits(userId, credits, coinCost);

    if (!result.success) {
      return fail(400, { error: `Not enough coins — ${credits} credit${credits === 1 ? '' : 's'} costs ${coinCost} coins.` });
    }

    return {
      success: true,
      credits,
      coinCost,
      coins: result.coins,
      aiHelpCredits: result.aiHelpCredits
    };
  }
};
