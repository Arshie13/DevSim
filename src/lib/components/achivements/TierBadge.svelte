<!--
  TierBadge.svelte — Single tier pill for an achievement.
  Shows tier label, description, reward, and progress bar.
-->
<script lang="ts">
  import type { achievement_tier_view } from "$types";

  export let tier: achievement_tier_view;

  const glowByTier: Record<achievement_tier_view["tier"], string> = {
    ROOKIE:  "0 0 18px rgb(var(--purple-rgb) / 0.18)",
    AMATEUR: "0 0 24px rgb(var(--purple-rgb) / 0.28)",
    PRO:     "0 0 32px rgb(var(--purple-rgb) / 0.42)",
  };

  $: progressPct = Math.round(tier.progress * 100);
</script>

<div
  class="tier-badge font-label text-[0.65rem] uppercase tracking-wider"
  class:locked={!tier.unlocked}
  style="box-shadow: {tier.unlocked ? glowByTier[tier.tier] : 'none'};"
>
  <div class="tier-header">
    <span class="tier-label">{tier.tier}</span>
    {#if tier.unlocked}
      <span class="tier-status">✓</span>
    {:else}
      <span class="tier-status">{progressPct}%</span>
    {/if}
  </div>

  <div class="tier-desc text-obsidian-text-primary/80 normal-case tracking-normal">
    {tier.description}
  </div>

  <div class="xp-track">
    <div class="xp-fill" style="width: {progressPct}%"></div>
  </div>

  <div class="tier-footer">
    <span class="tier-count normal-case tracking-normal">
      {tier.currentValue} / {tier.targetValue}
    </span>
    <span class="tier-reward">
      <span class="text-[var(--purple)]">+{tier.xpReward} XP</span>
      <span class="text-[var(--warn)]">+{tier.coinReward}🪙</span>
    </span>
  </div>
</div>

<style>
  .tier-badge {
    position: relative;
    padding: 0.5rem 0.75rem;
    background: rgb(var(--purple-rgb) / 0.08);
    border: 1px solid rgb(var(--purple-rgb) / 0.35);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }
  .tier-badge.locked {
    opacity: 0.55;
    background: rgb(var(--text-primary-rgb) / 0.04);
    border-color: rgb(var(--text-primary-rgb) / 0.15);
  }
  .tier-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .tier-label {
    color: var(--purple);
    font-weight: 700;
  }
  .tier-badge.locked .tier-label {
    color: rgb(var(--text-primary-rgb) / 0.5);
  }
  .tier-status {
    color: var(--purple);
    font-weight: 600;
  }
  .tier-badge.locked .tier-status {
    color: rgb(var(--text-primary-rgb) / 0.5);
  }
  .tier-desc {
    font-size: 0.7rem;
    line-height: 1.2;
  }
  .xp-track {
    margin-top: 0.15rem;
  }
  .tier-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.6rem;
  }
  .tier-count {
    color: rgb(var(--text-primary-rgb) / 0.7);
  }
  .tier-badge.locked .tier-count {
    color: rgb(var(--text-primary-rgb) / 0.4);
  }
  .tier-reward {
    display: flex;
    gap: 0.5rem;
  }
  .tier-badge.locked .tier-reward {
    color: rgb(var(--text-primary-rgb) / 0.4);
  }
</style>
