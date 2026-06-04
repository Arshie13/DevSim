<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { TOUR_STEPS } from './onboardingContent';

  /** Accent color inherited from the stack content. */
  export let accentColor: string = '#07a5c9';
  /** Whether users can end the tour early. */
  export let allowSkip: boolean = true;
  /**
   * Called by the tour when a step requires a specific workspace tab to be
   * visible (e.g. 'editor'). Parent should switch the active tab.
   */
  export let onSwitchTab: ((tab: string) => void) | undefined = undefined;

  const dispatch = createEventDispatcher<{ complete: void }>();

  // ── State ──────────────────────────────────────────────────────────────────
  let currentIdx = 0;
  let visible = false;
  let transitioning = false;

  // Spotlight rect (position of the highlighted element)
  let spotlight = { top: 0, left: 0, width: 0, height: 0 };

  // Callout bubble position
  let calloutTop = 0;
  let calloutLeft = 0;
  let arrowDir: 'top' | 'bottom' | 'left' | 'right' = 'top';
  // Dynamic arrow offset so the arrow always points at the spotlight center
  let arrowOffset = '50%';

  // ── Constants ──────────────────────────────────────────────────────────────
  const CALLOUT_W   = 300;
  const CALLOUT_H   = 185; // generous height so clamp arithmetic is safe
  const SPOT_PAD    = 8;   // padding around spotlight rect
  const GAP         = 16;  // gap between spotlight edge and callout edge
  const EDGE_MARGIN = 14;  // min distance from viewport edge

  // ── Helpers ────────────────────────────────────────────────────────────────
  function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(max, val));
  }

  /**
   * Resolve callout placement.
   * preferSide overrides the auto-pick logic when the preferred side has
   * enough space; otherwise falls back to the side with the most room.
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

    // Placement helpers
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
      // callout to RIGHT of target, arrowDir='left' (arrow points left)
      arrowDir    = 'left';
      calloutLeft = clamp(spotL + spotW + GAP, EDGE_MARGIN, window.innerWidth - CALLOUT_W - EDGE_MARGIN);
      calloutTop  = clamp(spotCY - CALLOUT_H / 2, EDGE_MARGIN, window.innerHeight - CALLOUT_H - EDGE_MARGIN);
      arrowOffset = `${clamp(spotCY - calloutTop, 14, CALLOUT_H - 14)}px`;
    }
    function placeLeft() {
      // callout to LEFT of target, arrowDir='right' (arrow points right)
      arrowDir    = 'right';
      calloutLeft = clamp(spotL - CALLOUT_W - GAP, EDGE_MARGIN, window.innerWidth - CALLOUT_W - EDGE_MARGIN);
      calloutTop  = clamp(spotCY - CALLOUT_H / 2, EDGE_MARGIN, window.innerHeight - CALLOUT_H - EDGE_MARGIN);
      arrowOffset = `${clamp(spotCY - calloutTop, 14, CALLOUT_H - 14)}px`;
    }

    // Preferred side (if enough room, honour it)
    if (preferSide === 'top'    && spaceBelow >= CALLOUT_H + GAP) { placeBelow();  return; }
    if (preferSide === 'bottom' && spaceAbove >= CALLOUT_H + GAP) { placeAbove();  return; }
    if (preferSide === 'left'   && spaceRight >= CALLOUT_W + GAP) { placeRight();  return; }
    if (preferSide === 'right'  && spaceLeft  >= CALLOUT_W + GAP) { placeLeft();   return; }

    // Auto: pick the side with the most room
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
    const step = TOUR_STEPS[idx];

    if (!step.openBoardTaskModal) {
      window.dispatchEvent(new CustomEvent('devsim-tour-close-task-modal'));
    }

    // If this step needs a tab switch, request it and wait a frame for DOM
    if (step.switchTab && onSwitchTab) {
      onSwitchTab(step.switchTab);
      await tick();
      // Extra wait for layout to settle (Monaco may resize)
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    }

    if (step.boardSubTab) {
      window.dispatchEvent(
        new CustomEvent('devsim-tour-board-subtab', { detail: { subTab: step.boardSubTab } }),
      );
      await tick();
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    }

    if (step.openBoardTaskModal) {
      window.dispatchEvent(new CustomEvent('devsim-tour-open-task-modal'));
      await tick();
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    }

    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);

    if (!el) {
      // Target not in DOM — skip to next step
      if (idx < TOUR_STEPS.length - 1) {
        currentIdx = idx + 1;
        await positionForStep(currentIdx);
      } else {
        complete();
      }
      return;
    }

    const r = el.getBoundingClientRect();
    resolvePlacement(r, step.preferSide);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  onMount(async () => {
    await tick();
    await positionForStep(0);
    visible = true;
  });

  // ── Actions ────────────────────────────────────────────────────────────────
  async function next() {
    if (currentIdx >= TOUR_STEPS.length - 1) { complete(); return; }
    transitioning = true;
    currentIdx++;
    await positionForStep(currentIdx);
    transitioning = false;
  }

  function complete() {
    window.dispatchEvent(new CustomEvent('devsim-tour-close-task-modal'));
    visible = false;
    setTimeout(() => dispatch('complete'), 300);
  }

  $: step = TOUR_STEPS[currentIdx];
  $: stepNum = String(currentIdx + 1);
  $: totalNum = String(TOUR_STEPS.length);
</script>

{#if visible}
  <!-- ── Spotlight hole (box-shadow creates the dim overlay) ─────────────── -->
  <!--    pointer-events:none → workspace stays fully interactive beneath     -->
  <div
    class="wt-spotlight"
    style="
      top:    {spotlight.top}px;
      left:   {spotlight.left}px;
      width:  {spotlight.width}px;
      height: {spotlight.height}px;
      border-color: {accentColor};
      box-shadow: 0 0 0 9999px rgba(0,0,12,0.82), 0 0 28px {accentColor}33;
    "
    aria-hidden="true"
  ></div>

  <!-- ── Callout bubble ──────────────────────────────────────────────────── -->
  {#key currentIdx}
    <div
      class="wt-callout"
      class:wt-fading={transitioning}
      style="top:{calloutTop}px; left:{calloutLeft}px;"
      role="dialog"
      aria-live="polite"
      aria-label="Tour step {currentIdx + 1} of {TOUR_STEPS.length}: {step.title}"
    >
      <!-- Animated arrow pointing toward the spotlight ───────────────────── -->
      <div
        class="wt-arrow wt-arrow-{arrowDir}"
        aria-hidden="true"
        style="color:{accentColor}; {arrowDir === 'top' || arrowDir === 'bottom' ? `left:${arrowOffset}` : `top:${arrowOffset}`};"
      >
        {#if arrowDir === 'top'}
          <!-- Arrow points UP (spotlight is above) -->
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
            <path d="M12 20V4M5 11l7-7 7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {:else if arrowDir === 'bottom'}
          <!-- Arrow points DOWN (spotlight is below) -->
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
            <path d="M12 4v16M5 13l7 7 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {:else if arrowDir === 'left'}
          <!-- Arrow points LEFT (spotlight is to the left) -->
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
            <path d="M20 12H4M11 5l-7 7 7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {:else}
          <!-- Arrow points RIGHT (spotlight is to the right) -->
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
            <path d="M4 12h16M13 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {/if}
      </div>

      <!-- Content ─────────────────────────────────────────────────────────── -->
      <div class="wt-content">
        <span class="wt-step-num" style="color:{accentColor};">{stepNum} / {totalNum}</span>
        <h3 class="wt-title">{step.title}</h3>
        <p class="wt-desc">{step.description}</p>
        <div class="wt-actions">
          {#if allowSkip}
            <button class="wt-btn-skip" on:click={complete}>End Tour</button>
          {/if}
          <button
            class="wt-btn-next"
            on:click={next}
            style="background:{accentColor}; color:#0a0e1a;"
          >
            {currentIdx === TOUR_STEPS.length - 1 ? '✓ Done' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  {/key}
{/if}

<style>
  /* ── Spotlight ─────────────────────────────────────────────────────────── */
  .wt-spotlight {
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

  /* ── Callout bubble ────────────────────────────────────────────────────── */
  .wt-callout {
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
  .wt-callout.wt-fading {
    opacity: 0;
    transition: opacity 0.14s;
  }

  @keyframes calloutIn {
    from { opacity: 0; transform: translateY(6px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }

  /* ── Arrow (positioned at the callout edge nearest the spotlight) ──────── */
  .wt-arrow {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 0 6px currentColor);
  }

  /* Arrow direction placement + bounce animations */
  .wt-arrow-top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding-bottom: 4px;
    animation: bounceUp 1.1s ease-in-out infinite;
  }
  .wt-arrow-bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding-top: 4px;
    animation: bounceDown 1.1s ease-in-out infinite;
  }
  .wt-arrow-left {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    padding-right: 4px;
    animation: bounceLeft 1.1s ease-in-out infinite;
  }
  .wt-arrow-right {
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

  /* ── Content ───────────────────────────────────────────────────────────── */
  .wt-content {
    padding: 1rem 1rem 0.875rem;
  }
  .wt-step-num {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  .wt-title {
    font-family: 'Orbitron', monospace;
    font-size: 0.88rem;
    font-weight: 700;
    color: #d0d7dd;
    margin: 0.28rem 0 0.5rem;
  }
  .wt-desc {
    font-size: 0.8rem;
    color: #8892a0;
    line-height: 1.55;
    margin: 0 0 0.8rem;
  }

  /* ── Actions ──────────────────────────────────────────────────────────── */
  .wt-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .wt-btn-skip {
    background: none;
    border: none;
    color: rgba(136, 146, 160, 0.55);
    font-size: 0.73rem;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
    transition: color 0.18s;
  }
  .wt-btn-skip:hover {
    color: #8892a0;
  }
  .wt-btn-next {
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
  .wt-btn-next:hover {
    opacity: 0.86;
  }
</style>
