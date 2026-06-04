<script lang="ts">
  export let icon: string = "📦";
  export let title: string = "Nothing here yet";
  export let message: string = "";
  export let ctaLabel: string | undefined = undefined;
  export let ctaHref: string | undefined = undefined;
</script>

<div class="empty-state">
  <div class="empty-glow" aria-hidden="true"></div>
  <div class="empty-icon">{icon}</div>
  <h3 class="empty-title">{title}</h3>
  {#if message}
    <p class="empty-message">{message}</p>
  {/if}
  {#if ctaLabel && ctaHref}
    <a href={ctaHref} class="btn-cyber btn-cyber-outline mt-4 !px-5 !py-2.5">
      {ctaLabel}
    </a>
  {/if}
</div>

<style>
  .empty-state {
    position: relative;
    overflow: hidden;
    padding: 3rem 2rem;
    background: var(--bg-light);
    border: 1px dashed rgba(7, 165, 201, 0.25);
    border-radius: 4px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 320px;
  }

  .empty-glow {
    position: absolute;
    top: -50%;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 100%;
    background: radial-gradient(ellipse at center, rgba(7, 165, 201, 0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .empty-icon {
    position: relative;
    font-size: 3rem;
    line-height: 1;
    filter: drop-shadow(0 0 12px rgba(7, 165, 201, 0.35));
    animation: empty-pulse 3s ease-in-out infinite alternate;
  }

  @keyframes empty-pulse {
    from { transform: translateY(0); filter: drop-shadow(0 0 8px rgba(7, 165, 201, 0.25)); }
    to   { transform: translateY(-4px); filter: drop-shadow(0 0 18px rgba(7, 165, 201, 0.45)); }
  }

  .empty-title {
    position: relative;
    margin-top: 1rem;
    font-family: var(--font-heading);
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--text-primary);
  }

  .empty-message {
    position: relative;
    margin-top: 0.4rem;
    max-width: 36ch;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--text-muted);
    line-height: 1.55;
  }
</style>
