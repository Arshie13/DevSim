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
  export let isTyping: boolean = false;
  export let onPrev: () => void = () => {};
  export let onNext: () => void = () => {};
  export let onClose: () => void = () => {};
</script>

<div class="takeaway-card">
  <TakeawayHeader {takeawayChunks} {currentIndex} />

  <TakeawayContent {displayedText} {isTyping} />

  <TakeawayNavigation
    {takeawayChunks}
    {currentIndex}
    {onPrev}
    {onNext}
    {onClose}
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
    max-width: 500px;
    margin: 0 auto;
  }
</style>