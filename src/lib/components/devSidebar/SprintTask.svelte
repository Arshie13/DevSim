<script lang="ts">
  import { CheckCircle } from "lucide-svelte";
  import type { Task } from "$lib/interface/LevelConfig";

  export let tasks: Task[] = [];
  export let onToggleTask: (taskId: number) => void = () => {};

  $: completedTasks = tasks.filter((t) => t.completed).length;
  $: progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
</script>

<div class="p-4">
  <div class="flex items-center justify-between mb-3">
    <span class="text-xs text-[#d0d7dd]/50">{completedTasks}/{tasks.length} completed</span>
  </div>

  <div class="w-full bg-[#2d3446] rounded-full h-1.5 mb-4">
    <div
      class="bg-gradient-to-r from-[#07a5c9] to-[#07a5c9]/60 h-1.5 rounded-full transition-all duration-500"
      style="width: {progress}%"
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
</div>
