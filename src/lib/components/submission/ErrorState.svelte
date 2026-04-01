<script lang="ts">
  import type { RegressedTask } from '$lib/types/Submission';
  
  export let error: string;
  export let regressedTasks: RegressedTask[];
</script>

<div class="space-y-4">
  {#if regressedTasks.length > 0}
    <div class="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
      <h4 class="text-yellow-400 font-medium mb-2">⚠️ Regressed Tasks</h4>
      <ul class="space-y-1 text-sm text-gray-300">
        {#each regressedTasks as task}
          <li>• {task.taskName}</li>
        {/each}
      </ul>
    </div>
  {/if}

  <div class="bg-red-900/30 border border-red-600/50 rounded-lg p-4">
    <pre class="text-sm text-gray-300 whitespace-pre-wrap font-mono">{error}</pre>
  </div>
</div>
