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
    stars: 1,
    score: 50,
    feedback: '',
    improvements: '',
    nextTime: '',
    loading: false,
    done: false,
  };
  export let submitRewards = { xp: 0, coins: 0 };
  export let keyTakeaways: Array<{ taskId: string; taskName: string; takeaway: string }> = [];

  $: takeawayChunks = keyTakeaways
    .filter(kt => kt.takeaway && kt.takeaway.trim().length > 0)
    .map(kt => ({ taskName: kt.taskName, content: `${kt.taskName}\n\n${kt.takeaway}` }));

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
    currentText = text;
    displayedText = '';
    typeIndex = 0;
    isTyping = true;
    typeComplete = false;
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

<!--
  Root: flex row.
    LEFT  → avatar + speech bubble (only when takeaways exist)
    RIGHT → the success card (always present)
-->
<div class="root" class:with-bubble={hasTakeaways}>

  <!-- ═══ LEFT: avatar + speech bubble ═══════════════════════════════════ -->
  {#if hasTakeaways}
    <aside class="aside">

      <!-- Avatar -->
      <div class="avatar" class:speaking={isTyping}>
        <img src="/images/saz.png" alt="DevSim AI" />
        {#if isTyping}<span class="pulse-dot"></span>{/if}
      </div>

      <!-- Bubble -->
      <div class="bubble">
        <!-- right-pointing tail -->
        <div class="tail"></div>

        <div class="bubble-header">
          <Lightbulb size={11} class="text-[var(--accent)]" />
          <span class="bubble-label">KEY TAKEAWAYS</span>
          {#if takeawayChunks.length > 1}
            <span class="bubble-badge">{currentIndex + 1}/{takeawayChunks.length}</span>
          {/if}
        </div>

        <div class="bubble-body">
          {#if showFallback}
            <p class="bubble-text muted">Great job completing this sprint! Keep exploring the codebase to discover more insights.</p>
          {:else}
            <p class="bubble-text">
              {displayedText}{#if isTyping}<span class="cursor">|</span>{/if}
            </p>
          {/if}
        </div>

        {#if !showFallback}
          <div class="bubble-footer">
            {#if isTyping}
              <button class="ctrl-btn" on:click={handleSkipTyping}>Skip →</button>
            {:else}
              <span></span>
            {/if}
            {#if typeComplete && takeawayChunks.length > 1}
              <div class="nav">
                <button class="ctrl-btn" disabled={currentIndex === 0}
                  on:click={() => currentIndex = Math.max(0, currentIndex - 1)}>← Prev</button>
                <span class="nav-count">{currentIndex + 1}/{takeawayChunks.length}</span>
                <button class="ctrl-btn"
                  on:click={() => currentIndex = Math.min(takeawayChunks.length - 1, currentIndex + 1)}>
                  {currentIndex === takeawayChunks.length - 1 ? '✓' : 'Next →'}
                </button>
              </div>
            {/if}
          </div>
        {/if}
      </div>

    </aside>
  {/if}

  <!-- ═══ RIGHT: success card ════════════════════════════════════════════ -->
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

  </div><!-- /card -->
</div><!-- /root -->

<style>
  /* ─── Root layout ───────────────────────────────────────────────── */
  .root {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    width: 100%;
    animation: pane-in 0.28s ease-out both;
  }

  /* Card takes all space when no bubble */
  .root:not(.with-bubble) .card { margin: 0 auto; }

  .card { flex: 1; min-width: 0; }

  /* ─── Left aside ────────────────────────────────────────────────── */
  .aside {
    flex-shrink: 0;
    width: 240px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding-top: 6px;
    /* align to top of card, sticky so it follows scroll */
    align-self: flex-start;
    position: sticky;
    top: 16px;
  }

  /* ─── Avatar ────────────────────────────────────────────────────── */
  .avatar {
    position: relative;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 2px solid rgba(6,182,212,0.65);
    box-shadow: 0 0 12px rgba(6,182,212,0.4);
    overflow: hidden;
    flex-shrink: 0;
    transition: box-shadow 0.2s, border-color 0.2s;
  }
  .avatar.speaking {
    border-color: rgba(6,182,212,1);
    box-shadow: 0 0 22px rgba(6,182,212,0.8);
  }
  .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .pulse-dot {
    position: absolute;
    bottom: 2px; right: 2px;
    width: 9px; height: 9px;
    border-radius: 50%;
    background: var(--accent);
    border: 1.5px solid #0f1a2e;
    animation: pulse 1s ease-in-out infinite;
  }

  /* ─── Speech bubble ─────────────────────────────────────────────── */
  .bubble {
    position: relative;
    width: 100%;
    background: #0d1b2a;
    border: 1.5px solid rgba(6,182,212,0.75);
    border-radius: 8px;
    box-shadow: 0 0 16px rgba(6,182,212,0.12);
    padding: 10px 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  /* Right-pointing tail */
  .tail {
    position: absolute;
    right: -11px;
    top: 16px;
    width: 0; height: 0;
    /* outer border colour */
    border-top: 9px solid transparent;
    border-bottom: 9px solid transparent;
    border-left: 11px solid rgba(6,182,212,0.75);
  }
  /* inner fill matches bubble bg */
  .tail::after {
    content: '';
    position: absolute;
    right: 2px; top: -7px;
    width: 0; height: 0;
    border-top: 7px solid transparent;
    border-bottom: 7px solid transparent;
    border-left: 9px solid #0d1b2a;
  }

  .bubble-header {
    display: flex;
    align-items: center;
    gap: 5px;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(6,182,212,0.2);
  }
  .bubble-label {
    font-family: var(--font-heading);
    font-size: 0.48rem;
    font-weight: 700;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .bubble-badge {
    font-size: 0.48rem;
    color: var(--text-muted);
    margin-left: 2px;
  }

  .bubble-body { flex: 1; }

  .bubble-text {
    font-family: var(--font-mono);
    font-size: 0.67rem;
    color: var(--text-primary);
    line-height: 1.55;
    white-space: pre-line;
    margin: 0;
  }
  .bubble-text.muted { color: var(--text-muted); }

  .bubble-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 5px;
    border-top: 1px solid rgba(6,182,212,0.15);
  }

  .ctrl-btn {
    background: none; border: none; cursor: pointer; padding: 1px 0;
    font-size: 0.48rem;
    color: var(--accent);
    transition: opacity 0.15s;
  }
  .ctrl-btn:disabled { opacity: 0.3; cursor: default; }
  .ctrl-btn:not(:disabled):hover { text-decoration: underline; }

  .nav { display: flex; align-items: center; gap: 6px; }
  .nav-count { font-size: 0.48rem; color: var(--text-muted); }

  /* ─── Misc animations ───────────────────────────────────────────── */
  .burst { animation: burst-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
  .fade-up { animation: fade-up 0.4s 0.15s ease both; }

  .cursor {
    color: var(--accent);
    font-weight: bold;
    animation: blink 0.8s step-end infinite;
  }

  @keyframes pane-in   { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes burst-pop { from { transform: scale(0.3);  opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes fade-up   { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes pulse     { 0%,100% { transform: scale(1);   opacity: 1; } 50% { transform: scale(1.3); opacity: 0.6; } }
  @keyframes blink     { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
</style>