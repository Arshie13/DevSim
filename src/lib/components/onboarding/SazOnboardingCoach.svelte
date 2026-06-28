<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import BubbleCloud from '$lib/components/ui/BubbleCloud.svelte';
  import { parseStackName } from '$lib/utils/stacks';
  export let open: boolean = false;
  export let accentColor: string = '#07a5c9';
  export let stackName: string = 'your project';
  export let onClose: () => void = () => {};

  let step: 0 | 1 | 2 = 0;

  $: if (open) {
    step = 0;
  }

  let typedMessage = '';
  let typingIndex = 0;
  let typingInterval: ReturnType<typeof setInterval> | null = null;
  const typedContentCache = new Set<string>();

  // Step 2 highlight positioning
  const SPOT_PAD = 8;
  const GAP = 32;
  const CALLOUT_W = 340;
  const CALLOUT_H = 200;
  const HIGHLIGHT_TARGET = 'ai-toggle';

  let spotlight = { top: -9999, left: -9999, width: 0, height: 0 };
  let calloutTop = -9999;
  let calloutLeft = -9999;
  let arrowDir: 'top' | 'bottom' = 'top';
  let arrowOffset = '50%';
  let targetFound = false;

  function normalizeStackLabel(raw: string): string {
    if (!raw?.trim()) return 'Unknown Stack';
    return parseStackName(raw.trim());
  }

  function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(max, val));
  }

  function clearTyping() {
    if (!typingInterval) return;
    clearInterval(typingInterval);
    typingInterval = null;
  }

  function startTyping(text: string, cacheKey: string) {
    clearTyping();
    typedMessage = '';
    typingIndex = 0;

    typingInterval = setInterval(() => {
      if (typingIndex >= text.length) {
        typedContentCache.add(cacheKey);
        clearTyping();
        return;
      }
      typedMessage = text.slice(0, typingIndex + 1);
      typingIndex += 1;
    }, 18);
  }

  $: parsedStackName = normalizeStackLabel(stackName);
  $: coachTitle =
    step === 0 ? `Welcome to ${parsedStackName}` : step === 1 ? 'Read README Files First' : 'Your AI Helper';
  $: coachEyebrow =
    step === 0 ? 'Greetings, Developer!' : step === 1 ? 'GETTING STARTED TIP' : 'ALWAYS HERE';
  $: coachMessage =
    step === 0
      ? 'Hey dev, I am Saz. I am here if you need help while you build this workspace. Stay focused on mission flow and we will ship this level cleanly.'
      : step === 1
        ? 'Before coding, review README files and docs so you understand setup, project constraints, and folder responsibilities.'
        : 'If you get stuck or need a hint, click the AI Helper button. Saz is always available to help you understand the task, explain errors, and point you in the right direction.';
  $: tipTypedBlock = `${coachMessage}\n• Read README docs to avoid missing setup steps.\n• Familiarize yourself with project structure first.`;
  $: coachImage = step === 0 ? '/images/saz-wave.png' : '/images/saz-full.png';
  $: coachImageAlt = step === 0 ? 'Saz waving hello' : 'Saz sharing onboarding advice';

  $: {
    if (!open) {
      clearTyping();
      typedMessage = '';
      typedContentCache.clear();
    } else if (step === 2) {
      clearTyping();
      typedMessage = coachMessage;
    } else {
      const targetText = step === 1 ? tipTypedBlock : coachMessage;
      const cacheKey = `${step}:${targetText}`;

      if (typedContentCache.has(cacheKey)) {
        clearTyping();
        typedMessage = targetText;
      } else {
        startTyping(targetText, cacheKey);
      }
    }
  }

  function measureTarget() {
    if (typeof document === 'undefined' || step !== 2 || !open) return;

    const el = document.querySelector<HTMLElement>(`[data-tour="${HIGHLIGHT_TARGET}"]`);
    if (!el) {
      targetFound = false;
      return;
    }

    const r = el.getBoundingClientRect();
    const spotL = r.left - SPOT_PAD;
    const spotT = r.top - SPOT_PAD;
    const spotW = r.width + SPOT_PAD * 2;
    const spotH = r.height + SPOT_PAD * 2;
    const spotCX = spotL + spotW / 2;

    spotlight = { top: spotT, left: spotL, width: spotW, height: spotH };
    targetFound = true;

    const spaceBelow = window.innerHeight - r.bottom - SPOT_PAD;
    if (spaceBelow >= CALLOUT_H + GAP + 20) {
      arrowDir = 'top';
      calloutTop = clamp(spotT + spotH + GAP, 10, window.innerHeight - CALLOUT_H - 10);
      calloutLeft = clamp(spotCX - CALLOUT_W / 2, 10, window.innerWidth - CALLOUT_W - 10);
    } else {
      arrowDir = 'bottom';
      calloutTop = clamp(spotT - CALLOUT_H - GAP, 10, window.innerHeight - CALLOUT_H - 10);
      calloutLeft = clamp(spotCX - CALLOUT_W / 2, 10, window.innerWidth - CALLOUT_W - 10);
    }
    arrowOffset = `${clamp(spotCX - calloutLeft, 14, CALLOUT_W - 14)}px`;
  }

  $: if (open && step === 2) {
    tick().then(() => {
      requestAnimationFrame(() => measureTarget());
    });
  }

  function handleResize() {
    if (open && step === 2) measureTarget();
  }

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }
  });

  onDestroy(() => {
    clearTyping();
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
  });

  function closeCoach() {
    onClose();
  }

  function nextStep() {
    if (step === 0) {
      step = 1;
      return;
    }
    if (step === 1) {
      step = 2;
      return;
    }
    closeCoach();
  }

  function backStep() {
    if (step === 1) {
      step = 0;
    } else if (step === 2) {
      step = 1;
    }
  }

  $: ctaLabel = step === 0 || step === 1 ? 'Next Tip →' : 'Start Building →';
</script>

{#if open}
  <section class="saz-coach" class:saz-coach--tour={step === 2} aria-label="Saz onboarding coach">
    {#if step === 2}
      <!-- Spotlight overlay with a hole around the AI Helper button -->
      <div
        class="tour-spotlight"
        aria-hidden="true"
        style="
          top: {spotlight.top}px;
          left: {spotlight.left}px;
          width: {spotlight.width}px;
          height: {spotlight.height}px;
          border-color: {accentColor};
          box-shadow: 0 0 0 9999px rgba(0, 0, 12, 0.82), 0 0 28px {accentColor}33;
        "
      ></div>

      <!-- Callout bubble pointing at the highlighted button -->
      <div
        class="tour-callout"
        style="top: {calloutTop}px; left: {calloutLeft}px;"
        role="dialog"
        aria-label="Saz AI Helper tip"
      >
        <div
          class="tour-arrow tour-arrow-{arrowDir}"
          aria-hidden="true"
          style="color: {accentColor}; {arrowDir === 'top' || arrowDir === 'bottom' ? `left:${arrowOffset}` : ''}"
        >
          {#if arrowDir === 'top'}
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
              <path d="M12 20V4M5 11l7-7 7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
              <path d="M12 4v16M5 13l7 7 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          {/if}
        </div>

        <div class="tour-content">
          <p class="coach-eyebrow">{coachEyebrow}</p>
          <h2 class="coach-title">{coachTitle}</h2>
          <p class="coach-copy">{coachMessage}</p>
          <div class="coach-actions">
            <button type="button" on:click={backStep}>← Back</button>
            <button type="button" class="cta" on:click={nextStep}>{ctaLabel}</button>
          </div>
        </div>
      </div>

      <!-- Saz avatar pointing at the highlighted button -->
      <div
        class="saz-avatar-wrap saz-avatar-wrap--tour"
        style="top: {calloutTop + CALLOUT_H + 48}px; left: {calloutLeft + CALLOUT_W / 2 - 125}px;"
      >
        <img src={coachImage} alt={coachImageAlt} class="saz-avatar" />
      </div>
    {:else}
      <div class="coach-shell">
        <BubbleCloud
          className="coach-bubble"
          accentColor={accentColor}
          accentRgb="7,165,201"
          width={540}
          viewBox="0 0 520 370"
          contentX={28}
          contentY={28}
          contentWidth={464}
          contentHeight={314}
        >
          <p class="coach-eyebrow">{coachEyebrow}</p>
          <h2 class="coach-title">{coachTitle}</h2>
          <p class="coach-copy" class:coach-copy-tip={step === 1}>
            {typedMessage}
            {#if typingInterval}
              <span class="typing-cursor">|</span>
            {/if}
          </p>

          <div class="coach-actions">
            <button type="button" on:click={backStep} disabled={step === 0}>← Back</button>
            <button type="button" class="cta" on:click={nextStep}>{ctaLabel}</button>
          </div>
        </BubbleCloud>

        <div class="saz-avatar-wrap">
          <img src={coachImage} alt={coachImageAlt} class="saz-avatar" />
        </div>
      </div>
    {/if}
  </section>
{/if}

<style>
  .saz-coach {
    position: fixed;
    inset: 0;
    z-index: 10045;
    pointer-events: auto;
    display: grid;
    place-items: center;
    background: rgba(3, 8, 18, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .saz-coach--tour {
    display: block;
    pointer-events: none;
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .coach-shell {
    position: relative;
    pointer-events: auto;
    width: 540px;
    max-width: 96vw;
    min-height: 430px;
    transform: translateY(-8px);
  }

  .coach-shell :global(.bubble-content) {
    justify-content: center;
  }

  :global(.coach-bubble) {
    position: relative;
    z-index: 1;
    transform: translate(-120px, -100px);
  }

  .coach-eyebrow {
    margin: 0 0 0.35rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 1.05rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #07a5c9;
    text-align: center;
  }

  .coach-title {
    margin: 0 0 0.5rem;
    color: #e4f8ff;
    font-size: 1.1rem;
    font-family: 'Orbitron', monospace;
    font-weight: 700;
    text-align: center;
  }

  .coach-copy {
    margin: 0.7rem 0 0 0;
    color: #d0d7dd;
    font-size: 0.9rem;
    line-height: 1.6;
    text-align: center;
  }

  .coach-copy.coach-copy-tip {
    white-space: pre-line;
  }

  .typing-cursor {
    animation: cursor-blink 0.8s step-end infinite;
    color: #8ae6ff;
    font-weight: 700;
    margin-left: 1px;
  }

  @keyframes cursor-blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }

  .coach-actions {
    margin-top: auto;
    padding-top: 0.7rem;
    border-top: 1px solid rgba(7, 165, 201, 0.24);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    align-items: center;
  }

  .coach-actions button {
    border: 1px solid rgba(136, 146, 160, 0.34);
    border-radius: 2px;
    padding: 0.45rem 0.65rem;
    background: rgba(255, 255, 255, 0.02);
    color: #9fb0bf;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: all 0.16s ease;
    white-space: nowrap;
  }

  .coach-actions button:hover:not(:disabled) {
    border-color: rgba(7, 165, 201, 0.45);
    color: #d2f4ff;
    background: rgba(7, 165, 201, 0.1);
  }

  .coach-actions button:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .coach-actions .cta {
    border-color: rgba(7, 165, 201, 0.6);
    color: #8ae6ff;
    background: rgba(7, 165, 201, 0.12);
  }

  .saz-avatar-wrap {
    position: absolute;
    right: -50px;
    top: 250px;
    z-index: 2;
    background: transparent;
    border: 0;
    box-shadow: none;
    display: block;
  }

  .saz-avatar-wrap--tour {
    position: fixed;
    right: auto;
    top: auto;
    z-index: 10048;
  }

  .saz-avatar {
    width: 250px;
    height: auto;
    object-fit: contain;
    display: block;
  }

  /* ── Tour step spotlight ─────────────────────────────────────────────── */
  .tour-spotlight {
    position: fixed;
    z-index: 10046;
    pointer-events: none;
    border: 2px solid;
    border-radius: 4px;
    transition:
      top 0.42s cubic-bezier(0.4, 0, 0.2, 1),
      left 0.42s cubic-bezier(0.4, 0, 0.2, 1),
      width 0.42s cubic-bezier(0.4, 0, 0.2, 1),
      height 0.42s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ── Tour callout ────────────────────────────────────────────────────── */
  .tour-callout {
    position: fixed;
    z-index: 10047;
    width: 340px;
    pointer-events: auto;
    background: #0d1425;
    border: 1px solid rgba(7, 165, 201, 0.22);
    border-radius: 4px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.65), 0 0 24px rgba(7, 165, 201, 0.05);
    overflow: visible;
    animation: calloutIn 0.26s ease;
  }

  @keyframes calloutIn {
    from { opacity: 0; transform: translateY(6px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .tour-content {
    padding: 1rem 1rem 0.875rem;
  }

  /* ── Arrow pointing toward the highlighted button ────────────────────── */
  .tour-arrow {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 0 6px currentColor);
  }

  .tour-arrow-top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding-bottom: 4px;
    animation: bounceUp 1.1s ease-in-out infinite;
  }

  .tour-arrow-bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding-top: 4px;
    animation: bounceDown 1.1s ease-in-out infinite;
  }

  @keyframes bounceUp {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(-5px); }
  }

  @keyframes bounceDown {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(5px); }
  }
</style>
