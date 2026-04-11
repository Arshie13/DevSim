<script lang="ts">
  type TakeawayChunk = {
    taskName: string;
    sectionTitle: string;
    content: string;
  };

  export let takeawayChunks: TakeawayChunk[] = [];
  export let currentIndex: number = 0;
</script>

<div class="card-header">
  <span class="[font-family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.1em] text-[var(--accent)] font-semibold">💡 Key Takeaways</span>
  {#if takeawayChunks.length > 1}
    <span class="ml-auto text-[0.65rem] text-[var(--text-muted)]">{currentIndex + 1}/{takeawayChunks.length}</span>
  {/if}
</div>

<style>
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(6, 182, 212, 0.2);
  }
</style>