<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, CheckCircle, XCircle, AlertCircle, Clock, Play, ChevronDown, ChevronUp } from 'lucide-svelte';

  // -- Types --------------------------------------------------------------------
  import type { TestRunResult } from '$lib/types/test';

  // -- Props --------------------------------------------------------------------
  export let open = false;
  export let result: TestRunResult | null = null;
  export let loading = false;
  export let title = 'Test Results';

  // -- State --------------------------------------------------------------------
  let expandedTasks: Set<string> = new Set();

  type ParsedOutputLine = {
    status: 'passed' | 'failed';
    text: string;
  };

  // -- Events -------------------------------------------------------------------
  const dispatch = createEventDispatcher<{
    close: { source: 'x' | 'footer' | 'backdrop' | 'escape' };
    rerun: void;
  }>();

  // -- Helpers ------------------------------------------------------------------
  function toggleTask(taskId: string) {
    if (expandedTasks.has(taskId)) {
      expandedTasks.delete(taskId);
    } else {
      expandedTasks.add(taskId);
    }
    expandedTasks = expandedTasks;
  }

  function close(source: 'x' | 'footer' | 'backdrop' | 'escape') {
    // If closing via footer button (Continue Working) when tests failed, show a toast or log confirmation
    if (source === 'footer' && !allPassed) {
      console.log('[TestResultModal] User pressed Continue Working - returning to continue working on tasks');
    }
    dispatch('close', { source });
    open = false;
  }

  function rerun() {
    dispatch('rerun');
  }

  function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  function parseCommandOutput(output: string): ParsedOutputLine[] {
    const ansiEscape = /\x1B\[[0-9;]*m/g;
    const lines = output
      .split('\n')
      .map((line) => line.replace(ansiEscape, '').trim())
      .filter(Boolean);

    const parsed: ParsedOutputLine[] = [];

    for (const line of lines) {
      const passMatch = /^(?:PASS\b|✓\s+|✔\s+|√\s+)/i;
      const failMatch = /^(?:FAIL\b|✕\s+|✖\s+|×\s+)/i;

      const stripTrailingDuration = (value: string) =>
        value
          .replace(/\s+\d+(?:\.\d+)?m?s$/i, '')
          .replace(/\s+\d+(?:\.\d+)?s$/i, '')
          .trim();

      if (passMatch.test(line)) {
        parsed.push({
          status: 'passed',
          text: stripTrailingDuration(line.replace(passMatch, '').trim() || line),
        });
        continue;
      }

      if (failMatch.test(line)) {
        parsed.push({
          status: 'failed',
          text: stripTrailingDuration(line.replace(failMatch, '').trim() || line),
        });
        continue;
      }
    }

    return parsed;
  }

  // -- Derived ------------------------------------------------------------------
  $: allPassed = result?.success ?? false;
  $: passRate = result?.summary.total
    ? Math.round((result.summary.passed / result.summary.total) * 100)
    : 0;
  $: parsedOutputLines = result?.output ? parseCommandOutput(result.output) : [];
  $: hasParsedChecklist = parsedOutputLines.length > 0;
</script>

{#if open}
  <div
    class="result-backdrop fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-[6px]"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    on:click={(e) => e.target === e.currentTarget && close('backdrop')}
    on:keydown={(e) => e.key === 'Escape' && close('escape')}
  >
    <div class="result-card-in relative flex max-h-[85vh] w-[min(680px,95vw)] flex-col overflow-hidden rounded-[4px] border border-[var(--card-border)] bg-[var(--bg-light)] shadow-[0_0_0_1px_rgba(7,165,201,0.07),0_0_50px_var(--accent-glow),0_24px_60px_rgba(0,0,0,0.6)]">
      <div class="pointer-events-none absolute inset-0 bg-grid-cyber opacity-30" aria-hidden="true"></div>
      <!-- Ambient glow top edge -->
      <div class="absolute left-0 right-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--accent),transparent)]" aria-hidden="true"></div>

      <!-- Header -->
      <div class="relative flex items-center justify-between border-b border-[rgba(7,165,201,0.1)] px-6 py-5">
        <div class="flex items-center gap-3.5">
          <div
            class="status-pulse flex h-10 w-10 items-center justify-center rounded-[4px] border border-[rgba(136,146,160,0.25)] bg-[rgba(136,146,160,0.1)] text-[var(--text-muted)]"
            class:border-[rgba(0,229,160,0.3)]={allPassed}
            class:bg-[rgba(0,229,160,0.1)]={allPassed}
            class:text-[var(--success)]={allPassed}
            class:border-[rgba(255,56,96,0.3)]={!allPassed && !loading}
            class:bg-[rgba(255,56,96,0.1)]={!allPassed && !loading}
            class:text-[var(--danger)]={!allPassed && !loading}
          >
            {#if loading}
              <Clock class="w-5 h-5 animate-pulse" />
            {:else if allPassed}
              <CheckCircle class="w-5 h-5" />
            {:else}
              <XCircle class="w-5 h-5" />
            {/if}
          </div>
          <div>
            <h2 class="[font-family:var(--font-heading)] text-base font-bold tracking-[0.08em] uppercase text-[var(--text-primary)]">{title}</h2>
            {#if result && !loading}
              <p class="mt-1 [font-family:var(--font-mono)] text-xs text-[var(--text-muted)]">
                {result.summary.passed} of {result.summary.total} tests passed
                {#if result.summary.duration > 0}
                  · {formatDuration(result.summary.duration)}
                {/if}
              </p>
            {:else if loading}
              <p class="mt-1 [font-family:var(--font-mono)] text-xs text-[var(--text-muted)]">Running tests...</p>
            {/if}
          </div>
        </div>
        <button
          class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[4px] border border-transparent bg-transparent text-[var(--text-muted)] transition-all duration-150 ease-in-out hover:border-[rgba(255,56,96,0.25)] hover:bg-[rgba(255,56,96,0.08)] hover:text-[var(--danger)]"
          on:click={() => close('x')}
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Progress bar -->
      {#if result && !loading}
        <div class="flex items-center gap-3 border-b border-[rgba(7,165,201,0.08)] bg-[rgba(7,165,201,0.03)] px-6 py-3.5">
          <div class="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-[rgba(136,146,160,0.15)]">
            <div
              class="h-full rounded-[3px] bg-[linear-gradient(90deg,var(--danger),var(--warn))] shadow-[0_0_8px_rgba(255,56,96,0.25)] transition-[width] duration-500 ease-in-out"
              class:bg-[linear-gradient(90deg,var(--success),var(--cyan-bright))]={allPassed}
              class:shadow-[0_0_8px_var(--accent-glow)]={allPassed}
              style="width: {passRate}%"
            ></div>
          </div>
          <span class="min-w-9 text-right [font-family:var(--font-mono)] text-xs font-semibold text-[var(--text-primary)]">{passRate}%</span>
        </div>
      {/if}

      <!-- Key Takeaways Summary - moved to bottom of content area -->

      <!-- Content -->
      <div class="trm-content relative flex-1 overflow-y-auto px-6 py-4">
        {#if loading}
          <div class="loading-pop flex flex-col items-center justify-center px-4 py-12 text-center text-[var(--text-muted)]">
            <div class="mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-[rgba(7,165,201,0.2)] border-t-[var(--accent)]"></div>
            <p class="[font-family:var(--font-body)]">Running tests in container...</p>
            {#if result?.command}
              <code class="mt-3 inline-block rounded-[4px] border border-[rgba(7,165,201,0.15)] bg-[rgba(7,165,201,0.08)] px-3.5 py-2 [font-family:var(--font-mono)] text-xs text-[var(--accent)]">{result.command}</code>
            {/if}
          </div>
        {:else if result}
          {#if result.taskResults.length === 0}
            <div class="px-4 py-12 text-center text-[var(--text-muted)]">
              <AlertCircle class="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No test results available</p>
            </div>
          {:else}
            <div class="flex flex-col gap-2">
              {#each result.taskResults as task, idx (task.taskId)}
                <div
                  class="result-row overflow-hidden rounded-[4px] border border-[rgba(136,146,160,0.12)] bg-[rgba(10,14,26,0.72)] transition-all duration-200 hover:border-[rgba(7,165,201,0.24)] hover:shadow-[0_0_18px_rgba(7,165,201,0.14)]"
                  class:border-[rgba(255,56,96,0.2)]={!task.passed}
                  style="animation-delay: {idx * 55}ms"
                >
                  <button
                    class="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-4 py-3 text-left transition-colors duration-150 ease-in-out hover:bg-[rgba(7,165,201,0.05)]"
                    on:click={() => toggleTask(task.taskId)}
                  >
                    <div
                      class="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(255,56,96,0.1)] text-[var(--danger)]"
                      class:bg-[rgba(0,229,160,0.1)]={task.passed}
                      class:text-[var(--success)]={task.passed}
                    >
                      {#if task.passed}
                        <CheckCircle class="w-4 h-4" />
                      {:else}
                        <XCircle class="w-4 h-4" />
                      {/if}
                    </div>
                    <span class="flex-1 [font-family:var(--font-body)] text-[0.88rem] font-medium text-[var(--text-primary)]">{task.taskName}</span>
                    {#if task.passed && task.keyTakeaway}
                      <span class="mr-1 rounded-[3px] bg-[rgba(0,229,160,0.1)] px-1.5 py-0.5 text-[0.625rem] text-[var(--success)]">✓</span>
                    {/if}
                    <span class="rounded-[3px] bg-[rgba(136,146,160,0.1)] px-2 py-1 [font-family:var(--font-mono)] text-[0.6875rem] text-[var(--text-muted)]">
                      {task.results.filter(r => r.passed).length}/{task.results.length}
                    </span>
                    <div class="text-[var(--text-muted)]">
                      {#if expandedTasks.has(task.taskId)}
                        <ChevronUp class="w-4 h-4" />
                      {:else}
                        <ChevronDown class="w-4 h-4" />
                      {/if}
                    </div>
                  </button>

                  {#if expandedTasks.has(task.taskId)}
                    <div class="expand-in border-t border-[rgba(136,146,160,0.08)] px-4 pb-4">
                      {#if task.errors.length > 0}
                        <div class="flex flex-col gap-2 py-3">
                          {#each task.errors as error}
                            <div class="flex items-start gap-2 rounded-[4px] border border-[rgba(255,56,96,0.15)] bg-[rgba(255,56,96,0.08)] px-3 py-2.5 [font-family:var(--font-body)] text-xs leading-6 text-[var(--danger)]">
                              <AlertCircle class="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--danger)]" />
                              <span>{error}</span>
                            </div>
                          {/each}
                        </div>
                      {/if}

                      {#if task.results.length > 0}
                        <div class="flex flex-col gap-1.5 pt-3">
                          {#each task.results as test}
                            <div
                              class="flex items-center gap-2 rounded-[3px] bg-[rgba(136,146,160,0.05)] px-2.5 py-2"
                              class:bg-[rgba(0,229,160,0.05)]={test.passed}
                            >
                              <div class="flex items-center text-[var(--danger)]" class:text-[var(--success)]={test.passed}>
                                {#if test.passed}
                                  <CheckCircle class="w-3.5 h-3.5" />
                                {:else}
                                  <XCircle class="w-3.5 h-3.5" />
                                {/if}
                              </div>
                              <div class="flex flex-1 flex-col gap-0.5">
                                <span class="[font-family:var(--font-body)] text-xs text-[var(--text-primary)]">{test.testName}</span>
                                {#if test.message}
                                  <span class="[font-family:var(--font-body)] text-[0.6875rem] text-[var(--text-muted)]">{test.message}</span>
                                {/if}
                              </div>
                              {#if test.duration}
                                <span class="[font-family:var(--font-mono)] text-[0.6875rem] text-[var(--text-muted)]">{formatDuration(test.duration)}</span>
                              {/if}
                            </div>
                          {/each}
                        </div>
                      {/if}


                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}

          <!-- Command output -->
          {#if result.output}
            <div class="mt-4 border-t border-[rgba(7,165,201,0.1)] pt-4">
              <h3 class="mb-2 [font-family:var(--font-heading)] text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Command Output</h3>

              {#if hasParsedChecklist}
                <div class="mb-3 overflow-hidden rounded-[4px] border border-[rgba(7,165,201,0.12)] bg-[rgba(7,165,201,0.04)]">
                  <ul class="m-0 list-none p-0">
                    {#each parsedOutputLines as line}
                      <li
                        class="output-line flex items-start gap-2.5 border-b border-[rgba(136,146,160,0.08)] px-3 py-2 [font-family:var(--font-body)] text-[0.76rem] text-[var(--text-muted)] last:border-b-0"
                        class:is-passed={line.status === 'passed'}
                        class:is-failed={line.status === 'failed'}
                      >
                        {#if line.status === 'passed'}
                          <span class="output-marker mt-[1px] text-[var(--success)]">✓</span>
                        {:else}
                          <span class="output-marker mt-[1px] text-[var(--danger)]">✕</span>
                        {/if}
                        <span class="break-words">{line.text}</span>
                      </li>
                    {/each}
                  </ul>
                </div>
              {/if}

              <details class="rounded-[4px] border border-[rgba(7,165,201,0.12)] bg-[var(--bg)]">
                <summary class="cursor-pointer px-3 py-2 [font-family:var(--font-mono)] text-[0.6875rem] text-[var(--accent)]">
                  View raw output
                </summary>
                <pre class="max-h-[200px] overflow-y-auto whitespace-pre-wrap break-words border-t border-[rgba(7,165,201,0.12)] p-3 [font-family:var(--font-mono)] text-[0.6875rem] leading-[1.6] text-[var(--text-muted)]">{result.output}</pre>
              </details>
            </div>
          {/if}
        {/if}
      </div>



      <!-- Footer -->
      <div class="flex justify-end gap-3 border-t border-[rgba(7,165,201,0.1)] bg-[rgba(7,165,201,0.02)] px-6 py-4">
        <button
          class="btn-cyber cursor-pointer border border-[rgba(136,146,160,0.3)] bg-transparent !px-[1.125rem] !py-[0.625rem] [font-family:var(--font-heading)] !text-[0.6875rem] font-semibold text-[var(--text-muted)] transition-all duration-150 ease-in-out hover:border-[rgba(136,146,160,0.5)] hover:bg-[rgba(136,146,160,0.08)] hover:text-[var(--text-primary)]"
          on:click={() => close('footer')}
        >
          {allPassed ? 'Close' : 'Continue Working'}
        </button>
        {#if !loading}
          <button
            class="btn-cyber btn-cyber-solid flex cursor-pointer items-center gap-1.5 !px-[1.125rem] !py-[0.625rem] [font-family:var(--font-heading)] !text-[0.6875rem] font-semibold shadow-[0_0_16px_var(--accent-glow)] hover:shadow-[0_0_26px_var(--accent-glow)]"
            on:click={rerun}
          >
            <Play class="w-4 h-4" />
            Run Again
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .result-backdrop {
    animation: modal-fade-in 0.2s ease-out both;
  }

  .result-card-in {
    animation: modal-slide-in 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .result-row {
    animation: row-stagger-in 0.26s ease-out both;
  }

  .expand-in {
    animation: expand-fade-in 0.2s ease-out both;
  }

  .loading-pop {
    animation: loading-fade 0.22s ease-out both;
  }

  .status-pulse {
    animation: icon-pulse 2.1s ease-in-out infinite;
  }

  .trm-content::-webkit-scrollbar {
    width: 6px;
  }

  .trm-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .trm-content::-webkit-scrollbar-thumb {
    background: rgba(7, 165, 201, 0.3);
    border-radius: 3px;
  }

  .trm-content::-webkit-scrollbar-thumb:hover {
    background: rgba(7, 165, 201, 0.5);
  }

  .output-marker {
    width: 0.9rem;
    flex-shrink: 0;
    font-weight: 700;
    text-align: center;
  }

  .output-line.is-passed {
    background: rgba(0, 229, 160, 0.06);
  }

  .output-line.is-failed {
    background: rgba(255, 56, 96, 0.06);
  }

  @keyframes modal-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes modal-slide-in {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes row-stagger-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes expand-fade-in {
    from {
      opacity: 0;
      transform: translateY(-3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes loading-fade {
    from { opacity: 0.4; }
    to { opacity: 1; }
  }

  @keyframes icon-pulse {
    0%, 100% {
      box-shadow: 0 0 0 rgba(7, 165, 201, 0);
    }
    50% {
      box-shadow: 0 0 16px var(--accent-glow);
    }
  }
</style>
