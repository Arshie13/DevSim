<script lang="ts">
  type TakeawayChunk = {
    taskName: string;
    sectionTitle: string;
    content: string;
  };

  export let takeawayChunks: TakeawayChunk[] = [];
  export let currentIndex: number = 0;
  export let onPrev: () => void = () => {};
  export let onNext: () => void = () => {};
  export let onClose: () => void = () => {};
  export let isTyping: boolean = false;
</script>

{#if takeawayChunks.length > 1}
  <div class="card-footer">
    <button class="nav-button" disabled={currentIndex === 0 || isTyping}
      on:click={onPrev}>← Prev</button>
    <button class="nav-button" disabled={isTyping}
      on:click={onNext}>
      {currentIndex === takeawayChunks.length - 1 ? 'Done' : 'Next →'}
    </button>
  </div>
{:else}
  <div class="card-footer">
    <button class="nav-button" disabled={isTyping}
      on:click={onClose}>Next</button>
  </div>
{/if}

<style>
  .card-footer {
    display: flex;
    justify-content: center;
    gap: 12px;
    padding-top: 8px;
    border-top: 1px solid rgba(6, 182, 212, 0.2);
  }

  .nav-button {
    background: none;
    border: none;
    color: #07a5c9;
    font-size: 0.75rem;
    font-family: monospace;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
    text-decoration: underline;
  }

  .nav-button:hover:not(:disabled) {
    background: rgba(6, 182, 212, 0.1);
    text-decoration: none;
  }

  .nav-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    text-decoration: none;
  }
</style>