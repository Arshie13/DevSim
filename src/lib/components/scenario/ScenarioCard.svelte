<script lang="ts">
  import { createEventDispatcher, tick } from "svelte";
  import {
    Loader,
    Star,
    Layers,
    Zap,
    ChevronDown,
    ChevronUp,
    Eye,
    Lock,
  } from "lucide-svelte";
  import type { ScenarioMeta } from "$types";
  import PreviewImages from "./PreviewImages.svelte";

  export let scenario: ScenarioMeta;
  export let isActive: boolean;
  export let dist: number;
  export let transform: string;
  export let diffColor: string;
  export let isLoading: boolean = false;

  const dispatch = createEventDispatcher<{
    launchSprint: void;
    select: void;
  }>();

  let showMore = false;
  let needsExpand = false;
  let descP: HTMLParagraphElement;
  let isModalOpen = false;

  $: previewImages = scenario.previewImages ?? [];
  $: epics = scenario.epics ?? [];
  $: isLocked = scenario.isLocked ?? false;

  $: if (isActive && scenario) {
    showMore = false;
    tick().then(detectClamp);
  }
  $: if (!isActive) {
    showMore = false;
    needsExpand = false;
  }

  function detectClamp() {
    if (!descP) return;
    needsExpand = descP.scrollHeight > descP.clientHeight + 2;
  }

  $: isAdj = Math.abs(dist) === 1;
  $: desc = scenario.description ?? "";
</script>

{#if isActive}
  <!-- ── Active card (center) ── -->
  <div
    class="carousel-card is-active {isLocked ? 'is-locked' : ''}"
    role="article"
    aria-label="Scenario {scenario.number}: {scenario.title}"
    style="--diff-color:{diffColor}; transform:{transform};"
  >
    <div class="card-top-bar" style="background:{diffColor};"></div>
    <span class="card-watermark">{scenario.number.toString().padStart(2, "0")}</span>

    <span class="bracket bracket-tl" aria-hidden="true"></span>
    <span class="bracket bracket-tr" aria-hidden="true"></span>
    <span class="bracket bracket-bl" aria-hidden="true"></span>
    <span class="bracket bracket-br" aria-hidden="true"></span>
    <div class="scan-sweep" aria-hidden="true"></div>

    <div class="relative z-[2] flex flex-col h-full px-6 pt-5 pb-5">
      <!-- Top row: scenario number + difficulty pill -->
      <div class="flex-shrink-0 flex items-center justify-between mb-3">
        <div class="flex items-baseline gap-0.5 font-['Chakra_Petch',monospace] font-bold">
          <span class="text-[0.6rem] tracking-widest uppercase opacity-60" style="color:{diffColor}">SCN</span>
          <span class="text-[1.6rem] leading-none tracking-tight ml-1" style="color:{diffColor}">
            {scenario.number.toString().padStart(2, "0")}
          </span>
        </div>
        <div
          class="flex items-center gap-1 text-[0.62rem] font-mono font-semibold tracking-[0.06em] px-2 py-0.5 rounded-[2px] border uppercase"
          style="color:{diffColor}; border-color:{diffColor}55; background:{diffColor}14;"
        >
          <Star class="w-2.5 h-2.5 flex-shrink-0" />
          <span>{scenario.difficulty}</span>
        </div>
        {#if isLocked}
          <div
            class="flex items-center gap-1 text-[0.62rem] font-mono font-semibold tracking-[0.06em] px-2 py-0.5 rounded-[2px] border uppercase ml-2"
            style="color:#ffb400; border-color:#ffb40055; background:#ffb40014;"
          >
            <Lock class="w-2.5 h-2.5 flex-shrink-0" />
            <span>Learner Pass</span>
          </div>
        {/if}
      </div>

      <div class="card-divider flex-shrink-0" aria-hidden="true"></div>

      <!-- Title -->
      <h2 class="flex-shrink-0 font-['Chakra_Petch',monospace] text-[1.15rem] font-bold text-[#e2e8f0] tracking-wide leading-snug line-clamp-2 mb-2">
        {scenario.title}
      </h2>

      <!-- Description area -->
      <div class="desc-area">
        {#if desc}
          <div class="desc-scroll" class:expanded={showMore}>
            <div class="desc-block" style="border-left-color:{diffColor}55;">
              <p bind:this={descP} class="desc-text" class:clamped={!showMore}>
                {desc}
              </p>
            </div>
          </div>
          {#if needsExpand || showMore}
            <button
              class="show-more-btn flex-shrink-0 mt-1.5"
              style="color:{diffColor};"
              on:click|stopPropagation={() => (showMore = !showMore)}
              aria-expanded={showMore}
            >
              {#if showMore}
                <ChevronUp class="w-3 h-3" /> Show less
              {:else}
                <ChevronDown class="w-3 h-3" /> Show more
              {/if}
            </button>
          {/if}
        {/if}
      </div>

      <!-- Sprint/Epic Structure -->
      {#if epics.length > 0}
        <div class="epics-section flex-shrink-0">
          <div class="epics-header">
            <span class="epics-title">Sprint Structure</span>
            <span class="epics-count">{epics.length} Sprint{epics.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="epics-list">
            {#each epics as epic}
              <div class="epic-item" style="border-left-color:{diffColor}55;">
                <span class="epic-sprint">Sprint {epic.sprintNumber}</span>
                <span class="epic-name">{epic.name}</span>
                <span class="epic-levels">{epic.levelCount} level{epic.levelCount !== 1 ? "s" : ""}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Footer -->
      <div class="flex-shrink-0 flex items-center justify-between pt-3 mt-auto border-t border-[rgba(7,165,201,0.1)] gap-3">
        <div class="flex items-center gap-1.5 text-[0.65rem] font-mono tracking-[0.04em]" style="color:{diffColor}99;">
          <Layers class="w-3 h-3" />
          {#if scenario.hasLevels}
            <span>{scenario.levelCount} Level{scenario.levelCount !== 1 ? "s" : ""}</span>
          {:else}
            <span class="opacity-40">No levels</span>
          {/if}
        </div>

        <div class="flex items-center gap-2">
          {#if previewImages.length > 0}
            <button
              class="preview-btn"
              on:click|stopPropagation={() => (isModalOpen = true)}
              aria-label="View scenario previews"
            >
              <Eye class="w-3 h-3 flex-shrink-0" />
              <span>Preview</span>
            </button>
          {/if}
          <button
            class="launch-btn flex items-center gap-1.5 font-['Chakra_Petch',monospace] text-[0.65rem] font-bold tracking-[0.1em] uppercase text-[#07a5c9] bg-[rgba(7,165,201,0.08)] border border-[rgba(7,165,201,0.35)] px-4 py-2 rounded-[3px] relative overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={() => dispatch("launchSprint")}
            disabled={isLoading || isLocked}
            aria-busy={isLoading}
            title={isLocked ? "Unlock with a Learner Pass" : undefined}
          >
            {#if isLoading}
              <Loader class="w-3.5 h-3.5 animate-spin" />
              <span>Starting…</span>
            {:else if isLocked}
              <Lock class="w-3.5 h-3.5" />
              <span>Locked</span>
            {:else}
              <Zap class="w-3.5 h-3.5" />
              <span>Launch Scenario</span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>

  {#if isModalOpen && previewImages.length > 0}
    <PreviewImages
      images={previewImages}
      alt="Scenario preview"
      showInline={false}
      noTrigger={true}
      isOpen={true}
      on:close={() => (isModalOpen = false)}
    />
  {/if}
{:else}
  <!-- ── Non-active card (side / hidden, clickable) ── -->
  <button
    class="carousel-card {isAdj ? 'is-adj' : 'is-far'} {isLocked ? 'is-locked' : ''}"
    style="--diff-color:{diffColor}; transform:{transform};"
    on:click={() => dispatch("select")}
    aria-label="Go to scenario {scenario.number}: {scenario.title}"
  >
    <div class="card-top-bar" style="background:{diffColor}; opacity:0.5;"></div>
    <span class="card-watermark">{scenario.number.toString().padStart(2, "0")}</span>

    <div class="relative z-[2] flex flex-col h-full px-6 pt-5 pb-5 flex-1">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-baseline gap-0.5 font-['Chakra_Petch',monospace] font-bold">
          <span class="text-[0.6rem] tracking-widest uppercase opacity-60" style="color:{diffColor}">SCN</span>
          <span class="text-[1.6rem] leading-none tracking-tight ml-1" style="color:{diffColor}">
            {scenario.number.toString().padStart(2, "0")}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <div
            class="flex items-center gap-1 text-[0.62rem] font-mono font-semibold tracking-[0.06em] px-2 py-0.5 rounded-[2px] border uppercase"
            style="color:{diffColor}; border-color:{diffColor}55; background:{diffColor}14;"
          >
            <Star class="w-2.5 h-2.5 flex-shrink-0" />
            <span>{scenario.difficulty}</span>
          </div>
          {#if isLocked}
            <div
              class="flex items-center gap-1 text-[0.62rem] font-mono font-semibold tracking-[0.06em] px-2 py-0.5 rounded-[2px] border uppercase"
              style="color:#ffb400; border-color:#ffb40055; background:#ffb40014;"
            >
              <Lock class="w-2.5 h-2.5 flex-shrink-0" />
              <span>Locked</span>
            </div>
          {/if}
        </div>
      </div>
      <div class="card-divider" aria-hidden="true"></div>
      <h2 class="font-['Chakra_Petch',monospace] text-[1.15rem] font-bold text-[#e2e8f0] tracking-wide leading-snug line-clamp-2">
        {scenario.title}
      </h2>
    </div>
  </button>
{/if}

<style>
  /* ── Card base ───────────────────────────────────────────────── */
  .carousel-card {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 560px;
    height: 440px;
    display: flex;
    flex-direction: column;
    border-radius: 6px;
    border: 1px solid rgba(7, 165, 201, 0.12);
    background: linear-gradient(155deg, #0d1525 0%, #0a0e1a 60%, #0d1525 100%);
    overflow: hidden;
    transform-origin: center center;
    transition:
      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.5s ease,
      filter 0.5s ease,
      border-color 0.3s ease,
      box-shadow 0.3s ease;
    will-change: transform, opacity;
    cursor: default;
    z-index: 10;
  }

  .carousel-card.is-adj {
    opacity: 0.45;
    filter: blur(1px);
    cursor: pointer;
    z-index: 5;
  }
  .carousel-card.is-far {
    opacity: 0;
    filter: blur(3px);
    pointer-events: none;
    z-index: 1;
  }
  .carousel-card.is-locked {
    filter: grayscale(0.6);
  }
  .carousel-card.is-active.is-locked {
    opacity: 0.7;
    border-color: rgba(255, 180, 0, 0.3);
    animation: none;
    box-shadow:
      0 0 0 1px rgba(255, 180, 0, 0.12),
      0 0 24px rgba(255, 180, 0, 0.08);
  }
  .carousel-card.is-active {
    opacity: 1;
    border-color: rgba(7, 165, 201, 0.45);
    animation: pulse-glow 3.5s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow:
        0 0 0 1px rgba(7, 165, 201, 0.12),
        0 0 32px rgba(7, 165, 201, 0.12),
        0 0 80px rgba(7, 165, 201, 0.06),
        inset 0 1px 0 rgba(7, 165, 201, 0.08);
    }
    50% {
      box-shadow:
        0 0 0 1px rgba(7, 165, 201, 0.22),
        0 0 48px rgba(7, 165, 201, 0.22),
        0 0 100px rgba(7, 165, 201, 0.1),
        inset 0 1px 0 rgba(7, 165, 201, 0.14);
    }
  }

  /* ── Corner brackets (active card only) ─────────────────────── */
  .bracket {
    position: absolute;
    width: 14px;
    height: 14px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .is-active .bracket { opacity: 1; }
  .bracket-tl { top: 8px;    left:  8px;  border-top: 1.5px solid var(--diff-color); border-left: 1.5px solid var(--diff-color); }
  .bracket-tr { top: 8px;    right: 8px;  border-top: 1.5px solid var(--diff-color); border-right: 1.5px solid var(--diff-color); }
  .bracket-bl { bottom: 8px; left:  8px;  border-bottom: 1.5px solid var(--diff-color); border-left: 1.5px solid var(--diff-color); }
  .bracket-br { bottom: 8px; right: 8px;  border-bottom: 1.5px solid var(--diff-color); border-right: 1.5px solid var(--diff-color); }

  /* ── Scan sweep ──────────────────────────────────────────────── */
  .scan-sweep {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(7, 165, 201, 0.04) 50%, transparent 100%);
    background-size: 100% 40%;
    animation: scan 4s linear infinite;
    pointer-events: none;
    z-index: 1;
  }
  @keyframes scan {
    0%   { background-position: 0 -40%; }
    100% { background-position: 0 140%; }
  }

  /* ── Accent top bar ──────────────────────────────────────────── */
  .card-top-bar {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    z-index: 3;
  }

  /* ── Ghost watermark ─────────────────────────────────────────── */
  .card-watermark {
    position: absolute;
    bottom: -10px;
    right: 12px;
    font-family: "Chakra Petch", monospace;
    font-size: 5rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.025);
    line-height: 1;
    pointer-events: none;
    user-select: none;
    z-index: 1;
  }

  /* ── Card divider ────────────────────────────────────────────── */
  .card-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(7, 165, 201, 0.2), transparent);
    margin-bottom: 12px;
  }

  /* ── Description area ────────────────────────────────────────── */
  .desc-area {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding-bottom: 10px;
  }
  .desc-scroll {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  .desc-scroll.expanded {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(7, 165, 201, 0.25) transparent;
  }
  .desc-scroll.expanded::-webkit-scrollbar { width: 4px; }
  .desc-scroll.expanded::-webkit-scrollbar-thumb {
    background: rgba(7, 165, 201, 0.25);
    border-radius: 2px;
  }
  .desc-block {
    border-left: 2px solid rgba(7, 165, 201, 0.35);
    padding-left: 10px;
    padding-top: 2px;
    padding-bottom: 2px;
  }
  .desc-text {
    font-size: 0.9rem;
    line-height: 1.6;
    color: rgba(208, 215, 221, 0.82);
    margin: 0;
  }
  .desc-text.clamped {
    display: -webkit-box;
    -webkit-line-clamp: 5;
    line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── Show more/less ──────────────────────────────────────────── */
  .show-more-btn {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: transparent;
    border: none;
    padding: 0;
    font-size: 0.68rem;
    font-family: "Chakra Petch", monospace;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    opacity: 0.75;
    transition: opacity 0.2s;
  }
  .show-more-btn:hover { opacity: 1; }

  /* ── Preview button ──────────────────────────────────────────── */
  .preview-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: "Chakra Petch", monospace;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(208, 215, 221, 0.55);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 6px 12px;
    border-radius: 3px;
    cursor: pointer;
    clip-path: polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%);
    transition: background 0.2s, border-color 0.2s, color 0.2s;
  }
  .preview-btn:hover {
    color: #e2e8f0;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.22);
  }

  /* ── Launch button shimmer ───────────────────────────────────── */
  .launch-btn {
    clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
  }
  .launch-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(7, 165, 201, 0.15), transparent);
    transform: translateX(-100%);
    transition: transform 0.4s ease;
  }
  .launch-btn:hover:not(:disabled) {
    background: rgba(7, 165, 201, 0.18);
    border-color: rgba(7, 165, 201, 0.7);
    box-shadow: 0 0 20px rgba(7, 165, 201, 0.25);
    color: #fff;
  }
  .launch-btn:hover:not(:disabled)::before { transform: translateX(100%); }

  /* ── Sprint/Epic Structure ───────────────────────────────────── */
  .epics-section {
    margin-top: 0.6rem;
    padding: 0.5rem;
    background: rgba(7, 165, 201, 0.04);
    border: 1px solid rgba(7, 165, 201, 0.12);
    border-radius: 4px;
  }
  .epics-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.4rem;
    padding-bottom: 0.3rem;
    border-bottom: 1px solid rgba(7, 165, 201, 0.12);
  }
  .epics-title {
    font-family: "Share Tech Mono", monospace;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #07a5c9;
  }
  .epics-count {
    font-family: "Rajdhani", sans-serif;
    font-size: 0.68rem;
    color: rgba(208, 215, 221, 0.4);
  }
  .epics-list {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    max-height: 72px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(7, 165, 201, 0.2) transparent;
  }
  .epic-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.2rem 0.45rem;
    background: rgba(0, 0, 0, 0.18);
    border-left: 2px solid;
    border-radius: 2px;
    font-size: 0.68rem;
  }
  .epic-sprint {
    font-family: "Share Tech Mono", monospace;
    color: #07a5c9;
    font-size: 0.58rem;
    flex-shrink: 0;
  }
  .epic-name {
    font-family: "Rajdhani", sans-serif;
    color: rgba(208, 215, 221, 0.82);
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .epic-levels {
    font-family: "Rajdhani", sans-serif;
    color: rgba(208, 215, 221, 0.35);
    font-size: 0.58rem;
    flex-shrink: 0;
  }

  /* ── Responsive ──────────────────────────────────────────────── */
  @media (max-width: 700px) {
    .carousel-card {
      width: min(90vw, 440px);
      height: 420px;
    }
  }
</style>
