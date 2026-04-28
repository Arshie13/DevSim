import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AdminSettingsService } from '$lib/layers/service/AdminSettingsService';

const adminSettingsService = new AdminSettingsService();

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.auth();
  
  if (!session?.user || !session.user.id) {
    return json({ error: 'Missing or stale session' }, { status: 401 });
  }

  const result = await adminSettingsService.getAllAppSettings();

  if (result.error) {
    return json({ error: result.error }, { status: result.status });
  }

  return json(result.data);
};

export const PATCH: RequestHandler = async ({ locals, request }) => {
  const session = await locals.auth();
  
  if (!session?.user || !session.user.id) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    const adminSettingsService = new AdminSettingsService();
    const result = await adminSettingsService.setAppSetting(session.user.id, key, value);

    if (result.error) {
      return json({
        error: result.error,
        status: result.status
      })
    }

    return json(result);
  } catch (error) {
    console.error('Error updating app setting:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to update setting' },
      { status: 500 }
    );
  }
};
