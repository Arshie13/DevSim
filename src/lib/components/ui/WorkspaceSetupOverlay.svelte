<script lang="ts">
  export let visible: boolean = false;
  export let title: string = "Setting Up Workspace";
  export let subtitle: string = "Preparing your workspace environment…";
</script>

{#if visible}
  <div class="ws-overlay" aria-live="polite" aria-label={title}>
    <div class="ws-rings-wrap">
      <div class="ws-ring ws-ring-outer"></div>
      <div class="ws-ring ws-ring-mid"></div>
      <div class="ws-ring ws-ring-inner"></div>
      <div class="ws-core"></div>
    </div>
    <p class="ws-title">{title}</p>
    <p class="ws-sub">{subtitle}</p>
    <div class="ws-bar-wrap"><div class="ws-bar"></div></div>
  </div>
{/if}

<style>
  .ws-overlay {
    position: fixed;
    inset: 0;
    z-index: 10070;
    background: rgba(0, 0, 10, 0.93);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.15rem;
  }

  .ws-rings-wrap {
    position: relative;
    width: 96px;
    height: 96px;
  }

  .ws-ring {
    position: absolute;
    inset: 0;
    margin: auto;
    border-radius: 50%;
    border: 2px solid transparent;
  }

  .ws-ring-outer {
    width: 96px;
    height: 96px;
    border-top-color: #00c2ff;
    border-right-color: rgba(0, 194, 255, 0.25);
    animation: ws-spin 2s linear infinite;
    filter: drop-shadow(0 0 6px rgba(0, 194, 255, 0.5));
  }

  .ws-ring-mid {
    width: 68px;
    height: 68px;
    border-top-color: rgba(0, 194, 255, 0.75);
    border-left-color: rgba(0, 194, 255, 0.2);
    animation: ws-spin-r 1.35s linear infinite;
  }

  .ws-ring-inner {
    width: 44px;
    height: 44px;
    border: 1.5px solid transparent;
    border-top-color: #00c2ff;
    border-bottom-color: rgba(0, 194, 255, 0.3);
    animation: ws-spin 0.85s linear infinite;
  }

  .ws-core {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #00c2ff;
    box-shadow: 0 0 10px #00c2ff, 0 0 22px rgba(0, 194, 255, 0.45);
    animation: ws-core-pulse 1.5s ease-in-out infinite;
  }

  .ws-title {
    font-family: "Orbitron", sans-serif;
    color: #d0d7dd;
    font-size: 1rem;
    letter-spacing: 0.06em;
    margin: 0;
    animation: ws-glow-text 2.2s ease-in-out infinite;
  }

  .ws-sub {
    font-family: "Share Tech Mono", monospace;
    color: rgba(208, 215, 221, 0.5);
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    margin: 0;
  }

  .ws-bar-wrap {
    width: 200px;
    height: 2px;
    background: rgba(0, 194, 255, 0.12);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 0.3rem;
  }

  .ws-bar {
    height: 100%;
    width: 45%;
    background: linear-gradient(90deg, transparent, #00c2ff, transparent);
    animation: ws-bar-slide 1.6s ease-in-out infinite;
  }

  @keyframes ws-spin   { to { transform: rotate(360deg); } }
  @keyframes ws-spin-r { to { transform: rotate(-360deg); } }

  @keyframes ws-core-pulse {
    0%, 100% { transform: scale(1);   opacity: 1; }
    50%       { transform: scale(1.5); opacity: 0.65; }
  }

  @keyframes ws-glow-text {
    0%, 100% { opacity: 0.75; text-shadow: none; }
    50%       { opacity: 1;    text-shadow: 0 0 18px rgba(0, 194, 255, 0.45); }
  }

  @keyframes ws-bar-slide {
    0%   { transform: translateX(-160%); }
    100% { transform: translateX(450%); }
  }
</style>
