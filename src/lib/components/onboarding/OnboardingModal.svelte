<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { getStackContent } from './onboardingContent';

  /** The tech stack label from the workspace (e.g. "Next.js + Prisma"). */
  export let stack: string = '';
  /** The level title (e.g. "Setup & First API Route"). */
  export let title: string = '';
  /** The scenario description from the level config. */
  export let scenario: string = '';
  /** The current level number. */
  export let level: number = 1;

  const dispatch = createEventDispatcher<{ complete: void; skip: void }>();

  $: content = getStackContent(stack);

  const TOTAL_STEPS = 4;
  let currentStep = 0;
  let slideDir: 'forward' | 'back' = 'forward';

  // Entrance animation
  let visible = false;
  onMount(() => {
    requestAnimationFrame(() => setTimeout(() => (visible = true), 40));
  });

  function goNext() {
    if (currentStep >= TOTAL_STEPS - 1) {
      complete();
      return;
    }
    slideDir = 'forward';
    currentStep++;
  }

  function goBack() {
    if (currentStep <= 0) return;
    slideDir = 'back';
    currentStep--;
  }

  function skip() {
    visible = false;
    setTimeout(() => dispatch('skip'), 320);
  }

  function complete() {
    visible = false;
    setTimeout(() => dispatch('complete'), 320);
  }

  $: scenarioShort =
    scenario.length > 220 ? scenario.slice(0, 220).trimEnd() + '…' : scenario;
</script>

<!-- Backdrop -->
<div
  class="om-backdrop"
  class:om-visible={visible}
  on:click|self={skip}
  role="presentation"
>
  <!-- Modal box -->
  <div
    class="om-box"
    class:om-visible={visible}
    role="dialog"
    aria-modal="true"
    aria-label="Workspace onboarding"
  >
    <!-- Accent top bar -->
    <div class="om-accent-bar" style="background:{content.accentColor};"></div>

    <!-- Close -->
    <button class="om-close" on:click={skip} aria-label="Dismiss onboarding">✕</button>

    <!-- Step dots -->
    <div class="om-dots" aria-hidden="true">
      {#each Array(TOTAL_STEPS) as _, i}
        <span
          class="om-dot"
          class:om-dot-active={i === currentStep}
          style={i === currentStep ? `background:${content.accentColor};` : ''}
        ></span>
      {/each}
    </div>

    <!-- Step counter -->
    <p class="om-step-label">Step {currentStep + 1} of {TOTAL_STEPS}</p>

    <!-- Animated step body  ────────────────────────────────────────────── -->
    {#key currentStep}
      <div class="om-step-body om-slide-{slideDir}">

        <!-- ── Step 1: Welcome ─────────────────────────────────────── -->
        {#if currentStep === 0}
          <div class="om-stack-icon" aria-hidden="true" style="color:{content.accentColor};">
            {content.icon}
          </div>
          <p class="om-eyebrow">Welcome to</p>
          <h1 class="om-stack-name" style="color:{content.accentColor};">{content.stackName}</h1>
          <p class="om-tagline">{content.tagline}</p>
          <p class="om-body">{content.realWorldUse}</p>

        <!-- ── Step 2: Mission ─────────────────────────────────────── -->
        {:else if currentStep === 1}
          <div class="om-step-icon" aria-hidden="true">🎯</div>
          <p class="om-eyebrow">Your Mission</p>
          <div class="om-mission-card" style="border-color:{content.accentColor}33;">
            <span class="om-mission-level" style="color:{content.accentColor};">
              Level {String(level).padStart(2, '0')}
            </span>
            <p class="om-mission-title">{title}</p>
          </div>
          <p class="om-scenario">{scenarioShort}</p>
          <p class="om-subdesc">{content.missionIntro}</p>

        <!-- ── Step 3: Tools ───────────────────────────────────────── -->
        {:else if currentStep === 2}
          <div class="om-step-icon" aria-hidden="true">🛠️</div>
          <p class="om-eyebrow">Your Tools</p>
          <p class="om-subdesc" style="margin-bottom:1rem;">Everything you need is already set up.</p>
          <div class="om-tools">
            <div class="om-tool">
              <span class="om-tool-icon" aria-hidden="true">⚡</span>
              <strong>Code Editor</strong>
              <p>Monaco-powered editor with syntax highlighting, IntelliSense, and multi-file tabs.</p>
            </div>
            <div class="om-tool">
              <span class="om-tool-icon" aria-hidden="true">💻</span>
              <strong>Terminal</strong>
              <p>A real shell connected to your Docker container — run any npm command you need.</p>
            </div>
            <div class="om-tool">
              <span class="om-tool-icon" aria-hidden="true">🌐</span>
              <strong>Live Preview</strong>
              <p>See your running app live in the browser without ever leaving the workspace.</p>
            </div>
          </div>

        <!-- ── Step 4: Ready ───────────────────────────────────────── -->
        {:else if currentStep === 3}
          <div class="om-step-icon om-float" aria-hidden="true">🚀</div>
          <p class="om-eyebrow" style="color:{content.accentColor};">You're Ready!</p>
          <h2 class="om-ready-title">Let's build something real.</h2>
          <p class="om-body">
            Your goal: <strong style="color:{content.accentColor};">{content.successLabel}</strong>
          </p>
          <p class="om-subdesc">
            A short tour of the workspace will start next. You can skip it anytime.
          </p>
        {/if}

      </div>
    {/key}

    <!-- Navigation ─────────────────────────────────────────────────────── -->
    <div class="om-nav">
      <button class="om-btn-back" on:click={goBack} disabled={currentStep === 0}>
        ← Back
      </button>
      <button
        class="om-btn-next"
        on:click={goNext}
        style="
          border-color:{content.accentColor};
          color:{currentStep === TOTAL_STEPS - 1 ? '#0a0e1a' : content.accentColor};
          background:{currentStep === TOTAL_STEPS - 1 ? content.accentColor : 'transparent'};
        "
      >
        {currentStep === TOTAL_STEPS - 1 ? '🚀 Start Workspace' : 'Next →'}
      </button>
    </div>

    <button class="om-btn-skip" on:click={skip}>Skip onboarding</button>
  </div>
</div>

<style>
  /* ── Backdrop ──────────────────────────────────────────────────────────── */
  .om-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10050;
    background: rgba(0, 0, 10, 0.88);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.32s ease;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }
  .om-backdrop.om-visible {
    opacity: 1;
  }

  /* ── Modal box ─────────────────────────────────────────────────────────── */
  .om-box {
    position: relative;
    width: min(94vw, 520px);
    background: #0d1425;
    border: 1px solid rgba(7, 165, 201, 0.2);
    border-radius: 4px;
    padding: 2.5rem 2rem 1.75rem;
    box-shadow:
      0 0 60px rgba(7, 165, 201, 0.07),
      0 24px 64px rgba(0, 0, 0, 0.65);
    overflow: hidden;
    transform: scale(0.88) translateY(18px);
    opacity: 0;
    transition:
      transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.34s ease;
  }
  .om-box.om-visible {
    transform: scale(1) translateY(0);
    opacity: 1;
  }

  /* ── Accent top bar ────────────────────────────────────────────────────── */
  .om-accent-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
  }

  /* ── Close button ──────────────────────────────────────────────────────── */
  .om-close {
    position: absolute;
    top: 0.9rem;
    right: 0.9rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.95rem;
    color: #8892a0;
    padding: 4px 7px;
    border-radius: 2px;
    transition: color 0.18s, background 0.18s;
    line-height: 1;
  }
  .om-close:hover {
    color: #d0d7dd;
    background: rgba(255, 255, 255, 0.06);
  }

  /* ── Step indicator dots ───────────────────────────────────────────────── */
  .om-dots {
    display: flex;
    gap: 6px;
    justify-content: center;
    margin-bottom: 0.4rem;
  }
  .om-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(136, 146, 160, 0.28);
    transition: background 0.28s, width 0.28s;
  }
  .om-dot.om-dot-active {
    width: 22px;
    border-radius: 3px;
  }

  /* ── Step label ────────────────────────────────────────────────────────── */
  .om-step-label {
    text-align: center;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #8892a0;
    margin: 0 0 1.5rem;
  }

  /* ── Step body  ────────────────────────────────────────────────────────── */
  .om-step-body {
    min-height: 248px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 0.5rem;
  }
  .om-slide-forward {
    animation: slideInRight 0.26s ease;
  }
  .om-slide-back {
    animation: slideInLeft 0.26s ease;
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(28px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-28px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* ── Step content elements ─────────────────────────────────────────────── */
  .om-stack-icon {
    font-size: 2.8rem;
    margin-bottom: 0.6rem;
    filter: drop-shadow(0 0 16px currentColor);
    line-height: 1;
  }
  .om-step-icon {
    font-size: 2.8rem;
    margin-bottom: 0.6rem;
    line-height: 1;
  }
  .om-float {
    animation: float 2.8s ease-in-out infinite;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
  }

  .om-eyebrow {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #8892a0;
    margin: 0 0 0.3rem;
  }
  .om-stack-name {
    font-family: 'Orbitron', monospace;
    font-size: 1.55rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    margin: 0 0 0.7rem;
    line-height: 1.2;
  }
  .om-tagline {
    font-size: 0.9rem;
    color: #d0d7dd;
    font-style: italic;
    margin: 0 0 0.75rem;
  }
  .om-body {
    font-size: 0.855rem;
    color: #8892a0;
    line-height: 1.65;
    margin: 0 0 0.5rem;
  }
  .om-subdesc {
    font-size: 0.8rem;
    color: rgba(136, 146, 160, 0.65);
    font-style: italic;
    margin: 0.4rem 0 0;
  }

  .om-mission-card {
    width: 100%;
    background: rgba(7, 165, 201, 0.05);
    border: 1px solid;
    border-radius: 4px;
    padding: 0.7rem 1rem;
    margin: 0.5rem 0 0.9rem;
    text-align: left;
  }
  .om-mission-level {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    display: block;
  }
  .om-mission-title {
    font-family: 'Orbitron', monospace;
    font-size: 0.95rem;
    font-weight: 700;
    color: #d0d7dd;
    margin: 0.25rem 0 0;
  }
  .om-scenario {
    font-size: 0.8rem;
    color: #8892a0;
    line-height: 1.6;
    background: rgba(255, 255, 255, 0.02);
    border-left: 2px solid rgba(7, 165, 201, 0.3);
    padding: 0.45rem 0.7rem;
    border-radius: 0 2px 2px 0;
    text-align: left;
    width: 100%;
    margin: 0 0 0.4rem;
  }

  .om-tools {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.55rem;
    width: 100%;
  }
  .om-tool {
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(7, 165, 201, 0.1);
    border-radius: 4px;
    padding: 0.7rem 0.45rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.28rem;
    text-align: center;
  }
  .om-tool-icon {
    font-size: 1.35rem;
    line-height: 1;
  }
  .om-tool strong {
    font-size: 0.73rem;
    color: #d0d7dd;
    font-weight: 600;
  }
  .om-tool p {
    font-size: 0.69rem;
    color: #8892a0;
    margin: 0;
    line-height: 1.4;
  }

  .om-ready-title {
    font-family: 'Orbitron', monospace;
    font-size: 1.1rem;
    font-weight: 700;
    color: #d0d7dd;
    margin: 0.3rem 0 1rem;
  }

  /* ── Navigation ─────────────────────────────────────────────────────────── */
  .om-nav {
    display: flex;
    gap: 0.6rem;
    align-items: center;
    margin-top: 2rem;
  }
  .om-btn-back {
    background: none;
    border: 1px solid rgba(136, 146, 160, 0.25);
    color: #8892a0;
    padding: 0.5rem 0.9rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.78rem;
    letter-spacing: 0.05em;
    cursor: pointer;
    border-radius: 2px;
    transition: color 0.18s, border-color 0.18s;
    white-space: nowrap;
  }
  .om-btn-back:hover:not(:disabled) {
    color: #d0d7dd;
    border-color: rgba(208, 215, 221, 0.38);
  }
  .om-btn-back:disabled {
    opacity: 0.28;
    cursor: not-allowed;
  }
  .om-btn-next {
    flex: 1;
    border: 1px solid;
    padding: 0.55rem 1rem;
    font-family: 'Orbitron', monospace;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 2px;
    transition: opacity 0.18s, box-shadow 0.18s;
  }
  .om-btn-next:hover {
    opacity: 0.88;
    box-shadow: 0 0 16px currentColor;
  }

  .om-btn-skip {
    display: block;
    margin: 0.7rem auto 0;
    background: none;
    border: none;
    color: rgba(136, 146, 160, 0.48);
    font-size: 0.73rem;
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.18s;
  }
  .om-btn-skip:hover {
    color: #8892a0;
  }
</style>
