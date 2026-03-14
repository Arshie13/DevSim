<script lang="ts">
  import { goto } from '$app/navigation';
  import { toast } from '$lib/stores/toast';
  import type { ScenarioMeta, StackSelection } from '$types';
  import {
    FRONTEND_OPTIONS,
    BACKEND_OPTIONS,
    DATABASE_OPTIONS,
    SERVICES_OPTIONS,
  } from '$mocks';
  import ScenarioHeader from './ScenarioHeader.svelte';
  import EmptyState from './EmptyState.svelte';
  import ConfirmationModal from '$components/ui/ConfirmationModal.svelte';
  import ScenarioCarousel from './ScenarioCarousel.svelte';

  export let scenarios: ScenarioMeta[];
  export let stackName: string;
  export let selection: StackSelection;
  /** Whether the current user has already completed onboarding before. */
  export let hasCompletedOnboarding: boolean = true;

  let activeIndex = 0;
  let isLoading = false;
  let showExistingModal = false;
  let existingContainerDbId = '';
  let existingContainerMessage = '';

  // Default to showing the tour for first-time users; returning users start unchecked.
  let withOnboarding = !hasCompletedOnboarding;
  let showSkipWarning = false;

  $: activeScenario = scenarios[activeIndex] ?? null;

  $: stackDisplayName = (() => {
    const parts: string[] = [];
    const lookup = [
      [FRONTEND_OPTIONS, selection?.frontend],
      [BACKEND_OPTIONS, selection?.backend],
      [DATABASE_OPTIONS, selection?.database],
      [SERVICES_OPTIONS, selection?.services],
    ] as const;
    for (const [options, id] of lookup) {
      if (!id) continue;
      const found = (options as { id: string; name: string }[]).find((o) => o.id === id);
      parts.push(found?.name ?? id);
    }
    return parts.join(' + ');
  })();

  function navigateToWorkspace(containerId: string) {
    const url = withOnboarding
      ? `/workspace/${containerId}?onboarding=1`
      : `/workspace/${containerId}`;
    goto(url);
  }

  async function handleStartSprint() {
    if (!activeScenario || isLoading) return;
    isLoading = true;
    try {
      const sessionRes = await fetch('/auth/session');
      const sessionData = sessionRes.ok ? await sessionRes.json() : null;
      if (!sessionData?.user?.id) {
        toast.error('Your session is outdated. Please sign out and sign back in.');
        return;
      }

      const createRes = await fetch('/api/docker/container/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stackName,
          level: 1,
          stacks: selection,
          scenarioId: activeScenario.id,
          projectFolder: activeScenario.projectFolder,
          scenarioTitle: activeScenario.title,
        }),
      });

      const data = await createRes.json();

      if (!data.success) {
        toast.error(`Failed to create container: ${data.error}`);
        return;
      }

      if (data.alreadyExists) {
        existingContainerDbId = data.dbContainerId;
        existingContainerMessage = data.message;
        showExistingModal = true;
        return;
      }

      navigateToWorkspace(data.dbContainerId);
    } catch (err) {
      console.error('Error starting sprint:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="w-full">
  <ScenarioHeader {stackDisplayName} scenarioCount={scenarios.length} summary={null} />
  <div class="mt-6">
  {#if scenarios.length === 0}
    <EmptyState {stackName} />
  {:else}
    <ScenarioCarousel
      {scenarios}
      {isLoading}
      bind:activeIndex
      bind:withOnboarding
      on:launchSprint={handleStartSprint}
      on:requestSkipConfirm={() => (showSkipWarning = true)}
    />
  {/if}
  </div>
</div>

<!-- Existing container dialog -->
<ConfirmationModal
  bind:open={showExistingModal}
  icon="⟨◉⟩"
  iconVariant="accent"
  title="Active Session Detected"
  subtitle="Existing workspace found"
  description={existingContainerMessage}
  confirmLabel="Continue to Workspace"
  cancelLabel="Cancel"
  variant="primary"
  on:confirm={() => { showExistingModal = false; navigateToWorkspace(existingContainerDbId); }}
  on:cancel={() => { showExistingModal = false; existingContainerDbId = ''; }}
/>

<!-- Skip-onboarding warning -->
<ConfirmationModal
  bind:open={showSkipWarning}
  icon="?"
  iconVariant="warning"
  title="Skip Onboarding?"
  subtitle="You're about to disable the onboarding guide"
  description="Are you sure you want to skip the onboarding tutorial and workspace tour? You'll jump straight into the project without any guided walkthrough. This is recommended only if you're already familiar with the workspace."
  confirmLabel="Yes, skip it"
  cancelLabel="Keep Tour"
  variant="warning"
  on:confirm={() => { showSkipWarning = false; withOnboarding = false; }}
  on:cancel={() => { showSkipWarning = false; }}
/>