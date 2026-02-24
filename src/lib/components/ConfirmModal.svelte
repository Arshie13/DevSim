<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // ── Props ──────────────────────────────────────────────────────────────────

  /** Controls visibility. Bind this to toggle the modal from the parent. */
  export let open: boolean = false;

  /** Modal heading. */
  export let title: string = 'Are you sure?';

  /**
   * Optional subtitle shown below the title.
   * If you need richer content, use the default slot instead.
   */
  export let description: string = '';

  /** Label for the confirm button. */
  export let confirmLabel: string = 'Confirm';

  /** Label for the cancel button. */
  export let cancelLabel: string = 'Cancel';

  /**
   * Visual style for the confirm button.
   * - "primary"  → brand blue  (#07a5c9)
   * - "danger"   → red         (bg-red-600)
   * - "warning"  → amber       (bg-amber-500)
   * - "success"  → green       (bg-green-600)
   */
  export let variant: 'primary' | 'danger' | 'warning' | 'success' = 'primary';

  /**
   * When true the confirm button is replaced with a loading spinner.
   * The cancel button is also disabled.
   */
  export let isLoading: boolean = false;

  /** Text shown next to the spinner while loading. */
  export let loadingLabel: string = 'Loading…';

  /**
   * When non-empty an error banner is rendered above the action buttons.
   * Clear this string to hide the banner.
   */
  export let error: string = '';

  /**
   * When true the default body + action row are hidden and the `success`
   * named slot is rendered instead. The parent controls this flag after a
   * successful async operation.
   */
  export let showSuccess: boolean = false;

  // ── Events ─────────────────────────────────────────────────────────────────

  const dispatch = createEventDispatcher<{
    /** Fired when the user clicks the confirm button. */
    confirm: void;
    /** Fired when the user clicks Cancel or the backdrop. */
    cancel: void;
  }>();

  // ── Internal helpers ───────────────────────────────────────────────────────

  // Map variant → Tailwind class for the confirm button
  const variantClass: Record<typeof variant, string> = {
    primary: 'bg-[#07a5c9] hover:bg-[#07a5c9]/80',
    danger:  'bg-red-600 hover:bg-red-500',
    warning: 'bg-amber-500 hover:bg-amber-400',
    success: 'bg-green-600 hover:bg-green-500',
  };

  function handleCancel() {
    if (isLoading) return;
    dispatch('cancel');
    open = false;
  }

  function handleConfirm() {
    dispatch('confirm');
  }

  // Close on backdrop click
  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) handleCancel();
  }

  // Close on Escape key
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') handleCancel();
  }
</script>

<!-- Only render when open -->
{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-modal-title"
    tabindex="-1"
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
  >
    <!-- Panel -->
    <div class="bg-[#12192a] border border-[#27272a] rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">

      {#if showSuccess}
        <!-- ──────────────────────────────────────────────────────────────────
             SUCCESS STATE
             Parents drop whatever they like into <slot name="success">.
             A sensible fallback is included so the modal is usable without it.
        ──────────────────────────────────────────────────────────────────── -->
        <slot name="success">
          <!-- Default success content -->
          <div class="text-center py-4">
            <p class="text-4xl mb-3">✅</p>
            <h2 class="text-xl font-bold text-white mb-1">Done!</h2>
            <p class="text-sm text-[#d0d7dd]/60">The action completed successfully.</p>
          </div>
        </slot>

      {:else}
        <!-- ──────────────────────────────────────────────────────────────────
             CONFIRMATION STATE
        ──────────────────────────────────────────────────────────────────── -->

        <!-- Title -->
        <h2 id="confirm-modal-title" class="text-lg font-bold text-white mb-2">
          {title}
        </h2>

        <!-- Optional description -->
        {#if description}
          <p class="text-sm text-[#d0d7dd]/60 mb-4">{@html description}</p>
        {/if}

        <!-- Custom body content (task lists, previews, costs, etc.) -->
        <slot />

        <!-- Error banner -->
        {#if error}
          <p class="text-red-400 text-sm mt-4 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
            {error}
          </p>
        {/if}

        <!-- Action row -->
        <div class="flex gap-3 justify-end mt-6">
          <!-- Cancel -->
          <button
            type="button"
            on:click={handleCancel}
            disabled={isLoading}
            class="px-4 py-2 rounded-lg text-sm font-semibold text-[#d0d7dd]/70
                   hover:bg-[#2d3446] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>

          <!-- Confirm -->
          <button
            type="button"
            on:click={handleConfirm}
            disabled={isLoading}
            class="px-4 py-2 rounded-lg text-sm font-semibold transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-2 text-white
                   {variantClass[variant]}"
          >
            {#if isLoading}
              <!-- Spinner -->
              <span
                class="w-4 h-4 border-2 border-white/30 border-t-white
                       rounded-full animate-spin inline-block"
              ></span>
              {loadingLabel}
            {:else}
              {confirmLabel}
            {/if}
          </button>
        </div>

      {/if}
    </div>
  </div>
{/if}
