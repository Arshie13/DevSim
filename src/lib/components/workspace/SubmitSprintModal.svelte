<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import { createSubmitFlow } from "$lib/components/submission/submission-flow";
  import { SUBMIT_STEPS } from "$lib/constants/submissionConstants";
  import type { ITask } from "$lib/types";

  import ConfirmState from "$lib/components/submission/ConfirmState.svelte";
  import ProgressState from "$lib/components/submission/ProgressState.svelte";
  import ErrorState from "$lib/components/submission/ErrorState.svelte";
  import SuccessState from "$lib/components/submission/SuccessState.svelte";

  // Props
  export let dbContainerId: string | null;
  export let containerId: string;
  export let tasks: ITask[];
  export let level: number = 1;
  export let fileContents: Record<string, string> = {};
  export let existingFiles: string[] = [];
  export let levelXpReward: number = 0;
  export let levelCoinReward: number = 0;

  const dispatch = createEventDispatcher<{
    submitted: {
      xp: number;
      coins: number;
      advanceToNextLevel: boolean;
      nextLevel: number | null;
    };
  }>();

  // Initialize flow
  const flow = createSubmitFlow({
    dbContainerId,
    containerId,
    tasks,
    level,
    fileContents,
    existingFiles,
    onComplete: (result) =>
      dispatch("submitted", {
        ...result,
        xp: levelXpReward,
        coins: levelCoinReward,
        advanceToNextLevel: true,
        nextLevel: level + 1,
      }),
  });

  // Destructure for template
  const {
    state,
    showModal,
    showCancelConfirm,
    submitError,
    cancelingSubmit,
    fileChanges,
    loadingFileChanges,
    testResults,
    regressedTasks,
    aiScoring,
    rewards,
    nextLevel,
    advancingToNextLevel,
    completedCount,
    activeStep,
    start,
    cancel,
    openCancelConfirm,
    dismissCancelConfirm,
    confirmCancel,
    handleDone,
    handleContinue,
    reset,
  } = flow;

  // Public API
  export function open() {
    reset();
    $showModal = true;
  }

  // Modal props based on state
  $: modalProps = (() => {
    switch ($state) {
      case "error":
        return {
          icon: "⚠",
          iconVariant: "danger" as const,
          title:
            $regressedTasks.length > 0 ? "Tasks Regressed" : "Tests Failed",
          subtitle: "",
          confirmLabel: $regressedTasks.length > 0 ? "Fix Issues" : "Retry",
          cancelLabel: "Close",
          variant: "danger" as const,
          hideActions: false,
          hideHeader: false,
        };
      case "loading":
        return {
          icon: "",
          iconVariant: "accent" as const,
          title: "",
          subtitle: "",
          confirmLabel: "Submit & Continue",
          cancelLabel: "Cancel",
          variant: "primary" as const,
          hideActions: true,
          hideHeader: true,
        };
      case "testing":
        return {
          icon: "",
          iconVariant: "warning" as const,
          title: "Running Tests…",
          subtitle: "",
          confirmLabel: "Submit & Continue",
          cancelLabel: "Cancel",
          variant: "warning" as const,
          hideActions: true,
          hideHeader: true,
        };
      case "success":
        return {
          icon: "⟨/⟩",
          iconVariant: "success" as const,
          title: "Success!",
          subtitle: "",
          confirmLabel: "Continue",
          cancelLabel: "",
          variant: "success" as const,
          hideActions: true,
          hideHeader: false,
        };
      default: // confirm
        return {
          icon: "⟨/⟩",
          iconVariant: "accent" as const,
          title: "Submit Sprint?",
          subtitle:
            "Are you sure you want to submit your completed tasks? This will validate your work and award XP and coins if all tests pass.",
          confirmLabel: "Submit & Continue",
          cancelLabel: "Cancel",
          variant: "primary" as const,
          hideActions: false,
          hideHeader: false,
        };
    }
  })();
</script>

<!-- Main Modal -->
<ConfirmationModal
  bind:open={$showModal}
  icon={modalProps.icon}
  iconVariant={modalProps.iconVariant}
  title={modalProps.title}
  subtitle={modalProps.subtitle}
  confirmLabel={modalProps.confirmLabel}
  cancelLabel={modalProps.cancelLabel}
  variant={modalProps.variant}
  hideActions={modalProps.hideActions}
  hideHeader={modalProps.hideHeader}
  showSuccess={$state === "success"}
  error={$state === "error" ? $submitError : ""}
  on:confirm={start}
  on:cancel={cancel}
>
  <!-- Dynamic Content -->
  {#if $state === "confirm"}
    <ConfirmState
      {tasks}
      completedCount={$completedCount}
      loadingFileChanges={$loadingFileChanges}
      fileChanges={$fileChanges}
      rewardXp={levelXpReward}
      rewardCoins={levelCoinReward}
    />
  {:else if $state === "loading" || $state === "testing"}
    <ProgressState
      state={$state}
      activeStepIndex={$activeStep.index}
      activeStep={$activeStep.data}
      submitSteps={SUBMIT_STEPS}
      loadingTitle={$activeStep.data.label}
      loadingSubtitle={$activeStep.data.detail}
      cancelingSubmit={$cancelingSubmit}
      on:cancel={openCancelConfirm}
    />
  {:else if $state === "error"}
    <ErrorState error={$submitError} regressedTasks={$regressedTasks} />
  {/if}

  <!-- Success Slot -->
  <svelte:fragment slot="success">
    <SuccessState
      advancingToNextLevel={$advancingToNextLevel}
      aiScoring={$aiScoring}
      rewards={$rewards}
      on:done={handleDone}
      on:continue={handleContinue}
    />
  </svelte:fragment>
</ConfirmationModal>

<!-- Cancel Confirmation Modal -->
<ConfirmationModal
  bind:open={$showCancelConfirm}
  icon="⚠"
  iconVariant="warning"
  title="Cancel Submission?"
  subtitle="This will stop test/submit progress for this run"
  description="Are you sure you want to cancel this submission process?"
  confirmLabel="Yes, Cancel"
  cancelLabel="No, Continue"
  variant="warning"
  isLoading={$cancelingSubmit}
  loadingLabel="Canceling…"
  on:confirm={confirmCancel}
  on:cancel={dismissCancelConfirm}
/>
