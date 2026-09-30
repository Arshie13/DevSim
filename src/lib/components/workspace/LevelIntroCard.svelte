<script lang="ts">
  import { X, CheckCircle, Circle, Play, Target } from "lucide-svelte";

  export let levelTitle: string = "";
  export let levelNumber: number = 1;
  export let isOpen: boolean = false;
  export let onClose: () => void = () => {};
  export let levelDescription: string = "";
  export let tasks: { id: string | number; text: string; completed?: boolean }[] = [];
  export let levelConfig: {
    isFirstProjectCreation?: boolean;
    operatorAlias?: string;
    projectName?: string;
  } = {};

  let isAnimatingOut = false;
  let isVisible = false;
  let mounted = false;

  $: if (isOpen && !mounted) {
    mounted = true;
    setTimeout(() => {
      isVisible = true;
    }, 50);
  }

  $: if (!isOpen) {
    isVisible = false;
    mounted = false;
  }

  function closeCard() {
    isVisible = false;
    isAnimatingOut = true;
    setTimeout(() => {
      isAnimatingOut = false;
      mounted = false;
      onClose();
    }, 200);
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeCard();
    }
  }

  function handleBackdropKeydown(event: KeyboardEvent) {
    if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
      event.preventDefault();
      closeCard();
    }
  }

  // Calculate progress percentage
  $: completedCount = tasks?.filter(t => t.completed).length || 0;
  $: totalCount = tasks?.length || 0;
  $: progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  $: activeObjectiveIndex = tasks?.findIndex(t => !t.completed) ?? -1;

  $: isFirstProjectCreation = levelConfig?.isFirstProjectCreation ?? false;

  // Personalization: the operator alias takes precedence over the static greetings
  $: operatorAlias = levelConfig?.operatorAlias?.trim() ?? "";
  $: projectName = levelConfig?.projectName?.trim() ?? "";

  $: greetingTitle = operatorAlias
    ? `Welcome aboard, ${operatorAlias}`
    : isFirstProjectCreation
      ? "Welcome to DevSim"
      : "Continue your Developer Journey!";

  $: isFirstLevelOnboarding = isFirstProjectCreation && levelNumber === 1;

  $: deploymentLabel = (() => {
    if (totalCount === 0) {
      return isFirstLevelOnboarding ? "Initialize Workspace" : "Continue";
    }

    if (completedCount === 0) {
      return isFirstLevelOnboarding ? "Initialize Workspace" : "Begin Mission";
    }

    if (completedCount < totalCount) {
      return "Resume Mission";
    }

    return "Review Mission";
  })();
</script>

{#if mounted}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)] p-4"
    role="button"
    tabindex="0"
    aria-label="Close level intro"
    on:click={handleBackdropClick}
    on:keydown={handleBackdropKeydown}
  >

    <!-- Card -->
    <div
      class="modal-card relative flex max-h-[94vh] w-[min(46rem,90vw)] flex-col overflow-hidden border border-[rgb(var(--accent-rgb)/0.17)] bg-[color-mix(in_oklab,var(--bg)_72%,var(--bg-light)_28%)]"
      class:visible={isVisible}
      class:animating-out={isAnimatingOut}
    >
      <div class="modal-card-glow" aria-hidden="true"></div>
      <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--accent),transparent)]"></div>

      <!-- Header -->
      <div class="mission-header relative flex items-start justify-between border-b border-[rgb(var(--accent-rgb)/0.2)] px-6 py-4">
        <div class="relative z-[1] flex items-start gap-3">
          <div class="ring-pulse mission-icon relative mt-0.5 flex h-9 w-9 items-center justify-center border border-[rgb(var(--accent-rgb)/0.38)] bg-[rgb(var(--accent-rgb)/0.12)]">
            <Target class="h-4 w-4 text-[var(--accent)]" />
          </div>

          <div class="space-y-1">
            <h2 class="greeting-title font-heading text-[1.08rem] font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">
              {greetingTitle}
            </h2>
            <span class="level-chip inline-flex items-center border border-[rgb(var(--accent-rgb)/0.3)] bg-[rgb(var(--accent-rgb)/0.09)] px-2 py-0.5 font-label text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
              Level <strong class="tabular-nums">{levelNumber}</strong>
            </span>
            {#if levelTitle}
              <p class="font-label text-xs uppercase tracking-[0.08em] text-[var(--accent)]">
                Current mission: <strong>{levelTitle}</strong>
              </p>
            {/if}
            {#if projectName}
              <p class="font-label text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Project: <strong>{projectName}</strong>
              </p>
            {/if}
          </div>
        </div>

        <button
          class="close-btn relative z-[1] flex h-8 w-8 cursor-pointer items-center justify-center border border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.05)] text-[var(--text-muted)] transition-all duration-200 hover:border-[rgb(var(--danger-rgb)/0.28)] hover:bg-[rgb(var(--danger-rgb)/0.1)] hover:text-[var(--danger)]"
          on:click={closeCard}
          aria-label="Close mission briefing"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Content (flex-1 scroll region — a safety net that should stay invisible at normal sizes) -->
      <div class="relative flex-1 overflow-y-auto px-6 py-5">
        {#if totalCount > 0}
          <div class="mb-5 border border-[rgb(var(--accent-rgb)/0.26)] bg-[rgb(var(--bg-light-rgb)/0.74)] p-4">
            <div class="mb-1.5 flex items-center justify-between">
              <span class="font-label text-xs uppercase tracking-[0.09em] text-[var(--accent)]">Mission Progress</span>
              <span class="font-label text-xs uppercase text-[var(--text-muted)]"><strong class="tabular-nums">{progressPercent.toFixed(0)}%</strong> synced</span>
            </div>
            <div class="xp-track">
              <div class="xp-fill" style="width: {progressPercent}%"></div>
            </div>
            <p class="mt-1.5 font-label text-xs uppercase text-[var(--text-muted)]"><strong class="tabular-nums">{completedCount}/{totalCount}</strong> objectives completed</p>
          </div>
        {/if}

        {#if levelDescription}
          <div class="mb-5">
            <h3 class="font-label text-xs uppercase tracking-[0.09em] text-[var(--accent)]">Intel</h3>
            <div class="mt-1.5 border border-[rgb(var(--accent-rgb)/0.22)] bg-[rgb(var(--bg-light-rgb)/0.74)] p-4">
              <p class="font-body text-sm leading-relaxed text-[var(--text-primary)]">
                {levelDescription}
              </p>
            </div>
          </div>
        {/if}

        {#if tasks && tasks.length > 0}
          <div>
            <div class="mb-2 flex items-center justify-between">
              <h3 class="font-label text-xs uppercase tracking-[0.09em] text-[var(--accent)]">Mission Objectives</h3>
              <span class="font-label text-xs uppercase text-[var(--text-muted)]"><strong class="tabular-nums">{completedCount}/{totalCount}</strong> done</span>
            </div>

            <ul class="space-y-2">
              {#each tasks as task, index}
                <li
                  class="objective-row flex items-center gap-2.5 border border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--bg-light-rgb)/0.74)] p-3 transition-all duration-200"
                  class:is-completed={task.completed}
                  class:is-active={!task.completed && index === activeObjectiveIndex}
                >
                  <div class="flex-shrink-0">
                    {#if task.completed}
                      <CheckCircle class="h-3.5 w-3.5 text-[var(--success)]" />
                    {:else}
                      <Circle class="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    {/if}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-body text-sm leading-snug text-[var(--text-primary)]" class:task-done={task.completed}>
                      <span class="mr-1.5 font-label text-xs text-[var(--text-muted)]">[{index + 1}]</span><strong>{task.text}</strong>
                    </p>
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>

      <!-- Footer CTA (outside the scroll region, pinned to the bottom) -->
      <div class="relative flex justify-center border-t border-[rgb(var(--accent-rgb)/0.2)] px-6 py-4">
        <button on:click={closeCard} class="btn-cyber btn-cyber-solid mission-btn group inline-flex cursor-pointer items-center gap-1.5">
          <span>{deploymentLabel}</span>
          <Play class="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-card {
    opacity: 0;
    transform: translateY(12px) scale(0.985);
    transition: all 0.35s ease;
    border-radius: var(--radius-card);
    box-shadow:
      0 0 0 1px rgb(var(--accent-rgb) / 0.06),
      0 0 36px rgb(var(--accent-rgb) / 0.1),
      0 24px 48px rgb(var(--bg-rgb) / 0.55);
  }

  .modal-card-glow {
    position: absolute;
    inset: -1px;
    border-radius: var(--radius-card);
    background: linear-gradient(135deg, rgb(var(--accent-rgb) / 0.22), transparent 62%, rgb(var(--accent-rgb) / 0.14));
    z-index: -1;
    pointer-events: none;
    animation: border-pulse 3s ease-in-out infinite alternate;
  }

  .modal-card.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .modal-card.animating-out {
    opacity: 0;
    transform: translateY(-10px) scale(0.975);
    transition: all 0.2s ease-out;
  }

  .mission-header {
    background:
      linear-gradient(180deg, rgb(var(--accent-rgb) / 0.07), transparent 71%),
      linear-gradient(90deg, rgb(var(--accent-rgb) / 0.06), transparent 41%);
    overflow: hidden;
  }

  .mission-icon {
    box-shadow:
      inset 0 0 0 1px rgb(var(--accent-rgb) / 0.14),
      0 0 14px rgb(var(--accent-rgb) / 0.2);
  }

  .greeting-title {
    text-shadow: 0 0 11px rgb(var(--accent-rgb) / 0.15);
  }

  .level-chip {
    border-radius: var(--radius-chrome);
    box-shadow: 0 0 0 1px rgb(var(--accent-rgb) / 0.1);
  }

  .close-btn {
    border-radius: var(--radius-card);
  }

  .ring-pulse::after {
    content: "";
    position: absolute;
    inset: -4px;
    border: 1px solid rgb(var(--accent-rgb) / 0.34);
    opacity: 0;
    animation: ping-ring 2.2s ease-out infinite;
  }

  .mission-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, var(--cyan-bright), transparent);
    opacity: 0;
    transform: translateX(-100%);
    transition: transform 0.35s ease, opacity 0.35s ease;
  }

  .mission-btn:hover::before {
    opacity: 0.3;
    transform: translateX(0);
  }

  .mission-btn > * {
    position: relative;
    z-index: 1;
  }

  .objective-row {
    position: relative;
  }

  .objective-row::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: transparent;
    transition: background 0.2s ease;
  }

  .objective-row:hover {
    transform: translateX(4px);
    border-color: var(--card-hover);
    background: rgb(var(--accent-rgb) / 0.07);
  }

  .objective-row:hover::before {
    background: var(--accent);
  }

  .objective-row.is-active {
    border-color: rgb(var(--accent-rgb) / 0.72);
    background: rgb(var(--accent-rgb) / 0.12);
    box-shadow:
      0 0 0 1px rgb(var(--accent-rgb) / 0.18),
      0 0 15px rgb(var(--accent-rgb) / 0.22);
    animation: active-step-pulse 1.6s ease-in-out infinite;
  }

  .objective-row.is-active::before {
    background: var(--accent);
  }

  .objective-row.is-completed {
    border-color: rgb(var(--success-rgb) / 0.35);
    background: rgb(var(--success-rgb) / 0.07);
  }

  .objective-row.is-completed::before {
    background: var(--success);
  }

  .task-done {
    color: var(--text-muted);
    text-decoration: line-through;
    text-decoration-color: rgb(var(--success-rgb) / 0.45);
  }

  @keyframes ping-ring {
    0% {
      transform: scale(0.92);
      opacity: 0.7;
    }

    100% {
      transform: scale(1.25);
      opacity: 0;
    }
  }

  @keyframes active-step-pulse {
    0%,
    100% {
      box-shadow:
        0 0 0 1px rgb(var(--accent-rgb) / 0.2),
        0 0 14px rgb(var(--accent-rgb) / 0.22);
    }

    50% {
      box-shadow:
        0 0 0 1px rgb(var(--accent-rgb) / 0.35),
        0 0 24px rgb(var(--accent-rgb) / 0.3);
    }
  }

  @keyframes border-pulse {
    from {
      opacity: 0.35;
    }

    to {
      opacity: 1;
    }
  }
</style>
