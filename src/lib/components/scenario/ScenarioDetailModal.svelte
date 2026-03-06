<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Rocket, Loader, X, Star, Layers, FolderOpen } from 'lucide-svelte';
  import type { ScenarioMeta } from '$types';

  export let open: boolean = false;
  export let scenario: ScenarioMeta | null = null;
  export let isLoading: boolean = false;

  const dispatch = createEventDispatcher<{
    startSprint: void;
    close: void;
  }>();

  // Map difficulty base word → color token
  const difficultyColors: Record<string, string> = {
    beginner: '#00e5a0',
    easy:     '#00e5a0',
    medium:   '#ffb400',
    hard:     '#ff3860',
    expert:   '#ff3860',
    master:   '#a855f7',
    advanced: '#ffb400',
  };

  $: diffBase = scenario?.difficulty.split(/[→\s]/)[0].trim().toLowerCase() ?? '';
  $: diffColor = difficultyColors[diffBase] ?? '#07a5c9';

  function handleClose() {
    if (isLoading) return;
    dispatch('close');
    open = false;
  }

  function handleStartSprint() {
    dispatch('startSprint');
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) handleClose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') handleClose();
  }
</script>

{#if open && scenario}
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div
    class="modal-enter fixed inset-0 z-[9998] bg-black/[.78] backdrop-blur-[5px] flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="sdm-title"
    tabindex="-1"
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
  >
    <div
      class="modal-card-enter relative w-full max-w-[600px] bg-[var(--bg-light)] border border-[rgba(7,165,201,0.25)] rounded-[4px] p-8"
      style="box-shadow: 0 0 0 1px rgba(7,165,201,0.07), 0 0 40px rgba(7,165,201,0.12), 0 24px 60px rgba(0,0,0,0.55);"
    >
      <!-- Animated glow border — gradient + @keyframes, needs custom CSS -->
      <div
        class="modal-glow absolute -inset-px rounded-[5px] -z-10 pointer-events-none"
        style="background: linear-gradient(135deg, rgba(7,165,201,0.30), transparent 55%, rgba(99,102,241,0.12));"
        aria-hidden="true"
      ></div>

      <!-- Close button -->
      <button
        class="absolute top-4 right-4 flex items-center justify-center w-8 h-8 bg-transparent border border-[rgba(7,165,201,0.20)] rounded-[4px] text-[var(--text-muted)] cursor-pointer transition-all duration-200 hover:border-[rgba(7,165,201,0.50)] hover:text-[var(--accent)] hover:bg-[rgba(7,165,201,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
        on:click={handleClose}
        disabled={isLoading}
        aria-label="Close scenario details"
      >
        <X class="w-4 h-4" />
      </button>

      <!-- ── Header ────────────────────────────────────────────────────── -->
      <div class="flex items-center gap-4 mb-5 pr-8">
        <div
          class="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-[4px] bg-[rgba(7,165,201,0.10)] border border-[rgba(7,165,201,0.30)]"
          aria-hidden="true"
        >
          <span class="font-label text-[0.78rem] font-bold text-[var(--accent)] tracking-[0.05em]">
            S{scenario.number.toString().padStart(2, '0')}
          </span>
        </div>
        <div>
          <p class="font-label text-[0.63rem] uppercase tracking-[0.12em] text-[var(--accent)] opacity-75 m-0 mb-0.5">
            // SCENARIO {scenario.number}
          </p>
          <h2 id="sdm-title" class="font-heading text-[1.35rem] font-bold tracking-[0.06em] text-[var(--text-primary)] leading-tight m-0">
            {scenario.title}
          </h2>
        </div>
      </div>

      <!-- Divider — gradient, needs inline style -->
      <div
        class="h-px mb-5"
        style="background: linear-gradient(90deg, rgba(7,165,201,0.30), rgba(7,165,201,0.05) 80%, transparent);"
        aria-hidden="true"
      ></div>

      <!-- ── Meta tags ─────────────────────────────────────────────────── -->
      <div class="flex items-center gap-[0.6rem] flex-wrap mb-6">
        <!-- Difficulty — dynamic color via inline style -->
        <div
          class="tag-cyber flex items-center gap-1.5"
          style="color:{diffColor}; border:1px solid {diffColor}99; background:{diffColor}18;"
        >
          <Star class="w-3 h-3 flex-shrink-0" />
          <span>{scenario.difficulty}</span>
        </div>

        <!-- Levels -->
        {#if scenario.hasLevels}
          <div class="tag-cyber flex items-center gap-1.5 text-[rgba(136,146,160,0.75)] border border-[rgba(136,146,160,0.18)]">
            <Layers class="w-3 h-3 flex-shrink-0" />
            <span>{scenario.levelCount} Level{scenario.levelCount !== 1 ? 's' : ''}</span>
          </div>
        {:else}
          <div class="tag-cyber text-[rgba(136,146,160,0.50)] border border-[rgba(136,146,160,0.18)] opacity-50">
            No levels defined
          </div>
        {/if}

        <!-- Project folder -->
        <div class="tag-cyber flex items-center gap-1.5 text-[rgba(136,146,160,0.60)] border border-[rgba(136,146,160,0.15)] ml-auto">
          <FolderOpen class="w-3 h-3 flex-shrink-0" />
          <span>{scenario.projectFolder}</span>
        </div>
      </div>

      <!-- ── Description ───────────────────────────────────────────────── -->
      <div class="bg-[rgba(7,165,201,0.04)] border border-[rgba(7,165,201,0.10)] border-l-2 border-l-[rgba(7,165,201,0.40)] rounded-[4px] p-4 mb-7">
        <p class="font-label text-[0.63rem] uppercase tracking-[0.12em] text-[var(--accent)] opacity-65 m-0 mb-2">
          // PROJECT BRIEF
        </p>
        <p class="font-body text-[0.92rem] leading-relaxed text-[rgba(208,215,221,0.80)] whitespace-pre-line m-0">
          {scenario.description}
        </p>
      </div>

      <!-- ── Actions ───────────────────────────────────────────────────── -->
      <div class="flex items-center justify-end gap-3">
        <button
          class="btn-cyber btn-cyber-outline"
          on:click={handleClose}
          disabled={isLoading}
        >
          Cancel
        </button>

        <button
          class="btn-cyber btn-cyber-solid flex items-center gap-2 disabled:opacity-65 disabled:cursor-not-allowed"
          on:click={handleStartSprint}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {#if isLoading}
            <Loader class="w-4 h-4 animate-spin" />
            <span>Starting Sprint…</span>
          {:else}
            <Rocket class="w-4 h-4" />
            <span>Start Sprint</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Tailwind cannot define @keyframes — animations only below */
  .modal-enter {
    animation: fade-in 0.2s ease;
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .modal-card-enter {
    animation: slide-up 0.25s ease;
  }
  @keyframes slide-up {
    from { transform: translateY(16px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  /* Gradient border glow — @keyframes + gradient, cannot be done in Tailwind */
  .modal-glow {
    animation: glow-pulse 3s ease-in-out infinite alternate;
  }
  @keyframes glow-pulse {
    from { opacity: 0.35; }
    to   { opacity: 1; }
  }
</style>
