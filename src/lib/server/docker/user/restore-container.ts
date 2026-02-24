/**
 * restore-container.ts
 *
 * Restores an archived container from its saved Docker volume back into a
 * live running container. The DB record (Container.id) stays the same
 * throughout the full lifecycle — only the Docker container and volume are
 * created/destroyed around it.
 *
 * Lifecycle recap:
 *   start  → Container row created, isArchived=false, containerId=<dockerId>
 *   archive → Docker container removed, volume created, isArchived=true, volumeName=<vol>
 *   restore → New Docker container created from volume, volume deleted,
 *             same Container row updated: isArchived=false, containerId=<newDockerI>, volumeName=null
 *
 * Flow:
 *  1. Validate the DB record is archived and belongs to the user.
 *  2. Validate the user has enough coins (≥ RESTORE_COST).
 *  3. Create + start a new Docker container with the volume mounted at /workspace.
 *  4. In a Prisma transaction: update the SAME Container row + deduct coins.
 *  5. Delete the Docker volume (data is now live in the container).
 */

import { docker } from '$lib/server/docker/client';
import prisma from '$lib/server/client';

export const RESTORE_COST = 100;

export interface RestoreContainerRequest {
	dbContainerId: string; // Prisma Container.id of the ARCHIVED container
	userId: string;
}

export interface RestoreContainerResult {
	newDockerContainerId: string; // Docker container ID of the restored container
	dbContainerId: string;        // Same Prisma Container.id — unchanged
	coinsDeducted: number;
	restoreCost: number;
}

export async function restoreContainer(
	req: RestoreContainerRequest
): Promise<RestoreContainerResult> {
	// --- 1. Look up & validate the archived container record ---
	const record = await prisma.container.findUnique({
		where: { id: req.dbContainerId }
	});

	if (!record) {
		throw new Error('Container record not found.');
	}

	if (record.userId !== req.userId) {
		throw new Error('You do not own this container.');
	}

	if (!record.isArchived || !record.volumeName) {
		throw new Error('Container is not archived — nothing to restore.');
	}

	// --- 2. Validate the user has enough coins ---
	const user = await prisma.user.findUnique({
		where: { id: req.userId },
		select: { coins: true }
	});

	if (!user) {
		throw new Error('User not found.');
	}

	if ((user.coins ?? 0) < RESTORE_COST) {
		throw new Error(`Insufficient coins. You need ${RESTORE_COST} coins to restore this workspace.`);
	}

	// --- 3. Create a new Docker container with the volume mounted at /workspace ---
	const newContainer = await docker.createContainer({
		Image: 'node:20-alpine',
		Cmd: ['/bin/sh'],
		Tty: true,
		OpenStdin: true,
		WorkingDir: '/workspace',
		ExposedPorts: {
			'3000/tcp': {},
			'5173/tcp': {}
		},
		HostConfig: {
			PortBindings: {
				'3000/tcp': [{ HostPort: '0' }],
				'5173/tcp': [{ HostPort: '0' }]
			},
			Binds: [`${record.volumeName}:/workspace`],
			Memory: 512 * 1024 * 1024,
			AutoRemove: false
		},
		Labels: {
			'devsim.userId': req.userId,
			'devsim.stack': record.stacks.join('-'),
			'devsim.level': record.level.toString()
		}
	});

	// --- 4. Start the container ---
	await newContainer.start();

	// --- 5. Update the SAME DB record + deduct coins atomically ---
	// The Container.id never changes — only the Docker container ID, archive flag, and volume name.
	await prisma.$transaction([
		prisma.container.update({
			where: { id: req.dbContainerId },
			data: {
				containerId: newContainer.id, // new Docker container ID
				isArchived: false,
				volumeName: null,
				status: 'created'
			}
		}),
		prisma.user.update({
			where: { id: req.userId },
			data: { coins: { decrement: RESTORE_COST } }
		})
	]);

	// --- 6. Delete the Docker volume — data is now live in the container ---
	try {
		const vol = docker.getVolume(record.volumeName);
		await vol.remove();
	} catch (volErr) {
		// Non-fatal: log but don't fail the restore — the container is already running.
		console.warn('Could not remove Docker volume after restore (non-fatal):', volErr);
	}

	return {
		newDockerContainerId: newContainer.id,
		dbContainerId: req.dbContainerId, // same ID — unchanged
		coinsDeducted: RESTORE_COST,
		restoreCost: RESTORE_COST
	};
}
