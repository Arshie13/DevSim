import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { HintService } from '$lib/layers/service/HintService';

const hintService = new HintService();

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();

    const result = await hintService.processHint(body);

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
      aiHelpsRemaining: result.aiHelpsRemaining,
      conversationId: result.conversationId
    });
  } catch (error) {
    console.error('Error in hint endpoint:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to generate hint' },
      { status: 500 }
    );
  }
};
