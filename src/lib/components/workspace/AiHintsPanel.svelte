<script lang="ts">
  import { Bot, Lightbulb, X, ChevronRight } from 'lucide-svelte';

  /** List of hint strings from the level config. */
  export let hints: string[] = [];
  /** Fired when the user closes the panel. */
  export let onClose: () => void;

  let expandedHint: number | null = null;

  function toggleHint(i: number) {
    expandedHint = expandedHint === i ? null : i;
  }
</script>

<aside
  class="w-72 bg-[#0a0e1a] border-l border-[rgba(7,165,201,0.15)] flex flex-col overflow-hidden flex-shrink-0"
  style="box-shadow:-4px 0 24px rgba(7,165,201,0.05);"
>
  <!-- Panel header -->
  <div
    class="px-4 py-3 border-b border-[rgba(7,165,201,0.15)] bg-[#12192a] flex items-center justify-between flex-shrink-0"
  >
    <div class="flex items-center gap-2">
      <Bot class="w-6 h-6 text-[#07a5c9]" style="filter:drop-shadow(0 0 6px rgba(7,165,201,0.6));" />
      <span
        class="text-[0.65rem] uppercase tracking-widest text-[#07a5c9]"
        style="font-family:'Share Tech Mono',monospace;"
        >AI Hints</span
      >
    </div>
    <button
      on:click={onClose}
      class="w-6 h-6 flex items-center justify-center text-[#8892a0] hover:text-[#ff3860] transition-colors"
      title="Close AI Hints"
    >
      <X class="w-3.5 h-3.5" />
    </button>
  </div>

  <!-- Hint count -->
  <div class="px-4 py-2 border-b border-[rgba(7,165,201,0.07)] flex-shrink-0">
    <span
      class="text-[0.6rem] uppercase tracking-widest text-[#8892a0]"
      style="font-family:'Share Tech Mono',monospace;"
    >
      {hints.length} hint{hints.length !== 1 ? 's' : ''} available
    </span>
  </div>

  <!-- Hints list -->
  <div class="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
    {#each hints as hint, i}
      <div
        class="border transition-all cursor-pointer group"
        class:border-[rgba(7,165,201,0.4)]={expandedHint === i}
        class:bg-[rgba(7,165,201,0.06)]={expandedHint === i}
        class:border-[rgba(7,165,201,0.12)]={expandedHint !== i}
        class:bg-[#12192a]={expandedHint !== i}
        style="border-radius:4px;"
        on:click={() => toggleHint(i)}
        on:keydown={(e) => e.key === 'Enter' && toggleHint(i)}
        role="button"
        tabindex="0"
      >
        <div class="flex items-start gap-2 p-3">
          <Lightbulb
            class="w-3.5 h-3.5 flex-shrink-0 mt-0.5 transition-colors {expandedHint === i
              ? 'text-[#07a5c9]'
              : 'text-[#8892a0] group-hover:text-[#07a5c9]'}"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1">
              <span
                class="text-[0.6rem] uppercase tracking-wider text-[#8892a0]"
                style="font-family:'Share Tech Mono',monospace;"
                >Hint #{i + 1}</span
              >
              <ChevronRight
                class="w-3 h-3 text-[#8892a0] transition-transform flex-shrink-0 {expandedHint === i
                  ? 'rotate-90'
                  : ''}"
              />
            </div>
            {#if expandedHint === i}
              <p
                class="text-xs text-[#d0d7dd]/80 leading-relaxed mt-1.5"
                style="font-family:'Rajdhani',sans-serif;"
              >
                {hint}
              </p>
            {:else}
              <p class="text-[0.65rem] text-[#8892a0] mt-0.5 line-clamp-1 font-mono">
                {hint.length > 55 ? hint.substring(0, 55) + '…' : hint}
              </p>
            {/if}
          </div>
        </div>
        {#if expandedHint === i}
          <div class="mx-3 border-t border-[rgba(7,165,201,0.1)]"></div>
          <div class="px-3 py-1.5">
            <span
              class="text-[0.55rem] text-[rgba(7,165,201,0.45)] uppercase tracking-widest"
              style="font-family:'Share Tech Mono',monospace;"
              >// AI_HINT_SYSTEM</span
            >
          </div>
        {/if}
      </div>
    {/each}

    {#if hints.length === 0}
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <Bot class="w-10 h-10 text-[#27272a] mb-3" />
        <p class="text-xs text-[#8892a0]" style="font-family:'Rajdhani',sans-serif;">
          No hints available
        </p>
      </div>
    {/if}
  </div>

  <!-- Footer note -->
  <div class="px-4 py-3 border-t border-[rgba(7,165,201,0.1)] bg-[#12192a] flex-shrink-0">
    <p
      class="text-[0.6rem] text-[#8892a0]/60 leading-relaxed"
      style="font-family:'Share Tech Mono',monospace;"
    >
      // Use hints wisely — they cost you points.
    </p>
  </div>
</aside>
