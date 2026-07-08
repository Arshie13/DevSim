<script context="module" lang="ts">
  // Re-export the shared interface under the legacy name for backward-compat.
  export type { LoadStep as BootStep } from '$lib/components/ui/LoadingSteps.svelte';
</script>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import LoadingSteps from '$lib/components/ui/LoadingSteps.svelte';
  import type { LoadStep } from '$lib/components/ui/LoadingSteps.svelte';

  /** Index of the currently active step (0-based). */
  export let step: number = 0;
  /** Full list of boot steps. */
  export let steps: LoadStep[] = [];
  /** Non-empty string means a fatal error occurred. */
  export let error: string = '';
  /** Displayed at the bottom — e.g. "Level 1 · Library Management". */
  export let levelLabel: string = '';

  const dispatch = createEventDispatcher<{ retry: void }>();
</script>

<LoadingSteps
  overlay
  brand
  {step}
  {steps}
  {error}
  footer={levelLabel}
  subtitle="Initialising workspace environment…"
  errorPrefix="Boot failed"
  on:retry
/>

<!-- All styles are owned by LoadingSteps.svelte -->
