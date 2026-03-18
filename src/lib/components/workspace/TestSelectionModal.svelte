<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Play, Beaker, CheckCircle, Circle } from 'lucide-svelte';
  import type { TestableTask } from '$lib/types/test';

  export let open = false;
  export let tasks: TestableTask[] = [];
  export let level = 1;
  export let loading = false;

  let selectedTasks: Set<string> = new Set();
  const dispatch = createEventDispatcher<{
    close: void;
    runTask: { taskId: string; taskName: string };
    runLevel: { taskIds: string[] };
  }>();

  function toggleTaskSelection(taskId: string) {
    if (selectedTasks.has(taskId)) {
      selectedTasks.delete(taskId);
    } else {
      selectedTasks.add(taskId);
    }
    selectedTasks = new Set(selectedTasks);
  }

  function selectAll() {
    const testable = tasks.filter(t => t.hasClientTest || t.hasServerTest);
    if (selectedTasks.size === testable.length) {
      selectedTasks.clear();
    } else {
      selectedTasks = new Set(testable.map(t => t.id));
    }
    selectedTasks = new Set(selectedTasks);
  }

  function close() {
    dispatch('close');
    open = false;
  }

  function runSelected() {
    const taskIds = Array.from(selectedTasks);
    if (taskIds.length === 1) {
      const task = tasks.find(t => t.id === taskIds[0]);
      if (task) {
        dispatch('runTask', { taskId: task.id, taskName: task.taskName });
      }
    } else if (taskIds.length > 1) {
      dispatch('runLevel', { taskIds });
    }
  }

  function runSingleTask(task: TestableTask) {
    dispatch('runTask', { taskId: task.id, taskName: task.taskName });
  }

  $: testableTasks = tasks.filter(t => t.hasClientTest || t.hasServerTest);
  $: selectedCount = selectedTasks.size;
  $: allSelected = testableTasks.length > 0 && selectedTasks.size === testableTasks.length;
  $: hasTestableTasks = testableTasks.length > 0;
</script>

{#if open}
  <div
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-[6px]"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    on:click={(e) => e.target === e.currentTarget && close()}
    on:keydown={(e) => e.key === 'Escape' && close()}
  >
    <div class="relative flex max-h-[85vh] w-[min(520px,95vw)] flex-col overflow-hidden rounded-[4px] border border-[rgba(7,165,201,0.2)] bg-[var(--bg-light)] shadow-[0_0_0_1px_rgba(7,165,201,0.07),0_0_50px_rgba(7,165,201,0.15),0_24px_60px_rgba(0,0,0,0.6)]">
      <div class="absolute left-0 right-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(7,165,201,0.5),transparent)]" aria-hidden="true"></div>
      <div class="flex items-center justify-between border-b border-[rgba(7,165,201,0.1)] px-6 py-5">
        <div class="flex items-center gap-3.5">
          <div class="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[rgba(7,165,201,0.25)] bg-[rgba(7,165,201,0.1)] text-[var(--accent)]">
            <Beaker class="w-5 h-5" />
          </div>
          <div>
            <h2 class="font-['Orbitron',monospace] text-base font-bold tracking-[0.02em] text-[var(--text-primary)]">Run Tests</h2>
            <p class="mt-1 font-['Share_Tech_Mono',monospace] text-xs text-[var(--text-muted)]">Level {level} · {testableTasks.length} testable tasks</p>
          </div>
        </div>
        <button
          class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[4px] border-none bg-transparent text-[var(--text-muted)] transition-all duration-150 ease-in-out hover:bg-[rgba(255,56,96,0.08)] hover:text-[var(--danger)]"
          on:click={close}
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      <div class="flex-1 overflow-y-auto px-6 py-4">
        {#if !hasTestableTasks}
          <div class="px-4 py-12 text-center text-[var(--text-muted)]">
            <Beaker class="w-12 h-12 mx-auto mb-3 opacity-30" />
            <h3 class="mb-2 font-['Orbitron',monospace] text-sm font-semibold text-[var(--text-primary)]">No Tests Available</h3>
            <p class="text-xs leading-6">This level does not have any automated tests configured yet.</p>
          </div>
        {:else}
          <button
            class="mb-3 flex cursor-pointer items-center gap-2 rounded-[4px] border border-[rgba(7,165,201,0.15)] bg-[rgba(7,165,201,0.05)] px-3 py-2 font-['Orbitron',monospace] text-[0.6875rem] font-semibold text-[var(--accent)] transition-all duration-150 ease-in-out hover:border-[rgba(7,165,201,0.25)] hover:bg-[rgba(7,165,201,0.1)]"
            on:click={selectAll}
          >
            {#if allSelected}
              <CheckCircle class="w-4 h-4" />
            {:else}
              <Circle class="w-4 h-4" />
            {/if}
            <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
          </button>
          <div class="flex flex-col gap-1.5">
            {#each tasks as task (task.id)}
              {@const hasTest = task.hasClientTest || task.hasServerTest}
              {@const isSelected = selectedTasks.has(task.id)}
              {@const isRunning = task.testStatus === 'running'}
              {@const isPassed = task.testStatus === 'passed'}
              {@const isFailed = task.testStatus === 'failed'}
              <div
                class="flex items-center gap-2.5 rounded-[4px] border border-[rgba(136,146,160,0.1)] bg-[rgba(10,14,26,0.5)] px-3 py-2.5"
                class:opacity-60={!hasTest}
                class:opacity-100={hasTest}
                class:cursor-pointer={hasTest}
                class:bg-[rgba(7,165,201,0.08)]={isSelected}
                class:border-[rgba(7,165,201,0.25)]={isSelected}
                class:bg-[rgba(0,229,160,0.08)]={isPassed}
                class:border-[rgba(0,229,160,0.25)]={isPassed}
                class:bg-[rgba(255,56,96,0.08)]={isFailed}
                class:border-[rgba(255,56,96,0.25)]={isFailed}
              >
                {#if hasTest}
                  <button
                    class="flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-[var(--accent)] transition-colors duration-150 ease-in-out hover:text-[var(--cyan-bright)] disabled:cursor-not-allowed disabled:opacity-50"
                    on:click={() => toggleTaskSelection(task.id)}
                    disabled={loading}
                  >
                    {#if isSelected}
                      <CheckCircle class="w-4 h-4" />
                    {:else}
                      <Circle class="w-4 h-4" />
                    {/if}
                  </button>
                {:else}
                  <div class="flex h-6 w-6 flex-shrink-0 items-center justify-center text-xs text-[var(--text-muted)]">
                    <span>-</span>
                  </div>
                {/if}
                <div class="flex min-w-0 flex-1 flex-col gap-1">
                  <span
                    class="truncate text-[0.8125rem] font-medium text-[var(--text-primary)]"
                    class:line-through={task.isCompleted}
                    class:opacity-60={task.isCompleted}
                  >
                    {task.taskName}
                  </span>
                  <div class="flex flex-wrap gap-1.5">
                    {#if task.hasClientTest}
                      <span class="rounded-[2px] bg-[rgba(0,229,160,0.1)] px-1.5 py-0.5 font-['Orbitron',monospace] text-[0.625rem] font-semibold uppercase tracking-[0.04em] text-[var(--success)]">Client</span>
                    {/if}
                    {#if task.hasServerTest}
                      <span class="rounded-[2px] bg-[rgba(7,165,201,0.1)] px-1.5 py-0.5 font-['Orbitron',monospace] text-[0.625rem] font-semibold uppercase tracking-[0.04em] text-[var(--accent)]">Server</span>
                    {/if}
                    {#if !hasTest}
                      <span class="rounded-[2px] bg-[rgba(136,146,160,0.1)] px-1.5 py-0.5 font-['Orbitron',monospace] text-[0.625rem] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">No tests</span>
                    {/if}
                  </div>
                </div>
                {#if hasTest}
                  <button
                    class="flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-[rgba(7,165,201,0.2)] bg-[rgba(7,165,201,0.08)] p-0 text-[var(--accent)] transition-all duration-150 ease-in-out hover:border-[rgba(7,165,201,0.35)] hover:bg-[rgba(7,165,201,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
                    on:click={() => runSingleTask(task)}
                    disabled={loading || isRunning}
                    title="Run this task's tests"
                  >
                    {#if isRunning}
                      <div class="h-[14px] w-[14px] animate-spin rounded-full border-2 border-[rgba(7,165,201,0.2)] border-t-[var(--accent)]"></div>
                    {:else}
                      <Play class="w-3.5 h-3.5" />
                    {/if}
                  </button>
                {/if}
                {#if isPassed}
                  <CheckCircle class="h-4 w-4 flex-shrink-0 text-[var(--success)]" />
                {:else if isFailed}
                  <X class="h-4 w-4 flex-shrink-0 text-[var(--danger)]" />
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
      {#if hasTestableTasks}
        <div class="flex items-center justify-between border-t border-[rgba(7,165,201,0.1)] bg-[rgba(7,165,201,0.02)] px-6 py-4">
          <span class="font-['Share_Tech_Mono',monospace] text-xs text-[var(--text-muted)]">
            {selectedCount} task{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <div class="flex gap-3">
            <button
              class="cursor-pointer rounded-[3px] border border-[rgba(136,146,160,0.3)] bg-transparent px-[1.125rem] py-[0.625rem] font-['Orbitron',monospace] text-[0.6875rem] font-semibold text-[var(--text-muted)] transition-all duration-150 ease-in-out hover:border-[rgba(136,146,160,0.5)] hover:bg-[rgba(136,146,160,0.08)] hover:text-[var(--text-primary)]"
              on:click={close}
            >
              Cancel
            </button>
            <button
              class="flex cursor-pointer items-center gap-1.5 rounded-[3px] border-none bg-[var(--accent)] px-[1.125rem] py-[0.625rem] font-['Orbitron',monospace] text-[0.6875rem] font-semibold text-[var(--bg)] shadow-[0_0_16px_rgba(7,165,201,0.35)] transition-all duration-150 ease-in-out hover:bg-[var(--cyan-bright)] hover:shadow-[0_0_26px_rgba(0,245,255,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
              on:click={runSelected}
              disabled={loading || selectedCount === 0}
            >
              {#if loading}
                <div class="h-3 w-3 animate-spin rounded-full border-2 border-[rgba(10,14,26,0.3)] border-t-[var(--bg)]"></div>
                Running...
              {:else}
                <Play class="w-4 h-4" />
                Run {selectedCount > 1 ? 'Tests' : 'Test'}
              {/if}
            </button>
          </div>
        </div>
      {:else}
        <div class="flex justify-end border-t border-[rgba(7,165,201,0.1)] bg-[rgba(7,165,201,0.02)] px-6 py-4">
          <button
            class="cursor-pointer rounded-[3px] border border-[rgba(136,146,160,0.3)] bg-transparent px-[1.125rem] py-[0.625rem] font-['Orbitron',monospace] text-[0.6875rem] font-semibold text-[var(--text-muted)] transition-all duration-150 ease-in-out hover:border-[rgba(136,146,160,0.5)] hover:bg-[rgba(136,146,160,0.08)] hover:text-[var(--text-primary)]"
            on:click={close}
          >
            Close
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
