import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { docker } from '$lib/server/docker/client';

type SearchLineMatch = {
  lineNumber: number;
  lineContent: string;
};

type SearchFileMatch = {
  filePath: string;
  matches: SearchLineMatch[];
};

function parseGrepOutput(output: string): { files: SearchFileMatch[]; totalMatchCount: number } {
  const byFile = new Map<string, SearchLineMatch[]>();
  let totalMatchCount = 0;

  const lines = output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const firstColon = line.indexOf(':');
    if (firstColon === -1) continue;

    const secondColon = line.indexOf(':', firstColon + 1);
    if (secondColon === -1) continue;

    const absolutePath = line.slice(0, firstColon);
    const lineNumberRaw = line.slice(firstColon + 1, secondColon);
    const lineNumber = Number.parseInt(lineNumberRaw, 10);
    const lineContent = line.slice(secondColon + 1);

    if (!Number.isFinite(lineNumber)) continue;
    if (!absolutePath.startsWith('/workspace/')) continue;

    const filePath = absolutePath.slice('/workspace/'.length);
    const existing = byFile.get(filePath) ?? [];
    existing.push({ lineNumber, lineContent });
    byFile.set(filePath, existing);
    totalMatchCount += 1;
  }

  const files: SearchFileMatch[] = Array.from(byFile.entries()).map(
    ([filePath, matches]) => ({ filePath, matches }),
  );

  return { files, totalMatchCount };
}

function shellEscapeSingleQuotes(value: string): string {
  return value.replace(/'/g, `'"'"'`);
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeWorkspaceFiles(files: string[]): string[] {
  return uniqueStrings(
    files
      .map((filePath) => filePath.trim())
      .filter((filePath) => filePath.length > 0)
      .map((filePath) => filePath.replace(/^\/+/, ''))
      .map((filePath) => `/workspace/${filePath}`),
  );
}

async function runSearchCommand(
  container: ReturnType<typeof docker.getContainer>,
  command: string,
): Promise<{ output: string; stderr: string }> {
  const exec = await container.exec({
    Cmd: ['sh', '-lc', command],
    AttachStdout: true,
    AttachStderr: true,
    Tty: false,
  });

  const stream = await exec.start({ hijack: true });

  const stdout: Buffer[] = [];
  const stderr: Buffer[] = [];

  await new Promise<void>((resolve, reject) => {
    container.modem.demuxStream(
      stream,
      {
        write: (chunk: Buffer) => stdout.push(chunk),
        end: () => {},
      },
      {
        write: (chunk: Buffer) => stderr.push(chunk),
        end: () => {},
      },
    );

    stream.on('end', resolve);
    stream.on('error', reject);
  });

  return {
    output: Buffer.concat(stdout).toString('utf8'),
    stderr: Buffer.concat(stderr).toString('utf8').trim(),
  };
}

export const POST: RequestHandler = async ({ params, request }) => {
  const startedAt = Date.now();

  try {
    const body = await request.json().catch(() => ({}));
    const rawQuery = typeof body?.query === 'string' ? body.query : '';
    const rawFiles: unknown[] = Array.isArray(body?.files) ? body.files : [];
    const query = rawQuery.trim();
    const files = rawFiles.filter((item): item is string => typeof item === 'string');

    if (query.length < 2) {
      return json({ success: true, files: [], totalMatchCount: 0 });
    }

    const containerId = params.id;
    

    const container = docker.getContainer(containerId);

    const safeQuery = shellEscapeSingleQuotes(query);
    let output = '';
    let errorOutput = '';

    if (files.length > 0) {
      const absoluteFileTargets = normalizeWorkspaceFiles(files)
        .map((filePath) => `'${shellEscapeSingleQuotes(filePath)}'`);

      const grepBatchSize = 200;
      let combinedOutput = '';
      let combinedStderr = '';

      for (let index = 0; index < absoluteFileTargets.length; index += grepBatchSize) {
        const batch = absoluteFileTargets.slice(index, index + grepBatchSize);
        const command = [
          'grep -Hn -i --',
          `'${safeQuery}'`,
          batch.join(' '),
          '2>/dev/null',
          '| head -n 2000',
        ].join(' ');

        const result = await runSearchCommand(container, command);
        combinedOutput += `${result.output}\n`;
        if (result.stderr.length > 0) {
          combinedStderr += `${result.stderr}\n`;
        }
      }

      output = combinedOutput;
      errorOutput = combinedStderr.trim();
    } else {
      const command = [
        'grep -RIn -i --binary-files=without-match',
        '--exclude-dir=node_modules',
        '--exclude-dir=.git',
        '--exclude-dir=.next',
        '--exclude-dir=dist',
        '--exclude-dir=build',
        `-- '${safeQuery}' /workspace 2>/dev/null`,
        '| head -n 2000',
      ].join(' ');

      const result = await runSearchCommand(container, command);
      output = result.output;
      errorOutput = result.stderr;
    }

    if (errorOutput.length > 0) {
      console.warn(`[FILES_SEARCH] stderr container=${containerId}: ${errorOutput}`);
    }

    const parsed = parseGrepOutput(output);
    const foundFiles = parsed.files;
    const totalMatchCount = parsed.totalMatchCount;

    const elapsedMs = Date.now() - startedAt;

    return json({ success: true, files: foundFiles, totalMatchCount });
  } catch (error) {
    const elapsedMs = Date.now() - startedAt;
    console.error(`[FILES_SEARCH] failed elapsedMs=${elapsedMs}`, error);
    return json({ success: false, error: String(error), files: [], totalMatchCount: 0 }, { status: 500 });
  }
};
