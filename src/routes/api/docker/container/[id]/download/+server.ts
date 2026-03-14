/**
 * GET /api/docker/container/[id]/download
 *
 * Downloads the container's workspace as a tar archive.
 * The user can extract this and push to GitHub.
 * Excludes node_modules, .git, .next, and other build artifacts.
 *
 * Auth: session required — must own the container.
 * Params: [id] = Prisma Container.id (NOT the Docker container ID).
 * Returns: tar archive stream as downloadable file.
 */

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { docker } from '$lib/server/docker/client';
import prisma from '$lib/server/client';

export const GET: RequestHandler = async ({ params, locals }) => {
  // --- Auth check ---
  const session = await locals.auth();
  if (!session?.user?.id) {
    return error(401, 'Unauthorized');
  }

  try {
    const dbContainerId = params.id;

    // --- Validate container ownership ---
    const container = await prisma.container.findUnique({
      where: { id: dbContainerId }
    });

    if (!container) {
      return error(404, 'Container not found');
    }

    if (container.userId !== session.user.id) {
      return error(403, 'You do not own this container');
    }

    // --- Get the Docker container ---
    const dockerContainer = docker.getContainer(container.containerId);

    // Check if container exists
    try {
      await dockerContainer.inspect();
    } catch {
      return error(404, 'Docker container not found');
    }

    // --- Create tar archive excluding node_modules, .git, .next, etc. ---
    // Using tar with --exclude to filter out unnecessary directories
    const tarCmd = `cd /workspace && tar -cf - --exclude='node_modules' --exclude='.git' --exclude='.next' --exclude='dist' --exclude='build' --exclude='*.log' --exclude='.env' .`;

    const exec = await dockerContainer.exec({
      Cmd: ['sh', '-c', tarCmd],
      AttachStdout: true,
      AttachStderr: true
    });

    const stream = await exec.start({ hijack: true });

    // --- Collect the stdout into a buffer ---
    const chunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);

      dockerContainer.modem.demuxStream(
        stream,
        {
          write: (chunk: Buffer) => chunks.push(chunk),
          end: () => {}
        },
        {
          write: (chunk: Buffer) => stderrChunks.push(chunk),
          end: () => {}
        }
      );
    });

    const stderrOutput = Buffer.concat(stderrChunks).toString();
    if (stderrOutput) {
      console.warn('Tar stderr:', stderrOutput);
    }

    const tarBuffer = Buffer.concat(chunks);

    // --- Generate filename ---
    const stackSlug = container.volumeName;
    const sanitizedTitle = stackSlug || 'project';
    const filename = `${sanitizedTitle}-lvl${container.level}-${container.id.slice(0, 8)}.tar`;

    // --- Return the archive as a downloadable file ---
    return new Response(tarBuffer, {
      headers: {
        'Content-Type': 'application/x-tar',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': tarBuffer.length.toString()
      }
    });
  } catch (err) {
    console.error('Download error:', err);
    return error(500, `Download failed: ${String(err)}`);
  }
};
