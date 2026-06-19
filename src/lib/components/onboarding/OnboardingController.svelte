<script lang="ts">
  import PERNTutorial from '../tutorial/PERN/PERNTutorial.svelte';
  import NestjsPostgresPrismaTutorial from '../tutorial/NESTJS_POSTGRES_PRISMA/NestjsPostgresPrismaTutorial.svelte';
  import NextjsShadcnTutorial from '../tutorial/NEXTJS_SHADCN/NextjsShadcnTutorial.svelte';
  import MERNTutorial from '../tutorial/MERN/MERNTutorial.svelte';
  import NextjsPostgresPrismaTutorial from '../tutorial/NEXTJS_POSTGRES_PRISMA/NextjsPostgresPrismaTutorial.svelte';
  import { getStackKey } from './onboardingContent';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { notifyAchievementUnlocks } from '$lib/stores/achievementToast';

  /** The tech stack label (e.g. "Next.js + Prisma"). */
  export let stack: string = '';
  /** Level title (e.g. "Setup & First API Route"). */
  export let title: string = '';
  /** Full scenario description from the level config. */
  export let scenario: string = '';
  /** Current level number. */
  export let level: number = 1;
  /** Which stack tutorial to run after workspace tour. */
  export let stackTutorialType: 'auto' | 'pern' | 'nestjs' | 'shadcn' | 'mern' | 'nextjs-postgres-prisma' | 'none' = 'auto';
  /** Allows dismissing tutorial intro/tour. Set false for mandatory tutorials. */
  export let allowSkip: boolean = true;
  /**
   * Called when a tour step needs the workspace to show a specific tab
   * (e.g. 'editor'). The parent page handles the actual tab switch.
   */
  export let onSwitchTab: ((tab: string) => void) | undefined = undefined;
  /**
   * Called when onboarding is fully complete (modal + tour).
   * Parent can use this to trigger UI transitions.
   */
  export let onComplete: (() => void) | undefined = undefined;
  /**
   * Called when the tutorial needs to run tests.
   */
  export let onRunTests: (() => void) | undefined = undefined;
  /**
   * Called when the tutorial needs to submit the sprint.
   */
  export let onSubmitSprint: (() => void) | undefined = undefined;

  // ── Phase machine ──────────────────────────────────────────────────────────
  // Direct tutorial flow only: stackTutorial → done
  let phase: 'stackTutorial' | 'done' = 'stackTutorial';

  $: stackKey = getStackKey(stack);
  $: isPernStack = stackKey === 'pern' || stackKey === 'react-express-postgres';
  $: isNestjsStack = stackKey === 'nestjs-postgres';
  $: isShadcnStack = stackKey === 'nextjs-shadcn';
  $: isMernStack = stackKey === 'mern' || stackKey === 'react-express-mongodb';
  $: isNextjsPostgresPrismaStack = stackKey === 'nextjs-postgres-prisma';
  $: resolvedStackTutorialType =
    stackTutorialType === 'auto'
      ? isPernStack
        ? 'pern'
        : isNestjsStack
          ? 'nestjs'
          : isShadcnStack
            ? 'shadcn'
            : isMernStack
              ? 'mern'
              : isNextjsPostgresPrismaStack
                ? 'nextjs-postgres-prisma'
                : 'none'
      : stackTutorialType;

  // ── Mark completion in DB (non-critical) ──────────────────────────────────
  async function markOnboardingComplete() {
    try {
      const res = await fetch('/api/user/onboarding', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        notifyAchievementUnlocks(data.newlyUnlocked);
      }
    } catch {
      // Non-critical — ignore
    }
  }

  // Clear the onboarding URL param after completion
  function clearOnboardingParam() {
    if (browser) {
      const url = new URL(window.location.href);
      url.searchParams.delete('onboarding');
      url.searchParams.delete('tutorial');
      url.searchParams.delete('tutorialRequired');
      goto(url.pathname + url.search, { replaceState: true, noScroll: true });
    }
  }

  // ── Phase transitions ──────────────────────────────────────────────────────────
  function finishTutorialFlow() {
    markOnboardingComplete();
    clearOnboardingParam();
    phase = 'done';
    if (onComplete) {
      onComplete();
    }
  }

  function onStackTutorialComplete() {
    finishTutorialFlow();
  }

  $: if (phase === 'stackTutorial' && resolvedStackTutorialType === 'none') {
    onStackTutorialComplete();
  }
</script>

<!-- Only render anything while onboarding is active -->
{#if phase === 'stackTutorial'}
  {#if resolvedStackTutorialType === 'pern'}
    <PERNTutorial
      {title}
      {scenario}
      {level}
      {allowSkip}
      {onSwitchTab}
      {onRunTests}
      {onSubmitSprint}
      on:complete={onStackTutorialComplete}
    />
  {:else if resolvedStackTutorialType === 'nestjs'}
    <NestjsPostgresPrismaTutorial
      {title}
      {scenario}
      {level}
      {allowSkip}
      {onSwitchTab}
      {onRunTests}
      {onSubmitSprint}
      on:complete={onStackTutorialComplete}
    />
  {:else if resolvedStackTutorialType === 'shadcn'}
    <NextjsShadcnTutorial
      {title}
      {scenario}
      {level}
      {allowSkip}
      {onSwitchTab}
      {onRunTests}
      {onSubmitSprint}
      on:complete={onStackTutorialComplete}
    />
  {:else if resolvedStackTutorialType === 'mern'}
    <MERNTutorial
      {title}
      {scenario}
      {level}
      {allowSkip}
      {onSwitchTab}
      {onRunTests}
      {onSubmitSprint}
      on:complete={onStackTutorialComplete}
    />
  {:else if resolvedStackTutorialType === 'nextjs-postgres-prisma'}
    <NextjsPostgresPrismaTutorial
      {title}
      {scenario}
      {level}
      {allowSkip}
      {onSwitchTab}
      {onRunTests}
      {onSubmitSprint}
      on:complete={onStackTutorialComplete}
    />
  {/if}
{/if}
