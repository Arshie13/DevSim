<script lang="ts">
  import { onMount } from 'svelte';
  import OnboardingModal from './OnboardingModal.svelte';
  import WorkspaceTour   from './WorkspaceTour.svelte';
  import { getStackContent } from './onboardingContent';

  /** The tech stack label (e.g. "Next.js + Prisma"). */
  export let stack: string = '';
  /** Level title (e.g. "Setup & First API Route"). */
  export let title: string = '';
  /** Full scenario description from the level config. */
  export let scenario: string = '';
  /** Current level number. */
  export let level: number = 1;
  /**
   * Called when a tour step needs the workspace to show a specific tab
   * (e.g. 'editor'). The parent page handles the actual tab switch.
   */
  export let onSwitchTab: ((tab: string) => void) | undefined = undefined;

  // ── Phase machine ──────────────────────────────────────────────────────────
  // 'loading' → check API → 'modal' | 'done' → 'tour' → 'done'
  let phase: 'loading' | 'modal' | 'tour' | 'done' = 'loading';

  $: content = getStackContent(stack);

  // ── API helpers ────────────────────────────────────────────────────────────
  async function checkOnboardingStatus() {
    try {
      const res = await fetch('/api/user/onboarding');
      if (res.ok) {
        const data = await res.json() as { completed: boolean };
        phase = data.completed ? 'done' : 'modal';
      } else {
        // Can't confirm status — show onboarding to be safe
        phase = 'modal';
      }
    } catch {
      phase = 'modal';
    }
  }

  async function markOnboardingComplete() {
    try {
      await fetch('/api/user/onboarding', { method: 'POST' });
    } catch {
      // Non-critical — ignore
    }
  }

  onMount(() => { checkOnboardingStatus(); });

  // ── Phase transitions ──────────────────────────────────────────────────────
  function onModalComplete() { phase = 'tour'; }

  function onModalSkip() {
    markOnboardingComplete();
    phase = 'done';
  }

  function onTourComplete() {
    markOnboardingComplete();
    phase = 'done';
  }
</script>

<!-- Only render anything while onboarding is active -->
{#if phase === 'modal'}
  <OnboardingModal
    {stack}
    {title}
    {scenario}
    {level}
    on:complete={onModalComplete}
    on:skip={onModalSkip}
  />
{/if}

{#if phase === 'tour'}
  <WorkspaceTour
    accentColor={content.accentColor}
    {onSwitchTab}
    on:complete={onTourComplete}
  />
{/if}

