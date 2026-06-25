<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { onMount } from 'svelte';

  const MOBILE_BREAKPOINT = 1024;

  let open = $state(false);
  let isMobile = $state(false);

  function checkMobile() {
    isMobile = window.innerWidth < MOBILE_BREAKPOINT;
  }

  function maybeShow() {
    checkMobile();
    open = isMobile;
  }

  onMount(() => {
    maybeShow();
    window.addEventListener('resize', maybeShow);
    return () => window.removeEventListener('resize', maybeShow);
  });
</script>

{#if open}
  <div
    class="dm-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="dm-title"
    transition:fade={{ duration: 200 }}
  >
    <div
      class="dm-card"
      transition:fly={{ y: 20, duration: 300 }}
    >
      <div class="dm-card-glow" aria-hidden="true"></div>

      <div class="dm-header">
        <span class="dm-icon" aria-hidden="true">&#x1F4BB;</span>
        <h2 id="dm-title" class="dm-title">Desktop Required</h2>
        <p class="dm-subtitle">Mobile devices are not supported</p>
      </div>

      <div class="dm-body">
        <p class="dm-text">
          DevSim is a full-stack development simulator designed exclusively for desktop and laptop devices. Code editing, terminal access, and multi-panel workspaces require a screen width of at least 1024px.
        </p>
        <p class="dm-text">
          Please switch to a desktop or laptop to continue.
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  .dm-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    pointer-events: all;
  }

  .dm-card {
    position: relative;
    width: min(420px, 90vw);
    max-height: min(90vh, 600px);
    overflow-y: auto;
    background: var(--bg-light, #12192a);
    border: 1px solid var(--card-border, rgba(7, 165, 201, 0.15));
    border-radius: 6px;
    padding: 2rem 2rem;
    box-shadow:
      0 0 0 1px rgba(7, 165, 201, 0.07),
      0 0 40px rgba(7, 165, 201, 0.12),
      0 24px 60px rgba(0, 0, 0, 0.55);
  }

  .dm-card-glow {
    position: absolute;
    inset: -1px;
    border-radius: 7px;
    background: linear-gradient(135deg, rgba(7, 165, 201, 0.30), transparent 55%, rgba(99, 102, 241, 0.18));
    z-index: -1;
    pointer-events: none;
    animation: dm-glow-pulse 3s ease-in-out infinite alternate;
  }

  @keyframes dm-glow-pulse {
    from { opacity: 0.35; }
    to   { opacity: 1; }
  }

  .dm-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .dm-icon {
    display: inline-block;
    font-size: 2.5rem;
    line-height: 1;
    filter: drop-shadow(0 0 8px rgba(7, 165, 201, 0.6));
    animation: dm-icon-pulse 2.5s ease-in-out infinite alternate;
  }

  @keyframes dm-icon-pulse {
    from { filter: drop-shadow(0 0 4px rgba(7, 165, 201, 0.4)); }
    to   { filter: drop-shadow(0 0 14px rgba(7, 165, 201, 0.7)); }
  }

  .dm-title {
    margin: 0.5rem 0 0.3rem;
    font-family: var(--font-head, 'Chakra Petch', sans-serif);
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    color: var(--text-primary, #d0d7dd);
  }

  .dm-subtitle {
    margin: 0;
    font-family: var(--font-mono, 'Space Mono', monospace);
    font-size: 0.82rem;
    line-height: 1.6;
    color: var(--danger, #ff3860);
    opacity: 0.85;
  }

  .dm-body {
    margin-bottom: 0.25rem;
  }

  .dm-text {
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 0.95rem;
    color: var(--text-primary, #d0d7dd);
    opacity: 0.75;
    margin: 0 0 0.75rem;
    line-height: 1.65;
    text-align: center;
  }

  @media (max-height: 760px) {
    .dm-backdrop { align-items: center; padding: 0.75rem; }
    .dm-card { max-height: 96vh; padding: 1.15rem 1rem; }
    .dm-header { margin-bottom: 1rem; }
  }
</style>
