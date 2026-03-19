<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import AIScoreCard from '$lib/components/ui/AIScoreCard.svelte';

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

  const dispatch = createEventDispatcher<{ done: void; continue: void }>();

  function handleDone() {
    dispatch('done');
  }

  function handleContinueWorking() {
    dispatch('continue');
  }
</script>

<div class="success-card text-center py-2">
  <div class="mb-3 inline-flex items-center gap-2 rounded-[3px] border border-[rgba(0,229,160,0.28)] bg-[rgba(0,229,160,0.08)] px-3 py-1.5">
    <span class="burst-anim text-xl" aria-hidden="true">🎉</span>
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
    <div class="fade-up-anim rounded-[4px] border border-[rgba(0,229,160,0.3)] bg-[rgba(15,34,16,0.8)] px-3 py-3 text-center">
      <p class="[font-family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.1em] text-[var(--success)]">XP Earned</p>
      <p class="mt-1 [font-family:var(--font-heading)] text-[1.35rem] font-bold text-[var(--text-primary)]">⚡ +{submitRewards.xp}</p>
    </div>
    <div class="fade-up-anim [animation-delay:0.15s] rounded-[4px] border border-[rgba(255,180,0,0.3)] bg-[rgba(31,21,8,0.8)] px-3 py-3 text-center">
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
      <button
        on:click={handleContinueWorking}
        class="btn-cyber fade-up-anim cursor-pointer border border-[rgba(0,229,160,0.55)] bg-[rgba(0,229,160,0.12)] !px-5 !py-2.5 [font-family:var(--font-heading)] !text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--success)] shadow-[0_0_16px_rgba(0,229,160,0.25)] transition-all duration-200 hover:-translate-y-[1px] hover:border-[rgba(0,229,160,0.8)] hover:bg-[rgba(0,229,160,0.2)]"
      >
        Continue Working →
      </button>
    {/if}
    <button
      on:click={handleDone}
      class="btn-cyber btn-cyber-solid fade-up-anim {advancingToNextLevel ? '[animation-delay:0.1s]' : ''} cursor-pointer !px-7 !py-2.5 [font-family:var(--font-heading)] !text-[0.78rem] font-bold uppercase tracking-[0.08em] shadow-[0_0_16px_var(--accent-glow)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_0_26px_var(--accent-glow)]"
    >
      Back to Dashboard
    </button>
    </div>
  </div>
</div>

<style>
  .success-card {
    animation: success-pane-in 0.28s ease-out both;
  }

  .burst-anim {
    animation: burst-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  .fade-up-anim {
    animation: fade-up 0.4s 0.15s ease both;
  }

  @keyframes burst-pop {
    from {
      transform: scale(0.3);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes fade-up {
    from {
      transform: translateY(10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes success-pane-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
