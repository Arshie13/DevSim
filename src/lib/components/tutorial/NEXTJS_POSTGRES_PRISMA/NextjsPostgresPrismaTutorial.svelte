<script lang="ts">
  import { browser } from "$app/environment";
  import TutorialHelper from "$components/tutorial/TutorialHelper.svelte";
  import {
    STEPS,
    type InteractiveStep,
  } from "$components/tutorial/NEXTJS_POSTGRES_PRISMA/NextjsPostgresPrismaTutorialData";

  export let title: string = "Guided Tutorial";
  export let scenario: string = "";
  export let level: number = 1;
  export let allowSkip: boolean = true;
  export let onSwitchTab: ((tab: string) => void) | undefined = undefined;
  export let onRunTests: (() => void) | undefined = undefined;
  export let onSubmitSprint: (() => void) | undefined = undefined;

  const steps = STEPS;

  async function handlePrepareStep(step: InteractiveStep) {
    if (!browser) return;

    if (step.id === "readme-open") {
      window.dispatchEvent(new CustomEvent("devsim-tour-open-explorer-panel"));
    }

    if (step.id === "task-two-header-edit") {
      window.dispatchEvent(
        new CustomEvent("devsim-tour-open-file", {
          detail: {
            file: "src/app/page.tsx",
            lineNumber: 1,
            searchTerm: "My To-Do List",
          },
        }),
      );
    }

    if (step.id === "submit-sprint-reflection") {
      const target = document.querySelector(
        '[data-tour="mastery-reflection-input"]',
      ) as HTMLElement;
      target?.dispatchEvent(new CustomEvent("focus", { bubbles: true }));
    }
  }
</script>

<TutorialHelper
  {steps}
  stack="Next.js + Postgres + Prisma"
  {title}
  {scenario}
  {level}
  {allowSkip}
  {onSwitchTab}
  {onRunTests}
  {onSubmitSprint}
  onPrepareStep={handlePrepareStep}
  on:complete
/>
