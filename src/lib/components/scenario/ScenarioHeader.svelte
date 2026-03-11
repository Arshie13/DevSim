<script lang="ts">
  import { goto } from "$app/navigation";
  import { ArrowLeft, BookOpen, Terminal } from "lucide-svelte";

  export let stackDisplayName: string;
  export let scenarioCount: number;
  export let summary: string | null = null;
</script>

<div class="mb-4">
  <!-- Back button -->
  <div class="mb-4">
    <button
      class="btn-cyber btn-cyber-outline flex items-center gap-1.5 flex-shrink-0"
      on:click={() => goto("/stacks")}
      aria-label="Back to stack selection"
    >
      <ArrowLeft class="w-4 h-4" />
      <span>Back</span>
    </button>
  </div>

  <!-- Title row -->
  <div class="flex items-end gap-4 flex-wrap">
    <div class="flex-1 min-w-0">

      <!-- Stack title with left accent bar -->
      <div class="flex items-stretch gap-3">
        <div class="w-[3px] rounded-full bg-gradient-to-b from-[var(--accent)] to-transparent flex-shrink-0"></div>
        <h1 class="font-heading text-[1.6rem] font-bold leading-tight tracking-wide
                   bg-gradient-to-r from-[#e2e8f0] via-[var(--accent)] to-[#00f5ff]
                   bg-clip-text text-transparent">
          {stackDisplayName}
        </h1>
      </div>
      <p class="mt-1.5 font-mono text-[0.8rem] tracking-[0.12em] uppercase text-[var(--text-muted)] opacity-80">
        <span class="text-[var(--accent)] opacity-80 mr-1">›</span>select a scenario to begin your sprint
      </p>
    </div>

    <!-- Badge -->
    <div class="flex items-center gap-2 mb-1 flex-shrink-0">
      <div class="tag-cyber tag-cyan flex items-center gap-1.5 whitespace-nowrap">
        <BookOpen class="w-3.5 h-3.5 flex-shrink-0" />
        <span>{scenarioCount} {scenarioCount === 1 ? 'scenario' : 'scenarios'} available</span>
      </div>
    </div>
  </div>

  {#if summary}
    <p class="font-body text-[0.95rem] text-[var(--text-primary)]/55 leading-relaxed
              border-l-2 border-[var(--accent)]/30 pl-4 mt-3">
      {summary}
    </p>
  {/if}
</div>
