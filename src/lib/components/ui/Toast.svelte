<script lang="ts">
  import { toast, type Toast } from '$lib/stores/toast';
  import { helpTrigger } from '$lib/stores/helpTrigger';
  import { fade, scale } from 'svelte/transition';
  import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-svelte';

  const variantMeta = {
    error:   { label: 'ERROR',   color: '#FF3860', glow: 'rgba(255,56,96,0.30)',   bg: 'rgba(255,56,96,0.08)',   Icon: XCircle       },
    warn:    { label: 'WARNING', color: '#FFB400', glow: 'rgba(255,180,0,0.30)',    bg: 'rgba(255,180,0,0.08)',   Icon: AlertTriangle  },
    success: { label: 'SUCCESS', color: '#00E5A0', glow: 'rgba(0,229,160,0.30)',    bg: 'rgba(0,229,160,0.08)',   Icon: CheckCircle    },
    info:    { label: 'INFO',    color: '#07A5C9', glow: 'rgba(7,165,201,0.30)',    bg: 'rgba(7,165,201,0.08)',   Icon: Info           },
  } as const;

  function meta(t: Toast) { return variantMeta[t.variant]; }

  function handleHelpClick(helpAction: Toast['helpAction']) {
    if (helpAction) {
      helpTrigger.trigger(helpAction.category, '');
    }
  }
</script>

<!-- Portal: centered popup stack -->
<div class="toast-portal" aria-live="assertive" aria-atomic="false">
  {#each $toast as t (t.id)}
    <div
      class="toast-popup"
      in:scale={{ duration: 200, start: 0.9 }}
      out:fade={{ duration: 150 }}
      style="
        --c: {meta(t).color};
        --glow: {meta(t).glow};
        --bg: {meta(t).bg};
        --duration: {t.duration ?? 4000}ms;
      "
      role="alert"
    >
      <!-- Icon header -->
      <div class="toast-icon-header">
        <div class="toast-icon-circle">
          <svelte:component this={meta(t).Icon} size={28} />
        </div>
      </div>

      <!-- Body -->
      <div class="toast-body">
        <div class="toast-text">
          <span class="toast-message">{t.message}</span>
          {#if t.helpAction}
            <button
              class="toast-help-action"
              onclick={() => handleHelpClick(t.helpAction)}
            >
              {t.helpAction.label} →
            </button>
          {/if}
        </div>
      </div>

      <!-- Close button -->
      <button class="toast-close" onclick={() => toast.remove(t.id)} aria-label="Dismiss">
        <X size={14} />
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
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    padding: 1.5rem;
  }

  /* ── Popup wrapper ── */
  .toast-popup {
    position: relative;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
    width: min(260px, 100%);
    background: #12192a;
    border: 1px solid var(--c);
    box-shadow:
      0 0 16px var(--glow),
      0 8px 32px rgba(0,0,0,0.6);
    border-radius: 8px;
  }

  /* Icon header */
  .toast-icon-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem 1rem 0.75rem;
  }

  .toast-icon-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--bg);
    border: 1px solid var(--c);
    color: var(--c);
    filter: drop-shadow(0 0 8px var(--glow));
  }

  /* Body row */
  .toast-body {
    padding: 0 1rem 1rem;
    flex: 1;
    min-width: 0;
    text-align: center;
  }

  /* Text column */
  .toast-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    min-width: 0;
  }

  .toast-message {
    font-family: 'Space Mono', monospace;
    font-size: 0.75rem;
    color: #d0d7dd;
    line-height: 1.5;
    word-break: break-word;
  }

  .toast-help-action {
    font-family: 'Chakra Petch', monospace;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--c);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-top: 0.4rem;
    text-align: center;
    transition: color 0.15s;
  }

  .toast-help-action:hover {
    color: #00f5ff;
  }

  /* Close button */
  .toast-close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.2rem;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    color: #8892a0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
    border-radius: 3px;
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
    left: 0;
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
