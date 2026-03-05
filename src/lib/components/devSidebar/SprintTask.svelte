<script lang="ts">
  import { CheckCircle } from "lucide-svelte";

  export let tasks: { id: number; text: string; completed: boolean }[] = [];
  export let onToggleTask: (taskId: number) => void = () => {};
  export let levelTitle: string = "";

  $: completedCount = tasks.filter((t) => t.completed).length;
  $: progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
</script>

<div class="p-4">
  {#if levelTitle}
    <div class="mb-3">
      <span class="text-xs font-medium text-cyan-400">{levelTitle}</span>
    </div>
  {/if}

  <div class="flex items-center justify-between mb-3">
    <span class="text-xs text-[#d0d7dd]/50">{completedCount}/{tasks.length} completed</span>
  </div>

  <div class="w-full bg-[#2d3446] rounded-full h-1.5 mb-4">
    <div
      class="h-1.5 rounded-full transition-all duration-500"
      style="width: {progress}%; background: linear-gradient(90deg, #07a5c9, rgba(7, 165, 201, 0.6));"
    ></div>
  </div>

  <div class="space-y-1">
    {#each tasks as task}
      <button
        on:click={() => onToggleTask(task.id)}
        class="w-full flex items-start gap-2 p-2 rounded hover:bg-[#2d3446]/50 cursor-pointer transition-all text-left"
      >
        <div
          class="mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all {task.completed
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-[#27272a] hover:border-[#d0d7dd]/30'}"
        >
          {#if task.completed}
            <CheckCircle class="w-3 h-3 text-white" />
          {/if}
        </div>
        <span
          class="text-sm {task.completed
            ? 'line-through text-[#d0d7dd]/30'
            : 'text-[#d0d7dd]/80'}"
        >
          {task.text}
        </span>
      </button>
    {/each}
  </div>

  {#if tasks.length === 0}
    <div class="text-center py-4">
      <p class="text-xs text-gray-500">No tasks available</p>
    </div>
  {/if}
</div>
