<!--
  TierBadge.svelte — Single tier pill for an achievement.
  Shows tier label, description, reward, and progress bar.
-->
<script lang="ts">
  import type { achievement_tier_view } from "$types";

  export let tier: achievement_tier_view;

  const glowByTier: Record<achievement_tier_view["tier"], string> = {
    ROOKIE:  "0 0 18px rgba(168, 85, 247, 0.18)",
    AMATEUR: "0 0 24px rgba(168, 85, 247, 0.28)",
    PRO:     "0 0 32px rgba(168, 85, 247, 0.42)",
  };

  $: progressPct = Math.round(tier.progress * 100);
</script>

<div
  class="tier-badge font-mono text-[0.65rem] uppercase tracking-wider"
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

  <div class="progress-bar">
    <div class="progress-fill" style="width: {progressPct}%;"></div>
  </div>

  <div class="tier-footer">
    <span class="tier-count normal-case tracking-normal">
      {tier.currentValue} / {tier.targetValue}
    </span>
    <span class="tier-reward">
      <span class="text-purple-400">+{tier.xpReward} XP</span>
      <span class="text-obsidian-warn">+{tier.coinReward}🪙</span>
    </span>
  </div>
</div>

<style>
  .tier-badge {
    position: relative;
    padding: 0.5rem 0.75rem;
    background: rgba(168, 85, 247, 0.08);
    border: 1px solid rgba(168, 85, 247, 0.35);
    clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }
  .tier-badge.locked {
    opacity: 0.55;
    background: rgba(208, 215, 221, 0.04);
    border-color: rgba(208, 215, 221, 0.15);
  }
  .tier-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .tier-label {
    color: #A855F7;
    font-weight: 700;
  }
  .tier-badge.locked .tier-label {
    color: rgba(208, 215, 221, 0.5);
  }
  .tier-status {
    color: #A855F7;
    font-weight: 600;
  }
  .tier-badge.locked .tier-status {
    color: rgba(208, 215, 221, 0.5);
  }
  .tier-desc {
    font-size: 0.7rem;
    line-height: 1.2;
  }
  .progress-bar {
    height: 3px;
    background: rgba(168, 85, 247, 0.12);
    overflow: hidden;
    margin-top: 0.15rem;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #A855F7, #C084FC);
    transition: width 0.4s ease;
  }
  .tier-badge.locked .progress-fill {
    background: rgba(168, 85, 247, 0.45);
  }
  .tier-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.6rem;
  }
  .tier-count {
    color: rgba(208, 215, 221, 0.7);
  }
  .tier-badge.locked .tier-count {
    color: rgba(208, 215, 221, 0.4);
  }
  .tier-reward {
    display: flex;
    gap: 0.5rem;
  }
  .tier-badge.locked .tier-reward {
    color: rgba(208, 215, 221, 0.4);
  }
</style>
