<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import { Loader, Star, Layers, Zap, ChevronDown, ChevronUp } from 'lucide-svelte';
  import type { ScenarioMeta } from '$types';

  /** The scenario data to display */
  export let scenario: ScenarioMeta;
  /** Whether this card is the focused center card */
  export let isActive: boolean;
  /** Signed ring distance from active (0=center, ±1=sides, else hidden) */
  export let dist: number;
  /** Pre-computed CSS transform string from the carousel */
  export let transform: string;
  /** Hex color derived from the scenario difficulty */
  export let diffColor: string;
  /** Whether a sprint launch is in progress (disables launch button) */
  export let isLoading: boolean = false;

  const dispatch = createEventDispatcher<{
    launchSprint: void;
    select: void;
    requestDisableTutorialConfirm: void;
  }>();

  /** Whether to launch this scenario in tutorial mode first. */
  export let withTutorial: boolean = false;
  export let tutorialRequired: boolean = false;

  function handleTutorialToggle(e: Event) {
    const input = e.target as HTMLInputElement;

    if (tutorialRequired) {
      withTutorial = true;
      input.checked = true;
      dispatch('requestDisableTutorialConfirm');
      return;
    }

    if (input.checked) {
      withTutorial = true;
    } else {
      withTutorial = false;
      dispatch('requestDisableTutorialConfirm');
    }
  }

  let showMore = false;
  let needsExpand = false;
  let descP: HTMLParagraphElement;

  // When the active card or scenario changes, reset and detect clamp
  $: if (isActive && scenario) {
    showMore = false;
    tick().then(detectClamp);
  }
  $: if (!isActive) { showMore = false; needsExpand = false; }

  function detectClamp() {
    if (!descP) return;
    // scrollHeight > clientHeight means the text is clamped
    needsExpand = descP.scrollHeight > descP.clientHeight + 2;
  }

  $: isAdj = Math.abs(dist) === 1;
  $: desc = scenario.description ?? '';
</script>

{#if isActive}
  <!-- ── Active card (center) ── -->
  <div
    class="carousel-card is-active"
    role="article"
    aria-label="Scenario {scenario.number}: {scenario.title}"
    style="--diff-color:{diffColor}; transform:{transform};"
  >
    <!-- Accent top bar -->
    <div class="card-top-bar" style="background:{diffColor};"></div>

    <!-- Ghost watermark number -->
    <span class="card-watermark">{scenario.number.toString().padStart(2, '0')}</span>

    <span class="bracket bracket-tl" aria-hidden="true"></span>
    <span class="bracket bracket-tr" aria-hidden="true"></span>
    <span class="bracket bracket-bl" aria-hidden="true"></span>
    <span class="bracket bracket-br" aria-hidden="true"></span>
    <div class="scan-sweep" aria-hidden="true"></div>

    <div class="relative z-[2] flex flex-col h-full px-6 pt-5 pb-5">
      <!-- Top row: number badge + difficulty pill (fixed, never shrinks) -->
      <div class="flex-shrink-0 flex items-center justify-between mb-3">
        <div class="flex items-baseline gap-0.5 font-['Chakra_Petch',monospace] font-bold">
          <span class="text-[0.6rem] tracking-widest uppercase opacity-60" style="color:{diffColor}">SCN</span>
          <span class="text-[1.6rem] leading-none tracking-tight ml-1" style="color:{diffColor}">
            {scenario.number.toString().padStart(2, '0')}
          </span>
        </div>
        <div
          class="flex items-center gap-1 text-[0.62rem] font-mono font-semibold tracking-[0.06em] px-2 py-0.5 rounded-[2px] border uppercase"
          style="color:{diffColor}; border-color:{diffColor}55; background:{diffColor}14;"
        >
          <Star class="w-2.5 h-2.5 flex-shrink-0" />
          <span>{scenario.difficulty}</span>
        </div>
      </div>

      <div class="card-divider flex-shrink-0" aria-hidden="true"></div>

      <!-- Title (fixed, never shrinks) -->
      <h2 class="flex-shrink-0 font-['Chakra_Petch',monospace] text-[1.15rem] font-bold text-[#e2e8f0] tracking-wide leading-snug line-clamp-2 mb-2">
        {scenario.title}
      </h2>

      <!-- Description area: flex-1 so it fills remaining space; scrolls when expanded -->
      <div class="desc-area">
        {#if desc}
          <div class="desc-scroll" class:expanded={showMore}>
            <div class="desc-block" style="border-left-color:{diffColor}55;">
              <p
                bind:this={descP}
                class="desc-text"
                class:clamped={!showMore}
              >
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


      <!-- Footer (fixed, never shrinks) -->
      <div class="flex-shrink-0 flex items-center justify-between pt-3 border-t border-[rgba(7,165,201,0.1)] gap-3">
        <div class="flex items-center gap-1.5 text-[0.65rem] font-mono tracking-[0.04em]" style="color:{diffColor}99;">
          <Layers class="w-3 h-3" />
          {#if scenario.hasLevels}
            <span>{scenario.levelCount} Level{scenario.levelCount !== 1 ? 's' : ''}</span>
          {:else}
            <span class="opacity-40">No levels</span>
          {/if}
        </div>

        <div class="flex items-center gap-3">
          <!-- Tutorial toggle -->
          <label
            class="onboarding-label"
            title={tutorialRequired
              ? 'Tutorial is required for first-time stack users'
              : 'Launch this scenario in tutorial mode first'}
          >
            <input
              type="checkbox"
              class="onboarding-check"
              checked={withTutorial}
              disabled={tutorialRequired}
              on:change={handleTutorialToggle}
              on:click|stopPropagation
            />
            <span style="color:{diffColor}99;">{tutorialRequired ? 'Tutorial Required' : 'Tutorial'}</span>
          </label>

          <button
            class="launch-btn flex items-center gap-1.5 font-['Chakra_Petch',monospace] text-[0.65rem] font-bold tracking-[0.1em] uppercase text-[#07a5c9] bg-[rgba(7,165,201,0.08)] border border-[rgba(7,165,201,0.35)] px-4 py-2 rounded-[3px] relative overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={() => dispatch('launchSprint')}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {#if isLoading}
              <Loader class="w-3.5 h-3.5 animate-spin" />
              <span>Starting…</span>
            {:else}
              <Zap class="w-3.5 h-3.5" />
              <span>Launch Scenario</span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>

{:else}
  <!-- ── Non-active card (side / hidden, clickable) ── -->
  <button
    class="carousel-card {isAdj ? 'is-adj' : 'is-far'}"
    style="--diff-color:{diffColor}; transform:{transform};"
    on:click={() => dispatch('select')}
    aria-label="Go to scenario {scenario.number}: {scenario.title}"
  >
    <div class="card-top-bar" style="background:{diffColor}; opacity:0.5;"></div>
    <span class="card-watermark">{scenario.number.toString().padStart(2, '0')}</span>

    <div class="relative z-[2] flex flex-col h-full px-6 pt-5 pb-5 flex-1">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-baseline gap-0.5 font-['Chakra_Petch',monospace] font-bold">
          <span class="text-[0.6rem] tracking-widest uppercase opacity-60" style="color:{diffColor}">SCN</span>
          <span class="text-[1.6rem] leading-none tracking-tight ml-1" style="color:{diffColor}">
            {scenario.number.toString().padStart(2, '0')}
          </span>
        </div>
        <div
          class="flex items-center gap-1 text-[0.62rem] font-mono font-semibold tracking-[0.06em] px-2 py-0.5 rounded-[2px] border uppercase"
          style="color:{diffColor}; border-color:{diffColor}55; background:{diffColor}14;"
        >
          <Star class="w-2.5 h-2.5 flex-shrink-0" />
          <span>{scenario.difficulty}</span>
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
    height: 360px;
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

  .carousel-card.is-adj { opacity: 0.45; filter: blur(1px); cursor: pointer; z-index: 5; }
  .carousel-card.is-far { opacity: 0; filter: blur(3px); pointer-events: none; z-index: 1; }

  .carousel-card.is-active {
    opacity: 1;
    border-color: rgba(7, 165, 201, 0.45);
    animation: pulse-glow 3.5s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 1px rgba(7,165,201,0.12), 0 0 32px rgba(7,165,201,0.12), 0 0 80px rgba(7,165,201,0.06), inset 0 1px 0 rgba(7,165,201,0.08); }
    50%       { box-shadow: 0 0 0 1px rgba(7,165,201,0.22), 0 0 48px rgba(7,165,201,0.22), 0 0 100px rgba(7,165,201,0.10), inset 0 1px 0 rgba(7,165,201,0.14); }
  }

  /* ── Corner brackets (active card only) ─────────────────────── */
  .bracket { position: absolute; width: 14px; height: 14px; opacity: 0; transition: opacity 0.3s ease; }
  .is-active .bracket { opacity: 1; }
  .bracket-tl { top: 8px;    left:  8px;  border-top:    1.5px solid var(--diff-color); border-left:   1.5px solid var(--diff-color); }
  .bracket-tr { top: 8px;    right: 8px;  border-top:    1.5px solid var(--diff-color); border-right:  1.5px solid var(--diff-color); }
  .bracket-bl { bottom: 8px; left:  8px;  border-bottom: 1.5px solid var(--diff-color); border-left:   1.5px solid var(--diff-color); }
  .bracket-br { bottom: 8px; right: 8px;  border-bottom: 1.5px solid var(--diff-color); border-right:  1.5px solid var(--diff-color); }

  /* ── Scan sweep (active card only) ──────────────────────────── */
  .scan-sweep {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(7,165,201,0.04) 50%, transparent 100%);
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
    font-family: 'Chakra Petch', monospace;
    font-size: 5rem;
    font-weight: 700;
    color: rgba(255,255,255,0.025);
    line-height: 1;
    pointer-events: none;
    user-select: none;
    z-index: 1;
  }

  /* ── Card divider ────────────────────────────────────────────── */
  .card-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(7,165,201,0.2), transparent);
    margin-bottom: 12px;
  }

  /* ── Description area (flex fill between title and footer) ─── */
  .desc-area {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding-bottom: 10px;
  }

  /* Scrollable wrapper — clipped by default, scrollable when expanded */
  .desc-scroll {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  .desc-scroll.expanded {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(7,165,201,0.25) transparent;
  }
  .desc-scroll.expanded::-webkit-scrollbar { width: 4px; }
  .desc-scroll.expanded::-webkit-scrollbar-thumb { background: rgba(7,165,201,0.25); border-radius: 2px; }

  /* ── Description block ───────────────────────────────────────── */
  .desc-block {
    border-left: 2px solid rgba(7,165,201,0.35);
    padding-left: 10px;
    padding-top: 2px;
    padding-bottom: 2px;
  }

  /* Description text */
  .desc-text {
    font-size: 0.85rem;
    line-height: 1.6;
    color: rgba(208, 215, 221, 0.82);
    margin: 0;
  }
  /* CSS line-clamp for collapsed state — only truncates if text genuinely overflows */
  .desc-text.clamped {
    display: -webkit-box;
    -webkit-line-clamp: 7;
    line-clamp: 7;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── Show more/less button ───────────────────────────────────── */
  .show-more-btn {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: transparent;
    border: none;
    padding: 0;
    font-size: 0.68rem;
    font-family: 'Chakra Petch', monospace;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    opacity: 0.75;
    transition: opacity 0.2s;
  }
  .show-more-btn:hover { opacity: 1; }

  /* ── Onboarding checkbox label ──────────────────────────────── */
  .onboarding-label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    user-select: none;
    font-size: 0.62rem;
    font-family: 'Chakra Petch', monospace;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .onboarding-check {
    appearance: none;
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border: 1.5px solid rgba(7, 165, 201, 0.45);
    border-radius: 2px;
    background: transparent;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: border-color 0.2s, background 0.2s;
  }
  .onboarding-check:checked {
    background: rgba(7, 165, 201, 0.2);
    border-color: rgba(7, 165, 201, 0.8);
  }
  .onboarding-check:checked::after {
    content: '';
    position: absolute;
    top: 1px;
    left: 3px;
    width: 4px;
    height: 7px;
    border: 1.5px solid #07a5c9;
    border-top: none;
    border-left: none;
    transform: rotate(45deg);
  }

  /* ── Launch button shimmer ───────────────────────────────────── */
  .launch-btn { clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%); }
  .launch-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(7,165,201,0.15), transparent);
    transform: translateX(-100%);
    transition: transform 0.4s ease;
  }
  .launch-btn:hover:not(:disabled) { background: rgba(7,165,201,0.18); border-color: rgba(7,165,201,0.7); box-shadow: 0 0 20px rgba(7,165,201,0.25); color: #fff; }
  .launch-btn:hover:not(:disabled)::before { transform: translateX(100%); }

  /* ── Responsive ──────────────────────────────────────────────── */
  @media (max-width: 700px) {
    .carousel-card { width: min(86vw, 380px); height: 300px; }
  }
</style>
