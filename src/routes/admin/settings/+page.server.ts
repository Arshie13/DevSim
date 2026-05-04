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

import { fail } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import type { Actions } from './$types';

const execAsync = promisify(exec);

export const actions: Actions = {
  resetDocker: async ({ locals }) => {
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

    try {
      const scriptPath = path.resolve('scripts/reset-docker-containers.ts');
      const { stdout, stderr } = await execAsync(`npx tsx ${scriptPath} --force`);
      console.log('Reset Docker output:', stdout);
      if (stderr) console.error('Reset Docker error:', stderr);
      
      return { success: true, message: 'Successfully reset Docker containers' };
    } catch (error) {
      console.error('Error resetting Docker containers:', error);
      return fail(500, { message: 'Failed to reset Docker containers. Check server logs.' });
    }
  }
};
