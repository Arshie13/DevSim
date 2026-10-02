import { docker } from './client';

/** Tag prefix for built scenario/workspace project images (see scripts/create-image.ts). */
export const DEVSIM_PROJECT_TAG_PREFIX = 'devsim-project';

/**
 * List the tags (without the `devsim-project:` prefix) of every built project
 * image available on the host, e.g. `react-express-postgres-prisma-scenario-1-library-management`.
 *
 * Throws if the Docker daemon is unreachable so callers can distinguish
 * "no images built" from "cannot talk to Docker".
 */
export async function listDevsimProjectImageTags(): Promise<string[]> {
	const images = await docker.listImages({
		filters: { reference: [`${DEVSIM_PROJECT_TAG_PREFIX}:*`] }
	});

	const prefix = `${DEVSIM_PROJECT_TAG_PREFIX}:`;
	const tags: string[] = [];
	for (const img of images) {
		for (const tag of img.RepoTags ?? []) {
			if (tag.startsWith(prefix)) {
				tags.push(tag.slice(prefix.length));
			}
		}
	}

	return tags.sort();
}

/** Normalize a stack/project folder segment to the slug used in image tags. */
export function normalizeImageSlug(value: string): string {
	return value.toLowerCase().replace(/[_ ]+/g, '-');
}

/**
 * Candidate image tags for a scenario folder. Matches the naming produced by
 * `scripts/create-image.ts` (`{stack}-{scenarioFolder}-{projectFolder}`) and the
 * no-project fallback used by `ContainerService.resolveImageAndVolume`.
 */
export function scenarioImageTagCandidates(
	stackFolder: string,
	scenarioFolder: string,
	projectFolders: string[]
): string[] {
	const base = `${normalizeImageSlug(stackFolder)}-${scenarioFolder}`;
	const tags = [base];
	for (const folder of projectFolders) {
		tags.push(`${base}-${normalizeImageSlug(folder)}`);
	}
	return tags;
}
