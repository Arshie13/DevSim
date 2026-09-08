import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { StackDescriptionService } from '$lib/layers/service/StackDescriptionService';

const stackDescriptionService = new StackDescriptionService();

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { selection } = body;

    const result = await stackDescriptionService.generateDescription({ selection });

    if (result.error) {
      const error = typeof result.error === 'string' ? result.error : String(result.error);
      const status = error.includes('Invalid selection') || error.includes('At least 2') ? 400 : 503;
      return json({ success: false, error }, { status });
    }

    return json({
      success: true,
      description: result.description
    });
  } catch (error) {
    console.error('Stack description generation error:', error);
    return json({
      success: false,
      error: 'An unexpected error occurred while generating the stack description',
      status: 500
    }
    );
  }
};