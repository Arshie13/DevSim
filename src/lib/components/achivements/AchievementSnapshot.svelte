<!--
  AchievementSnapshot.svelte — Futuristic podium achievement display.
  PRO = gold  |  AMATEUR = fuchsia  |  ROOKIE = purple
-->
<script lang="ts">
  import { Lock, Award } from "lucide-svelte";
  import type { AchievementSnapshotView, achievement_tier_level } from "$types";

  export let snapshots: AchievementSnapshotView[] = [];
  export const slotCount = 3;

  const TIER_COLOR: Record<achievement_tier_level, string> = {
    ROOKIE:  "#a855f7",
    AMATEUR: "#c084fc",
    PRO:     "#fbbf24",
  };

  const TIER_RGB: Record<achievement_tier_level, string> = {
    ROOKIE:  "168,85,247",
    AMATEUR: "192,132,252",
    PRO:     "251,191,36",
  };

  const TIER_RANK: Record<achievement_tier_level, number> = {
    PRO: 3, AMATEUR: 2, ROOKIE: 1,
  };

  $: sorted = [...snapshots].sort(
    (a, b) => TIER_RANK[b.highestTier] - TIER_RANK[a.highestTier],
  );

  // Podium visual order: [2nd-place, 1st-place, 3rd-place]
  $: podiumOrder = [sorted[1] ?? null, sorted[0] ?? null, sorted[2] ?? null];

  const RANK_LABELS = ["#2", "#1", "#3"];
</script>

<section class="snap-root bg-obsidian-bg-light border border-obsidian-accent/25">
  <!-- Top accent bar (purple gradient, matches achievement theme) -->
  <div class="absolute top-0 left-0 right-0 h-[2px] z-10"
    style="background: linear-gradient(90deg, transparent, #a855f7 30%, #c084fc 50%, #a855f7 70%, transparent);">
  </div>

  <!-- ── Header ─────────────────────────────────────────────── -->
  <header class="relative z-10 flex items-center gap-2 px-3.5 py-2.5 shrink-0">
    <div class="flex items-center justify-center w-6 h-6 rounded-[3px] shrink-0"
      style="background: rgba(168,85,247,0.12); border: 1px solid rgba(168,85,247,0.3);">
      <Award class="w-3.5 h-3.5 text-purple-400" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="font-orbitron text-[0.8rem] font-bold text-obsidian-text-muted tracking-wide leading-none">
        Top Achievements
      </p>
    </div>
    <!-- Status dots -->
    <div class="flex items-center gap-1 shrink-0">
      <span class="status-dot active"></span>
      <span class="status-dot"></span>
      <span class="status-dot"></span>
    </div>
  </header>

  <!-- Divider -->
  <div class="shrink-0 h-px relative z-10"
    style="background: linear-gradient(90deg, transparent, rgba(168,85,247,0.3), transparent);">
  </div>

  <!-- ── Podium ──────────────────────────────────────────────── -->
  <div class="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-4 pt-2 min-h-0">
    <div class="flex items-end justify-center gap-6 w-full">
    {#each podiumOrder as slot, i (i)}
      {@const isCenter = i === 1}
      {@const rankLabel = RANK_LABELS[i]}

      {#if slot}
        {@const color = TIER_COLOR[slot.highestTier]}
        {@const rgb   = TIER_RGB[slot.highestTier]}

        <div class="slot" class:slot-center={isCenter} class:slot-side={!isCenter}>

          <!-- Rank pill -->
          <p class="rank-pill font-mono"
            style="color:{color}; border-color:rgba({rgb},0.45); background:rgba({rgb},0.12);">
            {#if isCenter}<span class="mr-0.5">⭐</span>{/if}{rankLabel}
          </p>

          <!-- Hex badge — filter: drop-shadow on wrapper so glow escapes clip-path -->
          <div
            class="hex-wrapper"
            class:hex-center={isCenter}
            style="filter: drop-shadow(0 0 {isCenter ? '12px' : '7px'} rgba({rgb},0.6));"
          >
            <!-- Pulsing outer ring -->
            <div class="hex-ring" class:hex-ring-center={isCenter}
              style="background: rgba({rgb},0.22);">
            </div>

            <!-- Badge body — uses obsidian surface (#2d3446) as base to stay on-palette -->
            <div class="hex-body" class:hex-body-center={isCenter}
              style="background: linear-gradient(150deg, rgba({rgb},0.28) 0%, rgba(45,52,70,0.96) 55%);"
            >
              <!-- Top-edge highlight strip -->
              <div class="absolute top-0 left-1/4 right-1/4 h-px z-10"
                style="background: rgba({rgb},0.75);">
              </div>
              <!-- Corner shimmer -->
              <div class="absolute inset-0 pointer-events-none"
                style="background: linear-gradient(135deg, rgba({rgb},0.14) 0%, transparent 45%);
                       clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);">
              </div>

              <span class="badge-emoji relative z-10" class:badge-emoji-center={isCenter}
                style="filter: drop-shadow(0 0 5px rgba({rgb},0.85));">
                {slot.icon}
              </span>
              <span class="tier-text font-mono relative z-10" style="color:{color};">
                {slot.highestTier}
              </span>
            </div>
          </div>

          <!-- Platform pedestal -->
          <div class="platform" class:platform-center={isCenter}
            style="background: linear-gradient(180deg, rgba({rgb},0.18), rgba({rgb},0.04));
                   border-color: rgba({rgb},0.4);">
            <div class="platform-glow" style="background: rgba({rgb},0.45);"></div>
          </div>

          <!-- Name label -->
          <p class="badge-label font-mono" title={slot.name}>{slot.name}</p>
        </div>

      {:else}
        <!-- Locked slot -->
        <div class="slot" class:slot-center={isCenter} class:slot-side={!isCenter}>
          <p class="rank-pill font-mono locked-pill">{rankLabel}</p>
          <div class="hex-wrapper" class:hex-center={isCenter} style="opacity: 0.28;">
            <div class="hex-body hex-body-locked" class:hex-body-center={isCenter}>
              <Lock class="{isCenter ? 'w-5 h-5' : 'w-4 h-4'} text-obsidian-text-primary/30" />
            </div>
          </div>
          <div class="platform locked-platform" class:platform-center={isCenter}></div>
          <p class="badge-label font-mono locked-label">Locked</p>
        </div>
      {/if}
    {/each}
    </div>
  </div>
</section>

<style>
  /* ── Card root ─────────────────────────────────────────────── */
  .snap-root {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 0 30px rgba(7, 165, 201, 0.12);
  }

  /* ── Status dots ───────────────────────────────────────────── */
  .status-dot {
    display: block;
    width: 5px; height: 5px;
    border-radius: 50%;
    background: rgba(168,85,247,0.15);
    border: 1px solid rgba(168,85,247,0.22);
  }
  .status-dot.active {
    background: #a855f7;
    border-color: #a855f7;
    box-shadow: 0 0 6px rgba(168,85,247,0.9);
    animation: dot-pulse 2s ease-in-out infinite;
  }
  @keyframes dot-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.35; }
  }

  /* ── Slots ─────────────────────────────────────────────────── */
  .slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    min-width: 0;
  }
  .slot-center { flex: 0 0 88px; }
  .slot-side   { flex: 0 0 68px; }

  @media (min-width: 1280px) {
    .slot-center { flex: 0 0 104px; }
    .slot-side   { flex: 0 0 80px; }
  }

  /* ── Rank pill ─────────────────────────────────────────────── */
  .rank-pill {
    font-size: 0.52rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.1rem 0.42rem;
    border: 1px solid;
    border-radius: 2px;
    white-space: nowrap;
  }
  .locked-pill {
    color: rgba(208,215,221,0.2);
    border-color: rgba(208,215,221,0.1);
    background: transparent;
  }

  /* ── Hex wrapper — drop-shadow lives here, outside clip-path ─ */
  .hex-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s ease, filter 0.25s ease;
  }
  .hex-wrapper:not([style*="opacity: 0"]):hover {
    transform: translateY(-5px);
  }
  .hex-wrapper      { width: 62px;  height: 72px; }
  .hex-wrapper.hex-center { width: 82px;  height: 94px; }

  @media (min-width: 1280px) {
    .hex-wrapper           { width: 74px;  height: 86px; }
    .hex-wrapper.hex-center { width: 98px; height: 112px; }
    .badge-emoji        { font-size: 1.4rem; }
    .badge-emoji-center { font-size: 1.9rem; }
  }

  /* Outer pulsing ring — slightly larger than body */
  .hex-ring {
    position: absolute;
    width: 112%; height: 112%;
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    animation: ring-pulse 3s ease-in-out infinite;
  }
  .hex-ring-center { animation-duration: 2.4s; }
  @keyframes ring-pulse {
    0%, 100% { opacity: 0.45; transform: scale(1); }
    50%       { opacity: 0.1;  transform: scale(1.06); }
  }

  /* Badge body — clip-path hex, #12192a base (NOT black) */
  .hex-body {
    position: relative;
    width: 100%; height: 100%;
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.18rem;
    overflow: hidden;
  }
  .hex-body-locked {
    background: rgba(45, 52, 70, 0.75);
  }

  /* ── Badge content ─────────────────────────────────────────── */
  .badge-emoji        { font-size: 1.2rem; line-height: 1; }
  .badge-emoji-center { font-size: 1.6rem; }

  .tier-text {
    font-size: 0.4rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  /* ── Platform pedestal ─────────────────────────────────────── */
  .platform {
    width: 100%;
    height: 8px;
    border: 1px solid;
    border-radius: 2px;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  .platform-center { height: 14px; }
  .platform-glow {
    position: absolute;
    bottom: 0; left: 15%; right: 15%;
    height: 3px;
    border-radius: 50%;
    filter: blur(3px);
  }
  .locked-platform {
    background: rgba(208,215,221,0.03);
    border-color: rgba(208,215,221,0.1);
  }

  /* ── Name label ────────────────────────────────────────────── */
  .badge-label {
    font-size: 0.5rem;
    letter-spacing: 0.03em;
    color: rgba(208,215,221,0.75);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    padding: 0 2px;
  }
  .locked-label { color: rgba(208,215,221,0.2); }
</style>
