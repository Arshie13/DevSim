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

export async function archiveContainer(
	req: ArchiveContainerRequest
): Promise<ArchiveContainerResult> {
	const record = await prisma.workspace.findUnique({
		where: { id: req.dbContainerId }
	});

	if (!record) {
		throw new Error('Container record not found.');
	}

	if (record.user_id !== req.userId) {
		throw new Error('You do not own this container.');
	}

	if (record.status !== 'completed') {
		throw new Error('Only completed containers can be archived.');
	}

	if (record.is_archived) {
		throw new Error('Container is already archived.');
	}

	// --- 2. Build a deterministic volume name ---
	// Get stacks from ContainerStack relation
	const containerStacks = await prisma.workspace_stack.findMany({
		where: { workspace_id: record.id }
	});
	const stackNames = containerStacks.map(s => s.stackName);
	const stackSlug = stackNames.join('-').toLowerCase().replace(/\s+/g, '-');
	const randomSuffix = crypto.randomBytes(4).toString('hex'); // 8 chars for uniqueness
	const volumeName = `devsim-${record.user_id}-${stackSlug}-${randomSuffix}`;

	await docker.createVolume({ Name: volumeName });

	let helper: Awaited<ReturnType<typeof docker.createContainer>> | null = null;
	try {
		const sourceContainer = docker.getContainer(record.container_id);
		const archiveStream = await sourceContainer.getArchive({ path: '/workspace/.' });

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

		await helper.putArchive(archiveStream as NodeJS.ReadableStream, { path: '/data' });
	} catch (copyErr) {
		try {
			const vol = docker.getVolume(volumeName);
			await vol.remove();
		} catch {
			/* best-effort cleanup */
		}
		throw new Error(`Failed to copy workspace to volume: ${String(copyErr)}`);
	} finally {
		if (helper) {
			try { await helper.stop({ t: 2 }); } catch { /* already stopped */ }
			try { await helper.remove(); } catch { /* already removed */ }
		}
	}

	try {
		const original = docker.getContainer(record.container_id);
		const info = await original.inspect();
		if (info.State.Running) {
			await original.stop({ t: 5 });
		}
		await original.remove();
	} catch (removeErr) {
		// Container may already be stopped/removed — log but don't fail
		console.warn('Could not stop/remove original container (may already be gone):', removeErr);
	}

	await prisma.workspace.update({
		where: { id: record.id },
		data: {
			volume_name: volumeName,
			is_archived: true,
			stoppedAt: new Date()
		}
	});

	return { volumeName, dbContainerId: record.id };
}
