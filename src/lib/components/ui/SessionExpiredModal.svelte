<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Lock } from 'lucide-svelte';

  export let open: boolean = false;

  const dispatch = createEventDispatcher<{
    confirm: void;
  }>();

  function handleConfirm() {
    dispatch('confirm');
  }

  function handleBackdropClick(e: MouseEvent) {
    // Do nothing — modal is not dismissible via backdrop
    e.stopPropagation();
  }

  function handleKeydown(e: KeyboardEvent) {
    // Prevent Escape from closing the modal
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }
  }
</script>

{#if open}
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div
    class="sem-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="sem-title"
    tabindex="-1"
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
  >
    <div class="sem-card">
      <div class="sem-card-glow" aria-hidden="true"></div>

      <div class="sem-header">
        <div class="sem-icon-badge">
          <Lock class="sem-icon" />
        </div>
        <h2 id="sem-title" class="sem-title">Session Expired</h2>
        <p class="sem-subtitle">Your session has expired or is no longer valid</p>
      </div>

      <p class="sem-description">
        Your session has expired or been invalidated. You need to sign in again to continue.
      </p>

      <div class="sem-action-row">
        <button
          type="button"
          class="sem-btn-confirm"
          on:click={handleConfirm}
        >
          Go to Login
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .sem-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .sem-card {
    position: relative;
    width: min(440px, 100%);
    background: var(--bg-light, #12192a);
    border: 1px solid var(--card-border, rgba(7, 165, 201, 0.15));
    border-radius: 6px;
    padding: 2.25rem 2.5rem;
    box-shadow:
      0 0 0 1px rgba(7, 165, 201, 0.07),
      0 0 40px rgba(7, 165, 201, 0.12),
      0 24px 60px rgba(0, 0, 0, 0.55);
  }

  .sem-card-glow {
    position: absolute;
    inset: -1px;
    border-radius: 7px;
    background: linear-gradient(135deg, rgba(7, 165, 201, 0.30), transparent 55%, rgba(99, 102, 241, 0.18));
    z-index: -1;
    pointer-events: none;
    animation: sem-glow-pulse 3s ease-in-out infinite alternate;
  }
  @keyframes sem-glow-pulse {
    from { opacity: 0.35; }
    to   { opacity: 1; }
  }

  .sem-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .sem-icon-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3.2rem;
    height: 3.2rem;
    background: rgba(255, 180, 0, 0.1);
    border: 1px solid rgba(255, 180, 0, 0.3);
    border-radius: 50%;
    margin-bottom: 0.75rem;
  }

  :global(.sem-icon) {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--warn, #ffb400);
    filter: drop-shadow(0 0 6px rgba(255, 180, 0, 0.6));
  }

  .sem-title {
    margin: 0.45rem 0 0.3rem;
    font-family: var(--font-head, 'Chakra Petch', sans-serif);
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    color: var(--text-primary, #d0d7dd);
  }

  .sem-subtitle {
    margin: 0;
    font-family: var(--font-mono, 'Space Mono', monospace);
    font-size: 0.82rem;
    line-height: 1.6;
    color: rgba(7, 165, 201, 0.7);
  }

  .sem-description {
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 1rem;
    color: rgba(208, 215, 221, 0.75);
    margin: 0 0 1.5rem;
    line-height: 1.6;
    text-align: center;
  }

  .sem-action-row {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }

  .sem-btn-confirm {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 2rem;
    font-family: var(--font-head, 'Chakra Petch', sans-serif);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: transparent;
    clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px));
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.1s;
    color: var(--warn, #ffb400);
    border: 1px solid rgba(255, 180, 0, 0.55);
  }
  .sem-btn-confirm:hover {
    border-color: rgba(255, 180, 0, 0.90);
    background: rgba(255, 180, 0, 0.10);
    box-shadow: 0 0 16px rgba(255, 180, 0, 0.25);
  }
  .sem-btn-confirm:active {
    transform: scale(0.97);
  }

  @media (max-height: 760px) {
    .sem-backdrop {
      padding: 0.75rem;
    }
    .sem-card {
      padding: 1.5rem 1.25rem;
    }
  }
</style>
