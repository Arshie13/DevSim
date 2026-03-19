<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Beaker, ChevronDown } from 'lucide-svelte';
  import TestSelectionModal from '$components/workspace/TestSelectionModal.svelte';
  import TestResultModal from '$components/workspace/TestResultModal.svelte';
  import type { TestableTask, TestRunResult } from '$lib/types/test';
  import { toast } from '$lib/stores/toast';

  export let containerId: string;
  export let level = 1;
  export let tasks: TestableTask[] = [];
  export let disabled = false;

  let showSelectionModal = false;
  let showResultModal = false;
  let testLoading = false;
  let testResult: TestRunResult | null = null;

  const dispatch = createEventDispatcher<{
    testsComplete: { success: boolean; result: TestRunResult };
  }>();

  function openTestModal() {
    showSelectionModal = true;
  }

  function closeTestModal() {
    showSelectionModal = false;
  }

  function closeResultModal() {
    showResultModal = false;
  }

  async function runTaskTest(event: CustomEvent<{ taskId: string; taskName: string }>) {
    const { taskId, taskName } = event.detail;
    showSelectionModal = false;
    testLoading = true;
    showResultModal = true;

    try {
      const task = tasks.find(t => t.id === taskId);
      const isClient = task?.hasClientTest ?? false;
      const isServer = task?.hasServerTest ?? false;

      console.log(`[TEST RUN] Running tests for task ${taskId} (Client: ${isClient}, Server: ${isServer}) in container ${containerId}`);

      // Get task order from the task object (aligns with LevelTask.order in schema)
      const taskOrder = task?.order ?? getTaskNumber(taskId);

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
        body: JSON.stringify({
          command: testCommand,
          level,
          taskId,
          testType: 'task'
        })
      });

      const data = await response.json();
      console.log(`[TEST RUN] Response for task ${taskId}:`, data);

      if (data.success) {
        testResult = {
          success: data.passed,
          level,
          summary: data.summary || { total: 0, passed: 0, failed: 0, duration: 0 },
          taskResults: [{
            taskId,
            taskName,
            passed: data.passed,
            results: data.results || [],
            errors: data.errors || []
          }],
          command: testCommand,
          output: data.output
        };

        // Update task status
        tasks = tasks.map(t =>
          t.id === taskId
            ? { ...t, testStatus: data.passed ? 'passed' : 'failed' }
            : t
        );

        if (data.passed) {
          toast.success(`Tests passed for "${taskName}"`);
        } else {
          toast.error(`Tests failed for "${taskName}"`);
        }
      } else {
        throw new Error(data.message || 'Test execution failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      testResult = {
        success: false,
        level,
        summary: { total: 0, passed: 0, failed: 0, duration: 0 },
        taskResults: [{
          taskId,
          taskName,
          passed: false,
          results: [],
          errors: [errorMessage]
        }],
        output: errorMessage
      };
      toast.error(`Test failed: ${errorMessage}`);
    } finally {
      testLoading = false;
      dispatch('testsComplete', { success: testResult?.success ?? false, result: testResult! });
    }
  }

  async function runLevelTests(event: CustomEvent<{ taskIds: string[] }>) {
    const { taskIds } = event.detail;
    showSelectionModal = false;
    testLoading = true;
    showResultModal = true;

    try {
      // Run grouped level tests
      const response = await fetch(`/api/docker/container/${containerId}/tests/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: `test:tasks:l${level}`,
          level,
          taskIds,
          testType: 'level'
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

        if (data.passed) {
          toast.success('All level tests passed!');
        } else {
          toast.error('Some tests failed. Review the results.');
        }
      } else {
        throw new Error(data.message || 'Test execution failed');
      }
    } catch (err2) {
      const errorMessage = err2 instanceof Error ? err2.message : 'Unknown error';
      testResult = {
        success: false,
        level,
        summary: { total: 0, passed: 0, failed: 0, duration: 0 },
        taskResults: [],
        output: errorMessage
      };
      toast.error(`Tests failed: ${errorMessage}`);
    } finally {
      testLoading = false;
      dispatch('testsComplete', { success: testResult?.success ?? false, result: testResult! });
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

  // Public method for running all level tests (used by Submit Sprint)
  export async function runAllLevelTests(): Promise<TestRunResult> {
    testLoading = true;
    showResultModal = true;

    const taskIds = tasks
      .filter((task) => task.hasClientTest || task.hasServerTest)
      .map((task) => task.id);

    try {
      const response = await fetch(`/api/docker/container/${containerId}/tests/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: `test:tasks:l${level}`,
          level,
          taskIds,
          testType: 'level'
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

      return testResult;
    } catch (err3) {
      const errorMessage = err3 instanceof Error ? err3.message : 'Unknown error';
      testResult = {
        success: false,
        level,
        summary: { total: 0, passed: 0, failed: 0, duration: 0 },
        taskResults: [],
        output: errorMessage
      };
      return testResult;
    } finally {
      testLoading = false;
    }
  }

  // Public method to close result modal
  export function closeResults() {
    showResultModal = false;
  }

  // -- Derived ------------------------------------------------------------------
  $: hasTestableTasks = tasks.some(t => t.hasClientTest || t.hasServerTest);
  $: passedCount = tasks.filter(t => t.testStatus === 'passed').length;
  $: failedCount = tasks.filter(t => t.testStatus === 'failed').length;
</script>

<div class="relative inline-flex">
  <button
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
