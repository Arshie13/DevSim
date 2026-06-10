<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // ── Props ──────────────────────────────────────────────────────────────────

  let {
    /** Controls visibility. Bind this to toggle the modal from the parent. */
    open = $bindable(false),
    /** Decorative icon shown above the title (emoji or symbol). */
    icon = '⟨/⟩',
    iconVariant = 'accent' as 'accent' | 'danger' | 'warning' | 'success',
    /** Modal heading — rendered in Orbitron. */
    title = 'Are you sure?',
    subtitle = '',
    description = '',
    /** Label for the confirm button. */
    confirmLabel = 'Confirm',
    /** Label for the cancel button. */
    cancelLabel = 'Cancel',
    variant = 'primary' as 'primary' | 'danger' | 'warning' | 'success',
    isLoading = false,
    /** Text shown next to the spinner while loading. */
    loadingLabel = 'Loading…',
    error = '',
    showSuccess = false,
    /**
     * When true the Cancel + Confirm action row is hidden.
     * Useful when the body slot already contains its own progress UI (e.g. LoadingSteps).
     */
    hideActions = false,
    /**
     * When true the modal header (icon/title/subtitle) is hidden.
     * Useful when slot content already renders its own heading.
     */
    hideHeader = false,
    /**
     * When true, clicking the backdrop will close the modal.
     * Set to false to prevent closing when clicking outside.
     */
    closeOnBackdropClick = true,
    /** Optional data-tour attribute forwarded to the backdrop element for tutorial spotlight targeting. */
    tourId = undefined as string | undefined,
  } = $props();

  // ── Events ─────────────────────────────────────────────────────────────────

  const dispatch = createEventDispatcher<{
    /** Fired when the user clicks the confirm button. */
    confirm: void;
    /** Fired when the user clicks Cancel or the backdrop. */
    cancel: void;
  }>();

  // ── Derived ────────────────────────────────────────────────────────────────

  const iconGlowClass: Record<string, string> = {
    accent:  'icon--accent',
    danger:  'icon--danger',
    warning: 'icon--warning',
    success: 'icon--success',
  };

  const confirmBtnClass: Record<string, string> = {
    primary: 'cm-btn-confirm--primary',
    danger:  'cm-btn-confirm--danger',
    warning: 'cm-btn-confirm--warning',
    success: 'cm-btn-confirm--success',
  };

  let confirmButtonTour = $derived(
    confirmLabel === 'Submit & Continue'
      ? 'submit-sprint-confirm-button'
      : confirmLabel === 'Proceed to Workspace'
        ? 'tutorial-proceed-button'
        : undefined,
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleCancel() {
    if (isLoading) return;
    dispatch('cancel');
    open = false;
  }

  function handleConfirm() {
    dispatch('confirm');
  }

  function handleBackdropClick(e: MouseEvent) {
    if (closeOnBackdropClick && e.target === e.currentTarget) handleCancel();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') handleCancel();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div
    class="cm-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cm-title"
    tabindex="-1"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    data-tour={tourId}
  >
    <div class="cm-card ds-scrollbar">
      <!-- Animated gradient border glow -->
      <div class="cm-card-glow" aria-hidden="true"></div>

      {#if showSuccess}
        <slot name="success">
          <div class="cm-success-wrap">
            <div class="cm-success-burst" aria-hidden="true">✅</div>
            <h2 class="cm-success-title">Done!</h2>
            <p class="cm-success-sub">The action completed successfully.</p>
          </div>
        </slot>

      {:else}
        {#if !hideHeader && title}
          <div class="cm-header">
            {#if icon}
              <span class="cm-icon {iconGlowClass[iconVariant]}" aria-hidden="true">{icon}</span>
            {/if}
            <h2 id="cm-title" class="cm-title">{title}</h2>
            {#if subtitle}
              <p class="cm-subtitle">{subtitle}</p>
            {/if}
          </div>
        {/if}

        {#if description}
          <p class="cm-description">{@html description}</p>
        {/if}

        <slot />

        {#if error}
          <div class="cm-error-box">
            <span>⚠ {error}</span>
          </div>
        {/if}

        {#if !hideActions}
          <div class="cm-action-row">
            <button
              type="button"
              class="cm-btn-cancel"
              onclick={handleCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              data-tour={confirmButtonTour}
              class="cm-btn-confirm {confirmBtnClass[variant]}"
              onclick={handleConfirm}
              disabled={isLoading}
            >
              {#if isLoading}
                <span class="cm-spinner" aria-hidden="true"></span>
                {loadingLabel}
              {:else}
                {confirmLabel}
              {/if}
            </button>
          </div>
        {/if}
      {/if}
    </div>
  </div>
{/if}

<style>
  /* ── Backdrop ─────────────────────────────────────────────────────────── */
  .cm-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: rgba(0, 0, 0, 0.78);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  /* ── Card ─────────────────────────────────────────────────────────────── */
  .cm-card {
    position: relative;
    width: min(480px, 100%);
    max-height: min(92vh, 820px);
    overflow-y: auto;
    background: var(--bg-light, #12192a);
    border: 1px solid var(--card-border, rgba(7, 165, 201, 0.15));
    border-radius: 6px; /* sharp corners per design guide */
    padding: 2rem 2.25rem;
    box-shadow:
      0 0 0 1px rgba(7, 165, 201, 0.07),
      0 0 40px rgba(7, 165, 201, 0.12),
      0 24px 60px rgba(0, 0, 0, 0.55);
  }

  /* Shared custom scrollbar styling on modal shell (single scrollbar source). */
  .ds-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(136, 146, 160, 0.3) rgba(10, 14, 26, 0.6);
  }

  .ds-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .ds-scrollbar::-webkit-scrollbar-track {
    background: rgba(10, 14, 26, 0.6);
    border-radius: 4px;
    margin: 4px 0;
  }

  .ds-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(136, 146, 160, 0.3);
    border-radius: 4px;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 1px 3px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }

  .ds-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(7, 165, 201, 0.6);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 0 10px rgba(7, 165, 201, 0.4);
  }

  .ds-scrollbar:hover::-webkit-scrollbar-thumb {
    background: rgba(136, 146, 160, 0.45);
  }

  /* Animated gradient border overlay */
  .cm-card-glow {
    position: absolute;
    inset: -1px;
    border-radius: 7px;
    background: linear-gradient(135deg, rgba(7, 165, 201, 0.30), transparent 55%, rgba(99, 102, 241, 0.18));
    z-index: -1;
    pointer-events: none;
    animation: cm-glow-pulse 3s ease-in-out infinite alternate;
  }
  @keyframes cm-glow-pulse {
    from { opacity: 0.35; }
    to   { opacity: 1; }
  }

  /* ── Header ───────────────────────────────────────────────────────────── */
  .cm-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .cm-icon {
    display: inline-block;
    font-size: 1.9rem;
    line-height: 1;
    animation: cm-icon-pulse 2.5s ease-in-out infinite alternate;
  }
  .cm-icon.icon--accent  { color: var(--accent, #07a5c9);  filter: drop-shadow(0 0 8px var(--accent, #07a5c9)); }
  .cm-icon.icon--danger  { color: var(--danger, #ff3860);  filter: drop-shadow(0 0 8px var(--danger, #ff3860)); }
  .cm-icon.icon--warning { color: var(--warn, #ffb400);    filter: drop-shadow(0 0 8px var(--warn, #ffb400)); }
  .cm-icon.icon--success { color: var(--success, #00e5a0); filter: drop-shadow(0 0 8px var(--success, #00e5a0)); }
  @keyframes cm-icon-pulse {
    from { filter: drop-shadow(0 0 4px currentColor); }
    to   { filter: drop-shadow(0 0 14px currentColor); }
  }

  .cm-title {
    margin: 0.45rem 0 0.3rem;
    font-family: var(--font-head, 'Chakra Petch', sans-serif);
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    color: var(--text-primary, #d0d7dd);
  }

  .cm-subtitle {
    margin: 0;
    font-family: var(--font-mono, 'Space Mono', monospace);
    font-size: 0.82rem;
    line-height: 1.6;
    color: rgba(7, 165, 201, 0.7);
  }

  /* ── Description ──────────────────────────────────────────────────────── */
  .cm-description {
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 1rem;
    color: rgba(208, 215, 221, 0.75);
    margin: 0 0 1.25rem;
    line-height: 1.6;
  }

  /* ── Error box ────────────────────────────────────────────────────────── */
  .cm-error-box {
    margin: 0.75rem 0 1.25rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 56, 96, 0.07);
    border: 1px solid rgba(255, 56, 96, 0.35);
    border-radius: 4px;
    color: #fca5a5;
    font-family: var(--font-mono, 'Space Mono', monospace);
    font-size: 0.82rem;
    line-height: 1.5;
  }

  /* ── Action row ───────────────────────────────────────────────────────── */
  .cm-action-row {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
    position: sticky;
    bottom: -2rem;
    padding-top: 0.9rem;
    background: linear-gradient(
      to top,
      rgba(18, 25, 42, 0.98) 70%,
      rgba(18, 25, 42, 0)
    );
  }

  /* Cancel button */
  .cm-btn-cancel {
    position: relative;
    padding: 0.6rem 1.25rem;
    font-family: var(--font-head, 'Chakra Petch', sans-serif);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted, #8892a0);
    background: transparent;
    border: 1px solid rgba(40, 55, 80, 0.9);
    clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px));
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background 0.2s;
  }
  .cm-btn-cancel:hover:not(:disabled) {
    color: var(--text-primary, #d0d7dd);
    border-color: rgba(7, 165, 201, 0.25);
    background: rgba(7, 165, 201, 0.06);
  }
  .cm-btn-cancel:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Confirm button base */
  .cm-btn-confirm {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 1.5rem;
    font-family: var(--font-head, 'Chakra Petch', sans-serif);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: transparent;
    clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px));
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.1s;
  }
  .cm-btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
  .cm-btn-confirm:not(:disabled):active { transform: scale(0.97); }

  /* Confirm variants */
  .cm-btn-confirm--primary {
    color: var(--accent, #07a5c9);
    border: 1px solid rgba(7, 165, 201, 0.55);
  }
  .cm-btn-confirm--primary:hover:not(:disabled) {
    border-color: rgba(7, 165, 201, 0.90);
    background: rgba(7, 165, 201, 0.10);
    box-shadow: 0 0 16px rgba(7, 165, 201, 0.25);
  }
  .cm-btn-confirm--danger {
    color: var(--danger, #ff3860);
    border: 1px solid rgba(255, 56, 96, 0.55);
  }
  .cm-btn-confirm--danger:hover:not(:disabled) {
    border-color: rgba(255, 56, 96, 0.90);
    background: rgba(255, 56, 96, 0.10);
    box-shadow: 0 0 16px rgba(255, 56, 96, 0.25);
  }
  .cm-btn-confirm--warning {
    color: var(--warn, #ffb400);
    border: 1px solid rgba(255, 180, 0, 0.55);
  }
  .cm-btn-confirm--warning:hover:not(:disabled) {
    border-color: rgba(255, 180, 0, 0.90);
    background: rgba(255, 180, 0, 0.10);
    box-shadow: 0 0 16px rgba(255, 180, 0, 0.25);
  }
  .cm-btn-confirm--success {
    color: var(--success, #00e5a0);
    border: 1px solid rgba(0, 229, 160, 0.55);
  }
  .cm-btn-confirm--success:hover:not(:disabled) {
    border-color: rgba(0, 229, 160, 0.90);
    background: rgba(0, 229, 160, 0.10);
    box-shadow: 0 0 16px rgba(0, 229, 160, 0.25);
  }

  /* Spinner inside button */
  .cm-spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255, 255, 255, 0.25);
    border-top-color: #fff;
    border-radius: 50%;
    animation: cm-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes cm-spin { to { transform: rotate(360deg); } }

  /* ── Default success wrap (slot fallback) ─────────────────────────────── */
  .cm-success-wrap {
    text-align: center;
    padding: 0.75rem 0;
  }
  .cm-success-burst {
    font-size: 3rem;
    animation: cm-burst-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes cm-burst-pop {
    from { transform: scale(0.3); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  .cm-success-title {
    margin: 0.6rem 0 0.3rem;
    font-family: var(--font-head, 'Chakra Petch', sans-serif);
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--text-primary, #d0d7dd);
  }
  .cm-success-sub {
    font-family: var(--font-mono, 'Space Mono', monospace);
    font-size: 0.85rem;
    color: var(--text-muted, #8892a0);
    margin: 0;
  }

  @media (max-height: 760px) {
    .cm-backdrop {
      align-items: center;
      padding: 0.75rem;
    }

    .cm-card {
      max-height: 96vh;
      padding: 1.15rem 1rem;
    }

    .cm-header {
      margin-bottom: 1rem;
    }

    .cm-action-row {
      bottom: -1.15rem;
      margin-top: 1rem;
    }
  }
</style>
