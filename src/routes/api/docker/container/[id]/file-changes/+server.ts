import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getFileChanges, getFileChangeSummary } from '$lib/server/fileChangeLogger';

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    // --- Auth check ---
    const session = await locals.auth();
    if (!session?.user?.id) {
      return json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const containerId = url.searchParams.get('id');
    const summary = url.searchParams.get('summary') === 'true';

    if (!containerId) {
      return json({ 
        success: false, 
        error: 'containerId is required' 
      }, { status: 400 });
    }

    if (summary) {
      const fileChangeSummary = await getFileChangeSummary(containerId);
      return json({ 
        success: true, 
        data: fileChangeSummary 
      });
    }

    const fileChanges = await getFileChanges(containerId);
    return json({ 
      success: true, 
      data: fileChanges 
    });
  } catch (error) {
    console.error('Error fetching file changes:', error);
    return json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
};
