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
}

// Helper to get level by order
async function getLevelByOrder(order: number) {
  return prisma.level.findFirst({
    where: { order },
    orderBy: { order: 'asc' }
  });
}

export const POST: RequestHandler = async ({ params, locals, request }) => {
	// --- Auth check ---
	const session = await locals.auth();
	if (!session?.user?.id) {
		return error(401, 'Unauthorized');
	}

	try {
		const body: SubmitRequest = await request.json();
		const { taskId } = body

		if (!taskId) {
			return error(400, 'Missing taskId');
		}

		// --- Look up the Container record ---
		// NOTE: params.id is the Prisma Container.id (as documented above)
		const record = await prisma.container.findUnique({
			where: { id: params.id }
		});


		if (!record) {
			return error(404, 'Container not found.');
		}

		// --- Ownership check ---
		if (record.userId !== session.user.id) {
			return error(403, 'You do not own this container.');
		}

		const currentLevel = record.level;


		// --- Get level info by order ---
		const levelInfo = await getLevelByOrder(currentLevel);
		if (!levelInfo) {
			return error(404, 'Level not found.');
		}

		const xpReward = levelInfo.xpReward || DEFAULT_XP_REWARD;
		const coinReward = levelInfo.coinReward || DEFAULT_COIN_REWARD;
		const levelTasks = levelInfo.task || [];

		// --- FIX #5: Guard against division by zero ---
		const tasksCount = levelTasks.length;
		const partialXpReward = tasksCount > 0 ? Math.floor(xpReward / tasksCount) : 0;
		const partialCoinReward = tasksCount > 0 ? Math.floor(coinReward / tasksCount) : 0;

		// --- Update completed tasks ---
		const currentCompletedTasks = record.completedTasks || [];
		if (!currentCompletedTasks.includes(taskId)) {
			currentCompletedTasks.push(taskId);
		}


		// --- Check if all tasks are completed ---
		// FIX #5: Need tasksCount > 0 to consider all tasks completed
		const allTasksCompleted = tasksCount > 0 && levelTasks.every(task => 
			currentCompletedTasks.includes(task)
		);

		let levelComplete = false;
		let nextLevel = currentLevel;

		// --- Prisma transaction: update tasks + award rewards atomically ---
		if (allTasksCompleted) {

			levelComplete = true;
			nextLevel = currentLevel + 1;

			// Check if there's a next level available
			const nextLevelInfo = await getLevelByOrder(nextLevel);

			if (!nextLevelInfo) {
				// No more levels - this is the final completion
				// Mark container as fully completed
				await prisma.$transaction([
					prisma.container.update({
						where: { id: record.id },
						data: {
							status: 'completed',
							completedTasks: currentCompletedTasks,
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
			}

			// Advance to next level (keep container running with new tasks)
			await prisma.$transaction([
				prisma.container.update({
					where: { id: record.id },
					data: {
						level: nextLevel,
						completedTasks: [], // Reset tasks for new level
						status: 'in-progress'
					}
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
		} else {
			// FIX #4: Wrap in transaction for atomic update
			await prisma.$transaction([
				// Just mark the task as completed
				prisma.container.update({
					where: { id: record.id },
					data: {
						completedTasks: currentCompletedTasks
					}
				}),

				// Award partial rewards for completing a task
				prisma.user.update({
					where: { id: session.user.id },
					data: {
						xp: { increment: partialXpReward },
						coins: { increment: partialCoinReward }
					}
				})
			]);
		}

		return json({
			success: true,
			rewards: { 
				xp: allTasksCompleted ? xpReward : partialXpReward, 
				coins: allTasksCompleted ? coinReward : partialCoinReward 
			},
			levelComplete,
			allLevelsComplete: false,
			nextLevel: levelComplete ? nextLevel : null,
			progress: {
				completed: currentCompletedTasks.length,
				total: tasksCount
			}
		});
	} catch (err) {
		console.error('Submit error:', err);
		return error(500, `Submit failed: ${String(err)}`);
	}
};
