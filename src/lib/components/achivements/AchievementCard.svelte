<!--
  AchievementCard.svelte — One achievement family with its tiers.
-->
<script lang="ts">
  import type { AchievementView } from "$types";
  import TierBadge from "./TierBadge.svelte";

  export let achievement: AchievementView;

  $: anyUnlocked = achievement.tiers.some((t) => t.unlocked);
</script>

<article
  class="card-cyber"
  style="border-color: rgb(var(--purple-rgb) / {anyUnlocked ? 0.2 : 0.1})"
>
  <div class="card-cyber-body">
    <header class="flex items-center gap-3 mb-3">
      <div
        class="w-9 h-9 rounded-card flex items-center justify-center text-lg shrink-0"
        style="background: rgb(var(--purple-rgb) / 0.12); border: 1px solid rgb(var(--purple-rgb) / 0.3);"
      >
        <span aria-hidden="true">{achievement.icon}</span>
      </div>
      <div class="min-w-0">
        <h3 class="font-heading font-semibold text-lg text-obsidian-text-primary truncate">
          {achievement.name}
        </h3>
        <p class="font-label text-xs uppercase tracking-wider text-obsidian-text-muted">
          {achievement.category}
        </p>
      </div>
    </header>

    <p class="text-sm text-obsidian-text-muted mb-3">
      {achievement.description}
    </p>

    <div class="tier-grid">
      {#each achievement.tiers as tier (tier.id)}
        <TierBadge {tier} />
      {/each}
    </div>
  </div>
</article>

<style>
  .tier-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  @media (min-width: 640px) {
    .tier-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
