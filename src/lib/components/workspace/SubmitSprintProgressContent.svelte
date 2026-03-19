<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import LoadingSteps from '$lib/components/ui/LoadingSteps.svelte';

  type SubmitStep = { icon: string; label: string; detail: string };

  export let state: 'loading' | 'testing' = 'loading';
  export let activeSubmitStepIndex = 0;
  export let activeSubmitStep: SubmitStep;
  export let submitSteps: SubmitStep[] = [];
  export let loadingTitle = '';
  export let loadingSubtitle = '';
  export let cancelingSubmit = false;

  const dispatch = createEventDispatcher<{ cancel: void }>();

  function requestCancel() {
    dispatch('cancel');
  }
</script>

<div class="submit-run-panel">
  <div class="run-head-wrap relative mb-3 overflow-hidden rounded-[4px] border border-[rgba(7,165,201,0.24)] bg-[rgba(10,14,26,0.86)] px-4 py-3">
    <div class="run-head-glow absolute inset-0" aria-hidden="true"></div>
    <div class="relative flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <span class="run-head-icon inline-flex h-9 w-9 items-center justify-center rounded-[4px] border border-[rgba(7,165,201,0.35)] bg-[rgba(7,165,201,0.1)] text-base">
          {state === 'testing' ? '🧪' : '⚙'}
        </span>
        <div>
          <p class="[font-family:var(--font-heading)] text-[0.7rem] uppercase tracking-[0.12em] text-[var(--accent)]">Submission Pipeline</p>
          <p class="mt-0.5 [font-family:var(--font-mono)] text-[0.74rem] text-[var(--text-primary)]">{activeSubmitStep.label}</p>
        </div>
      </div>
      <span class="rounded-[3px] border border-[rgba(7,165,201,0.3)] bg-[rgba(7,165,201,0.1)] px-2 py-1 [font-family:var(--font-mono)] text-[0.63rem] uppercase tracking-[0.1em] text-[var(--accent)]">
        Stage {activeSubmitStepIndex + 1}/{submitSteps.length}
      </span>
    </div>
  </div>

  <div class="relative overflow-hidden rounded-[4px] border border-[rgba(7,165,201,0.24)] bg-[rgba(7,165,201,0.04)] px-2 py-2">
    <div class="run-step-scanline absolute inset-x-0 top-0 h-px" aria-hidden="true"></div>
    <div class="relative px-2 py-2">
      <LoadingSteps
        card={false}
        step={activeSubmitStepIndex}
        steps={submitSteps}
        title={loadingTitle}
        subtitle={loadingSubtitle}
        icon={state === 'testing' ? '🧪' : '📦'}
      />
    </div>
  </div>

  <div class="mt-3 grid grid-cols-3 gap-2.5">
    {#each submitSteps as s, i (s.label)}
      <div
        class="run-stage-chip rounded-[3px] border px-2 py-2 text-center transition-all duration-200"
        class:border-[rgba(7,165,201,0.35)]={i <= activeSubmitStepIndex}
        class:bg-[rgba(7,165,201,0.1)]={i <= activeSubmitStepIndex}
        class:text-[var(--accent)]={i <= activeSubmitStepIndex}
        class:border-[rgba(136,146,160,0.25)]={i > activeSubmitStepIndex}
        class:bg-[rgba(136,146,160,0.06)]={i > activeSubmitStepIndex}
        class:text-[var(--text-muted)]={i > activeSubmitStepIndex}
        class:run-stage-chip-active={i === activeSubmitStepIndex}
      >
        <div class="[font-family:var(--font-mono)] text-[0.8rem]">{s.icon}</div>
        <div class="mt-1 [font-family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.08em]">{i + 1} / {submitSteps.length}</div>
      </div>
    {/each}
  </div>

  <div class="mt-3 flex justify-end">
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
    box-shadow: inset 0 0 0 1px rgba(7, 165, 201, 0.08), 0 0 24px rgba(7, 165, 201, 0.08);
  }

  .run-head-glow {
    background: radial-gradient(circle at 10% 35%, rgba(7, 165, 201, 0.12), transparent 45%);
    animation: head-glow-shift 4.5s ease-in-out infinite;
  }

  .run-head-icon {
    animation: head-icon-pulse 1.8s ease-in-out infinite;
  }

  .run-stage-chip {
    backdrop-filter: blur(2px);
  }

  .run-stage-chip-active {
    box-shadow: 0 0 14px var(--accent-glow);
    animation: stage-chip-pop 1.6s ease-in-out infinite;
  }

  .run-step-scanline {
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    animation: step-scanline 2s linear infinite;
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

  @keyframes stage-chip-pop {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-1px);
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
</style>
