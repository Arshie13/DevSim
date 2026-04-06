<script lang="ts">
  import { onMount } from "svelte";
  import { X, CheckCircle, Circle, Play, Target } from "lucide-svelte";

  export let levelTitle: string = "";
  export let levelNumber: number = 1;
  export let isOpen: boolean = false;
  export let onClose: () => void = () => {};
  export let levelDescription: string = "";
  export let tasks: { id: string | number; text: string; completed?: boolean }[] = [];

  let isAnimatingOut = false;
  let isVisible = false;
  let mounted = false;

  $: if (isOpen && !mounted) {
    mounted = true;
    setTimeout(() => {
      isVisible = true;
    }, 50);
  }

  $: if (!isOpen) {
    isVisible = false;
    mounted = false;
  }

  function closeCard() {
    isVisible = false;
    isAnimatingOut = true;
    setTimeout(() => {
      isAnimatingOut = false;
      mounted = false;
      onClose();
    }, 200);
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeCard();
    }
  }

  // Calculate progress percentage
  $: completedCount = tasks?.filter(t => t.completed).length || 0;
  $: totalCount = tasks?.length || 0;
  $: progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
</script>

{#if mounted}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-[6px]"
    on:click={handleBackdropClick}
  >
    <!-- Card -->
    <div
      class="modal-card relative flex max-h-[85vh] w-[min(480px,95vw)] flex-col overflow-hidden rounded-[4px] border border-[rgba(7,165,201,0.15)] bg-[#12192a] shadow-[0_0_0_1px_rgba(7,165,201,0.07),0_0_50px_rgba(7,165,201,0.3),0_24px_60px_rgba(0,0,0,0.6)]"
      class:visible={isVisible}
      class:animating-out={isAnimatingOut}
    >
      <!-- Grid overlay -->
      <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(7,165,201,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(7,165,201,0.06)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <!-- Top gradient line -->
      <div class="absolute left-0 right-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#07a5c9,transparent)]"></div>
      
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-[rgba(7,165,201,0.1)] px-6 py-5">
        <div class="flex items-center gap-3.5">
          <div class="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[rgba(7,165,201,0.25)] bg-[rgba(7,165,201,0.1)]">
            <Target class="w-5 h-5 text-[#07a5c9]" />
          </div>
          <div>
            <h2 class="text-base font-bold tracking-[0.08em] uppercase text-[#d0d7dd]">Level {levelNumber}</h2>
            <p class="mt-1 text-xs text-[#8892a0]">{levelTitle}</p>
          </div>
        </div>
        <button
          class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[4px] border border-transparent bg-transparent text-[#8892a0] transition-all duration-150 ease-in-out hover:border-[rgba(255,56,96,0.25)] hover:bg-[rgba(255,56,96,0.08)] hover:text-[#ff3860]"
          on:click={closeCard}
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="relative flex-1 overflow-y-auto px-6 py-4">
        <!-- Progress bar -->
        {#if totalCount > 0}
          <div class="mb-5">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold uppercase tracking-[0.06em] text-[#07a5c9]">Progress</span>
              <span class="text-xs text-[#8892a0]">{completedCount}/{totalCount} tasks</span>
            </div>
            <div class="h-1.5 w-full rounded-[2px] bg-[rgba(7,165,201,0.15)] overflow-hidden">
              <div 
                class="h-full rounded-[2px] bg-gradient-to-r from-[#07a5c9] to-[#00f5ff] transition-all duration-500 ease-out"
                style="width: {progressPercent}%"
              ></div>
            </div>
          </div>
        {/if}

        <!-- Description -->
        {#if levelDescription}
          <div class="mb-5">
            <h3 class="mb-2 text-xs font-semibold uppercase tracking-[0.06em] text-[#07a5c9]">About This Level</h3>
            <div class="rounded-[4px] border border-[rgba(7,165,201,0.15)] bg-[rgba(7,165,201,0.05)] p-4">
              <p class="text-sm leading-relaxed text-[#a0a8b0]">
                {levelDescription}
              </p>
            </div>
          </div>
        {/if}

        <!-- Tasks -->
        {#if tasks && tasks.length > 0}
          <div class="mb-4">
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-[0.06em] text-[#07a5c9]">Objectives</h3>
            <ul class="space-y-2">
              {#each tasks as task, index}
                <li 
                  class="flex items-center gap-3 rounded-[4px] border border-[rgba(7,165,201,0.1)] p-3 transition-all duration-150"
                  class:bg-[rgba(7,165,201,0.08)]={task.completed}
                  class:border-[rgba(34,197,94,0.2)]={task.completed}
                >
                  <div class="flex-shrink-0">
                    {#if task.completed}
                      <CheckCircle class="w-4 h-4 text-[#22c55e]" />
                    {:else}
                      <Circle class="w-4 h-4 text-[#8892a0]" />
                    {/if}
                  </div>
                  <span 
                    class="text-sm"
                    class:text-[#d0d7dd]={!task.completed}
                    class:text-[#6e7681]={task.completed}
                  >
                    <span class="text-[#8892a0] mr-1">{index + 1}.</span>
                    {task.text}
                  </span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        <!-- Action button -->
        <div class="mt-4 text-center">
          <button
            on:click={closeCard}
            class="group inline-flex cursor-pointer items-center gap-2 rounded-[4px] border border-[#07a5c9] bg-[transparent] px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.06em] text-[#07a5c9] transition-all duration-150 ease-in-out hover:border-[#07a5c9] hover:bg-[#07a5c9] hover:text-[#0a0e1a] hover:shadow-[0_0_20px_rgba(7,165,201,0.3)]"
          >
            <span>Start Mission</span>
            <Play class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-card {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .modal-card.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .modal-card.animating-out {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
    transition: all 0.2s ease-out;
  }
</style>