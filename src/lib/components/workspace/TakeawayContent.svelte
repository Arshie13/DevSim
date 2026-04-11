<script lang="ts">
  export let displayedText: string = '';
  export let isTyping: boolean = false;
</script>

<div class="card-content">
  <p class="[font-family:var(--font-mono)] text-[0.9rem] leading-[1.6] text-[var(--text-primary)] break-words">
    {displayedText}{#if isTyping}<span class="animate-pulse">|</span>{/if}
  </p>
</div>

<style>
  .card-content {
    overflow-y: auto;
    overflow-x: hidden;
  }

  .card-content p {
    margin: 0;
    padding: 0;
  }

  .animate-pulse {
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
</style>