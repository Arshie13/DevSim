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
  if (!amount || isNaN(parseInt(amount))) {
    throw error(400, 'Invalid amount');
  }

  const coinAmount = parseInt(amount);

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        coins: { increment: coinAmount }
      },
      select: { coins: true }
    });

    return Response.json({ success: true, coins: updatedUser.coins });
  } catch (err) {
    console.error('Error adding coins:', err);
    throw error(500, 'Failed to add coins');
  }
};