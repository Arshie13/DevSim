<script lang="ts">
  import { toast, type Toast } from '$lib/stores/toast';
  import { helpTrigger } from '$lib/stores/helpTrigger';
  import { fly, fade } from 'svelte/transition';
  import { X, CheckCircle, Info } from 'lucide-svelte';

  const variantMeta = {
    success: { label: 'SUCCESS', color: '#00E5A0', glow: 'rgba(0,229,160,0.30)',    bg: 'rgba(0,229,160,0.08)',   Icon: CheckCircle    },
    info:    { label: 'INFO',    color: '#07A5C9', glow: 'rgba(7,165,201,0.30)',    bg: 'rgba(7,165,201,0.08)',   Icon: Info           },
  } as const;

  function meta(t: Toast) {
    return variantMeta[t.variant as 'success' | 'info'];
  }

  function handleHelpClick(helpAction: Toast['helpAction']) {
    if (helpAction) {
      helpTrigger.trigger(helpAction.category, '');
    }
  }
</script>

<!-- Success/Info toasts: bottom-right stack -->
<div class="toast-portal" aria-live="polite" aria-atomic="false">
  {#each $toast.filter(t => t.variant !== 'error' && t.variant !== 'warn') as t (t.id)}
    {@const m = meta(t)}
    <div
      class="toast"
      in:fly={{ x: 60, duration: 320, opacity: 0 }}
      out:fade={{ duration: 200 }}
      style="
        --c: {m.color};
        --glow: {m.glow};
        --bg: {m.bg};
        --duration: {t.duration ?? 4000}ms;
      "
      role="alert"
    >
      <div class="toast-shimmer"></div>
      <div class="toast-strip"></div>

      <div class="toast-body">
        <div class="toast-icon">
          <svelte:component this={m.Icon} size={18} />
        </div>

        <div class="toast-text">
          <span class="toast-label">{m.label}</span>
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

      <button class="toast-close" onclick={() => toast.remove(t.id)} aria-label="Dismiss">
        <X size={13} />
      </button>

      {#if t.duration && t.duration > 0}
        <div class="toast-progress">
          <div class="toast-progress-fill"></div>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .toast-portal {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    pointer-events: none;
    max-width: 360px;
    width: calc(100vw - 3rem);
  }

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
    clip-path: polygon(
      0 0,
      calc(100% - 10px) 0,
      100% 10px,
      100% 100%,
      10px 100%,
      0 calc(100% - 10px)
    );
  }

  .toast-shimmer {
    position: absolute;
    inset: 0 0 auto 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--c), transparent);
    opacity: 0.6;
  }

  .toast-strip {
    width: 3px;
    flex-shrink: 0;
    background: var(--c);
    box-shadow: 0 0 8px var(--glow);
  }

  .toast-body {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.7rem 0.6rem 0.75rem 0.75rem;
    flex: 1;
    min-width: 0;
  }

  .toast-icon {
    flex-shrink: 0;
    color: var(--c);
    filter: drop-shadow(0 0 4px var(--glow));
    margin-top: 1px;
  }

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

  .toast-progress {
    position: absolute;
    bottom: 0;
    left: 3px;
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
