/**
 * POST /api/docker/container/[id]/tests/run
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PassThrough } from 'stream';
import type { TestResult, TestRunRequest, TestRunResponse, TaskTestResult } from '$lib/types';
import { getLevelConfig } from '$lib/tests/levels';
import { docker } from '$lib/server/docker/client';

const TEST_TIMEOUT = 5 * 60 * 1000;

export const POST: RequestHandler = async ({ params, request }) => {
  const containerId = params.id;
  console.log(`[TEST RUN] Received test run request for container: ${containerId}`);

  try {
    const body = (await request.json()) as TestRunRequest & { testType?: 'task' | 'level'; taskInfos?: { taskId: string; hasClientTest: boolean; hasServerTest: boolean }[] };
    const { command, level, taskId, taskIds, taskInfos } = body;
    const type = body.type ?? body.testType;

    if (!command || !level) {
      return json({ success: false, passed: false, summary: { total: 0, passed: 0, failed: 0, duration: 0 }, results: [], output: '', message: 'Missing required parameters: command and level' } as TestRunResponse, { status: 400 });
    }

    console.log(`[TEST RUN] Container: ${containerId}, Command: ${command}, Level: ${level}, Type: ${type}`);

    const containerInfo = await getContainerInfo(containerId);
    if (!containerInfo) {
      return json({ success: false, passed: false, summary: { total: 0, passed: 0, failed: 0, duration: 0 }, results: [], output: '', message: 'Container not found or not running' } as TestRunResponse, { status: 404 });
    }

    if (containerInfo.mode === 'tutorial') {
      return json(buildTutorialDemoPassResponse(body));
    }

    const startTime = Date.now();

    // ── Level run ─────────────────────────────────────────────────────────────
    if (type === 'level') {
      const levelConfig = getLevelConfig(level);
      const levelTaskIds = taskIds && taskIds.length > 0 ? taskIds : (levelConfig?.tasks.map((t) => t.taskId) ?? []);

    const perTaskCommands = levelTaskIds.map((tid, idx) => {
        const taskNumber = idx + 1;
        let taskCmd = command.replace(/^test:tasks:/, `test:task:client:`).replace(/:l(\d+)$/, `:l$1:t${taskNumber}`);
        if (taskCmd === command) taskCmd = `test:task:l${level}:t${taskNumber}`;
        return buildPnpmCommand(taskCmd, level, tid);
      });

      // Read ground-truth test names per task BEFORE running
      const groundTruthPerTask: string[][] = await Promise.all(
        levelTaskIds.map((tid, idx) => {
          const taskInfo = taskInfos?.find(t => t.taskId === tid);
          const isClient = taskInfo?.hasClientTest ?? false;
          const isServer = taskInfo?.hasServerTest ?? false;
          let taskCmd: string;
          if (isClient && isServer) taskCmd = command;
          else if (isServer) taskCmd = `test:task:server:l${level}:t${idx + 1}`;
          else if (isClient) taskCmd = `test:task:client:l${level}:t${idx + 1}`;
          else taskCmd = command;
          return readTestNamesFromContainer(containerId, level, idx + 1, taskCmd);
        })
      );

      let combinedOutput = '';
      const perTaskExitCodes: number[] = [];
      const errors: string[] = [];

      for (let i = 0; i < perTaskCommands.length; i++) {
        const taskNum = i + 1;
        console.log(`[TEST RUN] Level task ${taskNum}/${perTaskCommands.length}: ${perTaskCommands[i]}`);
        combinedOutput += `\n> pkg@1.0.0 test:task:l${level}:t${taskNum}\n`;
        const { output, exitCode, error } = await executeTestInContainer(containerId, perTaskCommands[i]);
        combinedOutput += output;
        perTaskExitCodes.push(exitCode);
        if (error) errors.push(`Task ${taskNum}: ${error}`);
        console.log(`[TEST RUN] Level task ${taskNum} exit code: ${exitCode}`);
      }

      const duration = Date.now() - startTime;
      const overallExitCode = perTaskExitCodes.every((c) => c === 0) ? 0 : 1;
      console.log(`[TEST RUN] Completed in ${duration}ms. Per-task exit codes: ${perTaskExitCodes.join(', ')}`);

      const parsedResults = parseTestOutput(combinedOutput, overallExitCode);

      // Inject real exit codes + reconcile results against ground-truth names
      for (let i = 0; i < perTaskExitCodes.length; i++) {
        const taskNum = String(i + 1);
        const bucket = parsedResults.resultsByTaskNumber.get(taskNum);
        if (bucket) {
          bucket.exitCode = perTaskExitCodes[i];
          bucket.passed = perTaskExitCodes[i] === 0;
          if (groundTruthPerTask[i].length > 0) {
            bucket.results = reconcileResults(groundTruthPerTask[i], bucket.results, bucket.passed);
          }
        }
      }

      // Recompute overall results after reconciliation
      const reconciledAll: TestResult[] = [];
      for (const bucket of parsedResults.resultsByTaskNumber.values()) reconciledAll.push(...bucket.results);
      if (reconciledAll.length > 0) {
        parsedResults.results = reconciledAll;
        parsedResults.passedCount = reconciledAll.filter((r) => r.passed).length;
        parsedResults.failedCount = reconciledAll.filter((r) => !r.passed).length;
        parsedResults.total = reconciledAll.length;
      }

      const taskResults = buildTaskResults(levelTaskIds, parsedResults, level);

      return json({
        success: true,
        passed: overallExitCode === 0,
        summary: { total: parsedResults.total, passed: parsedResults.passedCount, failed: parsedResults.failedCount, duration },
        results: parsedResults.results,
        output: truncateOutput(combinedOutput, 5000),
        errors: errors.length > 0 ? errors : undefined,
        taskResults
      } as TestRunResponse);
    }

    // ── Single-task run ───────────────────────────────────────────────────────
    const pnpmCommand = buildPnpmCommand(command, level, taskId);
    console.log(`[TEST RUN] Executing: ${pnpmCommand}`);

    const taskNumMatch = command.match(/:t(\d+)$/);
    const singleTaskNum = taskNumMatch ? parseInt(taskNumMatch[1], 10) : 1;

    // Read ground-truth names BEFORE running
    const groundTruth = await readTestNamesFromContainer(containerId, level, singleTaskNum, command);

    const { output, exitCode, error } = await executeTestInContainer(containerId, pnpmCommand);
    const duration = Date.now() - startTime;
    console.log(`[TEST RUN] Completed in ${duration}ms with exit code: ${exitCode}`);

    const parsedResults = parseTestOutput(output, exitCode);

    if (groundTruth.length > 0) {
      const reconciled = reconcileResults(groundTruth, parsedResults.results, exitCode === 0);
      parsedResults.results = reconciled;
      parsedResults.passedCount = reconciled.filter((r) => r.passed).length;
      parsedResults.failedCount = reconciled.filter((r) => !r.passed).length;
      parsedResults.total = reconciled.length;
    }

    const response: TestRunResponse = {
      success: true,
      passed: parsedResults.passed,
      summary: { total: parsedResults.total, passed: parsedResults.passedCount, failed: parsedResults.failedCount, duration },
      results: parsedResults.results,
      output: truncateOutput(output, 5000),
      errors: error ? [error] : undefined
    };

    if (type === 'task' && taskId) {
      response.taskResults = [{ taskId, taskName: `Task ${taskId}`, passed: parsedResults.passed, results: parsedResults.results, errors: error ? [error] : [] }];
    }

    return json(response);
  } catch (error) {
    console.error('[TEST RUN] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return json({ success: false, passed: false, summary: { total: 0, passed: 0, failed: 0, duration: 0 }, results: [], output: '', errors: [errorMessage], message: errorMessage } as TestRunResponse, { status: 500 });
  }
};

// ---------------------------------------------------------------------------
// Ground-truth: read test names from source files inside the container
// ---------------------------------------------------------------------------

/**
 * Finds all .test.ts(x)/.test.js(x) files for level+task, reads them, and
 * extracts every it()/test() name in declaration order.
 *
 * Expected paths:
 *   /workspace/tests/client/level-{N}/task-{N}/**
 *   /workspace/tests/server/level-{N}/task-{N}/**
 *   /workspace/tests/level-{N}/task-{N}/**  (flat layout fallback)
 *
 * Returns [] on any error — caller degrades gracefully.
 */
async function readTestNamesFromContainer(
  containerId: string,
  level: number,
  taskNum: number,
  command: string
): Promise<string[]> {
  try {
    const wantsServer = command.includes(':server:');
    const wantsClient = command.includes(':client:') || !wantsServer;

    const searchDirs: string[] = [];
    if (wantsClient) searchDirs.push(`/workspace/tests/client/level-${level}/task-${taskNum}`);
    if (wantsServer) searchDirs.push(`/workspace/tests/server/level-${level}/task-${taskNum}`);
    searchDirs.push(`/workspace/tests/level-${level}/task-${taskNum}`);

    const findCmd = searchDirs
      .map((d) => `find "${d}" -type f \\( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.test.js" -o -name "*.test.jsx" \\) 2>/dev/null`)
      .join('; ');

    const { stdout: foundFiles } = await runShellCommandInContainer(containerId, findCmd, 10_000);
    const filePaths = foundFiles.split('\n').map((l) => l.trim()).filter(Boolean);

    if (filePaths.length === 0) {
      console.warn(`[GROUND TRUTH] No test files found for level ${level} task ${taskNum}`);
      return [];
    }

    const catCmd = filePaths.map((f) => `cat "${f}"`).join('\n');
    const { stdout: fileContents } = await runShellCommandInContainer(containerId, catCmd, 10_000);

    const names = extractTestNamesFromSource(fileContents);
    console.log(`[GROUND TRUTH] level ${level} task ${taskNum}: ${names.length} test names`);
    return names;
  } catch (err) {
    console.warn(`[GROUND TRUTH] Failed to read test names:`, err);
    return [];
  }
}

/**
 * Extracts test names from TypeScript/JavaScript source.
 * Handles: it('name'), it("name"), it(`name`), test('name'), etc.
 * Returns names in declaration order, deduped.
 */
function extractTestNamesFromSource(source: string): string[] {
  const regex = /(?:^|\s)(?:it|test)\s*\(\s*(['"`])([\s\S]*?)\1/gm;
  const names: string[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(source)) !== null) {
    const name = match[2].trim();
    if (name && !seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }

  return names;
}

// ---------------------------------------------------------------------------
// Reconcile: one result per test, always with the real "should..." name
// ---------------------------------------------------------------------------

/**
 * Produces exactly one TestResult per ground-truth test name.
 *
 * Logic:
 *  1. Collect names vitest reported as FAILED (× lines from parseTestOutput)
 *  2. If overall exit code = 0 → all tests passed (trust exit code over parsing)
 *  3. Otherwise: ground-truth name in failed set → failed, else → passed
 *  4. Append any vitest-reported failures not found in ground-truth (dynamic names)
 */
function reconcileResults(
  groundTruth: string[],
  parsedResults: TestResult[],
  overallPassed: boolean
): TestResult[] {
  const failedNames = new Set<string>(
    parsedResults.filter((r) => !r.passed).map((r) => normalizeTestName(r.testName))
  );

  let testIdCounter = 0;
  const reconciled: TestResult[] = [];
  const usedGroundTruth = new Set<string>();

  for (const name of groundTruth) {
    const normalized = normalizeTestName(name);
    usedGroundTruth.add(normalized);
    const failed = overallPassed ? false : isGroundTruthNameFailed(normalized, failedNames);

    reconciled.push({
      testId: `test-${++testIdCounter}`,
      testName: name,
      passed: !failed,
      message: failed ? 'Test failed' : 'Test passed'
    });
  }

  // Append failed names from vitest output that didn't match any ground-truth entry
  if (!overallPassed) {
    for (const parsed of parsedResults) {
      if (!parsed.passed && !usedGroundTruth.has(normalizeTestName(parsed.testName))) {
        reconciled.push({
          testId: `test-${++testIdCounter}`,
          testName: parsed.testName,
          passed: false,
          message: 'Test failed'
        });
      }
    }

    // If the run failed but no failed test names were captured, fail all known tests.
    if (failedNames.size === 0 && reconciled.length > 0) {
      return reconciled.map((result) => ({
        ...result,
        passed: false,
        message: 'Test failed'
      }));
    }
  }

  return reconciled;
}

function normalizeTestName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, ' ').trim();
}

function isGroundTruthNameFailed(normalizedGroundTruthName: string, failedNames: Set<string>): boolean {
  if (failedNames.has(normalizedGroundTruthName)) return true;

  for (const failedName of failedNames) {
    // Handles prefixed names like "suite > should ..." from vitest output.
    if (failedName.endsWith(`> ${normalizedGroundTruthName}`) || failedName.includes(normalizedGroundTruthName)) {
      return true;
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// Docker helpers
// ---------------------------------------------------------------------------

async function getContainerInfo(containerId: string): Promise<{ id: string; state: string; projectFolder?: string; mode?: string } | null> {
  try {
    const containerInfo = await docker.getContainer(containerId).inspect();
    return {
      id: containerInfo.Id,
      state: containerInfo.State.Status,
      projectFolder: containerInfo.Config?.Labels?.['devsim.projectFolder'],
      mode: containerInfo.Config?.Labels?.['devsim.mode']
    };
  } catch { return null; }
}

function buildTutorialDemoPassResponse(
  body: TestRunRequest & { testType?: 'task' | 'level' }
): TestRunResponse {
  const type = body.type ?? body.testType;
  const taskId = body.taskId;
  const taskIds = body.taskIds ?? [];
  const duration = 300;

  if (type === 'task' && taskId) {
    const results: TestResult[] = [
      {
        testId: `demo-${taskId}-1`,
        testName: 'Tutorial demo check',
        passed: true,
        message: 'Passed (tutorial demo mode)'
      }
    ];

    return {
      success: true,
      passed: true,
      summary: { total: 1, passed: 1, failed: 0, duration },
      results,
      output: 'Tutorial demo mode: tests are forced to pass.',
      taskResults: [
        {
          taskId,
          taskName: `Task ${taskId}`,
          passed: true,
          results,
          errors: []
        }
      ]
    };
  }

  const safeTaskIds = taskIds.length > 0 ? taskIds : ['task-1'];
  const taskResults: TaskTestResult[] = safeTaskIds.map((id, index) => ({
    taskId: id,
    taskName: `Task ${index + 1}`,
    passed: true,
    results: [
      {
        testId: `demo-${id}-1`,
        testName: 'Tutorial demo check',
        passed: true,
        message: 'Passed (tutorial demo mode)'
      }
    ],
    errors: []
  }));

  const allResults = taskResults.flatMap((tr) => tr.results);

  return {
    success: true,
    passed: true,
    summary: { total: allResults.length, passed: allResults.length, failed: 0, duration },
    results: allResults,
    output: 'Tutorial demo mode: tests are forced to pass.',
    taskResults
  };
}

function buildPnpmCommand(command: string, level: number, taskId?: string): string {
  const commandMap: Record<string, string> = {
    [`test:task:client:l${level}:t1`]: `pnpm run test:task:client:l${level}:t1`,
    [`test:task:client:l${level}:t2`]: `pnpm run test:task:client:l${level}:t2`,
    [`test:task:server:l${level}:t1`]: `pnpm run test:task:server:l${level}:t1`,
    [`test:task:server:l${level}:t2`]: `pnpm run test:task:server:l${level}:t2`,
    [`test:task:l${level}:t1`]: `pnpm run test:task:l${level}:t1`,
    [`test:task:l${level}:t2`]: `pnpm run test:task:l${level}:t2`,
    [`test:tasks:l${level}`]: `pnpm run test:tasks:l${level}`
  };
  if (commandMap[command]) return commandMap[command];
  if (command.startsWith('pnpm ')) return command;
  if (command.startsWith('npm ')) return command.replace('npm ', 'pnpm ');
  return `pnpm run ${command}`;
}

async function executeTestInContainer(containerId: string, command: string): Promise<{ output: string; exitCode: number; error?: string }> {
  try {
    const containerInfo = await getContainerInfo(containerId);
    const workspaceDir = await resolveWorkspaceDir(containerId, containerInfo?.projectFolder);
    const shellCmd = `cd ${shellEscape(workspaceDir)} && NODE_ENV=test ${command}`;
    console.log(`[TEST EXEC] dockerode exec in ${workspaceDir}: ${command}`);

    const firstRun = await runShellCommandInContainer(containerId, shellCmd, TEST_TIMEOUT);
    let output = firstRun.stdout + (firstRun.stderr ? `\nSTDERR:\n${firstRun.stderr}` : '');

    if (firstRun.exitCode !== 0 && shouldRetryAfterDependencyBootstrap(output)) {
      console.warn('[TEST EXEC] Missing dependency detected. Bootstrapping and retrying...');
      const bootstrapResult = await bootstrapWorkspaceDependencies(containerId, workspaceDir, command);
      if (bootstrapResult.stderr) output += `\n\n[DEPS BOOTSTRAP STDERR]\n${bootstrapResult.stderr}`;
      const secondRun = await runShellCommandInContainer(containerId, shellCmd, TEST_TIMEOUT);
      const retryOutput = secondRun.stdout + (secondRun.stderr ? `\nSTDERR:\n${secondRun.stderr}` : '');
      output = `${output}\n\n[RETRY]\n${retryOutput}`;
      return { output, exitCode: secondRun.exitCode };
    }

    return { output, exitCode: firstRun.exitCode };
  } catch (execError) {
    const error = execError as Error;
    const message = error.message || 'Test execution failed';
    return { output: `\nSTDERR:\n${message}\n`, exitCode: 1, error: message };
  }
}

function shouldRetryAfterDependencyBootstrap(output: string): boolean {
  const lower = output.toLowerCase();
  return lower.includes('failed to resolve import') || lower.includes('cannot find module') || lower.includes('module not found') || lower.includes('does the file exist?');
}

async function bootstrapWorkspaceDependencies(containerId: string, workspaceDir: string, command: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const wantsClient = command.includes(':client:') || command.includes('client');
  const wantsServer = command.includes(':server:') || command.includes('server');
  const steps: string[] = [
    `cd ${shellEscape(workspaceDir)}`,
    'if [ -f package.json ]; then pnpm install; fi',
    'pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event'
  ];
  if (wantsClient || (!wantsClient && !wantsServer)) steps.push('if [ -f client/package.json ]; then cd client && pnpm install && cd ..; fi');
  if (wantsServer || (!wantsClient && !wantsServer)) steps.push('if [ -f server/package.json ]; then cd server && pnpm install && cd ..; fi');
  return runShellCommandInContainer(containerId, steps.join(' && '), 8 * 60 * 1000);
}

async function resolveWorkspaceDir(containerId: string, projectFolder?: string): Promise<string> {
  const labelFolder = (projectFolder ?? '').trim();
  if (labelFolder) return `/workspace`;
  try {
    const detectCommand = ['if [ -f /workspace/package.json ]; then', '  echo /workspace;', 'else', '  first=$(find /workspace -mindepth 2 -maxdepth 2 -type f -name package.json | head -n 1);', '  if [ -n "$first" ]; then dirname "$first"; else echo /workspace; fi;', 'fi'].join(' ');
    const { stdout } = await runShellCommandInContainer(containerId, detectCommand, 10000);
    return stdout.trim() || '/workspace';
  } catch { return '/workspace'; }
}

async function runShellCommandInContainer(containerId: string, shellCommand: string, timeoutMs: number): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const container = docker.getContainer(containerId);
  const exec = await container.exec({ Cmd: ['sh', '-c', shellCommand], AttachStdout: true, AttachStderr: true, AttachStdin: false, Tty: false, WorkingDir: '/workspace' });
  const stream = await exec.start({ hijack: true, stdin: false });
  const stdoutStream = new PassThrough();
  const stderrStream = new PassThrough();
  docker.modem.demuxStream(stream, stdoutStream, stderrStream);

  let stdout = '';
  let stderr = '';
  stdoutStream.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
  stderrStream.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => { stream.destroy(new Error(`Test execution timed out after ${timeoutMs}ms`)); }, timeoutMs);
    stream.on('end', () => { clearTimeout(timer); resolve(); });
    stream.on('error', (err: Error) => { clearTimeout(timer); reject(err); });
  });

  const execState = await exec.inspect();
  const exitCode = typeof execState.ExitCode === 'number' ? execState.ExitCode : 1;
  return { stdout, stderr, exitCode };
}

function shellEscape(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TaskBucket {
  results: TestResult[];
  passed: boolean;
  exitCode: number | null;
}

interface ParsedTestResults {
  passed: boolean;
  total: number;
  passedCount: number;
  failedCount: number;
  results: TestResult[];
  resultsByTaskNumber: Map<string, TaskBucket>;
}

// ---------------------------------------------------------------------------
// Output parser — extracts only FAILING test names from vitest output
// ---------------------------------------------------------------------------

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
}

/**
 * Parses vitest output to extract:
 *  - Which task bucket each result belongs to (concurrent / sequential / single)
 *  - Which test names explicitly FAILED (× lines)
 *
 * Passing tests are NO LONGER synthesised here.
 * reconcileResults() handles that using the ground-truth names from source files.
 */
function parseTestOutput(output: string, exitCode: number): ParsedTestResults {
  const resultsByTaskNumber = new Map<string, TaskBucket>();
  const allResults: TestResult[] = [];
  let testIdCounter = 0;

  const cleanOutput = stripAnsi(output);
  const lines = cleanOutput.split('\n');

  const isConcurrentRun = lines.some((l) => /^\s*\[test:task:[^\]]*:t\d+\]/i.test(l));
  const isSequentialRun = !isConcurrentRun && lines.some((l) => /^>\s+\S+@\S+\s+[^\s]*:t\d+/.test(l.trim()));

  function ensureBucket(taskNum: string): TaskBucket {
    if (!resultsByTaskNumber.has(taskNum)) resultsByTaskNumber.set(taskNum, { results: [], passed: true, exitCode: null });
    return resultsByTaskNumber.get(taskNum)!;
  }

  /** Extract only failing test names from a single vitest output line */
  function processVitestLine(content: string, bucket: TaskBucket): void {
    // Failing test: "  × should do something 43ms"
    const failMatch = content.match(/^[✗✕×]\s+(.+?)(?:\s+\d+(?:\.\d+)?\s*(?:ms|s))?$/);
    if (failMatch) {
      const testName = failMatch[1].trim();
      if (!/\.test\.[jt]sx?/.test(testName)) {
        const r: TestResult = { testId: `test-${++testIdCounter}`, testName, passed: false, message: 'Test failed' };
        bucket.results.push(r);
        bucket.passed = false;
        allResults.push(r);
      }
      return;
    }

    // File-level summary: mark bucket failed if any failures
    const fileSummaryMatch = content.match(/^[✓✔❯▶]\s+\S+\.test\.[jt]sx?\s+\((\d+)\s+tests?(?:\s*\|\s*(\d+)\s+failed)?\)/);
    if (fileSummaryMatch) {
      if (parseInt(fileSummaryMatch[2] ?? '0', 10) > 0) bucket.passed = false;
      return;
    }

    // Vitest footer safety net
    if (/^\s*Tests\s+\d+\s+failed/i.test(content)) bucket.passed = false;
  }

  if (isConcurrentRun) {
    for (const rawLine of lines) {
      const line = rawLine.trim();
      const prefixMatch = line.match(/^\[test:task:[^\]]*:t(\d+)\]\s*(.*)/i);
      if (!prefixMatch) continue;
      const bucket = ensureBucket(prefixMatch[1]);
      const content = prefixMatch[2];
      const exitMatch = content.match(/exited with code (\d+)/i);
      if (exitMatch) {
        bucket.exitCode = parseInt(exitMatch[1], 10);
        if (bucket.exitCode !== 0) bucket.passed = false;
        continue;
      }
      processVitestLine(content, bucket);
    }
    for (const [, bucket] of resultsByTaskNumber) {
      if (bucket.exitCode !== null) bucket.passed = bucket.exitCode === 0;
    }

  } else if (isSequentialRun) {
    let currentBucket: TaskBucket | null = null;
    for (const rawLine of lines) {
      const line = stripAnsi(rawLine);
      const headerMatch = line.trim().match(/^>\s+\S+@\S+\s+[^\s]*:t(\d+)/);
      if (headerMatch) { currentBucket = ensureBucket(headerMatch[1]); continue; }
      if (!currentBucket) continue;
      processVitestLine(line.trim(), currentBucket);
    }
    for (const [, bucket] of resultsByTaskNumber) {
      const anyFailed = bucket.results.some((r) => !r.passed);
      bucket.exitCode = anyFailed ? 1 : 0;
      bucket.passed = !anyFailed;
    }

  } else {
    const singleBucket = ensureBucket('1');
    for (const rawLine of lines) processVitestLine(rawLine.trim(), singleBucket);
    singleBucket.exitCode = exitCode;
    singleBucket.passed = exitCode === 0;
  }

  const passedCount = allResults.filter((r) => r.passed).length;
  const failedCount = allResults.filter((r) => !r.passed).length;

  return { passed: exitCode === 0, total: allResults.length || 1, passedCount, failedCount, results: allResults, resultsByTaskNumber };
}

// ---------------------------------------------------------------------------
// Task-result builder
// ---------------------------------------------------------------------------

function buildTaskResults(taskIds: string[], parsedResults: ParsedTestResults, level: number): TaskTestResult[] {
  const taskNameById = new Map((getLevelConfig(level)?.tasks ?? []).map((task) => [task.taskId, task.taskText]));

  return taskIds.map((taskId, index) => {
    const taskNumber = String(index + 1);
    const idDigitMatch = taskId.match(/(\d+)$/);
    const taskNumberFromId = idDigitMatch ? idDigitMatch[1] : null;

    const bucket = parsedResults.resultsByTaskNumber.get(taskNumber) ?? (taskNumberFromId ? parsedResults.resultsByTaskNumber.get(taskNumberFromId) : undefined);

    let taskResults: TestResult[];
    let taskPassed: boolean;

    if (bucket) {
      taskResults = bucket.results;
      taskPassed = bucket.exitCode !== null ? bucket.exitCode === 0 : bucket.passed;
    } else if (taskIds.length === 1) {
      taskResults = parsedResults.results;
      taskPassed = parsedResults.passed;
    } else {
      taskResults = [{ testId: `task-${taskId}-unknown`, testName: `Task ${taskNumber} tests`, passed: false, message: 'Could not determine individual test result' }];
      taskPassed = false;
    }

    return { taskId, taskName: taskNameById.get(taskId) ?? `Task ${taskNumber}`, passed: taskPassed, results: taskResults, errors: taskPassed ? [] : ['Some tests failed for this task'] };
  });
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function truncateOutput(output: string, maxLength: number): string {
  if (output.length <= maxLength) return output;
  const half = Math.floor(maxLength / 2);
  return output.slice(0, half) + `\n\n... [${output.length - maxLength} characters truncated] ...\n\n` + output.slice(-half);
}