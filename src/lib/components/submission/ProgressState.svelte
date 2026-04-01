<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { SubmitStep } from '$lib/types/Submission';
  
  export let state: 'loading' | 'testing';
  export let activeStepIndex: number;
  export let activeStep: SubmitStep;
  export let submitSteps: SubmitStep[];
  export let loadingTitle: string;
  export let loadingSubtitle: string;
  export let cancelingSubmit: boolean;
  
  const dispatch = createEventDispatcher<{ cancel: void }>();
</script>

<div class="py-8">
  <!-- Progress Steps -->
  <div class="space-y-4 mb-8">
    {#each submitSteps as step, i}
      <div class="flex items-center gap-3" class:opacity-50={i > activeStepIndex}>
        <div 
          class="w-8 h-8 rounded-full flex items-center justify-center text-lg"
          class:bg-cyan-500={i <= activeStepIndex}
          class:bg-slate-700={i > activeStepIndex}
        >
          {#if i < activeStepIndex}
            ✓
          {:else}
            {step.icon}
          {/if}
        </div>
        <div>
          <div class="text-sm font-medium text-gray-200">{step.label}</div>
          <div class="text-xs text-gray-400">{step.detail}</div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Current Status -->
  <div class="text-center">
    <h3 class="text-lg font-medium text-gray-200 mb-1">{loadingTitle}</h3>
    <p class="text-sm text-gray-400">{loadingSubtitle}</p>
  </div>

  <!-- Cancel Button -->
  <div class="mt-8 text-center">
    <button
      on:click={() => dispatch('cancel')}
      disabled={cancelingSubmit}
      class="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
    >
      {cancelingSubmit ? 'Canceling...' : 'Cancel Submission'}
    </button>
  </div>
</div>
