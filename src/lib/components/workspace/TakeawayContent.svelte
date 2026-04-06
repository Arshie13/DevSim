<script lang="ts">
  export let displayedText: string = '';
  export let isTyping: boolean = false;
</script>

<div class="card-content">
  <p class="[font-family:var(--font-mono)] text-[0.75rem] leading-[1.6] text-[var(--text-primary)]">
    {displayedText}{#if isTyping}<span class="animate-pulse">|</span>{/if}
  </p>
</div>

<style>
  .card-content {
    min-height: 80px;
    max-height: 350px;
    overflow-y: auto;
    margin-bottom: 12px;
  }

  /* Animations */
  .animate-pulse {
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
</style>