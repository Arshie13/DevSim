import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllAppSettings } from '$lib/server/app-settings';

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.auth();
  
  if (!session?.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getAllAppSettings();
  return json(settings);
};
