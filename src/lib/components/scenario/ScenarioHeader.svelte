<script lang="ts">
  import { goto } from '$app/navigation';
  import { ArrowLeft, BookOpen } from 'lucide-svelte';

  export let stackDisplayName: string;
  export let scenarioCount: number;
  export let summary: string | null = null;
</script>

<div class="mb-8">
  <div class="flex items-start gap-5 flex-wrap">
    <!-- Back button -->
    <button
      class="btn-cyber btn-cyber-outline flex items-center gap-1.5 mt-3 flex-shrink-0"
      on:click={() => goto('/stacks')}
      aria-label="Back to stack selection"
    >
      <ArrowLeft class="w-4 h-4" />
      <span>Back</span>
    </button>

    <!-- Title block -->
    <div class="flex-1 min-w-0">
      <p class="font-label text-[0.68rem] text-[var(--accent)] uppercase tracking-widest mb-1">
        // SCENARIO_SELECTION
      </p>
      <h1 class="font-heading text-[1.75rem] font-bold text-[var(--text-primary)] tracking-wide leading-tight">
        {stackDisplayName || 'Select a Scenario'}
      </h1>
    </div>

    <!-- Count badge -->
    <div class="tag-cyber tag-cyan flex items-center gap-1.5 mt-3 flex-shrink-0 whitespace-nowrap">
      <BookOpen class="w-3.5 h-3.5 flex-shrink-0" />
      <span>{scenarioCount} {scenarioCount === 1 ? 'scenario' : 'scenarios'} available</span>
    </div>
  </div>

  {#if summary}
    <p class="font-body text-[0.95rem] text-[var(--text-primary)]/55 leading-relaxed
              border-l-2 border-[var(--accent)]/30 pl-4 mt-4">
      {summary}
    </p>
  {/if}
</div>
