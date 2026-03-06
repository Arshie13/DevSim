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
  import ScenarioCard from './ScenarioCard.svelte';
  import EmptyState from './EmptyState.svelte';
  import ScenarioDetailModal from './ScenarioDetailModal.svelte';
  import ConfirmationModal from '$components/ui/ConfirmationModal.svelte';

  export let scenarios: ScenarioMeta[];
  export let stackName: string;
  export let selection: StackSelection;

  let selectedScenarioId: string | null = null;
  let isLoading = false;
  let showDetailModal = false;

  // Existing-container dialog state
  let showExistingModal = false;
  let existingContainerDbId = '';
  let existingContainerMessage = '';

  $: selectedScenario = scenarios.find((s) => s.id === selectedScenarioId) ?? null;

  // Build human-readable display name from the StackSelection object
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

  function handleSelect(id: string) {
    selectedScenarioId = id;
    showDetailModal = true;
  }

  function handleModalClose() {
    showDetailModal = false;
    selectedScenarioId = null;
  }

  function navigateToWorkspace(containerId: string) {
    goto(`/workspace/${containerId}`);
  }

  async function handleStartSprint() {
    if (!selectedScenarioId || !selectedScenario || isLoading) return;

    isLoading = true;
    try {
      // Pre-flight: verify the session is still valid
      const sessionCheckResponse = await fetch('/auth/session');
      if (!sessionCheckResponse.ok) {
        toast.error('Your session is outdated. Please sign out and sign back in.');
        return;
      }
      const sessionData = await sessionCheckResponse.json();
      if (!sessionData?.user?.id) {
        toast.error('Your session is outdated. Please sign out and sign back in.');
        return;
      }

      const createResponse = await fetch('/api/docker/container/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stackName,
          level: 1,
          stacks: selection,
          scenarioId: selectedScenario.id,
          projectFolder: selectedScenario.projectFolder,
          scenarioTitle: selectedScenario.title,
        }),
      });

      const createData = await createResponse.json();

      if (!createData.success) {
        if (createResponse.status === 401) {
          toast.error('Your session is outdated. Please sign out and sign back in.');
        } else {
          toast.error(`Failed to create container: ${createData.error}`);
        }
        return;
      }

      if (createData.alreadyExists) {
        existingContainerDbId = createData.dbContainerId;
        existingContainerMessage = createData.message;
        showExistingModal = true;
        return;
      }

      navigateToWorkspace(createData.dbContainerId);
    } catch (err) {
      console.error('Error starting sprint:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="w-full">
  <ScenarioHeader
    {stackDisplayName}
    scenarioCount={scenarios.length}
    summary={null}
  />

  {#if scenarios.length === 0}
    <EmptyState {stackName} />
  {:else}
    <!-- auto-fill grid needs CSS; Tailwind has no auto-fill minmax utility -->
    <div class="cards-grid mb-8">
      {#each scenarios as scenario (scenario.id)}
        <ScenarioCard
          {scenario}
          isSelected={selectedScenarioId === scenario.id}
          onSelect={handleSelect}
        />
      {/each}
    </div>

    <!-- Scenario detail modal -->
    <ScenarioDetailModal
      bind:open={showDetailModal}
      scenario={selectedScenario}
      {isLoading}
      on:startSprint={handleStartSprint}
      on:close={handleModalClose}
    />
  {/if}
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

<style>
  /* auto-fill minmax grid — not expressible in Tailwind without arbitrary values per breakpoint */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1rem;
  }
</style>
