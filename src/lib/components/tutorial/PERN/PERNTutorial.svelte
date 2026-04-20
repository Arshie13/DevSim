<script lang="ts">
  import { browser } from "$app/environment";
  import TutorialHelper from "$components/tutorial/TutorialHelper.svelte";
  import {
    STEPS,
    type InteractiveStep,
  } from "$components/tutorial/PERN/PERNTutorialData";

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

    if (step.id === "open-explorer") {
      window.dispatchEvent(new CustomEvent("devsim-tour-open-explorer-panel"));
      window.dispatchEvent(new CustomEvent("devsim-tour-collapse-root-folder"));
    }

    if (step.id === "readme-open") {
      window.dispatchEvent(new CustomEvent("devsim-tour-open-explorer-panel"));
    }

    if (step.id === "task-two-ui-edit") {
      window.dispatchEvent(
        new CustomEvent("devsim-tour-open-file", {
          detail: {
            file: "client/src/pages/TodoPage.tsx",
            lineNumber: 71,
            searchTerm: "To-Do List Tutorial",
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
  stack="PERN"
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
