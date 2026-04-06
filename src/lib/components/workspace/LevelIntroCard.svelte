<script lang="ts">
  import { X, CheckCircle, Circle, Play, Target } from "lucide-svelte";

  export let levelTitle: string = "";
  export let levelNumber: number = 1;
  export let isOpen: boolean = false;
  export let onClose: () => void = () => {};
  export let levelDescription: string = "";
  export let tasks: { id: string | number; text: string; completed?: boolean }[] = [];

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
      class="modal-card relative flex max-h-[92vh] w-[min(520px,94vw)] flex-col overflow-hidden border border-[var(--card-border)] bg-[var(--bg-light)]"
      class:visible={isVisible}
      class:animating-out={isAnimatingOut}
    >
      <div class="modal-card-glow" aria-hidden="true"></div>
      <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--accent),transparent)]"></div>

      <!-- Header -->
      <div class="relative flex items-start justify-between border-b border-[rgba(7,165,201,0.2)] px-5 py-4">
        <div class="flex items-start gap-3">
          <div class="ring-pulse relative mt-0.5 flex h-9 w-9 items-center justify-center border border-[rgba(7,165,201,0.4)] bg-[rgba(7,165,201,0.12)]">
            <Target class="h-4 w-4 text-[var(--accent)]" />
          </div>

          <div class="space-y-0.5">
            <span class="tag-cyber tag-cyan inline-flex items-center text-[0.6rem]">Workspace Mission</span>
            <h2 class="font-heading text-[1rem] font-bold uppercase tracking-[0.11em] text-[var(--text-primary)]">
              DevSim // Level {levelNumber}
            </h2>
            <p class="font-label text-[0.66rem] uppercase tracking-[0.07em] text-[var(--text-muted)]">
              {levelTitle || "Objective Sync Active"}
            </p>
          </div>
        </div>

        <button
          class="flex h-8 w-8 cursor-pointer items-center justify-center border border-transparent bg-transparent text-[var(--text-muted)] transition-all duration-200 hover:border-[rgba(255,56,96,0.28)] hover:bg-[rgba(255,56,96,0.12)] hover:text-[var(--danger)]"
          on:click={closeCard}
          aria-label="Close mission briefing"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Content -->
      <div class="relative flex-1 overflow-y-auto px-5 py-4">
        {#if totalCount > 0}
          <div class="mb-4 border border-[rgba(7,165,201,0.3)] bg-[var(--surface)] p-2.5">
            <div class="mb-1.5 flex items-center justify-between">
              <span class="font-label text-[0.62rem] uppercase tracking-[0.09em] text-[var(--accent)]">Mission Progress</span>
              <span class="font-label text-[0.66rem] text-[var(--text-muted)]">{progressPercent.toFixed(0)}% synced</span>
            </div>
            <div class="xp-track">
              <div class="xp-fill" style="width: {progressPercent}%"></div>
            </div>
            <p class="mt-1.5 font-label text-[0.62rem] text-[var(--text-muted)]">{completedCount}/{totalCount} objectives completed</p>
          </div>
        {/if}

        {#if levelDescription}
          <div class="mb-4">
            <h3 class="font-label text-[0.64rem] uppercase tracking-[0.09em] text-[var(--accent)]">Intel</h3>
            <div class="mt-1.5 border border-[var(--card-border)] bg-[var(--surface)] p-3">
              <p class="font-body text-[0.85rem] leading-relaxed text-[var(--text-primary)]">
                {levelDescription}
              </p>
            </div>
          </div>
        {/if}

        {#if tasks && tasks.length > 0}
          <div>
            <div class="mb-2.5 flex items-center justify-between">
              <h3 class="font-label text-[0.64rem] uppercase tracking-[0.09em] text-[var(--accent)]">Objectives</h3>
              <span class="tag-cyber tag-purple text-[0.58rem]">XP +{totalCount * 40}</span>
            </div>

            <ul class="space-y-2">
              {#each tasks as task, index}
                <li
                  class="objective-row flex items-center gap-2.5 border border-[var(--card-border)] bg-[var(--surface)] p-2.5 transition-all duration-200"
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
                    <p class="font-body text-[0.82rem] leading-snug text-[var(--text-primary)]" class:task-done={task.completed}>
                      <span class="mr-1.5 font-label text-[0.64rem] text-[var(--text-muted)]">[{index + 1}]</span>{task.text}
                    </p>
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        <div class="mt-4 flex justify-center">
          <button on:click={closeCard} class="btn-cyber btn-cyber-solid mission-btn group inline-flex cursor-pointer items-center gap-1.5 !px-5 !py-3 !text-[0.8rem]">
            <span>Deploy Into Workspace</span>
            <Play class="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-card {
    opacity: 0;
    transform: translateY(12px) scale(0.985);
    transition: all 0.35s ease;
    border-radius: 4px;
    box-shadow:
      0 0 0 1px rgba(7, 165, 201, 0.07),
      0 0 40px rgba(7, 165, 201, 0.12),
      0 24px 48px rgba(0, 0, 0, 0.55);
  }

  .modal-card-glow {
    position: absolute;
    inset: -1px;
    border-radius: 5px;
    background: linear-gradient(135deg, rgba(7, 165, 201, 0.3), transparent 60%, rgba(7, 165, 201, 0.18));
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

  .ring-pulse::after {
    content: "";
    position: absolute;
    inset: -4px;
    border: 1px solid rgba(7, 165, 201, 0.4);
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
    background: rgba(7, 165, 201, 0.08);
  }

  .objective-row:hover::before {
    background: var(--accent);
  }

  .objective-row.is-active {
    border-color: rgba(7, 165, 201, 0.72);
    background: rgba(7, 165, 201, 0.14);
    box-shadow:
      0 0 0 1px rgba(7, 165, 201, 0.2),
      0 0 16px rgba(7, 165, 201, 0.24);
    animation: active-step-pulse 1.6s ease-in-out infinite;
  }

  .objective-row.is-active::before {
    background: var(--accent);
  }

  .objective-row.is-completed {
    border-color: rgba(0, 229, 160, 0.35);
    background: rgba(0, 229, 160, 0.08);
  }

  .objective-row.is-completed::before {
    background: var(--success);
  }

  .task-done {
    color: var(--text-muted);
    text-decoration: line-through;
    text-decoration-color: rgba(0, 229, 160, 0.45);
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
        0 0 0 1px rgba(7, 165, 201, 0.2),
        0 0 14px rgba(7, 165, 201, 0.22);
    }

    50% {
      box-shadow:
        0 0 0 1px rgba(7, 165, 201, 0.35),
        0 0 24px rgba(7, 165, 201, 0.3);
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

  @keyframes hud-drift {
    0% {
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 0.45;
    }

    100% {
      transform: translate3d(-8px, 6px, 0) scale(1.03);
      opacity: 0.62;
    }
  }

  @keyframes orb-float {
    0% {
      transform: translate3d(0, 0, 0);
    }

    100% {
      transform: translate3d(22px, -20px, 0);
    }
  }
</style>