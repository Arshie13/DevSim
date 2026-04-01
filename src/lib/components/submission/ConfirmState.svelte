<script lang="ts">
  import type { ITask } from '$types';
  import type { FileChangeSummary } from '$lib/types/Submission';
  
  export let tasks: ITask[];
  export let completedCount: number;
  export let loadingFileChanges: boolean;
  export let fileChanges: FileChangeSummary | null;
  export let rewardXp: number;
  export let rewardCoins: number;
</script>

<div class="space-y-4">
  <!-- Task Summary -->
  <div class="bg-slate-800/50 rounded-lg p-4">
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm text-gray-400">Tasks Completed</span>
      <span class="text-sm font-medium text-cyan-400">
        {completedCount}/{tasks.length}
      </span>
    </div>
    <div class="w-full bg-slate-700 rounded-full h-2">
      <div 
        class="bg-cyan-500 h-2 rounded-full transition-all"
        style="width: {(completedCount / tasks.length) * 100}%"
      ></div>
    </div>
  </div>

  <!-- File Changes -->
  {#if loadingFileChanges}
    <div class="text-sm text-gray-400 animate-pulse">
      Scanning file changes...
    </div>
  {:else if fileChanges && fileChanges.totalChanges > 0}
    <div class="bg-slate-800/50 rounded-lg p-4">
      <h4 class="text-sm font-medium text-gray-200 mb-2">Changes Detected</h4>
      <div class="space-y-1 text-sm">
        {#if fileChanges.created.length > 0}
          <div class="text-green-400">
            + {fileChanges.created.length} created
          </div>
        {/if}
        {#if fileChanges.modified.length > 0}
          <div class="text-yellow-400">
            ~ {fileChanges.modified.length} modified
          </div>
        {/if}
        {#if fileChanges.renamed.length > 0}
          <div class="text-blue-400">
            → {fileChanges.renamed.length} renamed
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Rewards -->
  <div class="flex gap-4">
    <div class="flex-1 bg-slate-800/50 rounded-lg p-3 text-center">
      <div class="text-2xl">⭐</div>
      <div class="text-sm font-medium text-gray-200">+{rewardXp} XP</div>
    </div>
    <div class="flex-1 bg-slate-800/50 rounded-lg p-3 text-center">
      <div class="text-2xl">🪙</div>
      <div class="text-sm font-medium text-gray-200">+{rewardCoins} Coins</div>
    </div>
  </div>
</div>