<script lang="ts">
  import TakeawayHeader from './TakeawayHeader.svelte';
  import TakeawayContent from './TakeawayContent.svelte';
  import TakeawayNavigation from './TakeawayNavigation.svelte';

  type TakeawayChunk = {
    taskName: string;
    sectionTitle: string;
    content: string;
  };

  export let takeawayChunks: TakeawayChunk[] = [];
  export let currentIndex: number = 0;
  export let displayedText: string = '';
  export let isTyping = false;
  export let onPrev: () => void = () => {};
  export let onNext: () => void = () => {};
  export let onClose: () => void = () => {};

  // ✅ expose content wrapper to parent
  export let contentWrapperRef: HTMLDivElement;
</script>

<div class="takeaway-card" class:is-typing={isTyping}>
  <TakeawayHeader {takeawayChunks} {currentIndex} />

  <div class="content-wrapper" bind:this={contentWrapperRef}>
    <TakeawayContent {displayedText} {isTyping} />
  </div>

  <TakeawayNavigation
    {takeawayChunks}
    {currentIndex}
    {onPrev}
    {onNext}
    {onClose}
    {isTyping}
  />
</div>

<style>
  .takeaway-card {
    background: linear-gradient(135deg, rgba(10, 14, 26, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
    border: 1px solid rgba(6, 182, 212, 0.4);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 32px rgba(6, 182, 212, 0.1);
    backdrop-filter: blur(8px);
    width: 100%;
    max-width: 420px;
    height: 400px; /* Fixed height */
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    overflow: hidden;
  }

  .content-wrapper {
    flex: 1;
    overflow-y: auto;
    min-height: 0;

    /* ✅ removed max-height */
  }
</style>