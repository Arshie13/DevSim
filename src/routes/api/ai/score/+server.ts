import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ScoringService } from '$lib/layers/service/ScoringService';
import { getFileChanges } from '$lib/server/fileChangeLogger';
import prisma from '$lib/server/client';

const scoringService = new ScoringService();

/**
 * Collect the paths the user created or modified for a container. The scoring
 * service uses these to guarantee the student's real work is read and shown to
 * the model, rather than relying on an alphabetical/truncated file snapshot.
 */
async function resolveChangedFiles(containerId: unknown): Promise<string[]> {
  if (typeof containerId !== 'string' || !containerId) return [];
  try {
    const changes = await getFileChanges(containerId);
    return Array.from(
      new Set(
        changes
          .filter((change) => change.action !== 'DELETE')
          .map((change) => change.filePath)
          .filter((filePath): filePath is string => typeof filePath === 'string' && filePath.length > 0)
      )
    );
  } catch (error) {
    console.warn('[ai/score] Could not resolve changed files:', error);
    return [];
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();

    const aiScoringEnabled = await prisma.app_setting.findFirst({
      where: {
        key: "mastery_checkpoint_enabled"
      },
      select: {
        value: true
      }
    });

    if (aiScoringEnabled?.value) {
      return json({
        success: true,
        stars: 3,
        score: 100,
        feedback: "AI scoring is bypassed.",
        improvements: "No content detected since AI scoring is bypassed",
        nextTime: "Prepare yourself",
        masteryPassed: true,
        masteryGaps: "None whatsoever",
        error: null
      });
    }

    const result = await scoringService.processScore({
      ...body,
      changedFiles: await resolveChangedFiles(body?.containerId)
    });

    if (result.error) {
      return json({
        success: false,
        stars: result.stars,
        score: result.score,
        feedback: result.feedback,
        masteryPassed: result.masteryPassed,
        masteryGaps: result.masteryGaps,
        error: result.error
      }, { status: 500 });
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
