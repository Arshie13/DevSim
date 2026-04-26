import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/client';

export const load: PageServerLoad = async ({ locals }) => {
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

  // Fetch settings
  const [masteryEnabled] = await Promise.all([
    prisma.app_setting.findUnique({
      where: { key: 'mastery_checkpoint_enabled' }
    })
  ]);

  const settings = {
    mastery_checkpoint_enabled: masteryEnabled 
      ? masteryEnabled.value === 'true'
      : true
  };

  return {
    user: session.user,
    settings
  };
};
