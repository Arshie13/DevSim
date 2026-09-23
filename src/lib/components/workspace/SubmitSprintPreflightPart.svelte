<script lang="ts">
  import type { ITask } from '$lib/types';

  type FileChangeSummary = {
    created: string[];
    modified: string[];
    renamed: { from: string; to: string }[];
    totalChanges: number;
  };

  export let tasks: ITask[] = [];
  export let completedCount = 0;
  export let loadingFileChanges = false;
  export let fileChanges: FileChangeSummary | null = null;
  export let rewardXp = 0;
  export let rewardCoins = 0;

  $: totalTasks = tasks.length;
  $: completionPct = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);
  $: changedCount = fileChanges?.totalChanges ?? 0;
  $: remainingCount = Math.max(totalTasks - completedCount, 0);

  // Paths the user has clicked to reveal in full (otherwise truncated to fit the box).
  let expandedFiles = new Set<string>();
  function toggleFile(file: string) {
    if (expandedFiles.has(file)) {
      expandedFiles.delete(file);
    } else {
      expandedFiles.add(file);
    }
    expandedFiles = expandedFiles; // trigger Svelte reactivity
  }
</script>

<div class="mb-3 overflow-hidden rounded-card border border-[rgb(var(--accent-rgb)/0.28)] bg-[rgb(var(--bg-rgb)/0.85)]">
  <div class="border-b border-[rgb(var(--accent-rgb)/0.18)] px-4 py-3">
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
      <p class="font-label text-xs uppercase tracking-[0.12em] text-[var(--accent)]">Preflight Summary</p>
      <p class="font-label text-xs tabular-nums text-[var(--text-muted)]"><strong>{completedCount}/{totalTasks}</strong> tasks complete</p>
    </div>
    <div class="h-1 w-full overflow-hidden rounded-chrome bg-[rgb(var(--text-muted-rgb)/0.22)]">
      <div
        class="h-full rounded-chrome bg-[linear-gradient(90deg,var(--accent),var(--cyan-bright))] shadow-[0_0_8px_var(--accent-glow)] transition-all duration-300"
        style={`width: ${completionPct}%`}
      ></div>
    </div>
  </div>

  <div class="grid grid-cols-3 gap-2.5 px-4 py-3">
    <div class="rounded-card border border-[rgb(var(--success-rgb)/0.25)] bg-[rgb(var(--success-rgb)/0.08)] px-2 py-2 text-center">
      <p class="font-label text-xs uppercase tracking-[0.08em] text-[var(--success)]">Completed</p>
      <p class="mt-0.5 font-heading text-xl font-semibold tabular-nums text-[var(--text-primary)]"><strong>{completedCount}</strong></p>
    </div>
    <div class="rounded-card border border-[rgb(var(--warn-rgb)/0.25)] bg-[rgb(var(--warn-rgb)/0.08)] px-2 py-2 text-center">
      <p class="font-label text-xs uppercase tracking-[0.08em] text-[var(--warn)]">Remaining</p>
      <p class="mt-0.5 font-heading text-xl font-semibold tabular-nums text-[var(--text-primary)]"><strong>{remainingCount}</strong></p>
    </div>
    <div class="rounded-card border border-[rgb(var(--accent-rgb)/0.25)] bg-[rgb(var(--accent-rgb)/0.08)] px-2 py-2 text-center">
      <p class="font-label text-xs uppercase tracking-[0.08em] text-[var(--accent)]">Changed</p>
      <p class="mt-0.5 font-heading text-xl font-semibold tabular-nums text-[var(--text-primary)]"><strong>{changedCount}</strong></p>
    </div>
  </div>
</div>

<div class="mb-4 grid gap-3 md:grid-cols-2">
  <div class="rounded-card border border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--bg-rgb)/0.72)] px-4 py-3">
    <p class="mb-2.5 font-label text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">Sprint Tasks</p>
    <ul class="m-0 flex list-none flex-col gap-1.5 p-0">
      {#each tasks as task}
        <li class="flex items-center gap-2.5 transition-opacity duration-150 {task.isCompleted ? 'opacity-100' : 'opacity-45'}">
          <span class="inline-flex h-4 w-4 items-center justify-center rounded-card border text-xs font-bold {task.isCompleted ? 'border-[rgb(var(--success-rgb)/0.45)] bg-[rgb(var(--success-rgb)/0.14)] text-[var(--success)]' : 'border-[rgb(var(--text-muted-rgb)/0.35)] text-[var(--text-muted)]'}">
            {task.isCompleted ? '✓' : '○'}
          </span>
          <span class="{task.isCompleted ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] line-through'} font-body text-sm">
            {task.taskName}
          </span>
        </li>
      {/each}
    </ul>
  </div>

  <div class="rounded-card border border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--bg-rgb)/0.72)] px-4 py-3">
    <p class="mb-2.5 font-label text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">Workspace Deltas</p>
    {#if loadingFileChanges}
      <p class="font-body text-sm text-[var(--text-muted)]">Scanning container changes...</p>
    {:else if fileChanges && fileChanges.totalChanges > 0}
      <ul class="m-0 flex max-h-[185px] list-none flex-col gap-1.5 overflow-y-auto p-0 pr-1 scrollbar-thin">
        {#if fileChanges.created.length > 0}
          {#each fileChanges.created as file}
            <li class="flex items-center gap-2 font-label text-sm">
              <span class="shrink-0 text-[var(--success)]">+</span>
              <button
                type="button"
                on:click={() => toggleFile(file)}
                title={file}
                class="min-w-0 flex-1 cursor-pointer text-left text-[var(--text-primary)] {expandedFiles.has(file) ? 'break-all' : 'truncate'}"
              >{file}</button>
            </li>
          {/each}
        {/if}
        {#if fileChanges.modified.length > 0}
          {#each fileChanges.modified as file}
            <li class="flex items-center gap-2 font-label text-sm">
              <span class="shrink-0 text-[var(--warn)]">•</span>
              <button
                type="button"
                on:click={() => toggleFile(file)}
                title={file}
                class="min-w-0 flex-1 cursor-pointer text-left text-[var(--text-primary)] {expandedFiles.has(file) ? 'break-all' : 'truncate'}"
              >{file}</button>
            </li>
          {/each}
        {/if}
        {#if fileChanges.renamed.length > 0}
          {#each fileChanges.renamed as rename}
            <li class="flex items-center gap-2 font-label text-sm">
              <span class="shrink-0 text-[var(--accent)]">→</span>
              <button
                type="button"
                on:click={() => toggleFile(`${rename.from} → ${rename.to}`)}
                title={`${rename.from} → ${rename.to}`}
                class="min-w-0 flex-1 cursor-pointer text-left text-[var(--text-primary)] {expandedFiles.has(`${rename.from} → ${rename.to}`) ? 'break-all' : 'truncate'}"
              >{rename.from} → {rename.to}</button>
            </li>
          {/each}
        {/if}
      </ul>
      <p class="mt-2 text-right font-label text-xs tabular-nums text-[var(--text-muted)]"><strong>{fileChanges.totalChanges} total changes</strong></p>
    {:else}
      <p class="font-body text-sm text-[var(--text-muted)]">No file changes detected.</p>
    {/if}
  </div>
</div>

<div class="mb-1 grid grid-cols-2 gap-2.5">
  <div class="rounded-card border border-[rgb(var(--success-rgb)/0.25)] bg-[color-mix(in_oklab,var(--success)_10%,var(--bg-light)_90%)] py-2 text-center font-label text-sm uppercase tracking-[0.06em] tabular-nums text-[var(--success)]">
    ⚡ <strong>+{rewardXp} XP</strong>
  </div>
  <div class="rounded-card border border-[rgb(var(--warn-rgb)/0.25)] bg-[color-mix(in_oklab,var(--warn)_10%,var(--bg-light)_90%)] py-2 text-center font-label text-sm uppercase tracking-[0.06em] tabular-nums text-[var(--warn)]">
    🪙 <strong>+{rewardCoins} Coins</strong>
  </div>
</div>
