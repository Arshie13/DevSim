<script context="module" lang="ts">
  export interface LoadStep {
    icon: string;
    label: string;
    detail?: string;
    detailSequence?: string[];
    detailSequenceIntervalMs?: number;
  }
</script>

<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';

  /** Currently active step index (0-based). */
  export let step: number = 0;
  /** Ordered list of steps to display. */
  export let steps: LoadStep[] = [];
  /** Main heading text. */
  export let title: string = 'Loading…';
  /** Smaller monospace subtitle shown below the heading. */
  export let subtitle: string = '';
  /** Decorative icon displayed above the title. */
  export let icon: string = '⟨/⟩';
  /** Non-empty string triggers the error panel. */
  export let error: string = '';
  /** Prefix label inside the error panel (e.g. "Boot failed"). */
  export let errorPrefix: string = 'Error';
  /** Wrap content in the glowing dark card. Set false when placed inside an existing card. */
  export let card: boolean = true;
  /** Render as a fixed full-screen overlay with CRT scanlines (implies card = true). */
  export let overlay: boolean = false;
  /** Footer badge rendered below the card — only visible in overlay mode. */
  export let footer: string = '';

  const dispatch = createEventDispatcher<{ retry: void }>();
  let detailTick = 0;
  let detailTicker: ReturnType<typeof setInterval> | null = null;

  function clearDetailTicker() {
    if (detailTicker) {
      clearInterval(detailTicker);
      detailTicker = null;
    }
  }

  function resolveActiveStepDetail(activeStep?: LoadStep): string {
    if (!activeStep) return '';

    const sequence = activeStep.detailSequence ?? [];
    if (sequence.length > 0) {
      return sequence[detailTick % sequence.length] ?? activeStep.detail ?? '';
    }

    return activeStep.detail ?? '';
  }

  $: pct = steps.length > 0 ? Math.round(((step + 1) / steps.length) * 100) : 0;
  $: activeStep = steps[step];
  $: activeStepDetail = resolveActiveStepDetail(activeStep);

  $: {
    clearDetailTicker();
    detailTick = 0;

    const sequence = activeStep?.detailSequence ?? [];
    const cycleMs = Math.max(1000, activeStep?.detailSequenceIntervalMs ?? 5000);

    if (typeof window !== 'undefined' && sequence.length > 1) {
      detailTicker = setInterval(() => {
        detailTick = (detailTick + 1) % sequence.length;
      }, cycleMs);
    }
  }

  onDestroy(() => {
    clearDetailTicker();
  });
</script>

<!-- ─── Inner content (reused across configurations) ──────────────────────── -->
{#snippet content()}
  <div class="ls-header">
    <span class="ls-icon">{icon}</span>
    <h2 class="ls-title">{title}</h2>
    {#if subtitle}
      <p class="ls-subtitle">{subtitle}</p>
    {/if}
  </div>

  <div
    class="ls-progress-track"
    role="progressbar"
    aria-valuenow={step + 1}
    aria-valuemax={steps.length}
  >
    <div class="ls-progress-fill" style="width: {pct}%"></div>
  </div>
  <p class="ls-progress-pct">{pct}%</p>

  <ul class="ls-steps">
    {#each steps as s, i}
      <li
        class="ls-step"
        class:done={i < step}
        class:active={i === step}
        class:pending={i > step}
      >
        <span class="ls-step-indicator">
          {#if i < step}
            <span class="ls-check">✓</span>
          {:else if i === step}
            <span class="ls-spinner"></span>
          {:else}
            <span class="ls-dot">·</span>
          {/if}
        </span>
        <span class="ls-step-body">
          <span class="ls-step-label">{s.icon} {s.label}</span>
          {#if i === step && activeStepDetail}
            <span class="ls-step-detail">{activeStepDetail}</span>
          {/if}
        </span>
      </li>
    {/each}
  </ul>

  {#if error}
    <div class="ls-error">
      <span>⚠ {errorPrefix}: {error}</span>
      <button class="ls-retry-btn" on:click={() => dispatch('retry')}>Retry</button>
    </div>
  {/if}
{/snippet}

<!-- ─── Rendering modes ────────────────────────────────────────────────────── -->
{#if overlay}
  <div class="ls-overlay">
    <div class="ls-scanlines" aria-hidden="true"></div>
    <div class="ls-card ls-card--overlay">
      <div class="ls-card-glow" aria-hidden="true"></div>
      {@render content()}
    </div>
    {#if footer}
      <p class="ls-footer">{footer}</p>
    {/if}
  </div>
{:else if card}
  <div class="ls-card">
    <div class="ls-card-glow" aria-hidden="true"></div>
    {@render content()}
  </div>
{:else}
  {@render content()}
{/if}

<style>
  /* ── Full-screen overlay ──────────────────────────────────────────────── */
  .ls-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: var(--bg, #0a0e1a);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    overflow: hidden;
  }

  /* CRT scanline texture (from design guide: repeating-gradient every 4px) */
  .ls-scanlines {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.015) 2px,
      rgba(0, 0, 0, 0.015) 4px
    );
    z-index: 200;
  }

  /* ── Card ─────────────────────────────────────────────────────────────── */
  .ls-card {
    position: relative;
    width: min(560px, 94vw);
    background: var(--bg-light, #12192a);
    border: 1px solid var(--card-border, rgba(7, 165, 201, 0.15));
    border-radius: 4px; /* sharp corners per design guide */
    padding: 2rem 2.25rem;
    box-shadow:
      0 0 0 1px rgba(7, 165, 201, 0.07),
      0 0 40px rgba(7, 165, 201, 0.12),
      0 24px 48px rgba(0, 0, 0, 0.55);
  }

  /* Animated gradient border glow */
  .ls-card-glow {
    position: absolute;
    inset: -1px;
    border-radius: 5px;
    background: linear-gradient(135deg, rgba(7, 165, 201, 0.30), transparent 60%, rgba(99, 102, 241, 0.18));
    z-index: -1;
    pointer-events: none;
    animation: ls-border-pulse 3s ease-in-out infinite alternate;
  }
  @keyframes ls-border-pulse {
    from { opacity: 0.35; }
    to   { opacity: 1; }
  }

  /* ── Header ───────────────────────────────────────────────────────────── */
  .ls-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .ls-icon {
    display: inline-block;
    font-size: 2rem;
    color: var(--accent, #07a5c9);
    filter: drop-shadow(0 0 8px var(--accent, #07a5c9));
    animation: ls-icon-pulse 2.5s ease-in-out infinite alternate;
  }
  @keyframes ls-icon-pulse {
    from { filter: drop-shadow(0 0 4px var(--accent, #07a5c9)); }
    to   { filter: drop-shadow(0 0 18px var(--accent, #07a5c9)); }
  }

  /* Overlay mode: larger uppercase title */
  .ls-card--overlay .ls-title {
    font-size: 1.55rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .ls-title {
    margin: 0.3rem 0 0;
    font-family: var(--font-head, 'Orbitron', sans-serif);
    font-size: 1.28rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    color: var(--text-primary, #d0d7dd);
  }

  .ls-subtitle {
    margin: 0.3rem 0 0;
    font-family: var(--font-mono, 'Share Tech Mono', monospace);
    font-size: 0.8rem;
    color: rgba(7, 165, 201, 0.7);
    letter-spacing: 0.08em;
    line-height: 1.55;
  }

  /* ── Progress bar (design guide: 4px track, gradient fill + glow) ──────── */
  .ls-progress-track {
    height: 5px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 0.4rem;
  }
  .ls-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent, #07a5c9), var(--cyan-bright, #00f5ff));
    border-radius: 2px;
    transition: width 0.8s ease;
    box-shadow: 0 0 8px var(--accent-glow, rgba(7, 165, 201, 0.30));
  }
  .ls-progress-pct {
    text-align: right;
    font-family: var(--font-mono, 'Share Tech Mono', monospace);
    font-size: 0.74rem;
    color: var(--accent, #07a5c9);
    margin: 0 0 1.25rem;
  }

  /* ── Step list ────────────────────────────────────────────────────────── */
  .ls-steps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.62rem;
  }

  .ls-step {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    font-family: var(--font-mono, 'Share Tech Mono', monospace);
    font-size: 0.85rem;
    transition: opacity 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
    border: 1px solid rgba(136, 146, 160, 0.22);
    border-radius: 4px;
    padding: 0.45rem 0.6rem;
    background: rgba(10, 14, 26, 0.4);
  }
  .ls-step.pending {
    opacity: 0.52;
    border-color: rgba(136, 146, 160, 0.18);
  }
  .ls-step.done {
    opacity: 0.88;
    border-color: rgba(0, 229, 160, 0.36);
    background: rgba(0, 229, 160, 0.08);
  }
  .ls-step.active {
    opacity: 1;
    border-color: rgba(7, 165, 201, 0.72);
    background: rgba(7, 165, 201, 0.14);
    box-shadow:
      0 0 0 1px rgba(7, 165, 201, 0.2),
      0 0 16px rgba(7, 165, 201, 0.24);
    transform: translateY(-1px);
    animation: ls-active-step-pulse 1.6s ease-in-out infinite;
  }

  .ls-step-indicator {
    flex-shrink: 0;
    width: 1.2rem;
    text-align: center;
    padding-top: 2px;
  }

  .ls-check { color: var(--success, #00e5a0); font-weight: 700; }
  .ls-dot   { color: var(--text-muted, #8892a0); }

  .ls-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(7, 165, 201, 0.25);
    border-top-color: var(--accent, #07a5c9);
    border-radius: 50%;
    animation: ls-spin 0.7s linear infinite;
  }
  @keyframes ls-spin { to { transform: rotate(360deg); } }

  .ls-step-body {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }
  .ls-step-label  { color: var(--text-primary, #d0d7dd); }
  .ls-step-detail {
    color: rgba(7, 165, 201, 0.95);
    font-size: 0.76rem;
    line-height: 1.45;
    min-height: 1.1rem;
    animation: ls-detail-fade-in 0.3s ease;
  }

  @keyframes ls-detail-fade-in {
    from {
      opacity: 0;
      transform: translateY(2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes ls-active-step-pulse {
    0%,
    100% {
      box-shadow:
        0 0 0 1px rgba(7, 165, 201, 0.18),
        0 0 12px rgba(7, 165, 201, 0.2);
    }
    50% {
      box-shadow:
        0 0 0 1px rgba(7, 165, 201, 0.35),
        0 0 24px rgba(7, 165, 201, 0.34);
    }
  }

  /* ── Error panel ──────────────────────────────────────────────────────── */
  .ls-error {
    margin-top: 1.25rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 56, 96, 0.07);
    border: 1px solid rgba(255, 56, 96, 0.35);
    border-radius: 4px;
    color: #fca5a5;
    font-family: var(--font-mono, 'Share Tech Mono', monospace);
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  .ls-retry-btn {
    flex-shrink: 0;
    padding: 0.3rem 0.85rem;
    font-family: var(--font-head, 'Orbitron', sans-serif);
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: rgba(255, 56, 96, 0.15);
    border: 1px solid rgba(255, 56, 96, 0.45);
    clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px));
    color: #fecaca;
    cursor: pointer;
    transition: background 0.2s;
  }
  .ls-retry-btn:hover { background: rgba(255, 56, 96, 0.28); }

 /* ── Footer (overlay mode only) ───────────────────────────────────────── */
  .ls-footer {
    position: relative;
    z-index: 1;
    font-family: var(--font-mono, 'Share Tech Mono', monospace);
    font-size: 0.7rem;
    color: rgba(7, 165, 201, 0.8);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    animation: ls-footer-glow 4.8s ease-in-out infinite;
  }
 
  @keyframes ls-footer-glow {
    0%, 100% {
      opacity: 0.2;
      text-shadow:
        0 0 2px rgba(7, 165, 201, 0.0),
        0 0 4px rgba(7, 165, 201, 0.0);
    }
    40%, 60% {
      opacity: 1;
      text-shadow:
        0 0 6px rgba(7, 165, 201, 1),
        0 0 16px rgba(7, 165, 201, 0.75),
        0 0 32px rgba(7, 165, 201, 0.45),
        0 0 56px rgba(7, 165, 201, 0.2);
    }
  }
</style>

