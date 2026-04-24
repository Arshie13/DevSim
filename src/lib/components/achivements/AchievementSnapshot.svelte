<!--
  AchievementSnapshot.svelte — 3-slot LoL-style achievement snapshot for the profile.
  Layout: highest tier centered (larger), 2nd left, 3rd right (same size as each other).
-->
<script lang="ts">
  import { Lock, Award } from "lucide-svelte";
  import type { AchievementSnapshotView, achievement_tier_level } from "$types";

  export let snapshots: AchievementSnapshotView[] = [];
  export const slotCount = 3;

  const TIER_COLOR: Record<achievement_tier_level, string> = {
    ROOKIE: "#8b5cf6",
    AMATEUR: "#c084fc",
    PRO: "#e9d5ff",
  };

  const TIER_GLOW: Record<achievement_tier_level, string> = {
    ROOKIE: "0 0 18px rgba(139, 92, 246, 0.25)",
    AMATEUR: "0 0 26px rgba(192, 132, 252, 0.40)",
    PRO: "0 0 36px rgba(233, 213, 255, 0.55)",
  };

  const TIER_RANK: Record<achievement_tier_level, number> = {
    PRO: 3,
    AMATEUR: 2,
    ROOKIE: 1,
  };

  // Sort by tier descending so index 0 = highest
  $: sorted = [...snapshots].sort(
    (a, b) => TIER_RANK[b.highestTier] - TIER_RANK[a.highestTier],
  );

  // Rearrange into [2nd, 1st, 3rd] for podium display order
  $: podiumOrder = [sorted[1] ?? null, sorted[0] ?? null, sorted[2] ?? null];
</script>

<section
  class="relative h-full bg-obsidian-surface/60 border border-obsidian-accent/25 rounded-card overflow-hidden shadow-[0_0_30px_rgba(7,165,201,0.12)] flex flex-col"
>
  <div
    class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
  ></div>

  <!-- Header -->
  <header
    class="flex items-center gap-2.5 px-4 py-3 border-b border-obsidian-border/60 shrink-0"
  >
    <div
      class="w-6 h-6 rounded-md bg-purple-500/15 flex items-center justify-center"
    >
      <Award class="w-4 h-4 text-purple-400" />
    </div>
    <div class="flex-1 min-w-0">
      <h3 class="text-sm font-orbitron font-semibold text-obsidian-text-muted">
        Top Achievements
      </h3>
      <p
        class="text-[0.6rem] font-mono text-obsidian-text-primary/40 uppercase tracking-wider"
      >
        Your highest-valued unlocks
      </p>
    </div>
  </header>

  <!-- Badge row — podium layout: [2nd] [1st] [3rd] -->
  <div
    class="flex-1 flex items-end justify-center gap-3 px-3 py-4 pb-5 min-h-0"
  >
    {#each podiumOrder as slot, i (i)}
      {@const isCenter = i === 1}
      {#if slot}
        <div
          class="badge-slot active"
          class:center={isCenter}
          class:side={!isCenter}
          style="--badge-color: {TIER_COLOR[
            slot.highestTier
          ]}; --badge-glow: {TIER_GLOW[slot.highestTier]};"
          title={`${slot.name} — ${slot.highestTier}`}
        >
          {#if isCenter}
            <p class="badge-crown">⭐ #1</p>
          {/if}
          <div class="badge-inner">
            <span class="badge-icon">{slot.icon}</span>
            <span class="badge-tier">{slot.highestTier}</span>
          </div>
          <p class="badge-name">{slot.name}</p>
        </div>
      {:else}
        <div
          class="badge-slot locked"
          class:center={isCenter}
          class:side={!isCenter}
          title="No achievement yet"
        >
          <div class="badge-inner">
            <Lock
              class="text-obsidian-text-primary/35 {isCenter
                ? 'w-6 h-6'
                : 'w-5 h-5'}"
            />
          </div>
          <p class="badge-name text-obsidian-text-primary/35">Locked</p>
        </div>
      {/if}
    {/each}
  </div>
</section>

<style>
  .badge-slot {
    --badge-color: #8b5cf6;
    --badge-glow: 0 0 18px rgba(139, 92, 246, 0.25);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex: 1 1 0;
    min-width: 0;
  }

  /* Side badges (2nd and 3rd) */
  .badge-slot.side .badge-inner {
    width: 64px;
    height: 74px;
  }
  .badge-slot.side .badge-icon {
    font-size: 1.35rem;
  }
  .badge-slot.side .badge-tier {
    font-size: 0.48rem;
  }

  /* Center badge (1st / highest tier) */
  .badge-slot.center .badge-inner {
    width: 84px;
    height: 96px;
  }
  .badge-slot.center .badge-icon {
    font-size: 1.85rem;
  }
  .badge-slot.center .badge-tier {
    font-size: 0.55rem;
  }

  .badge-crown {
    font-family: "Space Mono", monospace;
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #fbbf24;
    text-transform: uppercase;
    margin-bottom: -4px;
  }

  .badge-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    background: linear-gradient(
      160deg,
      rgba(24, 16, 40, 0.85),
      rgba(12, 8, 24, 0.95)
    );
    border: 1.5px solid var(--badge-color);
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    box-shadow: var(--badge-glow);
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;
  }
  .badge-slot.active:hover .badge-inner {
    transform: translateY(-2px);
    box-shadow:
      var(--badge-glow),
      0 0 40px rgba(168, 85, 247, 0.45);
  }
  .badge-slot.locked .badge-inner {
    background: rgba(18, 25, 42, 0.6);
    border-color: rgba(208, 215, 221, 0.12);
    box-shadow: none;
  }
  .badge-icon {
    line-height: 1;
  }
  .badge-tier {
    font-family: "Space Mono", monospace;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--badge-color);
    text-transform: uppercase;
  }
  .badge-name {
    font-family: "Space Mono", monospace;
    font-size: 0.6rem;
    color: rgba(208, 215, 221, 0.75);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
</style>
