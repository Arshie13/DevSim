import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AdminSettingsService } from '$lib/layers/service/AdminSettingsService';

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.auth();
  
  if (!session?.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminSettingsService = new AdminSettingsService();

  const allAppSettings = await adminSettingsService.getAllAppSettings();
  return json(allAppSettings);
};
