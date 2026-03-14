<script lang="ts">
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
  // The parent decides whether to render this component at all.
  // When rendered, always start with the modal immediately.
  // 'modal' → 'tour' → 'done'
  let phase: 'modal' | 'tour' | 'done' = 'modal';

  $: content = getStackContent(stack);

  // ── Mark completion in DB (non-critical) ──────────────────────────────────
  async function markOnboardingComplete() {
    try {
      await fetch('/api/user/onboarding', { method: 'POST' });
    } catch {
      // Non-critical — ignore
    }
  }

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

