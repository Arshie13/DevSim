<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Beaker, ChevronDown } from 'lucide-svelte';
  import TestSelectionModal from '$components/workspace/TestSelectionModal.svelte';
  import TestResultModal from '$components/workspace/TestResultModal.svelte';
  import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
  import type { TestableTask, TestRunResult } from '$lib/types/test';
  import { toast } from '$lib/stores/toast';

  export let containerId: string;
  export let level = 1;
  export let tasks: TestableTask[] = [];
  export let disabled = false;
  export let tutorialMode = false;

  let showSelectionModal = false;
  let showResultModal = false;
  let showCancelConfirmModal = false;
  let testLoading = false;
  let testResult: TestRunResult | null = null;
  let activeTestAbortController: AbortController | null = null;
  let runningTaskIds: string[] = [];
  let runningTaskPrevStatus = new Map<string, TestableTask['testStatus']>();
  let suppressCompletionDispatch = false;

  const dispatch = createEventDispatcher<{
    testsComplete: { success: boolean; result: TestRunResult };
    resultModalClosed: void;
  }>();

  function openTestModal() {
    if (testLoading) {
      showResultModal = true;
      showSelectionModal = false;
      return;
    }

    showSelectionModal = true;
  }

  function closeTestModal() {
    showSelectionModal = false;
  }

  function closeResultModal(event?: CustomEvent<{ source: 'x' | 'footer' | 'backdrop' | 'escape' }>) {
    const source = event?.detail?.source;

    if (testLoading && source === 'x') {
      showResultModal = false;
      showCancelConfirmModal = true;
      return;
    }

    showResultModal = false;
    dispatch('resultModalClosed');
  }

  function handleCancelConfirmDismiss() {
    showCancelConfirmModal = false;
    if (testLoading) {
      showResultModal = true;
    }
  }

  async function handleCancelConfirmAccept() {
    showCancelConfirmModal = false;
    await cancelRunningTests();
  }

  function markTasksRunning(taskIds: string[]) {
    runningTaskIds = taskIds;
    runningTaskPrevStatus = new Map<string, TestableTask['testStatus']>();

    for (const task of tasks) {
      if (taskIds.includes(task.id)) {
        runningTaskPrevStatus.set(task.id, task.testStatus ?? 'pending');
      }
    }

    tasks = tasks.map((task) =>
      taskIds.includes(task.id) ? { ...task, testStatus: 'running' } : task
    );
  }

  function restoreRunningTaskStatuses() {
    if (!runningTaskIds.length) return;

    tasks = tasks.map((task) => {
      if (!runningTaskIds.includes(task.id)) return task;
      return {
        ...task,
        testStatus: runningTaskPrevStatus.get(task.id) ?? 'pending'
      };
    });

    runningTaskIds = [];
    runningTaskPrevStatus = new Map<string, TestableTask['testStatus']>();
  }

  function clearRunningTaskTracking() {
    runningTaskIds = [];
    runningTaskPrevStatus = new Map<string, TestableTask['testStatus']>();
  }

  async function cancelRunningTests() {
    suppressCompletionDispatch = true;
    activeTestAbortController?.abort();
    activeTestAbortController = null;

    restoreRunningTaskStatuses();
    showResultModal = false;
    testLoading = false;

    try {
      await fetch(`/api/docker/container/${containerId}/tests/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (cancelError) {
      console.warn('[TEST RUN] Failed to request test cancellation:', cancelError);
    }

    toast.info('Test run canceled');
  }

  async function runTaskTest(event: CustomEvent<{ taskId: string; taskName: string }>) {
    const { taskId, taskName } = event.detail;
    showSelectionModal = false;
    testLoading = true;
    showResultModal = true;
    suppressCompletionDispatch = false;
    markTasksRunning([taskId]);
    const abortController = new AbortController();
    activeTestAbortController = abortController;

    try {
      const task = tasks.find(t => t.id === taskId);
      const isClient = task?.hasClientTest ?? false;
      const isServer = task?.hasServerTest ?? false;

      console.log(`[TEST RUN] Running tests for task ${taskId} (Client: ${isClient}, Server: ${isServer}) in container ${containerId}`);

      // Get task order from the task object (aligns with LevelTask.order in schema)
      const taskOrder = task?.order ?? getTaskNumber(taskId);
      const formattedTaskName = formatTaskLabel(level, taskOrder);

      // Determine which test to run
      let testCommand = '';
      if (isClient && isServer) {
        // Full-stack task - run both
        testCommand = `test:task:l${level}:t${taskOrder}`;
      } else if (isClient) {
        testCommand = `test:task:client:l${level}:t${taskOrder}`;
      } else if (isServer) {
        testCommand = `test:task:server:l${level}:t${taskOrder}`;
      } else {
        // Fallback when task metadata is incomplete.
        testCommand = `test:task:l${level}:t${taskOrder}`;
      }

      const response = await fetch(`/api/docker/container/${containerId}/tests/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          command: testCommand,
          level,
          taskId,
          taskOrder: taskOrder,
          type: 'task'
        })
      });

      const data = await response.json();
      console.log(`[TEST RUN] Response for task ${taskId}:`, data);

      if (data.success) {
        const passed = tutorialMode ? true : data.passed;
        const rawResults: typeof data.results = data.results || [];
        const rawTaskResults = data.taskResults || [{
          taskId,
          taskName: formattedTaskName,
          passed: data.passed,
          results: rawResults,
          errors: data.errors || []
        }];
        const forcedTaskResults = tutorialMode
          ? rawTaskResults.map((r: { passed: boolean; results: { passed: boolean }[]; errors: string[] }) => ({
              ...r,
              passed: true,
              results: r.results.map((tr: { passed: boolean }) => ({ ...tr, passed: true })),
              errors: []
            }))
          : rawTaskResults;
        const rawSummary = data.summary || { total: 0, passed: 0, failed: 0, duration: 0 };
        const forcedSummary = tutorialMode
          ? { ...rawSummary, passed: rawSummary.total, failed: 0 }
          : rawSummary;

        testResult = {
          success: passed,
          level,
          summary: forcedSummary,
          taskResults: forcedTaskResults,
          command: testCommand,
          output: data.output
        };

        tasks = tasks.map(t =>
          t.id === taskId ? { ...t, testStatus: 'passed' } : t
        );
        clearRunningTaskTracking();
        toast.success(`Tests passed for "${taskName}"`);
      } else {
        clearRunningTaskTracking();
        throw new Error(data.message || 'Test execution failed');
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const fallbackTaskOrder = tasks.find(t => t.id === taskId)?.order ?? getTaskNumber(taskId);
      testResult = {
        success: false,
        level,
        summary: { total: 0, passed: 0, failed: 0, duration: 0 },
        taskResults: [{
          taskId,
          taskName: formatTaskLabel(level, fallbackTaskOrder),
          passed: false,
          results: [],
          errors: [errorMessage]
        }],
        output: errorMessage
      };
      clearRunningTaskTracking();
      toast.error(`Test failed: ${errorMessage}`);
    } finally {
      if (activeTestAbortController === abortController) {
        activeTestAbortController = null;
      }
      testLoading = false;

      if (suppressCompletionDispatch) {
        suppressCompletionDispatch = false;
        return;
      }

      if (testResult) {
        dispatch('testsComplete', { success: testResult.success, result: testResult });
      }
    }
  }

  async function runLevelTests(event: CustomEvent<{ taskIds: string[] }>) {
    const { taskIds } = event.detail;
    showSelectionModal = false;
    testLoading = true;
    showResultModal = true;
    suppressCompletionDispatch = false;
    markTasksRunning(taskIds);
    const abortController = new AbortController();
    activeTestAbortController = abortController;

    try {
      // Run grouped level tests
      const response = await fetch(`/api/docker/container/${containerId}/tests/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          command: `test:tasks:l${level}`,
          level,
          taskIds,
          type: 'level'
        })
      });

      const data = await response.json();

      if (data.success) {
        testResult = {
          success: data.passed,
          level,
          summary: data.summary || { total: 0, passed: 0, failed: 0, duration: 0 },
          taskResults: data.taskResults || [],
          command: `npm run test:tasks:l${level}`,
          output: data.output
        };

        // Update all task statuses
        if (data.taskResults) {
          tasks = tasks.map(t => {
            const result = data.taskResults.find((r: { taskId: string }) => r.taskId === t.id);
            return result ? { ...t, testStatus: result.passed ? 'passed' : 'failed' } : t;
          });
        }
        clearRunningTaskTracking();

        if (data.passed) {
          toast.success('All level tests passed!');
        } else {
          toast.error('Some tests failed. Review the results.');
        }
      } else {
        clearRunningTaskTracking();
        throw new Error(data.message || 'Test execution failed');
      }
    } catch (err2) {
      if (err2 instanceof DOMException && err2.name === 'AbortError') {
        return;
      }

      const errorMessage = err2 instanceof Error ? err2.message : 'Unknown error';
      testResult = {
        success: false,
        level,
        summary: { total: 0, passed: 0, failed: 0, duration: 0 },
        taskResults: [],
        output: errorMessage
      };
      clearRunningTaskTracking();
      toast.error(`Tests failed: ${errorMessage}`);
    } finally {
      if (activeTestAbortController === abortController) {
        activeTestAbortController = null;
      }
      testLoading = false;

      if (suppressCompletionDispatch) {
        suppressCompletionDispatch = false;
        return;
      }

      if (testResult) {
        dispatch('testsComplete', { success: testResult.success, result: testResult });
      }
    }
  }

  function rerunTests() {
    if (testResult?.taskResults.length === 1) {
      // Re-run single task
      const task = testResult.taskResults[0];
      runTaskTest(new CustomEvent('rerun', { detail: { taskId: task.taskId, taskName: task.taskName } }));
    } else {
      // Re-run level tests
      const taskIds = testResult?.taskResults.map(t => t.taskId) || [];
      runLevelTests(new CustomEvent('rerun', { detail: { taskIds } }));
    }
  }

  function getTaskNumber(taskId: string): number {
    // Extract task number from task ID (e.g., "task-1" -> 1)
    const match = taskId.match(/\d+/);
    return match ? parseInt(match[0], 10) : 1;
  }

  function formatTaskLabel(levelNumber: number, taskOrder: number): string {
    return `Level ${levelNumber} - Task ${taskOrder}`;
  }

  // Public method for running all level tests (used by Submit Sprint)
  export async function runAllLevelTests(): Promise<TestRunResult> {
    testLoading = true;
    showResultModal = true;
    suppressCompletionDispatch = false;

    const taskIds = tasks
      .filter((task) => task.hasClientTest || task.hasServerTest)
      .map((task) => task.id);
    markTasksRunning(taskIds);
    const abortController = new AbortController();
    activeTestAbortController = abortController;

    try {
      const response = await fetch(`/api/docker/container/${containerId}/tests/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          command: `test:tasks:l${level}`,
          level,
          taskIds,
          type: 'level'
        })
      });

      const data = await response.json();

      testResult = {
        success: data.passed,
        level,
        summary: data.summary || { total: 0, passed: 0, failed: 0, duration: 0 },
        taskResults: data.taskResults || [],
        command: `npm run test:tasks:l${level}`,
        output: data.output
      };

      // Update task statuses
      if (data.taskResults) {
        tasks = tasks.map(t => {
          const result = data.taskResults.find((r: { taskId: string }) => r.taskId === t.id);
          return result ? { ...t, testStatus: result.passed ? 'passed' : 'failed' } : t;
        });
      }
      clearRunningTaskTracking();

      return testResult;
    } catch (err3) {
      if (err3 instanceof DOMException && err3.name === 'AbortError') {
        restoreRunningTaskStatuses();
        return {
          success: false,
          level,
          summary: { total: 0, passed: 0, failed: 0, duration: 0 },
          taskResults: [],
          output: 'Test run canceled'
        };
      }

      const errorMessage = err3 instanceof Error ? err3.message : 'Unknown error';
      testResult = {
        success: false,
        level,
        summary: { total: 0, passed: 0, failed: 0, duration: 0 },
        taskResults: [],
        output: errorMessage
      };
      clearRunningTaskTracking();
      return testResult;
    } finally {
      if (activeTestAbortController === abortController) {
        activeTestAbortController = null;
      }
      testLoading = false;
    }
  }

  // Public method to close result modal
  export function closeResults() {
    showResultModal = false;
    dispatch('resultModalClosed');
  }

  // -- Derived ------------------------------------------------------------------
  $: hasTestableTasks = tasks.some(t => t.hasClientTest || t.hasServerTest);
  $: passedCount = tasks.filter(t => t.testStatus === 'passed').length;
  $: failedCount = tasks.filter(t => t.testStatus === 'failed').length;
</script>

<div class="relative inline-flex">
  <button
    data-tour="run-tests-button"
    class="flex items-center gap-1.5 rounded-[3px] border border-[rgba(7,165,201,0.25)] bg-[rgba(7,165,201,0.08)] px-3.5 py-2 font-['Orbitron',monospace] text-[0.6875rem] font-semibold text-[var(--accent)] transition-all duration-150 ease-in-out hover:border-[rgba(7,165,201,0.4)] hover:bg-[rgba(7,165,201,0.15)] hover:shadow-[0_0_12px_rgba(7,165,201,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
    on:click={openTestModal}
    disabled={disabled || !hasTestableTasks}
    title={!hasTestableTasks ? 'No tests available for this level' : 'Run tests'}
  >
    <Beaker class="w-4 h-4" />
    <span>Test</span>
    {#if passedCount > 0 || failedCount > 0}
      <span
        class="ml-1 rounded-[2px] px-1.5 py-0.5 text-[0.625rem]"
        class:bg-[rgba(0,229,160,0.15)]={failedCount === 0}
        class:text-[var(--success)]={failedCount === 0}
        class:bg-[rgba(255,56,96,0.15)]={failedCount > 0}
        class:text-[var(--danger)]={failedCount > 0}
        class:bg-[rgba(136,146,160,0.2)]={failedCount === 0 && passedCount === 0}
        class:text-[var(--text-muted)]={failedCount === 0 && passedCount === 0}
      >
        {passedCount}/{passedCount + failedCount}
      </span>
    {/if}
    <ChevronDown class="ml-0.5 h-3.5 w-3.5 opacity-70" />
  </button>
</div>

<!-- Test Selection Modal -->
<TestSelectionModal
  bind:open={showSelectionModal}
  {tasks}
  {level}
  loading={testLoading}
  on:close={closeTestModal}
  on:runTask={runTaskTest}
  on:runLevel={runLevelTests}
/>

<!-- Test Result Modal -->
<TestResultModal
  bind:open={showResultModal}
  result={testResult}
  loading={testLoading}
  title={testResult?.taskResults.length === 1 ? 'Task Test Results' : 'Level Test Results'}
  on:close={closeResultModal}
  on:rerun={rerunTests}
/>

<ConfirmationModal
  bind:open={showCancelConfirmModal}
  icon="⚠"
  iconVariant="warning"
  title="Cancel Testing?"
  subtitle="A test run is currently in progress"
  description="Are you sure you want to cancel testing?"
  confirmLabel="Yes, Cancel Test"
  cancelLabel="No, Continue Test"
  variant="warning"
  on:confirm={handleCancelConfirmAccept}
  on:cancel={handleCancelConfirmDismiss}
/>
