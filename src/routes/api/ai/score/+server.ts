import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ScoringService } from '$lib/layers/service/ScoringService';

const scoringService = new ScoringService();

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();

    const result = await scoringService.processScore(body);

    if (result.error) {
      const status = result.isRateLimited ? 429 : 500;
      return json({
        success: false,
        stars: result.stars,
        score: result.score,
        feedback: result.feedback,
        masteryPassed: result.masteryPassed,
        masteryGaps: result.masteryGaps,
        error: result.error
      }, { status });
    }

    return json({
      success: true,
      stars: result.stars,
      score: result.score,
      feedback: result.feedback,
      improvements: result.improvements,
      nextTime: result.nextTime,
      masteryPassed: result.masteryPassed,
      masteryGaps: result.masteryGaps,
      level: result.level,
      levelTitle: result.levelTitle
    });
  } catch (error) {
    console.error('Error in scoring endpoint:', error);
    return json(
      {
        success: false,
        stars: 1,
        score: 33,
        feedback: 'No worries — every expert was once a beginner. Keep practicing and you\'ll get there!',
        masteryPassed: false,
        masteryGaps: 'Mastery check failed due to an AI service error. Please retry submit.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};
