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

    // Get container info to find the workspace path
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

    // Build the full npm command
    const npmCommand = buildNpmCommand(command, level, taskId);
    console.log(`[TEST RUN] Executing: ${npmCommand}`);

    // Execute the test command in the container
    const startTime = Date.now();
    const { output, exitCode, error } = await executeTestInContainer(containerId, npmCommand);
    const duration = Date.now() - startTime;

    console.log(`[TEST RUN] Completed in ${duration}ms with exit code: ${exitCode}`);

    // Parse test results from output
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

    // Add task results for level tests
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

    let firstRun = await runShellCommandInContainer(containerId, shellCmd, TEST_TIMEOUT);
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
  /** false as soon as any test in this bucket fails */
  passed: boolean;
  /** exit code reported by "exited with code N" line for this task label */
  exitCode: number | null;
}

interface ParsedTestResults {
  passed: boolean;
  total: number;
  passedCount: number;
  failedCount: number;
  results: TestResult[];
  /**
   * Per-task buckets keyed by task number string e.g. "1", "2".
   * Populated from the [test:task:...:tN] concurrently prefixes in the output.
   */
  resultsByTaskNumber: Map<string, TaskBucket>;
}

// ---------------------------------------------------------------------------
// Output parser
// ---------------------------------------------------------------------------

/**
 * Strips ANSI escape codes from a string.
 */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
}

/**
 * Extracts the task number from a concurrently label like:
 *   [test:task:client:l2:t1]  →  "1"
 *   [test:task:server:l1:t2]  →  "2"
 *   [test:task:l3:t1]         →  "1"
 *
 * Returns null if the line has no recognisable concurrently prefix.
 */
function extractConcurrentlyTaskNumber(label: string): string | null {
  // Label format from concurrently: [test:task:(client|server|):lN:tM]
  const m = label.match(/\[test:task:[^\]]*:t(\d+)\]/i);
  return m ? m[1] : null;
}

/**
 * Parses the interleaved concurrently output into per-task buckets.
 *
 * Every line emitted by `concurrently` is prefixed with the process label,
 * e.g.:
 *   [test:task:client:l2:t1] ✓ ../tests/client/level-2/task-1/borrow-availability.test.ts
 *   [test:task:client:l2:t2] × should keep only helper-available books...
 *
 * We use that prefix to attribute each line — and therefore each test result
 * and exit code — to the correct task bucket.
 *
 * For single-task runs there is no concurrently prefix, so we fall back to
 * the original line-scanning logic.
 */
function parseTestOutput(output: string, exitCode: number): ParsedTestResults {
  const resultsByTaskNumber = new Map<string, TaskBucket>();
  const allResults: TestResult[] = [];
  let testIdCounter = 0;

  // Strip ANSI from the whole output once up front.
  const cleanOutput = stripAnsi(output);
  const lines = cleanOutput.split('\n');

  // Check whether this is a concurrently run by looking for the label prefix.
  const isConcurrentRun = lines.some((l) =>
    /^\[test:task:[^\]]*:t\d+\]/i.test(l.trim())
  );

  if (isConcurrentRun) {
    // ------------------------------------------------------------------
    // CONCURRENT RUN — parse line-by-line using the concurrently prefix.
    // ------------------------------------------------------------------
    for (const rawLine of lines) {
      const line = rawLine.trim();

      // Extract the concurrently label prefix e.g. "[test:task:client:l2:t1]"
      const prefixMatch = line.match(/^(\[test:task:[^\]]*:t(\d+)\])\s*(.*)/i);
      if (!prefixMatch) continue;

      const taskNumber = prefixMatch[2];            // "1" or "2"
      const content = prefixMatch[3];               // rest of the line after the prefix

      // Ensure the bucket exists for this task number.
      if (!resultsByTaskNumber.has(taskNumber)) {
        resultsByTaskNumber.set(taskNumber, { results: [], passed: true, exitCode: null });
      }
      const bucket = resultsByTaskNumber.get(taskNumber)!;

      // ---- Detect "exited with code N" lines emitted by concurrently ----
      // e.g. "npm run test:task:client:l2:t1 exited with code 0"
      const exitMatch = content.match(/exited with code (\d+)/i);
      if (exitMatch) {
        bucket.exitCode = parseInt(exitMatch[1], 10);
        if (bucket.exitCode !== 0) bucket.passed = false;
        continue;
      }

      // ---- Detect individual passing test lines ----
      // Vitest: "  ✓ some test name 12ms"
      // Also catches the file-level summary line: "✓ ../tests/.../task-1/foo.test.ts (8 tests) 22ms"
      const passMatch = content.match(/^[✓✔]\s+(.+?)(?:\s+\d+(?:\.\d+)?\s*(?:ms|s))?(?:\s+\(\d+ tests?\).*)?$/);
      if (passMatch) {
        const testName = passMatch[1].trim();
        // Skip file-level summary lines (they contain ".test.ts" or ".test.tsx")
        // We still record them so the UI has something to show if no granular lines appear.
        const isFileSummary = /\.test\.[jt]sx?/.test(testName);
        if (!isFileSummary) {
          const result: TestResult = {
            testId: `test-${++testIdCounter}`,
            testName,
            passed: true,
            message: 'Test passed'
          };
          bucket.results.push(result);
          allResults.push(result);
        }
        continue;
      }

      // ---- Detect individual failing test lines ----
      // Vitest: "  × should keep only helper-available books 43ms"
      //         "  ✕ some test name"
      const failMatch = content.match(/^[✗✕×]\s+(.+?)(?:\s+\d+(?:\.\d+)?\s*(?:ms|s))?$/);
      if (failMatch) {
        const testName = failMatch[1].trim();
        const isFileSummary = /\.test\.[jt]sx?/.test(testName);
        if (!isFileSummary) {
          const result: TestResult = {
            testId: `test-${++testIdCounter}`,
            testName,
            passed: false,
            message: 'Test failed'
          };
          bucket.results.push(result);
          bucket.passed = false;
          allResults.push(result);
        }
        continue;
      }

      // ---- Detect Vitest "Tests N passed (N)" summary line ----
      // e.g. "      Tests  8 passed (8)"  or  "      Tests  7 failed (7)"
      // We use these to set bucket.passed definitively when no individual
      // test lines were captured (e.g. when the output was truncated).
      const summaryPassMatch = content.match(/^\s*Tests\s+(\d+)\s+passed/i);
      if (summaryPassMatch && bucket.exitCode === null) {
        // Don't override exitCode — we'll resolve it from the "exited with code" line.
        // But if we somehow missed that, treat this as a passing summary.
        if (bucket.exitCode === null) {
          // Keep passed as-is; will be corrected by exitCode below.
        }
        continue;
      }

      const summaryFailMatch = content.match(/^\s*Tests\s+\d+\s+failed/i);
      if (summaryFailMatch) {
        bucket.passed = false;
        continue;
      }
    }

    // ------------------------------------------------------------------
    // Post-process: reconcile bucket.passed with the captured exit codes.
    // The exit-code line is the ground truth — if it says non-zero, the
    // task failed regardless of what we parsed from individual test lines.
    // ------------------------------------------------------------------
    for (const [, bucket] of resultsByTaskNumber) {
      if (bucket.exitCode !== null && bucket.exitCode !== 0) {
        bucket.passed = false;
      }
      if (bucket.exitCode === 0 && bucket.results.every((r) => r.passed)) {
        bucket.passed = true;
      }

      // If we captured no individual test lines but have an exit code,
      // synthesise a single result so the UI isn't empty.
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

  } else {
    // ------------------------------------------------------------------
    // SINGLE-TASK RUN — no concurrently prefix.
    // Parse the output directly.
    // ------------------------------------------------------------------
    for (const rawLine of lines) {
      const line = stripAnsi(rawLine).trim();

      const passMatch = line.match(/^[✓✔]\s+(.+?)(?:\s+\d+(?:\.\d+)?\s*(?:ms|s))?$/);
      if (passMatch) {
        const testName = passMatch[1].trim();
        if (!/\.test\.[jt]sx?/.test(testName)) {
          allResults.push({
            testId: `test-${++testIdCounter}`,
            testName,
            passed: true,
            message: 'Test passed'
          });
        }
        continue;
      }

      const failMatch = line.match(/^[✗✕×]\s+(.+?)(?:\s+\d+(?:\.\d+)?\s*(?:ms|s))?$/);
      if (failMatch) {
        const testName = failMatch[1].trim();
        if (!/\.test\.[jt]sx?/.test(testName)) {
          allResults.push({
            testId: `test-${++testIdCounter}`,
            testName,
            passed: false,
            message: 'Test failed'
          });
        }
        continue;
      }
    }
  }

  // ------------------------------------------------------------------
  // Derive overall summary counts.
  // ------------------------------------------------------------------
  const passedCount = allResults.filter((r) => r.passed).length;
  const failedCount = allResults.filter((r) => !r.passed).length;
  const total = allResults.length || 1; // avoid division-by-zero in callers

  // Synthesise a result if we parsed nothing at all.
  const finalResults =
    allResults.length > 0
      ? allResults
      : [
          {
            testId: 'test-1',
            testName: exitCode === 0 ? 'All tests' : 'Test suite',
            passed: exitCode === 0,
            message: exitCode === 0 ? 'Tests completed successfully' : 'One or more tests failed'
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
 * Builds per-task TestRunResult entries from the parsed output.
 *
 * For concurrent runs, each task has its own bucket in resultsByTaskNumber
 * keyed by the task number string ("1", "2", …).  We derive the task number
 * from the index in taskIds (1-based) and from any digits in the taskId itself.
 *
 * This completely replaces the broken modulo-distribution approach.
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
    const taskNumber = String(index + 1); // "1", "2", …

    // Also try to extract a number directly from the taskId string
    // e.g. "task-2" → "2", "t2" → "2"
    const idDigitMatch = taskId.match(/(\d+)$/);
    const taskNumberFromId = idDigitMatch ? idDigitMatch[1] : null;

    // Look up the bucket — prefer the index-based number, fall back to id-based
    const bucket =
      parsedResults.resultsByTaskNumber.get(taskNumber) ??
      (taskNumberFromId ? parsedResults.resultsByTaskNumber.get(taskNumberFromId) : undefined);

    let taskResults: TestResult[];
    let taskPassed: boolean;

    if (bucket) {
      // ✅ We have per-task data from the concurrently-prefixed output.
      taskResults = bucket.results;
      taskPassed = bucket.passed;

      // The exit-code line is ground truth: override parsed result if needed.
      if (bucket.exitCode !== null) {
        taskPassed = bucket.exitCode === 0;
      }
    } else if (taskIds.length === 1) {
      // Single-task run — overall result unambiguously belongs to this task.
      taskResults = parsedResults.results;
      taskPassed = parsedResults.passed;
    } else {
      // Multiple tasks but no bucket found — report as unknown rather than
      // inheriting the wrong overall status (which was the original bug).
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
