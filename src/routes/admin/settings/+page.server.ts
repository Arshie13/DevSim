import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/client';
import { resolveStackName } from '$lib/utils/scenario-mapping';

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
  const masteryEnabled = await prisma.app_setting.findUnique({
    where: { key: 'mastery_checkpoint_enabled' }
  });

  const settings = {
    mastery_checkpoint_enabled: masteryEnabled 
      ? masteryEnabled.value === 'true'
      : true
  };

  const scenarios = await prisma.scenario.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, description: true, isPaywalled: true }
  });

  const scenariosWithStack = scenarios.map(s => ({
    ...s,
    stackName: resolveStackName(s.id) ?? 'Unknown'
  }));

  const adminEnrollment = await prisma.learner_pass_enrollment.findFirst({
    where: { user_id: session.user.id },
    select: { id: true, started_at: true }
  });

  return {
    user: session.user,
    settings,
    scenarios: scenariosWithStack,
    adminEnrollment: adminEnrollment
      ? { id: adminEnrollment.id, startedAt: adminEnrollment.started_at?.toISOString() ?? null }
      : null,
  };
};

import { fail } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import type { Actions } from './$types';

const execAsync = promisify(exec);

export const actions: Actions = {
  toggleScenarioPaywall: async ({ locals, request }) => {
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

    const formData = await request.formData();
    const scenarioId = formData.get('scenarioId') as string;

    if (!scenarioId) {
      return fail(400, { message: 'Missing scenario ID' });
    }

    const scenario = await prisma.scenario.findUnique({
      where: { id: scenarioId },
      select: { is_paywalled: true }
    });

    if (!scenario) {
      return fail(404, { message: 'Scenario not found' });
    }

    await prisma.scenario.update({
      where: { id: scenarioId },
      data: { is_paywalled: !scenario.is_paywalled }
    });

    return { success: true };
  },
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
  },
  simulateNextDay: async ({ locals }) => {
    const session = await locals.auth();
    if (!session?.user) throw redirect(303, '/login');

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });
    if (!dbUser || dbUser.role !== 'ADMIN') throw redirect(303, '/');

    const enrollment = await prisma.learner_pass_enrollment.findFirst({
      where: { user_id: session.user.id },
    });
    if (!enrollment) return fail(400, { message: 'No active learner pass enrollment' });

    await prisma.learner_pass_enrollment.update({
      where: { id: enrollment.id },
      data: { started_at: new Date(enrollment.started_at!.getTime() - 24 * 60 * 60 * 1000) },
    });

    return { success: true };
  },
};
