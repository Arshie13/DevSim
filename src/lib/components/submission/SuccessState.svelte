<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { AIScoring, SubmitRewards } from '$lib/types/Submission';
  
  export let advancingToNextLevel: boolean;
  export let aiScoring: AIScoring;
  export let rewards: SubmitRewards;
  
  const dispatch = createEventDispatcher<{ done: void; continue: void }>();
  
  $: stars = Array(5).fill(0).map((_, i) => i < aiScoring.stars);
</script>

<div class="space-y-6 text-center">
  <!-- Success Header -->
  <div class="text-6xl mb-4">🎉</div>
  <h3 class="text-xl font-bold text-gray-100">
    {advancingToNextLevel ? 'Level Complete!' : 'All Levels Complete!'}
  </h3>

  <!-- AI Scoring -->
  {#if aiScoring.done}
    <div class="bg-slate-800/50 rounded-lg p-6">
      <!-- Stars -->
      <div class="flex justify-center gap-1 mb-4">
        {#each stars as filled}
          <span class="text-2xl" class:text-yellow-400={filled} class:text-gray-600={!filled}>
            ★
          </span>
        {/each}
      </div>
      
      <div class="text-3xl font-bold text-cyan-400 mb-2">
        {aiScoring.score}/100
      </div>
      
      {#if aiScoring.feedback}
        <p class="text-sm text-gray-300 mb-4">{aiScoring.feedback}</p>
      {/if}
      
      {#if aiScoring.improvements}
        <div class="text-left bg-slate-900/50 rounded p-3 mb-3">
          <div class="text-xs text-gray-400 mb-1">💡 Improvements</div>
          <p class="text-sm text-gray-300">{aiScoring.improvements}</p>
        </div>
      {/if}
      
      {#if aiScoring.nextTime}
        <div class="text-left bg-slate-900/50 rounded p-3">
          <div class="text-xs text-gray-400 mb-1">🎯 Next Time</div>
          <p class="text-sm text-gray-300">{aiScoring.nextTime}</p>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Rewards -->
  <div class="flex justify-center gap-6">
    <div class="text-center">
      <div class="text-3xl mb-1">⭐</div>
      <div class="text-sm text-gray-400">XP Earned</div>
      <div class="text-lg font-bold text-cyan-400">+{rewards.xp}</div>
    </div>
    <div class="text-center">
      <div class="text-3xl mb-1">🪙</div>
      <div class="text-sm text-gray-400">Coins Earned</div>
      <div class="text-lg font-bold text-yellow-400">+{rewards.coins}</div>
    </div>
  </div>

  <!-- Actions -->
  <div class="flex gap-3 justify-center">
    <button
      on:click={() => dispatch('done')}
      class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium"
    >
      Go to Dashboard
    </button>
    {#if advancingToNextLevel}
      <button
        on:click={() => dispatch('continue')}
        class="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-sm font-medium text-white"
      >
        Continue to Next Level
      </button>
    {/if}
  </div>
</div>