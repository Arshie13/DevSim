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
  class="achievement-card"
  class:dim={!anyUnlocked}
>
  <header class="flex items-center gap-3 mb-3">
    <div class="icon-slot">
      <span aria-hidden="true">{achievement.icon}</span>
    </div>
    <div class="min-w-0">
      <h3 class="font-orbitron font-semibold text-obsidian-text-primary text-sm truncate">
        {achievement.name}
      </h3>
      <p class="font-mono text-[0.65rem] uppercase tracking-wider text-obsidian-text-primary/50">
        {achievement.category}
      </p>
    </div>
  </header>

  <p class="text-xs text-obsidian-text-primary/70 mb-3">
    {achievement.description}
  </p>

  <div class="tier-grid">
    {#each achievement.tiers as tier (tier.id)}
      <TierBadge {tier} />
    {/each}
  </div>
</article>

<style>
  .achievement-card {
    position: relative;
    background: rgba(18, 25, 42, 0.6);
    border: 1px solid rgba(168, 85, 247, 0.2);
    padding: 1rem;
    clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px);
    transition: border-color 0.2s, transform 0.2s;
  }
  .achievement-card:hover {
    border-color: rgba(168, 85, 247, 0.5);
    transform: translateY(-1px);
  }
  .achievement-card.dim {
    border-color: rgba(168, 85, 247, 0.12);
  }
  .icon-slot {
    width: 2.25rem;
    height: 2.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(168, 85, 247, 0.12);
    border: 1px solid rgba(168, 85, 247, 0.3);
    font-size: 1.1rem;
    flex-shrink: 0;
  }
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
