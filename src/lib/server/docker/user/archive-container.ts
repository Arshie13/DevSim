/**
 * archive-container.ts
 *
 * Service that archives a completed container's /workspace into a named
 * Docker volume, then stops and removes the original container.
 * This preserves the user's work so it can be restored later via the paywall.
 *
 * Flow:
 *  1. Validate the container belongs to the user and is completed.
 *  2. Create a named Docker volume.
 *  3. Stream /workspace tar out of the source container and into the volume
 *     via a short-lived node:20-alpine helper (already present on the host —
 *     no pull needed, unlike busybox which may not exist).
 *  4. Stop and remove the original container.
 *  5. Update the DB record with volumeName + isArchived = true.
 */

import { docker } from '$lib/server/docker/client';
import prisma from '$lib/server/client';
import crypto from 'crypto';

export interface ArchiveContainerRequest {
	dbContainerId: string; // Prisma Container.id
	userId: string;
}

export interface ArchiveContainerResult {
	volumeName: string;
	dbContainerId: string;
}

/**
 * Archives a completed container to a Docker volume.
 * Throws on validation errors or Docker failures.
 */
export async function archiveContainer(
	req: ArchiveContainerRequest
): Promise<ArchiveContainerResult> {
	// --- 1. Look up & validate the container record ---
	const record = await prisma.container.findUnique({
		where: { id: req.dbContainerId }
	});

	if (!record) {
		throw new Error('Container record not found.');
	}

	if (record.userId !== req.userId) {
		throw new Error('You do not own this container.');
	}

	if (record.status !== 'completed') {
		throw new Error('Only completed containers can be archived.');
	}

	if (record.isArchived) {
		throw new Error('Container is already archived.');
	}

	// --- 2. Build a deterministic volume name ---
	const stackSlug = record.stacks.join('-').toLowerCase().replace(/\s+/g, '-');
	const randomSuffix = crypto.randomBytes(4).toString('hex'); // 8 chars for uniqueness
	const volumeName = `devsim-${record.userId}-${stackSlug}-${randomSuffix}`;

	// --- 3. Create the named Docker volume ---
	await docker.createVolume({ Name: volumeName });

	// --- 4. Copy /workspace into the volume via a helper container ---
	try {
		// Stream the workspace tar out of the source container
		const sourceContainer = docker.getContainer(record.containerId);
		const archiveStream = await sourceContainer.getArchive({ path: '/workspace/LIBRARY_MANAGEMENT' });

		// Use node:20-alpine — already present on the host (same image as all user containers).
		// It mounts the new volume at /data and stays alive long enough to receive the tar.
		const helper = await docker.createContainer({
			Image: 'node:20-alpine',
			Cmd: ['sh', '-c', 'sleep 60'],
			HostConfig: {
				Binds: [`${volumeName}:/data`]
			}
		});

		await helper.start();

		// Push the tar archive into /data — Docker writes through the mount into the volume
		await helper.putArchive(archiveStream as NodeJS.ReadableStream, { path: '/data' });

		// Clean up: stop + remove the short-lived helper
		await helper.stop({ t: 2 });
		await helper.remove();
	} catch (copyErr) {
		// If copy fails, remove the volume so we don't leave orphans
		try {
			const vol = docker.getVolume(volumeName);
			await vol.remove();
		} catch {
			/* best-effort cleanup */
		}
		throw new Error(`Failed to copy workspace to volume: ${String(copyErr)}`);
	}

	// --- 5. Stop & remove the original Docker container ---
	try {
		const original = docker.getContainer(record.containerId);
		const info = await original.inspect();
		if (info.State.Running) {
			await original.stop({ t: 5 });
		}
		await original.remove();
	} catch (removeErr) {
		// Container may already be stopped/removed — log but don't fail
		console.warn('Could not stop/remove original container (may already be gone):', removeErr);
	}

	// --- 6. Update DB: mark as archived, store volume name ---
	await prisma.container.update({
		where: { id: req.dbContainerId },
		data: {
			volumeName,
			isArchived: true,
			stoppedAt: new Date()
		}
	});

	return { volumeName, dbContainerId: req.dbContainerId };
}
