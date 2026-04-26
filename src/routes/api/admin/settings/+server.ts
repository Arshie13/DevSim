import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import { getAllAppSettings, setAppSetting } from '$lib/server/app-settings';

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.auth();
  
  if (!session?.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!dbUser || dbUser.role !== 'ADMIN') {
    return json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const settings = await getAllAppSettings();
  return json(settings);
};

export const PATCH: RequestHandler = async ({ locals, request }) => {
  const session = await locals.auth();
  
  if (!session?.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!dbUser || dbUser.role !== 'ADMIN') {
    return json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return json({ error: 'Missing required fields: key, value' }, { status: 400 });
    }

    await setAppSetting(key, value);
    
    const updatedSettings = await getAllAppSettings();
    return json(updatedSettings);
  } catch (error) {
    console.error('Error updating app setting:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to update setting' },
      { status: 500 }
    );
  }
};
