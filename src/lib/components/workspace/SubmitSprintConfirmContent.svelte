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
  export let masteryReflection = '';
  export let impactedLayers: string[] = [];
  export let expectedLayerCount = 1;
  export let showMasteryCheckpoint = true;

  $: totalTasks = tasks.length;
  $: completionPct = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);
  $: changedCount = fileChanges?.totalChanges ?? 0;
  $: remainingCount = Math.max(totalTasks - completedCount, 0);
  const layerOptions = ['frontend', 'backend', 'database', 'infra/testing'];

   function toggleLayer(layer: string) {
     if (impactedLayers.includes(layer)) {
       impactedLayers = impactedLayers.filter((item) => item !== layer);
       return;
     }
     impactedLayers = [...impactedLayers, layer];
   }
 </script>

<div class="mb-3 overflow-hidden rounded-[4px] border border-[rgba(7,165,201,0.28)] bg-[rgba(10,14,26,0.85)]">
  <div class="border-b border-[rgba(7,165,201,0.18)] px-4 py-3">
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
      <p class="[font-family:var(--font-heading)] text-[0.72rem] uppercase tracking-[0.12em] text-[var(--accent)]">Preflight Summary</p>
      <p class="[font-family:var(--font-mono)] text-[0.72rem] text-[var(--text-muted)]">{completedCount}/{totalTasks} tasks complete</p>
    </div>
    <div class="h-1 w-full overflow-hidden rounded-[2px] bg-[rgba(136,146,160,0.22)]">
      <div
        class="h-full rounded-[2px] bg-[linear-gradient(90deg,var(--accent),var(--cyan-bright))] shadow-[0_0_8px_var(--accent-glow)] transition-all duration-300"
        style={`width: ${completionPct}%`}
      ></div>
    </div>
  </div>

  <div class="grid grid-cols-3 gap-2.5 px-4 py-3">
    <div class="rounded-[3px] border border-[rgba(0,229,160,0.25)] bg-[rgba(0,229,160,0.08)] px-2 py-2 text-center">
      <p class="[font-family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.08em] text-[var(--success)]">Completed</p>
      <p class="mt-0.5 [font-family:var(--font-heading)] text-[1rem] text-[var(--text-primary)]">{completedCount}</p>
    </div>
    <div class="rounded-[3px] border border-[rgba(255,180,0,0.25)] bg-[rgba(255,180,0,0.08)] px-2 py-2 text-center">
      <p class="[font-family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.08em] text-[var(--warn)]">Remaining</p>
      <p class="mt-0.5 [font-family:var(--font-heading)] text-[1rem] text-[var(--text-primary)]">{remainingCount}</p>
    </div>
    <div class="rounded-[3px] border border-[rgba(7,165,201,0.25)] bg-[rgba(7,165,201,0.08)] px-2 py-2 text-center">
      <p class="[font-family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.08em] text-[var(--accent)]">Changed</p>
      <p class="mt-0.5 [font-family:var(--font-heading)] text-[1rem] text-[var(--text-primary)]">{changedCount}</p>
    </div>
  </div>
</div>

<div class="mb-4 grid gap-3 md:grid-cols-2">
  <div class="rounded-[4px] border border-[rgba(7,165,201,0.2)] bg-[rgba(10,14,26,0.72)] px-4 py-3">
    <p class="mb-2.5 [font-family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.1em] text-[var(--text-muted)]">Sprint Tasks</p>
    <ul class="m-0 flex list-none flex-col gap-1.5 p-0">
      {#each tasks as task}
        <li class="flex items-center gap-2.5 [font-family:var(--font-mono)] text-[0.5rem] transition-opacity duration-150 {task.isCompleted ? 'opacity-100' : 'opacity-45'}">
          <span class="inline-flex h-4 w-4 items-center justify-center rounded-[2px] border F font-bold {task.isCompleted ? 'border-[rgba(0,229,160,0.45)] bg-[rgba(0,229,160,0.14)] text-[var(--success)]' : 'border-[rgba(136,146,160,0.35)] text-[var(--text-muted)]'}">
            {task.isCompleted ? '✓' : '○'}
          </span>
          <span class="{task.isCompleted ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] line-through'} text-[0.7rem]">
            {task.taskName}
          </span>
        </li>
      {/each}
    </ul>
  </div>

  <div class="rounded-[4px] border border-[rgba(7,165,201,0.2)] bg-[rgba(10,14,26,0.72)] px-4 py-3">
    <p class="mb-2.5 [font-family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.1em] text-[var(--text-muted)]">Workspace Deltas</p>
    {#if loadingFileChanges}
      <p class="[font-family:var(--font-mono)] text-[0.76rem] text-[var(--text-muted)]">Scanning container changes...</p>
    {:else if fileChanges && fileChanges.totalChanges > 0}
      <ul class="m-0 flex max-h-[185px] list-none flex-col gap-1.5 overflow-y-auto p-0 pr-1 scrollbar-thin">
        {#if fileChanges.created.length > 0}
          {#each fileChanges.created as file}
            <li class="flex items-center gap-2 [font-family:var(--font-mono)] text-[0.7rem]">
              <span class="text-[var(--success)]">+</span>
              <span class="truncate text-[var(--text-primary)] text-[0.7rem]">{file}</span>
            </li>
          {/each}
        {/if}
        {#if fileChanges.modified.length > 0}
          {#each fileChanges.modified as file}
            <li class="flex items-center gap-2 [font-family:var(--font-mono)] text-[0.7rem]">
              <span class="text-[var(--warn)]">•</span>
              <span class="truncate text-[var(--text-primary)]">{file}</span>
            </li>
          {/each}
        {/if}
        {#if fileChanges.renamed.length > 0}
          {#each fileChanges.renamed as rename}
            <li class="flex items-center gap-2 [font-family:var(--font-mono)] text-[0.78rem]">
              <span class="text-[var(--accent)]">→</span>
              <span class="truncate text-[var(--text-primary)]">{rename.from} → {rename.to}</span>
            </li>
          {/each}
        {/if}
      </ul>
      <p class="mt-2 text-right [font-family:var(--font-mono)] text-[0.7rem] text-[var(--text-muted)]">{fileChanges.totalChanges} total changes</p>
    {:else}
      <p class="[font-family:var(--font-mono)] text-[0.76rem] text-[var(--text-muted)]">No file changes detected.</p>
    {/if}
  </div>
</div>

<div class="mb-1 grid grid-cols-2 gap-2.5">
  <div class="rounded-[4px] border border-[rgba(0,229,160,0.25)] bg-[rgba(15,34,16,0.8)] py-2 text-center [font-family:var(--font-mono)] text-[0.8rem] uppercase tracking-[0.06em] text-[var(--success)]">
    ⚡ +{rewardXp} XP
  </div>
  <div class="rounded-[4px] border border-[rgba(255,180,0,0.25)] bg-[rgba(31,21,8,0.8)] py-2 text-center [font-family:var(--font-mono)] text-[0.8rem] uppercase tracking-[0.06em] text-[var(--warn)]">
    🪙 +{rewardCoins} Coins
  </div>
</div>

 <div class="mt-3 rounded-[4px] border border-[rgba(7,165,201,0.2)] bg-[rgba(10,14,26,0.72)] px-4 py-3">
   <p class="mb-2.5 [font-family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.1em] text-[var(--text-muted)]">
     Mastery Checkpoint
   </p>
   {#if showMasteryCheckpoint}
     <p class="mb-2 [font-family:var(--font-mono)] text-[0.72rem] text-[var(--text-muted)]">
       Explain what you changed and why it works. This is required to unlock the next level.
     </p>
     <textarea
       bind:value={masteryReflection}
       rows="4"
       placeholder="Example: I updated the API validation to reject empty titles, then adjusted the frontend form and DB migration so the same constraint is enforced end-to-end..."
       class="w-full resize-y rounded-[4px] border border-[rgba(136,146,160,0.38)] bg-[rgba(10,14,26,0.95)] px-3 py-2 [font-family:var(--font-body)] text-[0.8rem] text-[var(--text-primary)] outline-none transition-colors focus:border-[rgba(7,165,201,0.6)]"
     ></textarea>
     <p class="mt-1 text-right [font-family:var(--font-mono)] text-[0.66rem] text-[var(--text-muted)]">
       {masteryReflection.trim().length} characters
     </p>

     <div class="mt-3">
       <p class="mb-2 [font-family:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.08em] text-[var(--text-muted)]">
         Which layers did this sprint touch?
       </p>
       <p class="mb-2 [font-family:var(--font-mono)] text-[0.66rem] text-[var(--text-muted)]">
         Select at least {expectedLayerCount} layer{expectedLayerCount > 1 ? 's' : ''} for this sprint.
       </p>
       <div class="flex flex-wrap gap-2">
         {#each layerOptions as layer}
           <button
             type="button"
             on:click={() => toggleLayer(layer)}
             class="rounded-[3px] border px-2.5 py-1 [font-family:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.06em] transition-colors {impactedLayers.includes(layer) ? 'border-[rgba(0,229,160,0.45)] bg-[rgba(0,229,160,0.14)] text-[var(--success)]' : 'border-[rgba(136,146,160,0.35)] bg-[rgba(10,14,26,0.8)] text-[var(--text-muted)]'}"
           >
             {impactedLayers.includes(layer) ? '✓ ' : ''}{layer}
           </button>
         {/each}
       </div>
     </div>
   {/if}
 </div>
