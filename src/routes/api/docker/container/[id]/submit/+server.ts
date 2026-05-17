/**
 * POST /api/docker/container/[id]/submit
 *
 * Marks a container's task as "completed" and awards XP + coins to the user.
 * If all tasks in the level are completed, the user advances to the next level.
 *
 * Auth: session required, must own the container.
 * Params: [id] = Prisma Container.id (NOT the Docker container ID).
 * Body: { taskId: string }
 * Returns: { success, rewards: { xp, coins }, levelComplete: boolean, nextLevel: number }
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';

// Default rewards — used when a linked Level record is unavailable.
const DEFAULT_XP_REWARD = 100;
const DEFAULT_COIN_REWARD = 50;

interface SubmitRequest {
  taskId: string;
  advanceLevel?: boolean; // If true, will advance level when all tasks complete
}

// Helper to get level by order, scoped to the container's scenario.
// Multiple scenarios share level orders (1..5), so the scenario must be
// part of the lookup — otherwise this resolves to the wrong scenario's level.
async function getLevelByOrder(order: number, scenarioId: string) {
  return prisma.level.findFirst({
    where: { order, scenarioId },
    orderBy: { order: 'asc' },
    include: {
      tasks: {
        orderBy: { order: 'asc' }
      }
    }
  });
}

// Helper to get the highest level order for a scenario.
async function getHighestLevelOrder(scenarioId: string): Promise<number> {
  const highestLevel = await prisma.level.findFirst({
    where: { scenarioId },
    orderBy: { order: 'desc' },
    select: { order: true }
  });
  return highestLevel?.order ?? 0;
}

export const POST: RequestHandler = async ({ params, locals, request }) => {
	// --- Auth check ---
	const session = await locals.auth();
	if (!session?.user?.id) {
		return error(401, 'Unauthorized');
	}

	try {
		const body: SubmitRequest = await request.json();
		const { taskId, advanceLevel } = body

		if (!taskId) {
			return error(400, 'Missing taskId');
		}

		// --- Look up the Container record ---
		// params.id is the Docker container ID (stored in Prisma as containerId)
		const record = await prisma.container.findFirst({
			where: { containerId: params.id, userId: session.user.id }
		});


		if (!record) {
			return error(404, 'Container not found.');
		}

		// --- Ownership check ---
		if (record.userId !== session.user.id) {
			return error(403, 'You do not own this container.');
		}

		const currentLevel = record.level;
		const scenarioId = record.currentScenarioId;


		// --- Get level info by order (scoped to the container's scenario) ---
		const levelInfo = await getLevelByOrder(currentLevel, scenarioId);
		if (!levelInfo) {
			return error(404, 'Level not found.');
		}


		const xpReward = levelInfo.xpReward || DEFAULT_XP_REWARD;
		const coinReward = levelInfo.coinReward || DEFAULT_COIN_REWARD;
		const levelTasks = levelInfo.tasks.map(t => t.taskName);

		// --- Get completed tasks from CompletedTask table ---
		const currentCompletedTasks = await prisma.completedTask.findMany({
			where: { containerId: record.id },
			select: { taskName: true }
		});
		const completedTaskNames = currentCompletedTasks.map(t => t.taskName);

		// --- Add new completed task if not already completed ---
		if (!completedTaskNames.includes(taskId)) {
			await prisma.completedTask.create({
				data: {
					containerId: record.id,
					taskName: taskId
				}
			});
			completedTaskNames.push(taskId);
		}


		// --- Check if all tasks are completed ---
		const allTasksCompleted = levelTasks.every(task => 
			completedTaskNames.includes(task)
		);

		// Only auto-advance level if explicitly requested (via Submit Sprint modal)
		// Individual task checkboxes should NOT auto-advance
		const shouldAdvanceLevel = advanceLevel === true && allTasksCompleted;

		let levelComplete = false;
		let nextLevel = currentLevel;

		// --- Prisma transaction: update tasks + award rewards atomically ---
		if (shouldAdvanceLevel) {

			levelComplete = true;
			nextLevel = currentLevel + 1;

			// Get the highest level order to determine if this is the last level
			const highestLevelOrder = await getHighestLevelOrder(scenarioId);
			const isLastLevel = currentLevel >= highestLevelOrder;

			if (isLastLevel) {
				// No more levels - this is the final completion
				// Mark container as completed - archiving will be handled separately by the archive API
				await prisma.$transaction([
					prisma.container.update({
						where: { id: record.id },
						data: {
							status: 'completed',
							stoppedAt: new Date()
						}
					}),
					prisma.user.update({
						where: { id: session.user.id },
						data: {
							xp: { increment: xpReward * 2 }, // Bonus for completing all levels!
							coins: { increment: coinReward * 2 }
						}
					})
				]);

				return json({
					success: true,
					rewards: { xp: xpReward * 2, coins: coinReward * 2 },
					levelComplete: true,
					allLevelsComplete: true,
					nextLevel: null
				});
			} else {
				// Advance to next level (keep container running with new tasks)
				await prisma.$transaction([
					prisma.container.update({
						where: { id: record.id },
						data: {
							level: nextLevel,
							status: 'in-progress'
						}
					}),
					// Delete completed tasks for this container when advancing to next level
					prisma.completedTask.deleteMany({
						where: { containerId: record.id }
					}),
					prisma.user.update({
						where: { id: session.user.id },
						data: {
							xp: { increment: xpReward },
							coins: { increment: coinReward },
							level: { increment: 1 }
						}
					})
				]);
			}
		} else {
			// Just mark the task as completed (already done above when creating CompletedTask)
			// Award partial rewards for completing a task
			await prisma.user.update({
				where: { id: session.user.id },
				data: {
					xp: { increment: Math.floor(xpReward / levelTasks.length) },
					coins: { increment: Math.floor(coinReward / levelTasks.length) }
				}
			});
		}

		return json({
			success: true,
			rewards: { 
				xp: allTasksCompleted ? xpReward : Math.floor(xpReward / levelTasks.length), 
				coins: allTasksCompleted ? coinReward : Math.floor(coinReward / levelTasks.length) 
			},
			levelComplete,
			allLevelsComplete: false,
			nextLevel: levelComplete ? nextLevel : null,
			progress: {
				completed: completedTaskNames.length,
				total: levelTasks.length
			}
		});
	} catch (err) {
		console.error('Submit error:', err);
		return error(500, `Submit failed: ${String(err)}`);
	}
};
