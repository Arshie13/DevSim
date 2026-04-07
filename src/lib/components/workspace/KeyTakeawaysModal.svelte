<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
  import TakeawayCard from './TakeawayCard.svelte';

  export let open = false;
  export let keyTakeaways: Array<{ taskId: string; taskName: string; takeaway: string }> = [];

  const dispatch = createEventDispatcher<{ closed: void }>();

  let takeawayChunks: Array<{ taskName: string; sectionTitle: string; content: string }> = [];

  // Track which texts have already been shown to skip typewriter on revisit
  let shownTexts: Set<string> = new Set();

  function normalizeTakeawayText(value: unknown): string {
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value)) {
      return value
        .map((entry) => (typeof entry === 'string' ? entry.trim() : String(entry ?? '').trim()))
        .filter(Boolean)
        .join('\n\n');
    }
    if (value == null) return '';
    return String(value).trim();
  }

  function parseTakeawaySections(content: string, taskName: string) {
    const paragraphs = content.split(/\n\s*\n/).filter(Boolean);

    return paragraphs.map((p) => ({
      taskName,
      sectionTitle: taskName,
      content: p.trim()
    }));
  }

  $: {
    takeawayChunks = (keyTakeaways || [])
      .map((kt) => ({
        taskName: kt?.taskName || 'Task',
        takeaway: normalizeTakeawayText((kt as { takeaway?: unknown })?.takeaway),
      }))
      .filter((kt) => kt.takeaway.length > 0)
      .flatMap((kt) => parseTakeawaySections(kt.takeaway, kt.taskName));

    // Reset to first takeaway when keyTakeaways change
    currentIndex = 0;
    lastMeasuredIndex = -1;
  }

  let currentIndex = 0;
  $: currentTakeaway = takeawayChunks[currentIndex] ?? null;
  $: showFallback = takeawayChunks.length === 0;

  // =========================
  // ✅ TYPEWRITER + HEIGHT PER ITEM
  // =========================

  let displayedText = '';
  let currentText = '';
  let typeIndex = 0;
  let typeInterval: ReturnType<typeof setInterval> | null = null;
  const TYPE_SPEED = 15;

  let isTyping = false;
  let cardHeight = 0;

  let measureEl: HTMLParagraphElement;
  let contentWrapper: HTMLDivElement;

  let lastMeasuredIndex = -1;

  // Reset height when modal opens or takeaways change
  $: if (open && takeawayChunks.length > 0) {
    cardHeight = 0;
    lastMeasuredIndex = -1;
  }

  function measureHeight(text: string) {
    if (!measureEl) return;

    // Use a fixed width that matches the content area for consistent measurement
    measureEl.style.width = '388px'; // Match the fixed width used elsewhere
    measureEl.textContent = text;

    // Force a reflow to ensure accurate measurement
    measureEl.offsetHeight;
    cardHeight = measureEl.offsetHeight;
  }

  function startTypewriter(text: string, skipAnimation: boolean = false) {
    if (typeInterval) {
      clearInterval(typeInterval);
      typeInterval = null;
    }

    currentText = text;

    if (!text.length) {
      displayedText = '';
      isTyping = false;
      return;
    }

    // If this text was already shown, skip animation
    if (skipAnimation) {
      displayedText = text;
      isTyping = false;
      return;
    }

    // First time - run typewriter
    displayedText = '';
    typeIndex = 0;
    isTyping = true;

    typeInterval = setInterval(() => {
      if (typeIndex < currentText.length) {
        displayedText = currentText.substring(0, ++typeIndex);
      } else {
        clearInterval(typeInterval!);
        typeInterval = null;
        isTyping = false;
      }
    }, TYPE_SPEED);
  }

  // ✅ KEY FIX: re-measure per takeaway
  $: {
    const txt = currentTakeaway?.content || '';

    if (!open || !txt) {
      displayedText = '';
      isTyping = false;
    } else if (currentIndex !== lastMeasuredIndex) {
      lastMeasuredIndex = currentIndex;
      currentText = txt;

      // Check if this text was already shown
      const skipAnimation = shownTexts.has(txt);

      // Mark as shown
      if (!skipAnimation) {
        shownTexts.add(txt);
      }

      // Measure height first, then start typing
      measureHeight(txt);
      startTypewriter(txt, skipAnimation);
    }
  }

  // ✅ Ensure initial measurement when modal opens with takeaways
  $: if (open && takeawayChunks.length > 0 && currentIndex === 0 && lastMeasuredIndex === -1) {
    const txt = takeawayChunks[0]?.content || '';
    if (txt) {
      lastMeasuredIndex = 0;
      currentText = txt;

      // Check if this text was already shown
      const skipAnimation = shownTexts.has(txt);

      // Mark as shown
      if (!skipAnimation) {
        shownTexts.add(txt);
      }

      measureHeight(txt);
      startTypewriter(txt, skipAnimation);
    }
  }

  onDestroy(() => {
    if (typeInterval) clearInterval(typeInterval);
  });

  let wasOpen = false;
  $: {
    if (open) {
      wasOpen = true;
    } else if (wasOpen) {
      wasOpen = false;
      dispatch('closed');
    }
  }

  function handlePrev() {
    currentIndex = Math.max(0, currentIndex - 1);
    lastMeasuredIndex = -1; // ✅ force recalculation
  }

  function handleNext() {
    if (currentIndex === takeawayChunks.length - 1) {
      open = false;
    } else {
      currentIndex++;
      lastMeasuredIndex = -1; // ✅ force recalculation
    }
  }
</script>

<!-- ✅ Hidden measurer -->
<p
  bind:this={measureEl}
  style="
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    font-family: var(--font-mono);
    font-size: 0.9rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-words;
    margin: 0;
    padding: 0;
  "
></p>

<ConfirmationModal
  bind:open
  icon="💡"
  iconVariant="accent"
  title="Key Takeaways"
  subtitle="Insights from your completed tasks"
  confirmLabel="Next"
  variant="primary"
  hideActions={true}
  closeOnBackdropClick={false}
>
  {#if !showFallback}
    <TakeawayCard
      {takeawayChunks}
      {currentIndex}
      {displayedText}
      {isTyping}
      {cardHeight}
      bind:contentWrapperRef={contentWrapper}
      onPrev={handlePrev}
      onNext={handleNext}
      onClose={() => open = false}
    />
  {:else}
    <TakeawayCard
      takeawayChunks={[]}
      currentIndex={0}
      displayedText="Great job completing this sprint! Keep exploring the codebase to discover more insights."
      isTyping={false}
      {cardHeight}
      bind:contentWrapperRef={contentWrapper}
      onPrev={() => {}}
      onNext={() => {}}
      onClose={() => open = false}
    />
  {/if}
</ConfirmationModal>