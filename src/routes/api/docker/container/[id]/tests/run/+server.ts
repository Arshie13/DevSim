/**
 * POST /api/docker/container/[id]/tests/run
 *
 * Runs tests inside a Docker container for a specific task or level.
 * This endpoint executes npm test commands in the container's workspace.
 *
 * Body: {
 *   command: string (e.g., "test:task:client:l1:t1", "test:tasks:l1"),
 *   level: number,
 *   taskId?: string,
 *   type: 'task' | 'level'
 * }
 *
 * Returns: {
 *   success: boolean,
 *   passed: boolean,
 *   summary: { total: number, passed: number, failed: number, duration: number },
 *   results: TestResult[],
 *   taskResults?: TaskTestResult[],
 *   output: string,
 *   errors?: string[]
 * }
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PassThrough } from 'stream';
import type { TestResult, TestRunRequest, TestRunResponse, TaskTestResult } from '$lib/types';
import { getLevelConfig } from '$lib/tests/levels';
import { docker } from '$lib/server/docker/client';

// Maximum execution time for tests (5 minutes)
const TEST_TIMEOUT = 5 * 60 * 1000;

export const POST: RequestHandler = async ({ params, request }) => {
  const containerId = params.id;
  console.log(`[TEST RUN] Received test run request for container: ${containerId}`);

  try {
    const body = (await request.json()) as TestRunRequest & {
      testType?: 'task' | 'level';
    };
    const { command, level, taskId, taskIds } = body;
    const type = body.type ?? body.testType;

    if (!command || !level) {
      return json(
        {
          success: false,
          passed: false,
          summary: { total: 0, passed: 0, failed: 0, duration: 0 },
          results: [],
          output: '',
          message: 'Missing required parameters: command and level'
        } as TestRunResponse,
        { status: 400 }
      );
    }

    console.log(
      `[TEST RUN] Container: ${containerId}, Command: ${command}, Level: ${level}, Type: ${type}`
    );

    const containerInfo = await getContainerInfo(containerId);
    if (!containerInfo) {
      return json(
        {
          success: false,
          passed: false,
          summary: { total: 0, passed: 0, failed: 0, duration: 0 },
          results: [],
          output: '',
          message: 'Container not found or not running'
        } as TestRunResponse,
        { status: 404 }
      );
    }

    const npmCommand = buildNpmCommand(command, level, taskId);
    console.log(`[TEST RUN] Executing: ${npmCommand}`);

    const startTime = Date.now();
    const { output, exitCode, error } = await executeTestInContainer(containerId, npmCommand);
    const duration = Date.now() - startTime;

    console.log(`[TEST RUN] Completed in ${duration}ms with exit code: ${exitCode}`);

    const parsedResults = parseTestOutput(output, exitCode);

    const response: TestRunResponse = {
      success: true,
      passed: parsedResults.passed,
      summary: {
        total: parsedResults.total,
        passed: parsedResults.passedCount,
        failed: parsedResults.failedCount,
        duration
      },
      results: parsedResults.results,
      output: truncateOutput(output, 5000),
      errors: error ? [error] : undefined
    };

    if (type === 'level') {
      const levelConfigTaskIds =
        getLevelConfig(level)?.tasks.map((task) => task.taskId) ?? [];
      const effectiveTaskIds =
        taskIds && taskIds.length > 0 ? taskIds : levelConfigTaskIds;
      response.taskResults = buildTaskResults(effectiveTaskIds, parsedResults, level);
    } else if (type === 'task' && taskId) {
      response.taskResults = [
        {
          taskId,
          taskName: `Task ${taskId}`,
          passed: parsedResults.passed,
          results: parsedResults.results,
          errors: error ? [error] : []
        }
      ];
    }

    return json(response);
  } catch (error) {
    console.error('[TEST RUN] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return json(
      {
        success: false,
        passed: false,
        summary: { total: 0, passed: 0, failed: 0, duration: 0 },
        results: [],
        output: '',
        errors: [errorMessage],
        message: errorMessage
      } as TestRunResponse,
      { status: 500 }
    );
  }
};

// ---------------------------------------------------------------------------
// Docker helpers
// ---------------------------------------------------------------------------

async function getContainerInfo(
  containerId: string
): Promise<{ id: string; state: string; projectFolder?: string } | null> {
  try {
    const containerInfo = await docker.getContainer(containerId).inspect();
    return {
      id: containerInfo.Id,
      state: containerInfo.State.Status,
      projectFolder: containerInfo.Config?.Labels?.['devsim.projectFolder']
    };
  } catch {
    return null;
  }
}

function buildNpmCommand(command: string, level: number, taskId?: string): string {
  const commandMap: Record<string, string> = {
    [`test:task:client:l${level}:t1`]: `npm run test:task:client:l${level}:t1`,
    [`test:task:client:l${level}:t2`]: `npm run test:task:client:l${level}:t2`,
    [`test:task:server:l${level}:t1`]: `npm run test:task:server:l${level}:t1`,
    [`test:task:server:l${level}:t2`]: `npm run test:task:server:l${level}:t2`,
    [`test:task:l${level}:t1`]: `npm run test:task:l${level}:t1`,
    [`test:task:l${level}:t2`]: `npm run test:task:l${level}:t2`,
    [`test:tasks:l${level}`]: `npm run test:tasks:l${level}`
  };

  if (commandMap[command]) return commandMap[command];
  if (command.startsWith('npm ')) return command;
  return `npm run ${command}`;
}

async function executeTestInContainer(
  containerId: string,
  command: string
): Promise<{ output: string; exitCode: number; error?: string }> {
  try {
    const containerInfo = await getContainerInfo(containerId);
    const workspaceDir = await resolveWorkspaceDir(containerId, containerInfo?.projectFolder);

    const shellCmd = `cd ${shellEscape(workspaceDir)} && NODE_ENV=test ${command}`;
    console.log(`[TEST EXEC] dockerode exec in ${workspaceDir}: ${command}`);

    const firstRun = await runShellCommandInContainer(containerId, shellCmd, TEST_TIMEOUT);
    let output =
      firstRun.stdout + (firstRun.stderr ? `\nSTDERR:\n${firstRun.stderr}` : '');

    if (firstRun.exitCode !== 0 && shouldRetryAfterDependencyBootstrap(output)) {
      console.warn(
        '[TEST EXEC] Missing dependency detected. Bootstrapping workspace dependencies and retrying once...'
      );
      const bootstrapResult = await bootstrapWorkspaceDependencies(
        containerId,
        workspaceDir,
        command
      );
      if (bootstrapResult.stderr) {
        output += `\n\n[DEPS BOOTSTRAP STDERR]\n${bootstrapResult.stderr}`;
      }

      const secondRun = await runShellCommandInContainer(containerId, shellCmd, TEST_TIMEOUT);
      const retryOutput =
        secondRun.stdout + (secondRun.stderr ? `\nSTDERR:\n${secondRun.stderr}` : '');

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
  return (
    lower.includes('failed to resolve import') ||
    lower.includes('cannot find module') ||
    lower.includes('module not found') ||
    lower.includes('does the file exist?')
  );
}

async function bootstrapWorkspaceDependencies(
  containerId: string,
  workspaceDir: string,
  command: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const wantsClient = command.includes(':client:') || command.includes('client');
  const wantsServer = command.includes(':server:') || command.includes('server');

  const steps: string[] = [
    `cd ${shellEscape(workspaceDir)}`,
    'if [ -f package.json ]; then npm install --include=dev --no-audit --no-fund; fi',
    'npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event --no-audit --no-fund'
  ];

  if (wantsClient || (!wantsClient && !wantsServer)) {
    steps.push(
      'if [ -f client/package.json ]; then cd client && npm install --include=dev --no-audit --no-fund && cd ..; fi'
    );
  }
  if (wantsServer || (!wantsClient && !wantsServer)) {
    steps.push(
      'if [ -f server/package.json ]; then cd server && npm install --include=dev --no-audit --no-fund && cd ..; fi'
    );
  }

  return runShellCommandInContainer(containerId, steps.join(' && '), 8 * 60 * 1000);
}

async function resolveWorkspaceDir(
  containerId: string,
  projectFolder?: string
): Promise<string> {
  const labelFolder = (projectFolder ?? '').trim();
  if (labelFolder) return `/workspace`;

  try {
    const detectCommand = [
      'if [ -f /workspace/package.json ]; then',
      '  echo /workspace;',
      'else',
      '  first=$(find /workspace -mindepth 2 -maxdepth 2 -type f -name package.json | head -n 1);',
      '  if [ -n "$first" ]; then dirname "$first"; else echo /workspace; fi;',
      'fi'
    ].join(' ');

    const { stdout } = await runShellCommandInContainer(containerId, detectCommand, 10000);
    return stdout.trim() || '/workspace';
  } catch {
    return '/workspace';
  }
}

async function runShellCommandInContainer(
  containerId: string,
  shellCommand: string,
  timeoutMs: number
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const container = docker.getContainer(containerId);
  const exec = await container.exec({
    Cmd: ['sh', '-c', shellCommand],
    AttachStdout: true,
    AttachStderr: true,
    AttachStdin: false,
    Tty: false,
    WorkingDir: '/workspace'
  });

  const stream = await exec.start({ hijack: true, stdin: false });
  const stdoutStream = new PassThrough();
  const stderrStream = new PassThrough();
  docker.modem.demuxStream(stream, stdoutStream, stderrStream);

  let stdout = '';
  let stderr = '';
  stdoutStream.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
  stderrStream.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      stream.destroy(new Error(`Test execution timed out after ${timeoutMs}ms`));
    }, timeoutMs);
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
// Output parser
// ---------------------------------------------------------------------------

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
}

/**
 * parseTestOutput handles THREE output formats produced by npm test scripts:
 *
 * 1. CONCURRENT (`concurrently "npm:test:task:client:l2:t1" "npm:test:task:client:l2:t2"`)
 *    Every line is prefixed: [test:task:client:l2:t1] ✓ ...
 *    Task number is read directly from the prefix.
 *
 * 2. SEQUENTIAL (`npm run test:task:client:l1:t2 && npm run test:task:client:l1:t1`)
 *    No line prefix. npm prints a script header before each task's Vitest output:
 *      > library-management@1.0.0 test:task:client:l1:t2
 *    Task number is read from that header, then all subsequent Vitest lines until
 *    the next header belong to that task.
 *
 * 3. SINGLE TASK (one task run directly)
 *    No prefix, no multi-task headers. All results belong to the one task.
 */
function parseTestOutput(output: string, exitCode: number): ParsedTestResults {
  const resultsByTaskNumber = new Map<string, TaskBucket>();
  const allResults: TestResult[] = [];
  let testIdCounter = 0;

  const cleanOutput = stripAnsi(output);
  const lines = cleanOutput.split('\n');

  // ── Detect run mode ────────────────────────────────────────────────────────

  // Concurrent: lines start with [test:task:...:tN]
  const isConcurrentRun = lines.some((l) =>
    /^\s*\[test:task:[^\]]*:t\d+\]/i.test(l)
  );

  // Sequential (&&): npm prints "> pkg-name@ver script-name" headers with :tN in the script name.
  // We detect this by finding such a header that contains a task number.
  const isSequentialRun =
    !isConcurrentRun &&
    lines.some((l) => /^>\s+\S+@\S+\s+[^\s]*:t\d+/.test(l.trim()));

  // ── Helpers ────────────────────────────────────────────────────────────────

  function ensureBucket(taskNum: string): TaskBucket {
    if (!resultsByTaskNumber.has(taskNum)) {
      resultsByTaskNumber.set(taskNum, { results: [], passed: true, exitCode: null });
    }
    return resultsByTaskNumber.get(taskNum)!;
  }

  /**
   * Process a single content line (after stripping any concurrently prefix).
   * Mutates `bucket` and `allResults`.
   */
  function processVitestLine(content: string, bucket: TaskBucket): void {
    // ---- File-level summary line ----------------------------------------
    // All-passing:  "✓ ../tests/.../task-1/foo.test.ts (8 tests) 22ms"
    // With failures:"❯ ../tests/.../task-2/bar.test.ts (3 tests | 3 failed) 79ms"
    //
    // When ALL tests in a file pass, Vitest only emits this one summary line —
    // it does NOT emit individual ✓ lines per test. We read the "(N tests)"
    // count and synthesise N passing results so the UI shows "8/8" not "1/1".
    // Failing individual lines (×) are handled separately below.
    const fileSummaryMatch = content.match(
      /^[✓✔❯▶]\s+\S+\.test\.[jt]sx?\s+\((\d+)\s+tests?(?:\s*\|\s*(\d+)\s+failed)?\)/
    );
    if (fileSummaryMatch) {
      const totalTests = parseInt(fileSummaryMatch[1], 10);
      const failedTests = parseInt(fileSummaryMatch[2] ?? '0', 10);
      const passedTests = totalTests - failedTests;
      for (let i = 0; i < passedTests; i++) {
        const r: TestResult = {
          testId: `test-${++testIdCounter}`,
          testName: `Test ${i + 1}`,
          passed: true,
          message: 'Test passed'
        };
        bucket.results.push(r);
        allResults.push(r);
      }
      if (failedTests > 0) bucket.passed = false;
      return;
    }

    // ---- Individual passing test line --------------------------------------
    // Vitest emits these only when the file has a mix of pass/fail results.
    // "  ✓ some test name 12ms"
    const passMatch = content.match(/^[✓✔]\s+(.+?)(?:\s+\d+(?:\.\d+)?\s*(?:ms|s))?$/);
    if (passMatch) {
      const testName = passMatch[1].trim();
      if (!/\.test\.[jt]sx?/.test(testName)) {
        const r: TestResult = {
          testId: `test-${++testIdCounter}`,
          testName,
          passed: true,
          message: 'Test passed'
        };
        bucket.results.push(r);
        allResults.push(r);
      }
      return;
    }

    // ---- Individual failing test line --------------------------------------
    // "  × should keep only helper-available books 43ms"
    // "  ✕ some test name"
    const failMatch = content.match(/^[✗✕×]\s+(.+?)(?:\s+\d+(?:\.\d+)?\s*(?:ms|s))?$/);
    if (failMatch) {
      const testName = failMatch[1].trim();
      if (!/\.test\.[jt]sx?/.test(testName)) {
        const r: TestResult = {
          testId: `test-${++testIdCounter}`,
          testName,
          passed: false,
          message: 'Test failed'
        };
        bucket.results.push(r);
        bucket.passed = false;
        allResults.push(r);
      }
      return;
    }

    // ---- Vitest footer summary lines (safety net) -------------------------
    // "      Tests  7 failed (7)"
    const summaryFailMatch = content.match(/^\s*Tests\s+\d+\s+failed/i);
    if (summaryFailMatch) {
      bucket.passed = false;
    }
  }

  // ── Parse ──────────────────────────────────────────────────────────────────

  if (isConcurrentRun) {
    // ------------------------------------------------------------------------
    // CONCURRENT RUN
    // Each line: "[test:task:client:l2:t1] <content>"
    // Task number extracted directly from the prefix.
    // Ground truth per task: "npm run ... exited with code N"
    // ------------------------------------------------------------------------
    for (const rawLine of lines) {
      const line = rawLine.trim();
      const prefixMatch = line.match(/^\[test:task:[^\]]*:t(\d+)\]\s*(.*)/i);
      if (!prefixMatch) continue;

      const taskNumber = prefixMatch[1];
      const content = prefixMatch[2];
      const bucket = ensureBucket(taskNumber);

      // Ground-truth exit line emitted by concurrently
      const exitMatch = content.match(/exited with code (\d+)/i);
      if (exitMatch) {
        bucket.exitCode = parseInt(exitMatch[1], 10);
        if (bucket.exitCode !== 0) bucket.passed = false;
        continue;
      }

      processVitestLine(content, bucket);
    }

  } else if (isSequentialRun) {
    // ------------------------------------------------------------------------
    // SEQUENTIAL RUN (`&&`)
    // npm prints a script header before each task's block:
    //   "> library-management@1.0.0 test:task:client:l1:t2"
    // Everything until the next such header belongs to that task.
    //
    // Because && short-circuits on failure, if task N fails then tasks N+1…
    // never run. We mark those missing tasks as failed in post-processing.
    //
    // Exit code of the overall command: 0 only if ALL tasks passed.
    // We derive per-task exit codes from the Vitest summary lines since
    // there is no per-task "exited with code" line in && output.
    // ------------------------------------------------------------------------
    let currentTaskNumber: string | null = null;
    let currentBucket: TaskBucket | null = null;

    for (const rawLine of lines) {
      const line = stripAnsi(rawLine); // already stripped but be safe

      // Detect npm script header: "> pkg@ver test:task:...:tN"
      // e.g. "> library-management@1.0.0 test:task:client:l1:t2"
      const headerMatch = line.trim().match(/^>\s+\S+@\S+\s+[^\s]*:t(\d+)/);
      if (headerMatch) {
        currentTaskNumber = headerMatch[1];
        currentBucket = ensureBucket(currentTaskNumber);
        continue;
      }

      if (!currentBucket) continue; // haven't seen a header yet

      processVitestLine(line.trim(), currentBucket);
    }

    // Derive per-task exit codes from Vitest summary lines in the raw output.
    // For each bucket, check if we saw any "Tests N failed" summary attributed
    // to it. If a bucket has only passing results and no failure markers, it passed.
    // If the overall exitCode is 0, all tasks passed.
    for (const [, bucket] of resultsByTaskNumber) {
      // If we found failing test lines, the bucket is already marked failed.
      // If no results at all were captured (task never ran due to && short-circuit),
      // mark as failed — it didn't run because a prior task failed.
      if (bucket.results.length === 0) {
        bucket.passed = false;
        bucket.exitCode = 1;
        const synthetic: TestResult = {
          testId: `test-${++testIdCounter}`,
          testName: 'Tests did not run',
          passed: false,
          message: 'This task was not executed (a prior task in the sequence failed)'
        };
        bucket.results.push(synthetic);
        allResults.push(synthetic);
      } else {
        // exitCode for a sequential task: failed if any result failed
        const anyFailed = bucket.results.some((r) => !r.passed);
        bucket.exitCode = anyFailed ? 1 : 0;
        bucket.passed = !anyFailed;
      }
    }

  } else {
    // ------------------------------------------------------------------------
    // SINGLE-TASK RUN — no prefix, no multi-task headers.
    // All results belong to the single task.
    // ------------------------------------------------------------------------
    const singleBucket = ensureBucket('1');
    for (const rawLine of lines) {
      processVitestLine(rawLine.trim(), singleBucket);
    }
    singleBucket.exitCode = exitCode;
    singleBucket.passed = exitCode === 0;
  }

  // ── Post-process concurrent buckets (exit code is ground truth) ───────────

  if (isConcurrentRun) {
    for (const [, bucket] of resultsByTaskNumber) {
      if (bucket.exitCode !== null) {
        bucket.passed = bucket.exitCode === 0;
      }
      // Synthesise a fallback result if we captured no lines (e.g. truncated output)
      if (bucket.results.length === 0 && bucket.exitCode !== null) {
        const synthetic: TestResult = {
          testId: `test-${++testIdCounter}`,
          testName: 'Test suite',
          passed: bucket.exitCode === 0,
          message: bucket.exitCode === 0 ? 'Tests passed' : 'Tests failed'
        };
        bucket.results.push(synthetic);
        allResults.push(synthetic);
      }
    }
  }

  // ── Derive overall summary ─────────────────────────────────────────────────

  const passedCount = allResults.filter((r) => r.passed).length;
  const failedCount = allResults.filter((r) => !r.passed).length;
  const total = allResults.length || 1;

  const finalResults =
    allResults.length > 0
      ? allResults
      : [
          {
            testId: 'test-1',
            testName: exitCode === 0 ? 'All tests' : 'Test suite',
            passed: exitCode === 0,
            message:
              exitCode === 0 ? 'Tests completed successfully' : 'One or more tests failed'
          }
        ];

  return {
    passed: exitCode === 0,
    total,
    passedCount,
    failedCount,
    results: finalResults,
    resultsByTaskNumber
  };
}

// ---------------------------------------------------------------------------
// Task-result builder
// ---------------------------------------------------------------------------

/**
 * Builds per-task result entries from the parsed output.
 *
 * Works for all three run modes (concurrent, sequential &&, single) because
 * all three now populate `resultsByTaskNumber` with per-task buckets.
 *
 * Task number lookup order:
 *   1. Index-based key ("1", "2", ...) — always correct for ordered taskIds
 *   2. Digit suffix of the taskId string ("task-2" → "2")
 */
function buildTaskResults(
  taskIds: string[],
  parsedResults: ParsedTestResults,
  level: number
): TaskTestResult[] {
  const taskNameById = new Map(
    (getLevelConfig(level)?.tasks ?? []).map((task) => [task.taskId, task.taskText])
  );

  return taskIds.map((taskId, index) => {
    const taskNumber = String(index + 1);

    const idDigitMatch = taskId.match(/(\d+)$/);
    const taskNumberFromId = idDigitMatch ? idDigitMatch[1] : null;

    const bucket =
      parsedResults.resultsByTaskNumber.get(taskNumber) ??
      (taskNumberFromId
        ? parsedResults.resultsByTaskNumber.get(taskNumberFromId)
        : undefined);

    let taskResults: TestResult[];
    let taskPassed: boolean;

    if (bucket) {
      taskResults = bucket.results;
      // Exit code is ground truth when available
      taskPassed = bucket.exitCode !== null ? bucket.exitCode === 0 : bucket.passed;
    } else if (taskIds.length === 1) {
      // Single-task run — overall result belongs unambiguously to this task
      taskResults = parsedResults.results;
      taskPassed = parsedResults.passed;
    } else {
      // Multiple tasks but no bucket found — unknown rather than inheriting wrong status
      taskResults = [
        {
          testId: `task-${taskId}-unknown`,
          testName: `Task ${taskNumber} tests`,
          passed: false,
          message: 'Could not determine individual test result'
        }
      ];
      taskPassed = false;
    }

    return {
      taskId,
      taskName: taskNameById.get(taskId) ?? `Task ${taskNumber}`,
      passed: taskPassed,
      results: taskResults,
      errors: taskPassed ? [] : ['Some tests failed for this task']
    };
  });
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function truncateOutput(output: string, maxLength: number): string {
  if (output.length <= maxLength) return output;
  const half = Math.floor(maxLength / 2);
  return (
    output.slice(0, half) +
    `\n\n... [${output.length - maxLength} characters truncated] ...\n\n` +
    output.slice(-half)
  );
}
