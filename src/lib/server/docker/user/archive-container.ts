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
	// req.dbContainerId here is the Prisma Container.id (primary key).
	const record = await prisma.workspace.findUnique({
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
	// Get stacks from ContainerStack relation
	const containerStacks = await prisma.workspaceStack.findMany({
		where: { workspaceId: record.id }
	});
	const stackNames = containerStacks.map(s => s.stackName);
	const stackSlug = stackNames.join('-').toLowerCase().replace(/\s+/g, '-');
	const randomSuffix = crypto.randomBytes(4).toString('hex'); // 8 chars for uniqueness
	const volumeName = `devsim-${record.userId}-${stackSlug}-${randomSuffix}`;

	// --- 3. Create the named Docker volume ---
	await docker.createVolume({ Name: volumeName });

	// --- 4. Copy /workspace into the volume via a helper container ---
	// Declare helper outside try so the finally block can always clean it up.
	let helper: Awaited<ReturnType<typeof docker.createContainer>> | null = null;
	try {
		// Stream the full workspace tar out of the source container.
		// Use '/workspace/.' (trailing dot) so the tar contains file entries at the
		// ROOT level (./file.txt, ./src/, …) rather than wrapped inside a 'workspace/'
		// directory. When putArchive writes into '/data' on the helper, the volume ends
		// up with /data/file.txt — NOT /data/workspace/file.txt.
		// This prevents the nested '/workspace/workspace/…' structure on restore.
		const sourceContainer = docker.getContainer(record.containerId);
		const archiveStream = await sourceContainer.getArchive({ path: '/workspace/.' });

		// Use node:20-alpine — already present on the host (same image as all user containers).
		// AutoRemove: false so we can call remove() ourselves — this guarantees the volume
		// consumer is fully gone before any subsequent vol.remove() call.
		// 'sleep' is PID 1 directly so SIGTERM exits it immediately on stop().
		const helperSuffix = crypto.randomBytes(4).toString('hex');
		helper = await docker.createContainer({
			Image: 'node:20-alpine',
			Cmd: ['sleep', '3600'],
			name: `devsim-archive-helper-${helperSuffix}`,
			Labels: { 'devsim.internal': 'archive-helper' },
			HostConfig: {
				Binds: [`${volumeName}:/data`],
				AutoRemove: false
			}
		});

		await helper.start();

		// Push the tar archive into /data — Docker writes through the mount into the volume
		await helper.putArchive(archiveStream as NodeJS.ReadableStream, { path: '/data' });
	} catch (copyErr) {
		// If copy fails, remove the volume so we don't leave orphans
		try {
			const vol = docker.getVolume(volumeName);
			await vol.remove();
		} catch {
			/* best-effort cleanup */
		}
		throw new Error(`Failed to copy workspace to volume: ${String(copyErr)}`);
	} finally {
		// Stop then explicitly remove the helper — ensures the volume has zero consumers
		// before we return. AutoRemove:false + explicit remove() is synchronous from our
		// perspective, unlike AutoRemove:true which lets Docker remove it asynchronously.
		if (helper) {
			try { await helper.stop({ t: 2 }); } catch { /* already stopped */ }
			try { await helper.remove(); } catch { /* already removed */ }
		}
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
	await prisma.workspace.update({
		where: { id: record.id },
		data: {
			volumeName,
			isArchived: true,
			stoppedAt: new Date()
		}
	});

	return { volumeName, dbContainerId: record.id };
}
