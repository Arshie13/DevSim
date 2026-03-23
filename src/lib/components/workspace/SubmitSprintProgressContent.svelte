<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  type SubmitStep = { icon: string; label: string; detail: string };

  export let state: 'loading' | 'testing' = 'loading';
  export let activeSubmitStepIndex = 0;
  export let activeSubmitStep: SubmitStep;
  export let submitSteps: SubmitStep[] = [];
  export let loadingTitle = '';
  export let loadingSubtitle = '';
  export let cancelingSubmit = false;

  $: stepCount = submitSteps.length;
  $: progressPct = stepCount === 0 ? 0 : Math.round(((activeSubmitStepIndex + 1) / stepCount) * 100);
  $: currentStep =
    activeSubmitStep ?? submitSteps[activeSubmitStepIndex] ?? { icon: '⚙', label: 'Submitting…', detail: '' };

  const dispatch = createEventDispatcher<{ cancel: void }>();

  function requestCancel() {
    dispatch('cancel');
  }
</script>

<div class="submit-run-panel">
  <div class="run-head-wrap relative mb-3 overflow-hidden rounded-[4px] border border-[rgba(7,165,201,0.24)] bg-[rgba(10,14,26,0.88)] px-4 py-3">
    <div class="run-head-glow absolute inset-0" aria-hidden="true"></div>
    <div class="relative">
      <div class="mb-2 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <span class="run-head-icon inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-[rgba(7,165,201,0.35)] bg-[rgba(7,165,201,0.1)] text-[0.92rem]">
            {state === 'testing' ? '🧪' : '⚙'}
          </span>
          <div>
            <p class="[font-family:var(--font-heading)] text-[0.68rem] uppercase tracking-[0.12em] text-[var(--accent)]">Submission Pipeline</p>
            <p class="run-head-status mt-0.5 [font-family:var(--font-mono)] text-[0.75rem] text-[var(--text-primary)]">{loadingTitle || currentStep.label}</p>
          </div>
        </div>
        <span class="rounded-[3px] border border-[rgba(7,165,201,0.3)] bg-[rgba(7,165,201,0.1)] px-2 py-1 [font-family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.1em] text-[var(--accent)]">
          {progressPct}%
        </span>
      </div>
      <div class="h-1.5 w-full overflow-hidden rounded-[2px] bg-[rgba(136,146,160,0.22)]">
        <div
          class="run-head-progress h-full rounded-[2px] bg-[linear-gradient(90deg,var(--accent),var(--cyan-bright))] shadow-[0_0_8px_var(--accent-glow)] transition-all duration-300"
          style={`width: ${progressPct}%`}
        ></div>
      </div>
    </div>
  </div>

  <div class="relative overflow-hidden rounded-[4px] border border-[rgba(7,165,201,0.24)] bg-[rgba(7,165,201,0.04)] px-4 py-3">
    <div class="run-step-scanline absolute inset-x-0 top-0 h-px" aria-hidden="true"></div>
    <div class="relative">
      <div class="run-queue-wrap">
        <p class="run-queue-title">Stage Queue</p>
        <ol class="run-queue-track">
          {#each submitSteps as s, i (s.label)}
            <li class="run-queue-item {i < activeSubmitStepIndex ? 'done' : i === activeSubmitStepIndex ? 'active' : 'pending'}">
              <span class="run-queue-pill">{i < activeSubmitStepIndex ? '✓' : i + 1}</span>
              <span class="run-queue-icon">{s.icon}</span>
              <div class="run-queue-copy">
                {#if i === activeSubmitStepIndex}
                  <span class="run-queue-detail">{loadingSubtitle || s.detail || 'In progress...'}</span>
                {:else}
                  <span class="run-queue-label">{s.label}</span>
                {/if}
              </div>
            </li>
          {/each}
        </ol>
      </div>
    </div>
  </div>

  <div class="mt-3 flex items-center justify-between gap-2 rounded-[4px] border border-[rgba(255,56,96,0.24)] bg-[rgba(255,56,96,0.06)] px-3 py-2">
    <p class="[font-family:var(--font-mono)] text-[0.67rem] uppercase tracking-[0.08em] text-[var(--danger)]">Need to stop this run?</p>
    <button
      class="btn-cyber cursor-pointer border border-[rgba(255,56,96,0.4)] bg-[rgba(255,56,96,0.1)] !px-[1rem] !py-[0.55rem] [font-family:var(--font-heading)] !text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--danger)] transition-all duration-150 ease-in-out hover:-translate-y-[1px] hover:border-[rgba(255,56,96,0.7)] hover:bg-[rgba(255,56,96,0.16)] hover:shadow-[0_0_14px_rgba(255,56,96,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
      on:click={requestCancel}
      disabled={cancelingSubmit}
    >
      {cancelingSubmit ? 'Canceling…' : 'Cancel Run'}
    </button>
  </div>
</div>

<style>
  .submit-run-panel {
    animation: run-panel-in 0.26s ease-out both;
  }

  .run-head-wrap {
    position: relative;
    box-shadow: inset 0 0 0 1px rgba(7, 165, 201, 0.08), 0 0 24px rgba(7, 165, 201, 0.08);
  }

  .run-head-glow {
    background: radial-gradient(circle at 10% 35%, rgba(7, 165, 201, 0.12), transparent 45%);
    animation: head-glow-shift 4.5s ease-in-out infinite;
  }

  .run-head-icon {
    animation: head-icon-pulse 1.8s ease-in-out infinite;
  }

  .run-head-status {
    white-space: nowrap;
    text-shadow: 0 0 10px rgba(7, 165, 201, 0.16);
  }

  .run-head-progress {
    position: relative;
    overflow: hidden;
  }

  .run-head-progress::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      -55deg,
      rgba(255, 255, 255, 0.03) 0,
      rgba(255, 255, 255, 0.03) 4px,
      rgba(255, 255, 255, 0.48) 4px,
      rgba(255, 255, 255, 0.48) 9px
    );
    animation: progress-stripes 0.65s linear infinite;
    opacity: 0.9;
    mix-blend-mode: normal;
  }

  .run-step-scanline {
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    animation: step-scanline 2s linear infinite;
  }

  .run-queue-wrap {
    border: 1px solid rgba(7, 165, 201, 0.2);
    border-radius: 4px;
    background: rgba(10, 14, 26, 0.46);
    padding: 0.7rem;
  }

  .run-queue-title {
    margin: 0 0 0.55rem;
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--text-muted);
    font-size: 0.62rem;
  }

  .run-queue-track {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .run-queue-item {
    display: flex;
    align-items: center;
    gap: 0.42rem;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    border: 1px solid rgba(136, 146, 160, 0.28);
    border-radius: 4px;
    padding: 0.35rem 0.45rem;
    min-height: 2rem;
    background: rgba(10, 14, 26, 0.4);
  }

  .run-queue-item.done {
    border-color: rgba(0, 229, 160, 0.35);
    background: rgba(0, 229, 160, 0.08);
  }

  .run-queue-item.active {
    border-color: rgba(7, 165, 201, 0.55);
    background: rgba(7, 165, 201, 0.12);
    box-shadow: 0 0 12px rgba(7, 165, 201, 0.16);
    position: relative;
    overflow: hidden;
    animation: active-stage-pulse 1.4s ease-in-out infinite;
  }

  .run-queue-item.active::after {
    content: '';
    position: absolute;
    inset: -1px;
    transform: translateX(-120%);
    background: linear-gradient(100deg, transparent 10%, rgba(7, 165, 201, 0.24) 50%, transparent 90%);
    animation: active-stage-sweep 1.5s linear infinite;
    pointer-events: none;
  }

  .run-queue-item.pending {
    border-color: rgba(136, 146, 160, 0.23);
    opacity: 0.76;
  }

  .run-queue-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    border: 1px solid rgba(136, 146, 160, 0.35);
    border-radius: 2px;
    font-size: 0.6rem;
    font-weight: 700;
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .run-queue-item.done .run-queue-pill {
    border-color: rgba(0, 229, 160, 0.5);
    color: var(--success);
  }

  .run-queue-item.active .run-queue-pill {
    border-color: rgba(7, 165, 201, 0.5);
    color: var(--accent);
  }

  .run-queue-icon {
    color: var(--accent);
    width: 0.9rem;
    text-align: center;
    flex-shrink: 0;
  }

  .run-queue-item.done .run-queue-icon {
    color: var(--success);
  }

  .run-queue-label {
    line-height: 1.22;
    color: var(--text-primary);
    min-width: 0;
  }

  .run-queue-copy {
    display: flex;
    flex-direction: column;
    gap: 0.16rem;
    min-width: 0;
  }

  .run-queue-detail {
    font-family: var(--font-mono);
    font-size: 0.64rem;
    color: rgba(7, 165, 201, 0.85);
    line-height: 1.35;
  }

  .run-queue-item.pending .run-queue-label {
    color: var(--text-muted);
  }

  @media (max-width: 768px) {
    .run-queue-wrap {
      padding: 0.6rem;
    }
  }

  @keyframes run-panel-in {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.99);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes head-glow-shift {
    0%, 100% {
      opacity: 0.65;
      transform: translateX(0);
    }
    50% {
      opacity: 1;
      transform: translateX(6px);
    }
  }

  @keyframes head-icon-pulse {
    0%, 100% {
      box-shadow: 0 0 0 rgba(7, 165, 201, 0);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 18px var(--accent-glow);
      transform: scale(1.05);
    }
  }

  @keyframes step-scanline {
    from {
      transform: translateX(-45%);
      opacity: 0.45;
    }
    50% {
      opacity: 1;
    }
    to {
      transform: translateX(45%);
      opacity: 0.45;
    }
  }

  @keyframes progress-stripes {
    from {
      background-position: 0 0;
    }
    to {
      background-position: 28px 0;
    }
  }

  @keyframes active-stage-pulse {
    0%, 100% {
      box-shadow: 0 0 12px rgba(7, 165, 201, 0.14);
      border-color: rgba(7, 165, 201, 0.52);
    }
    50% {
      box-shadow: 0 0 20px rgba(7, 165, 201, 0.28);
      border-color: rgba(7, 165, 201, 0.75);
    }
  }

  @keyframes active-stage-sweep {
    to {
      transform: translateX(120%);
    }
  }
</style>
