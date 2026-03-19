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
</script>

<div class="card-cyber mb-4 bg-[var(--bg)] px-4 py-3.5">
  <p class="mb-2.5 [font-family:var(--font-mono)] text-[0.75rem] tracking-[0.1em] uppercase text-[var(--text-muted)]">Sprint tasks</p>
  <ul class="list-none m-0 p-0 flex flex-col gap-1.5">
    {#each tasks as task}
      <li class="flex items-center gap-2.5 [font-family:var(--font-mono)] text-[0.88rem] transition-opacity duration-150 {task.isCompleted ? 'opacity-100' : 'opacity-35'}">
        <span class="w-4 text-center font-bold {task.isCompleted ? 'text-[var(--success)]' : 'text-[var(--surface)]'}">
          {task.isCompleted ? '✓' : '○'}
        </span>
        <span class="{task.isCompleted ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] line-through'}">
          {task.taskName}
        </span>
      </li>
    {/each}
  </ul>
  <p class="mt-2.5 text-right [font-family:var(--font-mono)] text-[0.75rem] text-[var(--text-muted)]">{completedCount} / {tasks.length} completed</p>
</div>

{#if loadingFileChanges}
  <div class="card-cyber mb-4 bg-[var(--bg)] px-4 py-3">
    <p class="mb-2 [font-family:var(--font-mono)] text-[0.75rem] tracking-[0.1em] uppercase text-[var(--text-muted)]">Loading file changes...</p>
  </div>
{:else if fileChanges && fileChanges.totalChanges > 0}
  <div class="card-cyber mb-4 bg-[var(--bg)] px-4 py-3">
    <p class="mb-2.5 [font-family:var(--font-mono)] text-[0.75rem] tracking-[0.1em] uppercase text-[var(--text-muted)]">Files modified</p>
    <ul class="list-none m-0 p-0 flex flex-col gap-1.5">
      {#if fileChanges.created.length > 0}
        {#each fileChanges.created as file}
          <li class="flex items-center gap-2.5 [font-family:var(--font-mono)] text-[0.82rem]">
            <span class="w-4 text-center font-bold text-[var(--success)]">+</span>
            <span class="text-[var(--text-primary)]">{file}</span>
          </li>
        {/each}
      {/if}
      {#if fileChanges.modified.length > 0}
        {#each fileChanges.modified as file}
          <li class="flex items-center gap-2.5 [font-family:var(--font-mono)] text-[0.82rem]">
            <span class="w-4 text-center font-bold text-[var(--warn)]">•</span>
            <span class="text-[var(--text-primary)]">{file}</span>
          </li>
        {/each}
      {/if}
      {#if fileChanges.renamed.length > 0}
        {#each fileChanges.renamed as rename}
          <li class="flex items-center gap-2.5 [font-family:var(--font-mono)] text-[0.82rem]">
            <span class="w-4 text-center font-bold text-[var(--accent)]">→</span>
            <span class="text-[var(--text-primary)]">{rename.from} → {rename.to}</span>
          </li>
        {/each}
      {/if}
    </ul>
    <p class="mt-2.5 text-right [font-family:var(--font-mono)] text-[0.75rem] text-[var(--text-muted)]">{fileChanges.totalChanges} file(s) changed</p>
  </div>
{:else}
  <div class="card-cyber mb-4 bg-[var(--bg)] px-4 py-3">
    <p class="mb-2 [font-family:var(--font-mono)] text-[0.75rem] tracking-[0.1em] uppercase text-[var(--text-muted)]">No files modified</p>
  </div>
{/if}

<div class="flex gap-2.5 mb-1">
  <div class="flex-1 rounded-[4px] border border-[rgba(22,163,74,0.25)] bg-[rgba(15,34,16,0.8)] py-2 text-center [font-family:var(--font-mono)] text-[0.82rem] tracking-[0.04em] text-[var(--success)]">
    ⚡ XP incoming
  </div>
  <div class="flex-1 rounded-[4px] border border-[rgba(202,138,4,0.25)] bg-[rgba(31,21,8,0.8)] py-2 text-center [font-family:var(--font-mono)] text-[0.82rem] tracking-[0.04em] text-[var(--warn)]">
    🪙 Coins incoming
  </div>
</div>
