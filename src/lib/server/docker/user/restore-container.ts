import { docker } from '$lib/server/docker/client';
import prisma from '$lib/server/client';
import crypto from 'crypto';

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
	const record = await prisma.workspace.findUnique({
		where: { id: req.dbContainerId }
	});

	if (!record) {
		throw new Error('Container record not found.');
	}

	if (record.user_id !== req.userId) {
		throw new Error('You do not own this container.');
	}

	if (!record.is_archived || !record.volume_name) {
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

	// --- 3. Create the new container WITHOUT a volume mount ---
	// Get stack name from workspace for the label
	const stackNames = record.stack_name ? [record.stack_name] : [];

	// We intentionally do NOT bind the volume here. If we mount the volume directly
	// into the running container, Docker will refuse to delete it (volume in use).
	// Instead we copy the data in step 4 via a short-lived helper container.
	const newContainer = await docker.createContainer({
		Image: 'devsim-workspace:latest',
		Cmd: ['/bin/sh'],
		Tty: true,
		OpenStdin: true,
		WorkingDir: '/workspace',
		ExposedPorts: {
			'5000/tcp': {},
			'3000/tcp': {},
			'5173/tcp': {}
		},
		Env: [
			// PostgreSQL initialization variables (required by postgres-entrypoint.sh)
			'POSTGRES_USER=devsim',
			'POSTGRES_PASSWORD=devsim',
			'POSTGRES_DB=devsim',
			// Application database connection variables
			'DATABASE_HOST=localhost',
			'DATABASE_PORT=5432',
			'DATABASE_USER=devsim',
			'DATABASE_PASSWORD=devsim',
			'DATABASE_NAME=devsim',
			'DATABASE_URL=postgresql://devsim:devsim@localhost:5432/devsim'
		],
		HostConfig: {
			PortBindings: {
				'5000/tcp': [{ HostPort: '0' }],
				'3000/tcp': [{ HostPort: '0' }],
				'5173/tcp': [{ HostPort: '0' }]
			},
			Memory: 512 * 1024 * 1024,
			AutoRemove: false
		},
		Labels: {
			'devsim.userId': req.userId,
			'devsim.stack': stackNames.join('-'),
			'devsim.level': record.level.toString()
		}
	});

	// --- 4. Start the new container ---
	await newContainer.start();

	// --- 5. Stream volume data into the new container via a helper ---
	// A short-lived helper mounts the volume at /data so we can read from it,
	// then we pipe a tar stream directly into /workspace of the new container.
	// Once the helper is removed the volume has zero consumers and can be deleted.
	const helperSuffix = crypto.randomBytes(4).toString('hex');
	const helper = await docker.createContainer({
		Image: 'node:20-alpine',
		Cmd: ['sh', '-c', 'sleep 60'],
		name: `devsim-restore-helper-${helperSuffix}`,
		HostConfig: {
			Binds: [`${record.volume_name}:/data`]
		}
	});

	await helper.start();

	try {
		// Pull the archived workspace tar out of the volume and push it into the
		// new container's /workspace directory.
		const archiveStream = await helper.getArchive({ path: '/data/.' });
		await newContainer.putArchive(archiveStream as NodeJS.ReadableStream, { path: '/workspace' });
	} finally {
		// Always clean up the helper, even if the copy fails.
		try {
			await helper.stop({ t: 2 });
		} catch {
			/* already stopped */
		}
		await helper.remove();
	}

	// --- 6. Update the SAME DB record + deduct coins atomically ---
	// The Container.id never changes — only the Docker container ID, archive flag, and volume name.
	await prisma.$transaction([
		prisma.workspace.update({
			where: { id: req.dbContainerId },
			data: {
				container_id: newContainer.id, // new Docker container ID
				is_archived: false,
				volume_name: null,
				status: 'created'
			}
		}),
		prisma.user.update({
			where: { id: req.userId },
			data: { coins: { decrement: RESTORE_COST } }
		})
	]);

	// --- 7. Delete the Docker volume — safe now because the helper is gone ---
	// The new container holds the data in its own writable layer; the volume is no
	// longer referenced by any container and Docker will allow the removal.
	try {
		const vol = docker.getVolume(record.volume_name);
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
