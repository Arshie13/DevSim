<script lang="ts">
  import { browser } from "$app/environment";
  import TutorialHelper from "$components/tutorial/TutorialHelper.svelte";
  import {
    STEPS,
    type InteractiveStep,
  } from "$components/tutorial/NESTJS_POSTGRES_PRISMA/NestjsPostgresPrismaTutorialData";

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

    if (step.id === "task-two-schema-edit") {
      window.dispatchEvent(
        new CustomEvent("devsim-tour-open-file", {
          detail: {
            file: "prisma/schema.prisma",
            lineNumber: 14,
            searchTerm: "completed Boolean",
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
  stack="NestJS + Postgres + Prisma"
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
