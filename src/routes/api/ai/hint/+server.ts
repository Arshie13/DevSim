import { json, isHttpError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { HintService } from '$lib/layers/service/HintService';
import { requireWorkspaceAccess } from '$lib/server/docker/workspace-access';

const hintService = new HintService();

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // --- Auth: the billed user is always the session user ---
    const session = await locals.auth();
    if (!session?.user?.id) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Any container the hint reads files from must belong to that same user.
    if (body?.containerId) {
      await requireWorkspaceAccess(locals, body.containerId);
    }

    const result = await hintService.processHint({
      ...body,
      // Never trust a client-supplied userId — it decides whose coins are spent.
      userId: session.user.id,
    });

    if (result.error) {
      const status = result.error.includes('coins') || result.error.includes('credit') ? 400 : 500;
      return json({ error: result.error, ...result }, { status });
    }

    return json({
      success: true,
      hint: result.hint,
      isGreeting: result.isGreeting,
      isWarning: result.isWarning,
      creditsSpent: result.creditsSpent,
      coinsSpent: result.coinsSpent,
      coinsRemaining: result.coinsRemaining,
      aiHelpsRemaining: result.aiHelpsRemaining
    });
  } catch (caught) {
    // Ownership/auth failures must surface as 401/404, not 500.
    if (isHttpError(caught)) {
      throw caught;
    }
    console.error('Error in hint endpoint:', caught);
    return json(
      { error: caught instanceof Error ? caught.message : 'Failed to generate hint' },
      { status: 500 }
    );
  }
};
