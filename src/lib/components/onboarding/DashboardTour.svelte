<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte';
  import { DASHBOARD_TOUR_STEPS } from './dashboardTourSteps';

  /** Whether users can end the tour early. */
  export let allowSkip: boolean = true;
  /** 'tour' = full multi-step guide. 'highlight' = single-step spotlight only. */
  export let mode: 'tour' | 'highlight' = 'tour';
  /** Which step to start on (zero-based). */
  export let startStep: number = 0;

  const dispatch = createEventDispatcher<{ complete: void; skip: void }>();
  const ACCENT = '#07a5c9';

  // ── State ──
  let currentIdx = startStep;
  let visible = false;
  let transitioning = false;

  // Spotlight rect (position of the highlighted element)
  let spotlight = { top: 0, left: 0, width: 0, height: 0 };

  // Callout bubble position
  let calloutTop = 0;
  let calloutLeft = 0;
  let arrowDir: 'top' | 'bottom' | 'left' | 'right' = 'top';
  let arrowOffset = '50%';

  // Highlight target glow class injection
  let highlightedEl: HTMLElement | null = null;

  // ── Constants ──
  const CALLOUT_W   = 300;
  const CALLOUT_H   = 185;
  const SPOT_PAD    = 8;
  const GAP         = 16;
  const EDGE_MARGIN = 14;

  // ── Helpers ──
  function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(max, val));
  }

  function clearHighlight() {
    if (highlightedEl) {
      highlightedEl.classList.remove('dashboard-tour-highlight');
      highlightedEl = null;
    }
  }

  function applyHighlight(el: HTMLElement) {
    clearHighlight();
    el.classList.add('dashboard-tour-highlight');
    highlightedEl = el;
  }

  /**
   * Resolve callout placement.
   */
  function resolvePlacement(
    r: DOMRect,
    preferSide: string | undefined,
  ) {
    const spaceBelow = window.innerHeight - r.bottom - SPOT_PAD;
    const spaceAbove = r.top - SPOT_PAD;
    const spaceRight = window.innerWidth - r.right - SPOT_PAD;
    const spaceLeft  = r.left - SPOT_PAD;

    const spotL = r.left   - SPOT_PAD;
    const spotT = r.top    - SPOT_PAD;
    const spotW = r.width  + SPOT_PAD * 2;
    const spotH = r.height + SPOT_PAD * 2;
    const spotCX = spotL + spotW / 2;
    const spotCY = spotT + spotH / 2;

    spotlight = { top: spotT, left: spotL, width: spotW, height: spotH };

    function placeBelow() {
      arrowDir    = 'top';
      calloutTop  = clamp(spotT + spotH + GAP, EDGE_MARGIN, window.innerHeight - CALLOUT_H - EDGE_MARGIN);
      calloutLeft = clamp(spotCX - CALLOUT_W / 2, EDGE_MARGIN, window.innerWidth - CALLOUT_W - EDGE_MARGIN);
      arrowOffset = `${clamp(spotCX - calloutLeft, 14, CALLOUT_W - 14)}px`;
    }
    function placeAbove() {
      arrowDir    = 'bottom';
      calloutTop  = clamp(spotT - CALLOUT_H - GAP, EDGE_MARGIN, window.innerHeight - CALLOUT_H - EDGE_MARGIN);
      calloutLeft = clamp(spotCX - CALLOUT_W / 2, EDGE_MARGIN, window.innerWidth - CALLOUT_W - EDGE_MARGIN);
      arrowOffset = `${clamp(spotCX - calloutLeft, 14, CALLOUT_W - 14)}px`;
    }
    function placeRight() {
      arrowDir    = 'left';
      calloutLeft = clamp(spotL + spotW + GAP, EDGE_MARGIN, window.innerWidth - CALLOUT_W - EDGE_MARGIN);
      calloutTop  = clamp(spotCY - CALLOUT_H / 2, EDGE_MARGIN, window.innerHeight - CALLOUT_H - EDGE_MARGIN);
      arrowOffset = `${clamp(spotCY - calloutTop, 14, CALLOUT_H - 14)}px`;
    }
    function placeLeft() {
      arrowDir    = 'right';
      calloutLeft = clamp(spotL - CALLOUT_W - GAP, EDGE_MARGIN, window.innerWidth - CALLOUT_W - EDGE_MARGIN);
      calloutTop  = clamp(spotCY - CALLOUT_H / 2, EDGE_MARGIN, window.innerHeight - CALLOUT_H - EDGE_MARGIN);
      arrowOffset = `${clamp(spotCY - calloutTop, 14, CALLOUT_H - 14)}px`;
    }

    if (preferSide === 'top'    && spaceBelow >= CALLOUT_H + GAP) { placeBelow();  return; }
    if (preferSide === 'bottom' && spaceAbove >= CALLOUT_H + GAP) { placeAbove();  return; }
    if (preferSide === 'left'   && spaceRight >= CALLOUT_W + GAP) { placeRight();  return; }
    if (preferSide === 'right'  && spaceLeft  >= CALLOUT_W + GAP) { placeLeft();   return; }

    const scores: Array<[number, () => void]> = [
      [spaceBelow, placeBelow],
      [spaceAbove, placeAbove],
      [spaceRight, placeRight],
      [spaceLeft,  placeLeft],
    ];
    scores.sort((a, b) => b[0] - a[0]);
    scores[0][1]();
  }

  /** Measure the target element and compute spotlight + callout positions. */
  async function positionForStep(idx: number) {
    const step = DASHBOARD_TOUR_STEPS[idx];
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);

    if (!el) {
      if (idx < DASHBOARD_TOUR_STEPS.length - 1) {
        currentIdx = idx + 1;
        await positionForStep(currentIdx);
      } else {
        complete();
      }
      return;
    }

    const r = el.getBoundingClientRect();
    resolvePlacement(r, step.preferSide);

    if (step.highlightTarget) {
      applyHighlight(el);
    } else {
      clearHighlight();
    }
  }

  // ── Lifecycle ──
  onMount(async () => {
    await tick();
    await positionForStep(startStep);
    visible = true;
  });

  onDestroy(() => {
    clearHighlight();
    // If component is destroyed while still visible (e.g. user clicked the
    // highlighted button and page navigated away), dispatch complete so the
    // parent can mark onboarding done.
    if (visible) {
      dispatch('complete');
    }
  });

  // ── Actions ──
  async function next() {
    if (currentIdx >= DASHBOARD_TOUR_STEPS.length - 1) { complete(); return; }
    transitioning = true;
    currentIdx++;
    await positionForStep(currentIdx);
    transitioning = false;
  }

  function complete() {
    clearHighlight();
    visible = false;
    setTimeout(() => dispatch('complete'), 300);
  }

  function skip() {
    clearHighlight();
    visible = false;
    setTimeout(() => dispatch('skip'), 300);
  }

  $: step = DASHBOARD_TOUR_STEPS[currentIdx];
  $: isLastStep = currentIdx >= DASHBOARD_TOUR_STEPS.length - 1;
  $: stepNum = String(currentIdx + 1);
  $: totalNum = String(DASHBOARD_TOUR_STEPS.length);
</script>

<svelte:window on:resize={() => { if (visible) void positionForStep(currentIdx); }} />

{#if visible}
  <!-- Spotlight hole (box-shadow creates the dim overlay) -->
  <div
    class="dt-spotlight"
    style="
      top:    {spotlight.top}px;
      left:   {spotlight.left}px;
      width:  {spotlight.width}px;
      height: {spotlight.height}px;
      border-color: {ACCENT};
      box-shadow: 0 0 0 9999px rgba(0,0,12,0.82), 0 0 28px {ACCENT}33;
    "
    aria-hidden="true"
  ></div>

  <!-- Callout bubble -->
  {#key currentIdx}
    <div
      class="dt-callout"
      class:dt-fading={transitioning}
      style="top:{calloutTop}px; left:{calloutLeft}px;"
      role="dialog"
      aria-live="polite"
      aria-label={mode === 'tour' ? `Tour step ${currentIdx + 1} of ${DASHBOARD_TOUR_STEPS.length}: ${step.title}` : `Highlight: ${step.title}`}
    >
      <!-- Animated arrow pointing toward the spotlight -->
      <div
        class="dt-arrow dt-arrow-{arrowDir}"
        aria-hidden="true"
        style="color:{ACCENT}; {arrowDir === 'top' || arrowDir === 'bottom' ? `left:${arrowOffset}` : `top:${arrowOffset}`};"
      >
        {#if arrowDir === 'top'}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
            <path d="M12 20V4M5 11l7-7 7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {:else if arrowDir === 'bottom'}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
            <path d="M12 4v16M5 13l7 7 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {:else if arrowDir === 'left'}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
            <path d="M20 12H4M11 5l-7 7 7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
            <path d="M4 12h16M13 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {/if}
      </div>

      <!-- Content -->
      <div class="dt-content">
        {#if mode === 'tour'}
          <span class="dt-step-num" style="color:{ACCENT};">{stepNum} / {totalNum}</span>
        {/if}
        <h3 class="dt-title">{step.title}</h3>
        <p class="dt-desc">{step.description}</p>

        <div class="dt-actions" class:dt-actions-highlight={mode === 'highlight'}>
          {#if mode === 'tour'}
            {#if allowSkip}
              <button class="dt-btn-skip" on:click={skip}>End Tour</button>
            {/if}
            <button
              class="dt-btn-next"
              on:click={next}
              style="background:{ACCENT}; color:#0a0e1a;"
            >
              {isLastStep ? '✓ Done' : 'Next →'}
            </button>
          {:else}
            <button
              class="dt-btn-next"
              on:click={complete}
              style="background:{ACCENT}; color:#0a0e1a;"
            >
              Got it
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/key}
{/if}

<style>
  /* ── Spotlight ── */
  .dt-spotlight {
    position: fixed;
    z-index: 10010;
    pointer-events: none;
    border: 2px solid;
    border-radius: 4px;
    transition:
      top    0.42s cubic-bezier(0.4, 0, 0.2, 1),
      left   0.42s cubic-bezier(0.4, 0, 0.2, 1),
      width  0.42s cubic-bezier(0.4, 0, 0.2, 1),
      height 0.42s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Global highlight pulse (applied via JS class) */
  :global(.dashboard-tour-highlight) {
    animation: dt-pulse-glow 1.4s ease-in-out infinite;
    border-radius: 4px;
  }
  @keyframes dt-pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(7, 165, 201, 0.45); }
    50%      { box-shadow: 0 0 0 8px rgba(7, 165, 201, 0); }
  }

  /* ── Callout bubble ── */
  .dt-callout {
    position: fixed;
    z-index: 10030;
    width: 300px;
    background: #0d1425;
    border: 1px solid rgba(7, 165, 201, 0.22);
    border-radius: 4px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.65), 0 0 24px rgba(7, 165, 201, 0.05);
    overflow: visible;
    animation: calloutIn 0.26s ease;
  }
  .dt-callout.dt-fading {
    opacity: 0;
    transition: opacity 0.14s;
  }

  @keyframes calloutIn {
    from { opacity: 0; transform: translateY(6px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }

  /* ── Arrow ── */
  .dt-arrow {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 0 6px currentColor);
  }

  .dt-arrow-top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding-bottom: 4px;
    animation: bounceUp 1.1s ease-in-out infinite;
  }
  .dt-arrow-bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding-top: 4px;
    animation: bounceDown 1.1s ease-in-out infinite;
  }
  .dt-arrow-left {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    padding-right: 4px;
    animation: bounceLeft 1.1s ease-in-out infinite;
  }
  .dt-arrow-right {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    padding-left: 4px;
    animation: bounceRight 1.1s ease-in-out infinite;
  }

  @keyframes bounceUp {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50%       { transform: translateX(-50%) translateY(-9px); }
  }
  @keyframes bounceDown {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50%       { transform: translateX(-50%) translateY(9px); }
  }
  @keyframes bounceLeft {
    0%, 100% { transform: translateY(-50%) translateX(0); }
    50%       { transform: translateY(-50%) translateX(-9px); }
  }
  @keyframes bounceRight {
    0%, 100% { transform: translateY(-50%) translateX(0); }
    50%       { transform: translateY(-50%) translateX(9px); }
  }

  /* ── Content ── */
  .dt-content {
    padding: 1rem 1rem 0.875rem;
  }
  .dt-step-num {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  .dt-title {
    font-family: 'Orbitron', monospace;
    font-size: 0.88rem;
    font-weight: 700;
    color: #d0d7dd;
    margin: 0.28rem 0 0.5rem;
  }
  .dt-desc {
    font-size: 0.8rem;
    color: #8892a0;
    line-height: 1.55;
    margin: 0 0 0.8rem;
  }

  /* ── Actions ── */
  .dt-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .dt-actions-highlight {
    justify-content: center;
  }
  .dt-btn-skip {
    background: none;
    border: none;
    color: rgba(136, 146, 160, 0.55);
    font-size: 0.73rem;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
    transition: color 0.18s;
  }
  .dt-btn-skip:hover {
    color: #8892a0;
  }
  .dt-btn-next {
    flex: 1;
    border: none;
    padding: 0.42rem 0.75rem;
    font-family: 'Orbitron', monospace;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 2px;
    transition: opacity 0.18s;
  }
  .dt-btn-next:hover {
    opacity: 0.86;
  }
</style>
