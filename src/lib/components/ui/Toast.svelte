<script lang="ts">
  import { toast, type Toast } from '$lib/stores/toast';
  import { fly, fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-svelte';

  const variantMeta = {
    error:   { label: 'ERROR',   color: '#FF3860', glow: 'rgba(255,56,96,0.30)',   bg: 'rgba(255,56,96,0.08)',   Icon: XCircle       },
    warn:    { label: 'WARNING', color: '#FFB400', glow: 'rgba(255,180,0,0.30)',    bg: 'rgba(255,180,0,0.08)',   Icon: AlertTriangle  },
    success: { label: 'SUCCESS', color: '#00E5A0', glow: 'rgba(0,229,160,0.30)',    bg: 'rgba(0,229,160,0.08)',   Icon: CheckCircle    },
    info:    { label: 'INFO',    color: '#07A5C9', glow: 'rgba(7,165,201,0.30)',    bg: 'rgba(7,165,201,0.08)',   Icon: Info           },
  } as const;

  function meta(t: Toast) { return variantMeta[t.variant]; }
</script>

<!-- Portal: fixed stack at bottom-right -->
<div class="toast-portal" aria-live="assertive" aria-atomic="false">
  {#each $toast as t (t.id)}
    <div
      class="toast"
      animate:flip={{ duration: 250 }}
      in:fly={{ x: 60, duration: 320, opacity: 0 }}
      out:fade={{ duration: 200 }}
      style="
        --c: {meta(t).color};
        --glow: {meta(t).glow};
        --bg: {meta(t).bg};
        --duration: {t.duration ?? 4000}ms;
      "
      role="alert"
    >
      <!-- Shimmer bar (top) -->
      <div class="toast-shimmer"></div>

      <!-- Left accent strip -->
      <div class="toast-strip"></div>

      <!-- Body -->
      <div class="toast-body">
        <!-- Icon -->
        <div class="toast-icon">
          <svelte:component this={meta(t).Icon} size={18} />
        </div>

        <!-- Text -->
        <div class="toast-text">
          <span class="toast-label">{meta(t).label}</span>
          <span class="toast-message">{t.message}</span>
        </div>
      </div>

      <!-- Dismiss button -->
      <button class="toast-close" on:click={() => toast.remove(t.id)} aria-label="Dismiss">
        <X size={13} />
      </button>

      <!-- Auto-dismiss progress bar -->
      {#if t.duration && t.duration > 0}
        <div class="toast-progress">
          <div class="toast-progress-fill"></div>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  /* ── Portal ── */
  .toast-portal {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 10100;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    pointer-events: none;
    max-width: 360px;
    width: calc(100vw - 3rem);
  }

  /* ── Toast wrapper ── */
  .toast {
    position: relative;
    pointer-events: auto;
    display: flex;
    align-items: stretch;
    overflow: hidden;

    background: #12192a;
    border: 1px solid var(--c);
    box-shadow:
      0 0 16px var(--glow),
      0 4px 24px rgba(0,0,0,0.6);

    /* cut-corner clip-path (matches design system) */
    clip-path: polygon(
      0 0,
      calc(100% - 10px) 0,
      100% 10px,
      100% 100%,
      10px 100%,
      0 calc(100% - 10px)
    );
  }

  /* Top shimmer */
  .toast-shimmer {
    position: absolute;
    inset: 0 0 auto 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--c), transparent);
    opacity: 0.6;
  }

  /* Left accent strip */
  .toast-strip {
    width: 3px;
    flex-shrink: 0;
    background: var(--c);
    box-shadow: 0 0 8px var(--glow);
  }

  /* Body row */
  .toast-body {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.7rem 0.6rem 0.75rem 0.75rem;
    flex: 1;
    min-width: 0;
  }

  /* Icon */
  .toast-icon {
    flex-shrink: 0;
    color: var(--c);
    filter: drop-shadow(0 0 4px var(--glow));
    margin-top: 1px;
  }

  /* Text column */
  .toast-text {
    display: flex;
    flex-direction: column;
    gap: 0.18rem;
    min-width: 0;
  }

  .toast-label {
    font-family: 'Chakra Petch', monospace;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--c);
  }

  .toast-message {
    font-family: 'Space Mono', monospace;
    font-size: 0.72rem;
    color: #d0d7dd;
    line-height: 1.45;
    word-break: break-word;
  }

  /* Close button */
  .toast-close {
    flex-shrink: 0;
    align-self: flex-start;
    margin: 0.55rem 0.55rem 0 0;
    padding: 0.22rem;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    color: #8892a0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
    clip-path: polygon(
      0 0,
      calc(100% - 4px) 0,
      100% 4px,
      100% 100%,
      4px 100%,
      0 calc(100% - 4px)
    );
  }

  .toast-close:hover {
    color: var(--c);
    border-color: var(--c);
    background: var(--bg);
  }

  /* Progress bar */
  .toast-progress {
    position: absolute;
    bottom: 0;
    left: 3px; /* align after strip */
    right: 0;
    height: 2px;
    background: rgba(255,255,255,0.06);
  }

  .toast-progress-fill {
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, var(--c), rgba(0,245,255,0.8));
    box-shadow: 0 0 6px var(--glow);
    transform-origin: left;
    animation: progress-shrink var(--duration) linear forwards;
  }

  @keyframes progress-shrink {
    from { transform: scaleX(1); }
    to   { transform: scaleX(0); }
  }
</style>
