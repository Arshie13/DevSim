<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import AIScoreCard from '$lib/components/ui/AIScoreCard.svelte';
  import { Lightbulb } from 'lucide-svelte';

  type AIScoring = {
    stars: number;
    score: number;
    feedback: string;
    improvements: string;
    nextTime: string;
    loading: boolean;
    done: boolean;
  };

  export let advancingToNextLevel = false;
  export let aiScoring: AIScoring = {
    stars: 1, score: 50, feedback: '', improvements: '', nextTime: '',
    loading: false, done: false,
  };
  export let submitRewards = { xp: 0, coins: 0 };
  export let keyTakeaways: Array<{ taskId: string; taskName: string; takeaway: string }> = [];
  
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
  $: showFallback = takeawayChunks.length === 0 && aiScoring.done;
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
    if (txt && aiScoring.done) startTypewriter(txt);
    else { displayedText = ''; isTyping = false; typeComplete = false; }
  }

  onDestroy(() => { if (typeInterval) clearInterval(typeInterval); });

  const dispatch = createEventDispatcher<{ done: void; continue: void }>();
  const handleDone = () => dispatch('done');
  const handleContinueWorking = () => dispatch('continue');
  function handleSkipTyping() {
    if (typeInterval) { clearInterval(typeInterval); typeInterval = null; }
    displayedText = currentText; isTyping = false; typeComplete = true;
  }
</script>

<div class="anchor">

  <!-- ═══ THE CARD ════════════════════════════ -->
  <div class="card text-center py-2">

    <div class="mb-3 inline-flex items-center gap-2 rounded-[3px] border border-[rgba(0,229,160,0.28)] bg-[rgba(0,229,160,0.08)] px-3 py-1.5">
      <span class="burst text-xl" aria-hidden="true">🎉</span>
      <span class="[font-family:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.1em] text-[var(--success)]">Submission Complete</span>
    </div>

    <h2 class="mt-1 [font-family:var(--font-heading)] text-[1.55rem] font-bold tracking-[0.08em] text-[var(--text-primary)]">
      {advancingToNextLevel ? 'Level Cleared' : 'Sprint Archived'}
    </h2>
    <p class="mb-5 mt-1 [font-family:var(--font-mono)] text-[0.82rem] text-[var(--text-muted)]">
      {advancingToNextLevel
        ? 'Great run. Jump into your next challenge or return to dashboard.'
        : 'All deliverables are recorded for this sprint.'}
    </p>

    <!-- Key Takeaways - shown right after the subtitle -->
    {#if hasTakeaways && !showFallback}
      <div class="mb-4 rounded-[4px] border border-[rgba(7,165,201,0.2)] bg-[rgba(10,14,26,0.7)] px-4 py-3">
        <div class="mb-2 flex items-center gap-2 border-b border-[rgba(7,165,201,0.15)] pb-2">
          <Lightbulb size={14} class="text-[var(--accent)]" />
          <span class="[font-family:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.1em] text-[var(--accent)]">Key Takeaways</span>
          {#if takeawayChunks.length > 1}
            <span class="ml-auto text-[0.6rem] text-[var(--text-muted)]">{currentIndex + 1}/{takeawayChunks.length}</span>
          {/if}
        </div>
        <div class="min-h-[80px] max-h-[140px] overflow-y-auto">
          <p class="[font-family:var(--font-mono)] text-[0.7rem] leading-[1.6] text-[var(--text-primary)]">
            {displayedText}{#if isTyping}<span class="animate-pulse">|</span>{/if}
          </p>
        </div>
        {#if takeawayChunks.length > 1}
          <div class="mt-3 flex items-center justify-center gap-4 border-t border-[rgba(7,165,201,0.15)] pt-2">
            <button class="text-[0.6rem] text-[var(--accent)] hover:underline" disabled={currentIndex === 0}
              on:click={() => currentIndex = Math.max(0, currentIndex - 1)}>← Prev</button>
            <button class="text-[0.6rem] text-[var(--accent)] hover:underline"
              on:click={() => currentIndex = Math.min(takeawayChunks.length - 1, currentIndex + 1)}>
              {currentIndex === takeawayChunks.length - 1 ? 'Done' : 'Next →'}
            </button>
          </div>
        {/if}
      </div>
    {:else if showFallback}
      <div class="mb-4 rounded-[4px] border border-[rgba(7,165,201,0.2)] bg-[rgba(10,14,26,0.7)] px-4 py-3">
        <div class="flex items-center gap-2">
          <Lightbulb size={14} class="text-[var(--accent)]" />
          <span class="[font-family:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.1em] text-[var(--accent)]">Key Takeaways</span>
        </div>
        <p class="mt-2 [font-family:var(--font-mono)] text-[0.7rem] text-[var(--text-muted)]">Great job completing this sprint! Keep exploring the codebase to discover more insights.</p>
      </div>
    {/if}

    <div class="mb-5 grid grid-cols-2 gap-2.5">
      <div class="fade-up rounded-[4px] border border-[rgba(0,229,160,0.3)] bg-[rgba(15,34,16,0.8)] px-3 py-3 text-center">
        <p class="[font-family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.1em] text-[var(--success)]">XP Earned</p>
        <p class="mt-1 [font-family:var(--font-heading)] text-[1.35rem] font-bold text-[var(--text-primary)]">⚡ +{submitRewards.xp}</p>
      </div>
      <div class="fade-up [animation-delay:0.15s] rounded-[4px] border border-[rgba(255,180,0,0.3)] bg-[rgba(31,21,8,0.8)] px-3 py-3 text-center">
        <p class="[font-family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.1em] text-[var(--warn)]">Coins Earned</p>
        <p class="mt-1 [font-family:var(--font-heading)] text-[1.35rem] font-bold text-[var(--text-primary)]">🪙 +{submitRewards.coins}</p>
      </div>
    </div>

    {#if aiScoring.done && !aiScoring.loading}
      <div class="mb-5">
        <AIScoreCard
          stars={aiScoring.stars}
          score={aiScoring.score}
          feedback={aiScoring.feedback}
          improvements={aiScoring.improvements}
          nextTime={aiScoring.nextTime}
        />
      </div>
    {:else if aiScoring.loading}
      <div class="mb-5 flex items-center gap-3 rounded-[6px] border border-[rgba(7,165,201,0.25)] bg-[rgba(10,14,26,0.9)] px-4 py-3">
        <div class="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent"></div>
        <p class="[font-family:var(--font-mono)] text-[0.72rem] text-[var(--accent)]">Analyzing your code…</p>
      </div>
    {/if}

    <div class="rounded-[4px] border border-[rgba(7,165,201,0.2)] bg-[rgba(10,14,26,0.7)] px-3 py-3">
      <div class="flex flex-wrap justify-center gap-3">
        {#if advancingToNextLevel}
          <button on:click={handleContinueWorking}
            class="btn-cyber fade-up cursor-pointer border border-[rgba(0,229,160,0.55)] bg-[rgba(0,229,160,0.12)] !px-5 !py-2.5 [font-family:var(--font-heading)] !text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--success)] shadow-[0_0_16px_rgba(0,229,160,0.25)] transition-all duration-200 hover:-translate-y-[1px] hover:border-[rgba(0,229,160,0.8)] hover:bg-[rgba(0,229,160,0.2)]">
            Continue Working →
          </button>
        {/if}
        <button on:click={handleDone}
          class="btn-cyber btn-cyber-solid fade-up {advancingToNextLevel ? '[animation-delay:0.1s]' : ''} cursor-pointer !px-7 !py-2.5 [font-family:var(--font-heading)] !text-[0.78rem] font-bold uppercase tracking-[0.08em] shadow-[0_0_16px_var(--accent-glow)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_0_26px_var(--accent-glow)]">
          Back to Dashboard
        </button>
      </div>
    </div>

  </div>
</div>

<style>
  .anchor {
    position: relative;
    animation: pane-in 0.28s ease-out both;
  }

  .card { position: relative; z-index: 1; }

  /* ─── Animations ─────────────────────────────────────────────────── */
  .burst { animation: burst-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
  .fade-up { animation: fade-up 0.4s 0.15s ease both; }

  @keyframes pane-in   { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes burst-pop { from { transform: scale(0.3);  opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes fade-up   { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>