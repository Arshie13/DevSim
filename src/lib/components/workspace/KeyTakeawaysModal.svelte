<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
  import TakeawayCard from './TakeawayCard.svelte';

  export let open = false;
  export let keyTakeaways: Array<{ taskId: string; taskName: string; takeaway: string }> = [];
  export let aiScoringDone = false;

  const dispatch = createEventDispatcher<{ closed: void }>();

  let takeawayChunks: Array<{ taskName: string; sectionTitle: string; content: string }> = [];

  function parseTakeawaySections(content: string, taskName: string): Array<{ taskName: string; sectionTitle: string; content: string }> {
    const lines = content.split(/\r?\n/);
    const paragraphs: string[] = [];
    let currentParagraph = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (currentParagraph.trim()) {
          paragraphs.push(currentParagraph.trim());
          currentParagraph = '';
        }
      } else {
        currentParagraph += (currentParagraph ? ' ' : '') + trimmed;
      }
    }
    if (currentParagraph.trim()) {
      paragraphs.push(currentParagraph.trim());
    }

    const validParagraphs = paragraphs.filter(p => p.length > 0);
    if (validParagraphs.length === 0 && content.trim()) {
      return [{ taskName, sectionTitle: taskName, content: content.trim() }];
    }

    const sections: Array<{ taskName: string; sectionTitle: string; content: string }> = [];
    let chunk: string[] = [];
    let chunkLength = 0;
    const MAX_CHARS = 280;
    const MAX_PARAS = 2;

    for (const para of validParagraphs) {
      chunk.push(para);
      chunkLength += para.length;

      if (chunkLength >= MAX_CHARS || chunk.length >= MAX_PARAS) {
        const contentStr = chunk.join('\n\n');
        let title = taskName;
        const firstPara = chunk[0];
        const headingMatch = firstPara.match(/^\*\*(.+?)\*\*[:\s]*/);
        if (headingMatch) {
          title = headingMatch[1].trim();
        } else if (sections.length > 0) {
          const words = firstPara.split(' ').slice(0, 3).join(' ');
          title = words + (firstPara.split(' ').length > 3 ? '...' : '');
        }
        sections.push({ taskName, sectionTitle: title, content: contentStr });
        chunk = [];
        chunkLength = 0;
      }
    }

    if (chunk.length > 0) {
      const contentStr = chunk.join('\n\n');
      let title = taskName;
      if (sections.length > 0) {
        const words = chunk[0].split(' ').slice(0, 3).join(' ');
        title = words + (chunk[0].split(' ').length > 3 ? '...' : '');
      }
      sections.push({ taskName, sectionTitle: title, content: contentStr });
    }

    return sections;
  }

  $: {
    const parsed = keyTakeaways
      ?.filter(kt => kt?.takeaway && kt?.takeaway?.trim()?.length > 0)
      ?.flatMap(kt => parseTakeawaySections(kt.takeaway, kt.taskName || 'Task'))
      || [];

    takeawayChunks = parsed;
  }

  let currentIndex = 0;
  $: if (takeawayChunks.length > 0) currentIndex = 0;
  $: currentTakeaway = takeawayChunks[currentIndex] ?? null;
  $: showFallback = takeawayChunks.length === 0 && aiScoringDone;
  $: hasTakeaways = (takeawayChunks.length > 0 && !!currentTakeaway) || showFallback;

  // Typewriter
  let displayedText = '';
  let currentText = '';
  let typeIndex = 0;
  let typeInterval: ReturnType<typeof setInterval> | null = null;
  const TYPE_SPEED = 15;
  let isTyping = false;
  let typeComplete = false;

  function startTypewriter(text: string) {
    if (typeInterval) { clearInterval(typeInterval); typeInterval = null; }
    currentText = text; displayedText = ''; typeIndex = 0;
    isTyping = true; typeComplete = false;
    if (!text.length) { isTyping = false; return; }
    typeInterval = setInterval(() => {
      if (typeIndex < currentText.length) {
        displayedText = currentText.substring(0, ++typeIndex);
      } else {
        clearInterval(typeInterval!); typeInterval = null;
        isTyping = false; typeComplete = true;
      }
    }, TYPE_SPEED);
  }

  $: {
    const txt = currentTakeaway?.content || '';
    if (txt && aiScoringDone) startTypewriter(txt);
    else { displayedText = ''; isTyping = false; typeComplete = false; }
  }

  onDestroy(() => { if (typeInterval) clearInterval(typeInterval); });

  // Dispatch event when modal is closed
  $: if (!open && keyTakeaways.length > 0) {
    dispatch('closed');
  }

  function handleSkipTyping() {
    if (typeInterval) { clearInterval(typeInterval); typeInterval = null; }
    displayedText = currentText; isTyping = false; typeComplete = true;
  }

  function handlePrev() {
    currentIndex = Math.max(0, currentIndex - 1);
  }

  function handleNext() {
    if (currentIndex === takeawayChunks.length - 1) {
      // Close modal when reaching the end
      open = false;
    } else {
      currentIndex = Math.min(takeawayChunks.length - 1, currentIndex + 1);
    }
  }
</script>

<ConfirmationModal
  bind:open
  icon="💡"
  iconVariant="accent"
  title="Key Takeaways"
  subtitle="Insights from your completed tasks"
  confirmLabel="Next"
  variant="primary"
  hideActions={true}
>
  {#if hasTakeaways && !showFallback}
    <TakeawayCard
      {takeawayChunks}
      {currentIndex}
      {displayedText}
      {isTyping}
      onPrev={handlePrev}
      onNext={handleNext}
      onClose={() => open = false}
    />
  {:else if showFallback}
    <TakeawayCard
      takeawayChunks={[]}
      currentIndex={0}
      displayedText="Great job completing this sprint! Keep exploring the codebase to discover more insights."
      isTyping={false}
      onPrev={() => {}}
      onNext={() => {}}
      onClose={() => open = false}
    />
  {/if}
</ConfirmationModal>
