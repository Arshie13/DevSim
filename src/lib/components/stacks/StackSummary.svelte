<script lang="ts">
  import type { StackSelection, TechOption } from "$types";
  import {
    FRONTEND_OPTIONS,
    BACKEND_OPTIONS,
    DATABASE_OPTIONS,
    SERVICES_OPTIONS,
  } from "$mocks";
  import { Rocket, X, Zap, Loader, Sparkles, ChevronRight, Shield } from "lucide-svelte";
  import StackDescriptionModal from "./StackDescriptionModal.svelte";

  export let selection: StackSelection;
  export let onClear: (category: keyof StackSelection) => void;
  export let onStart: () => Promise<void>;

  let isLoading = false;
  let showSummaryModal = false;
  let showDescriptionModal = false;
  let stackDescription = "";
  let isGeneratingDescription = false;

  async function generateStackDescription() {
    try {
      const response = await fetch('/api/ai/stack-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selection }),
      });
      const data = await response.json();
      if (data.success) {
        stackDescription = data.description;
      } else {
        stackDescription = "Unable to generate description at this time.";
      }
    } catch {
      stackDescription = "Unable to generate description at this time.";
    }
  }

  async function handleStart() {
    if (isLoading || !hasValidStack) return;
    isLoading = true;
    try {
      await onStart();
    } finally {
      isLoading = false;
    }
  }

  async function handleShowInfo() {
    showDescriptionModal = true;
    isGeneratingDescription = true;
    try {
      await generateStackDescription();
    } finally {
      isGeneratingDescription = false;
    }
  }

  function handleCloseSummary() {
    showSummaryModal = false;
  }

  function getOption(options: TechOption[], id: string | null): TechOption | null {
    if (!id) return null;
    return options.find((o) => o.id === id) || null;
  }

  $: frontendOption = getOption(FRONTEND_OPTIONS, selection.frontend);
  $: backendOption  = getOption(BACKEND_OPTIONS,  selection.backend);
  $: databaseOption = getOption(DATABASE_OPTIONS, selection.database);
  $: servicesOption = getOption(SERVICES_OPTIONS, selection.services);

  $: selectedCount = [
    selection.frontend, selection.backend, selection.database, selection.services,
  ].filter(Boolean).length;

  $: hasValidStack = selectedCount >= 2;

  $: xpMultiplier =
    selectedCount === 4 ? 2.0 :
    selectedCount === 3 ? 1.5 :
    selectedCount === 2 ? 1.25 : 1.0;
</script>

<!-- ══ FLOATING TRIGGER ══ -->
{#if selectedCount > 0 && !showSummaryModal}
  <button
    class="fab"
    on:click={() => (showSummaryModal = true)}
    aria-label="Open stack summary"
  >
    <div class="fab-glow"></div>
    <div class="fab-inner">
      <Shield class="w-4 h-4" style="color:#07a5c9;" />
      <span class="fab-text">YOUR STACK</span>
      <span class="fab-count">{selectedCount}/4</span>
      <ChevronRight class="w-3 h-3" style="color:rgba(208,215,221,0.40);" />
    </div>
  </button>
{/if}

<!-- ══ SUMMARY MODAL ══ -->
{#if showSummaryModal}
  <div class="modal-overlay" role="button" tabindex="0" aria-label="Close stack summary" on:click={handleCloseSummary} on:keydown={(e) => e.key === 'Escape' && handleCloseSummary()}>
    <div class="modal-box" on:click|stopPropagation>
      <div class="modal-scanlines" aria-hidden="true"></div>
      <div class="modal-shimmer"></div>

      <!-- Header -->
      <div class="modal-header">
        <button class="close-btn" on:click={handleCloseSummary}>
          <X class="w-4 h-4" />
        </button>

        <div class="flex items-center gap-2 mb-2">
          <Shield class="w-4 h-4" style="color:#07a5c9;" />
          <h2 class="modal-title">Your Stack</h2>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          {#if selectedCount > 0}
            <div class="xp-badge">
              <Zap class="w-3 h-3" style="color:#ffb400;" />
              <span>{xpMultiplier}x XP</span>
            </div>
          {/if}
          <span class="count-tag">{selectedCount}/4</span>
        </div>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <!-- Selected pills -->
        <div class="pills-wrap">
          {#if frontendOption}
            <div class="stack-pill">
              <span class="text-sm">{frontendOption.icon}</span>
              <span class="pill-name">{frontendOption.name}</span>
              <button class="pill-clear" on:click={() => onClear("frontend")}>
                <X class="w-3 h-3" />
              </button>
            </div>
          {:else}
            <div class="stack-pill stack-pill--empty"><span class="pill-empty-label">Frontend</span></div>
          {/if}

          <span class="arrow">→</span>

          {#if backendOption}
            <div class="stack-pill">
              <span class="text-sm">{backendOption.icon}</span>
              <span class="pill-name">{backendOption.name}</span>
              <button class="pill-clear" on:click={() => onClear("backend")}>
                <X class="w-3 h-3" />
              </button>
            </div>
          {:else}
            <div class="stack-pill stack-pill--empty"><span class="pill-empty-label">Backend</span></div>
          {/if}

          <span class="arrow">→</span>

          {#if databaseOption}
            <div class="stack-pill">
              <span class="text-sm">{databaseOption.icon}</span>
              <span class="pill-name">{databaseOption.name}</span>
              <button class="pill-clear" on:click={() => onClear("database")}>
                <X class="w-3 h-3" />
              </button>
            </div>
          {:else}
            <div class="stack-pill stack-pill--empty"><span class="pill-empty-label">Database</span></div>
          {/if}

          <span class="arrow">→</span>

          {#if servicesOption}
            <div class="stack-pill">
              <span class="text-sm">{servicesOption.icon}</span>
              <span class="pill-name">{servicesOption.name}</span>
              <button class="pill-clear" on:click={() => onClear("services")}>
                <X class="w-3 h-3" />
              </button>
            </div>
          {:else}
            <div class="stack-pill stack-pill--empty"><span class="pill-empty-label">Services</span></div>
          {/if}
        </div>

        <!-- Actions -->
        <div class="actions">
          <button class="btn-ghost flex items-center gap-1.5" on:click={handleShowInfo}>
            <Sparkles class="w-4 h-4" />
            <span>AI Analysis</span>
          </button>

          <button
            on:click={handleStart}
            disabled={!hasValidStack || isLoading}
            class="btn-primary flex items-center gap-1.5 {hasValidStack && !isLoading ? '' : 'btn-primary--disabled'}"
          >
            {#if isLoading}
              <Loader class="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            {:else}
              <Rocket class="w-4 h-4" />
              <span>{hasValidStack ? 'Launch Scenarios' : `Select ${2 - selectedCount} more`}</span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Stack Description Modal -->
<StackDescriptionModal
  show={showDescriptionModal}
  {selection}
  description={stackDescription}
  isLoading={isGeneratingDescription}
  onClose={() => (showDescriptionModal = false)}
/>

<style>
  /* ══ FLOATING TRIGGER ══ */
  .fab {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 40;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
  }
  .fab-glow {
    position: absolute;
    inset: -4px;
    border-radius: 6px;
    background: rgba(7, 165, 201, 0.15);
    filter: blur(12px);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .fab:hover .fab-glow { opacity: 1; }

  .fab-inner {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 1.1rem;
    background: #12192a;
    border: 1px solid rgba(7, 165, 201, 0.30);
    border-radius: 4px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.35);
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .fab:hover .fab-inner {
    border-color: rgba(7, 165, 201, 0.55);
    box-shadow: 0 8px 32px rgba(7, 165, 201, 0.15);
  }

  .fab-text {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #d0d7dd;
  }
  .fab-count {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.72rem;
    color: #07a5c9;
    padding: 0.05rem 0.35rem;
    background: rgba(7, 165, 201, 0.10);
    border: 1px solid rgba(7, 165, 201, 0.25);
    border-radius: 2px;
  }

  /* ══ MODAL ══ */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.80);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 1rem;
    animation: fadeIn 0.25s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .modal-box {
    position: relative;
    overflow: hidden;
    background: #12192a;
    border: 1px solid rgba(7, 165, 201, 0.30);
    border-radius: 6px;
    max-width: 560px;
    width: 100%;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 60px rgba(7, 165, 201, 0.12), 0 0 120px rgba(0, 0, 0, 0.60);
    animation: boxIn 0.35s cubic-bezier(0.22,0.61,0.36,1);
  }
  @keyframes boxIn {
    from { opacity:0; transform: scale(0.96) translateY(10px); }
    to   { opacity:1; transform: scale(1) translateY(0); }
  }

  .modal-scanlines {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.015) 4px);
    pointer-events: none;
    z-index: 0;
  }
  .modal-shimmer {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #07a5c9, transparent);
    z-index: 1;
  }

  .modal-header {
    position: relative;
    z-index: 2;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(7, 165, 201, 0.12);
    background: rgba(10, 14, 26, 0.40);
  }
  .close-btn {
    position: absolute;
    top: 1rem; right: 1rem;
    width: 32px; height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(208, 215, 221, 0.45);
    background: transparent;
    border: 1px solid rgba(7, 165, 201, 0.25);
    border-radius: 4px;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
  }
  .close-btn:hover {
    color: #ff3860;
    border-color: rgba(255, 56, 96, 0.40);
    background: rgba(255, 56, 96, 0.08);
  }

  .modal-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: #d0d7dd;
    letter-spacing: 0.05em;
  }

  .xp-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.15rem 0.5rem;
    background: rgba(255, 180, 0, 0.10);
    border: 1px solid rgba(255, 180, 0, 0.30);
    border-radius: 2px;
  }
  .xp-badge span {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.72rem;
    font-weight: 700;
    color: #ffb400;
    letter-spacing: 0.06em;
  }
  .count-tag {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.72rem;
    padding: 0.15rem 0.5rem;
    border-radius: 2px;
    color: #07a5c9;
    border: 1px solid rgba(7, 165, 201, 0.35);
    background: rgba(7, 165, 201, 0.08);
  }

  /* Content */
  .modal-content {
    position: relative;
    z-index: 2;
    padding: 1.25rem 1.5rem;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .pills-wrap {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex-wrap: wrap;
  }

  .stack-pill {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.65rem;
    background: rgba(7, 165, 201, 0.08);
    border: 1px solid rgba(7, 165, 201, 0.35);
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(7, 165, 201, 0.08);
  }
  .stack-pill--empty {
    background: transparent;
    border-style: dashed;
    border-color: rgba(208, 215, 221, 0.12);
    opacity: 0.5;
  }
  .pill-name {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.82rem;
    color: #d0d7dd;
    letter-spacing: 0.04em;
  }
  .pill-empty-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.78rem;
    color: rgba(208, 215, 221, 0.40);
  }
  .pill-clear {
    color: rgba(208, 215, 221, 0.40);
    transition: color 0.15s ease;
    line-height: 0;
    background: transparent;
    border: none;
    cursor: pointer;
  }
  .pill-clear:hover { color: #ff3860; }

  .arrow {
    font-family: 'Share Tech Mono', monospace;
    color: rgba(208, 215, 221, 0.25);
    font-size: 0.9rem;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: auto;
    padding-top: 0.25rem;
  }

  .btn-ghost {
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    font-family: 'Orbitron', sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    padding: 0.65rem 1.2rem;
    border: 1px solid #07a5c9;
    color: #07a5c9;
    background: transparent;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  }
  .btn-ghost:hover {
    background: #07a5c9;
    color: #0a0e1a;
    box-shadow: 0 0 20px rgba(7, 165, 201, 0.30);
  }

  .btn-primary {
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    font-family: 'Orbitron', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    padding: 0.65rem 1.2rem;
    background: #07a5c9;
    color: #0a0e1a;
    border: none;
    cursor: pointer;
    transition: background 0.2s ease, box-shadow 0.2s ease;
  }
  .btn-primary:hover {
    background: #00f5ff;
    box-shadow: 0 0 25px rgba(7, 165, 201, 0.40);
  }
  .btn-primary--disabled {
    background: rgba(208, 215, 221, 0.06);
    color: rgba(208, 215, 221, 0.30);
    border: 1px solid rgba(208, 215, 221, 0.10);
    cursor: not-allowed;
  }
  .btn-primary--disabled:hover {
    background: rgba(208, 215, 221, 0.06);
    box-shadow: none;
  }
</style>
