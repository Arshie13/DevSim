<script lang="ts">
  import { Compass } from "lucide-svelte";
  import type { StackRecommendation } from "$lib/server/recommend";

  export let recommendation: StackRecommendation | null = null;

  const ctaLabels: Record<StackRecommendation["kind"], string> = {
    starter: "Start Stack",
    progression: "View Scenarios",
    continue: "Resume",
  };
</script>

{#if recommendation}
  <div class="card-cyber shrink-0" style="border-color: rgb(var(--purple-rgb) / 0.2)">
    <div class="card-cyber-body !p-4 flex items-center justify-between gap-5 flex-wrap">
      <div class="flex items-center gap-4 min-w-0">
        <div class="w-9 h-9 shrink-0 rounded-card bg-cyber-purple/15 border border-cyber-purple/30 flex items-center justify-center">
          {#if recommendation.emoji}
            <span class="text-xl leading-none">{recommendation.emoji}</span>
          {:else}
            <Compass class="w-4 h-4 text-cyber-purple" />
          {/if}
        </div>
        <div class="min-w-0">
          <h3 class="font-heading text-base font-semibold text-obsidian-text-primary truncate">
            {recommendation.stackLabel}
          </h3>
          <p class="text-sm text-obsidian-text-muted truncate">
            {recommendation.reason}
          </p>
        </div>
      </div>
      <a
        href={recommendation.ctaHref}
        class="btn-cyber btn-cyber-solid !px-5 !py-2 shrink-0"
      >
        {ctaLabels[recommendation.kind]}
      </a>
    </div>
  </div>
{/if}
