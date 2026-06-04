import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from "$lib/server/client";

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  const url = event.url;
  const amount = url.searchParams.get('amount');
  const xp = url.searchParams.get('xp');

  if (!amount || isNaN(parseInt(amount))) {
    throw error(400, 'Invalid amount');
  }

  const coinAmount = parseInt(amount);
  const xpAmount = xp ? parseInt(xp) : 0;

  if (xp && isNaN(xpAmount)) {
    throw error(400, 'Invalid XP amount');
  }

  try {
    const updateData: any = {
      coins: { increment: coinAmount }
    };

    if (xpAmount > 0) {
      updateData.xp = { increment: xpAmount };
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { coins: true, xp: true }
    });

    return Response.json({ success: true, coins: updatedUser.coins, xp: updatedUser.xp });
  } catch (err) {
    console.error('Error adding coins/XP:', err);
    throw error(500, 'Failed to update user rewards');
  }
};