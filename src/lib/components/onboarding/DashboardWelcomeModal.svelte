<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  /** Whether users can dismiss this intro modal. */
  export let allowSkip: boolean = true;

  const dispatch = createEventDispatcher<{ complete: void; skip: void; highlightStack: void }>();

  const ACCENT = '#07a5c9';
  const TOTAL_STEPS = 2;
  let currentStep = 0;
  let slideDir: 'forward' | 'back' = 'forward';

  // Entrance animation
  let visible = false;
  onMount(() => {
    requestAnimationFrame(() => setTimeout(() => (visible = true), 40));
  });

  function goNext() {
    if (currentStep >= TOTAL_STEPS - 1) return;
    slideDir = 'forward';
    currentStep++;
  }

  function skip() {
    if (!allowSkip) return;
    visible = false;
    setTimeout(() => dispatch('skip'), 320);
  }

  function complete() {
    visible = false;
    setTimeout(() => dispatch('complete'), 320);
  }

  function highlightStack() {
    visible = false;
    setTimeout(() => dispatch('highlightStack'), 320);
  }
</script>

<!-- Backdrop -->
<div
  class="dom-backdrop"
  class:dom-visible={visible}
  role="presentation"
>
  <!-- Modal box -->
  <div
    class="dom-box"
    class:dom-visible={visible}
    role="dialog"
    aria-modal="true"
    aria-label="Dashboard onboarding welcome"
  >
    <!-- Accent top bar -->
    <div class="dom-accent-bar" style="background:{ACCENT};"></div>

    <!-- Step dots -->
    <div class="dom-dots" aria-hidden="true">
      {#each Array(TOTAL_STEPS) as _, i}
        <span
          class="dom-dot"
          class:dom-dot-active={i === currentStep}
          style={i === currentStep ? `background:${ACCENT};` : ''}
        ></span>
      {/each}
    </div>

    <!-- Step counter -->
    <p class="dom-step-label">Step {currentStep + 1} of {TOTAL_STEPS}</p>

    <!-- Animated step body -->
    {#key currentStep}
      <div class="dom-step-body dom-slide-{slideDir}">

        <!-- ── Step 1: Welcome to DevSim ── -->
        {#if currentStep === 0}
          <div class="dom-step-icon dom-float" aria-hidden="true">◈</div>
          <p class="dom-eyebrow" style="color:{ACCENT};">Welcome</p>
          <h1 class="dom-title" style="color:{ACCENT};">DevSim</h1>
          <p class="dom-tagline">Your simulated development environment.</p>
          <p class="dom-body">
            Build real-world projects, level up your skills, and compete with other developers.
          </p>

        <!-- ── Step 2: Ready to Build ── -->
        {:else if currentStep === 1}
          <div class="dom-step-icon dom-float" aria-hidden="true">🚀</div>
          <p class="dom-eyebrow" style="color:{ACCENT};">Ready to Build?</p>
          <h2 class="dom-ready-title">Let's write some code.</h2>
          <p class="dom-body">
            Start your first simulated tech stack and earn XP, coins, and achievements.
          </p>
        {/if}

      </div>
    {/key}

    <!-- Navigation -->
    <div class="dom-nav">
      {#if currentStep === 0}
        <button
          class="dom-btn-next"
          on:click={goNext}
          style="border-color:{ACCENT}; color:{ACCENT}; background: transparent;"
        >
          Next →
        </button>
      {:else}
        <button
          class="dom-btn-next"
          on:click={highlightStack}
          style="border-color:{ACCENT}; color:#0a0e1a; background:{ACCENT};"
        >
          🚀 Create My First Stack
        </button>
      {/if}
    </div>

    {#if currentStep === 1}
      <button class="dom-btn-secondary" on:click={complete}>
        Explore Dashboard First
      </button>
    {/if}

    {#if allowSkip}
      <button class="dom-btn-skip" on:click={skip}>Skip tour</button>
    {/if}
  </div>
</div>

<style>
  /* ── Backdrop ── */
  .dom-backdrop {
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
  .dom-backdrop.dom-visible {
    opacity: 1;
  }

  /* ── Modal box ── */
  .dom-box {
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
  .dom-box.dom-visible {
    transform: scale(1) translateY(0);
    opacity: 1;
  }

  /* ── Accent top bar ── */
  .dom-accent-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
  }

  /* ── Step indicator dots ── */
  .dom-dots {
    display: flex;
    gap: 6px;
    justify-content: center;
    margin-bottom: 0.4rem;
  }
  .dom-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(136, 146, 160, 0.28);
    transition: background 0.28s, width 0.28s;
  }
  .dom-dot.dom-dot-active {
    width: 22px;
    border-radius: 3px;
  }

  /* ── Step label ── */
  .dom-step-label {
    text-align: center;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #8892a0;
    margin: 0 0 1.5rem;
  }

  /* ── Step body ── */
  .dom-step-body {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 0.5rem;
  }
  .dom-slide-forward {
    animation: slideInRight 0.26s ease;
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(28px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* ── Step content elements ── */
  .dom-step-icon {
    font-size: 2.8rem;
    margin-bottom: 0.6rem;
    line-height: 1;
  }
  .dom-float {
    animation: float 2.8s ease-in-out infinite;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
  }

  .dom-eyebrow {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #8892a0;
    margin: 0 0 0.3rem;
  }
  .dom-title {
    font-family: 'Orbitron', monospace;
    font-size: 1.85rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    margin: 0 0 0.7rem;
    line-height: 1.2;
  }
  .dom-tagline {
    font-size: 0.9rem;
    color: #d0d7dd;
    font-style: italic;
    margin: 0 0 0.75rem;
  }
  .dom-body {
    font-size: 0.855rem;
    color: #8892a0;
    line-height: 1.65;
    margin: 0 0 0.5rem;
  }

  .dom-ready-title {
    font-family: 'Orbitron', monospace;
    font-size: 1.1rem;
    font-weight: 700;
    color: #d0d7dd;
    margin: 0.3rem 0 1rem;
  }

  /* ── Navigation ── */
  .dom-nav {
    display: flex;
    gap: 0.6rem;
    align-items: center;
    margin-top: 2rem;
  }
  .dom-btn-next {
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
  .dom-btn-next:hover {
    opacity: 0.88;
    box-shadow: 0 0 16px currentColor;
  }

  .dom-btn-secondary {
    display: block;
    margin: 0.6rem auto 0;
    background: none;
    border: 1px solid rgba(136, 146, 160, 0.25);
    color: #8892a0;
    padding: 0.5rem 1rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    cursor: pointer;
    border-radius: 2px;
    transition: color 0.18s, border-color 0.18s;
  }
  .dom-btn-secondary:hover {
    color: #d0d7dd;
    border-color: rgba(208, 215, 221, 0.38);
  }

  .dom-btn-skip {
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
  .dom-btn-skip:hover {
    color: #8892a0;
  }
</style>
