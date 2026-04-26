import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import prisma from '$lib/server/client';

export const load: LayoutServerLoad = async ({ locals }) => {
  const session = await locals.auth();
  
  if (!session?.user) {
    throw redirect(303, '/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!dbUser || dbUser.role !== 'ADMIN') {
    throw redirect(303, '/');
  }

  return {
    user: session.user
  };
};
