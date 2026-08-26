<script lang="ts">
  import { toast, type Toast } from '$lib/stores/toast';
  import { helpTrigger } from '$lib/stores/helpTrigger';
  import { fade, scale } from 'svelte/transition';
  import { X, XCircle, AlertTriangle } from 'lucide-svelte';

  const variantConfig = {
    error: { label: 'ERROR', color: '#FF3860', glow: 'rgba(255,56,96,0.30)', bg: 'rgba(255,56,96,0.08)', Icon: XCircle },
    warn:  { label: 'WARNING', color: '#FFB400', glow: 'rgba(255,180,0,0.30)', bg: 'rgba(255,180,0,0.08)', Icon: AlertTriangle },
  } as const;

  function handleHelpClick(helpAction: Toast['helpAction']) {
    if (helpAction) {
      helpTrigger.trigger(helpAction.category, '');
    }
  }

  $: errorAndWarnToasts = $toast
    .filter(t => t.variant === 'error' || t.variant === 'warn')
    .filter((t, i, arr) => arr.findIndex(ot => ot.variant === t.variant && ot.message === t.message) === i);
  $: latestError = errorAndWarnToasts.length > 0 ? errorAndWarnToasts[errorAndWarnToasts.length - 1] : null;
</script>

<div class="error-popup-portal" aria-live="assertive" aria-atomic="false">
  {#if latestError}
    {@const t = latestError}
    {@const cfg = t.variant === 'error' ? variantConfig.error : variantConfig.warn}
      <div
        class="error-popup"
        in:scale={{ duration: 200, start: 0.9 }}
        out:fade={{ duration: 150 }}
        style="
          --c: {cfg.color};
          --glow: {cfg.glow};
          --bg: {cfg.bg};
          --duration: {t.duration ?? 4000}ms;
        "
        role="alert"
      >
        <div class="ep-icon-header">
          <div class="ep-icon-circle">
            <svelte:component this={cfg.Icon} size={28} />
          </div>
        </div>

        <div class="ep-body">
          <div class="ep-text">
            <span class="ep-label">{cfg.label}</span>
            <span class="ep-message">{t.message}</span>
            {#if t.helpAction}
              <button
                class="ep-help-action"
                onclick={() => handleHelpClick(t.helpAction)}
              >
                {t.helpAction.label} →
              </button>
            {/if}
          </div>
        </div>

        <button class="ep-close" onclick={() => toast.remove(t.id)} aria-label="Dismiss">
          <X size={14} />
        </button>

        {#if t.duration && t.duration > 0}
          <div class="ep-progress">
            <div class="ep-progress-fill"></div>
          </div>
        {/if}
        </div>
    {/if}
  </div>

<style>
  .error-popup-portal {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    pointer-events: none;
    width: min(420px, calc(100% - 2rem));
    margin: 0 auto;
  }

  .error-popup {
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

  .ep-icon-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem 1rem 0.75rem;
  }

  .ep-icon-circle {
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

  .ep-body {
    padding: 0 1rem 1rem;
    flex: 1;
    min-width: 0;
    text-align: center;
  }

  .ep-text {
    display: flex;
    flex-direction: column;
    gap: 0.18rem;
    min-width: 0;
  }

  .ep-label {
    font-family: 'Chakra Petch', monospace;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--c);
  }

  .ep-message {
    font-family: 'Space Mono', monospace;
    font-size: 0.72rem;
    color: #d0d7dd;
    line-height: 1.45;
    word-break: break-word;
  }

  .ep-help-action {
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

  .ep-help-action:hover {
    color: #00f5ff;
  }

  .ep-close {
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

  .ep-close:hover {
    color: var(--c);
    border-color: var(--c);
    background: var(--bg);
  }

  .ep-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: rgba(255,255,255,0.06);
  }

  .ep-progress-fill {
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
