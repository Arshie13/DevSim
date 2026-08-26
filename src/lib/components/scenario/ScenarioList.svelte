<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
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
  export let tutorialState: {
    isNewUser: boolean;
    hasCompletedTutorial: boolean;
  };

  let activeIndex = 0;
  let isLoading = false;
  let showExistingModal = false;
  let existingContainerDbId = '';
  let existingContainerMessage = '';

  let withTutorial = false;
  let showSkipTutorialWarning = false;

  onMount(() => {
    withTutorial = !tutorialState.hasCompletedTutorial;
  });

  function handleTutorialToggleChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.checked) {
      if (!tutorialState.hasCompletedTutorial) {
        input.checked = true;
        showSkipTutorialWarning = true;
      } else {
        withTutorial = false;
      }
    } else {
      withTutorial = true;
    }
  }

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
    const params = new URLSearchParams();
    if (withTutorial) {
      params.set('tutorial', '1');
      params.set('stackName', stackName);
      params.set('selection', JSON.stringify(selection));
      if (activeScenario?.id) params.set('scenarioId', activeScenario.id);
      if (activeScenario?.projectFolder) params.set('projectFolder', activeScenario.projectFolder);
      if (activeScenario?.title) params.set('scenarioTitle', activeScenario.title);

      // Keep the launch context available if onboarding rewrites the URL before
      // the tutorial completion callback runs.
      if (browser) {
        try {
          sessionStorage.setItem(
            `tutorial-launch:v1:${containerId}`,
            JSON.stringify({
              stackName,
              selection,
              scenarioId: activeScenario?.id ?? null,
              projectFolder: activeScenario?.projectFolder ?? null,
              scenarioTitle: activeScenario?.title ?? null,
            }),
          );
        } catch {
          // Continue with the URL context when storage is unavailable.
        }
      }
    }

    const query = params.toString();
    const baseRoute = withTutorial ? `/tutorial/${containerId}` : `/workspace/${containerId}`;
    const url = query ? `${baseRoute}?${query}` : baseRoute;
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
          mode: withTutorial ? 'tutorial' : 'workspace',
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

  <!-- Tutorial Mode Toggle Bar -->
  <div class="tutorial-bar mt-5">
    <div class="tutorial-bar-left">
      <span class="tutorial-bar-icon" aria-hidden="true">🎓</span>
      <div class="tutorial-bar-text">
        <span class="tutorial-bar-title">Guided Tutorial Mode</span>
        <span class="tutorial-bar-desc">Complete an isolated tutorial sprint before entering your real workspace</span>
      </div>
    </div>
    <div class="tutorial-bar-right">
      {#if tutorialState.isNewUser}
        <span class="tutorial-bar-badge tutorial-bar-badge--new">New User</span>
      {/if}
      <label class="tutorial-bar-switch" title={withTutorial ? 'Tutorial mode on — click to disable' : 'Tutorial mode off — click to enable'}>
        <input
          type="checkbox"
          class="sr-only"
          checked={withTutorial}
          on:change={handleTutorialToggleChange}
        />
        <span class="tutorial-bar-track" class:tutorial-bar-track--on={withTutorial}>
          <span class="tutorial-bar-knob"></span>
        </span>
        <span class="tutorial-bar-switch-label" class:tutorial-bar-switch-label--on={withTutorial}>
          {withTutorial ? 'On' : 'Off'}
        </span>
      </label>
    </div>
  </div>

  <div class="mt-6">
  {#if scenarios.length === 0}
    <EmptyState {stackName} />
  {:else}
    <ScenarioCarousel
      {scenarios}
      {isLoading}
      bind:activeIndex
      on:launchSprint={handleStartSprint}
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

<!-- Warning when new/new-to-stack user disables tutorial -->
<ConfirmationModal
  bind:open={showSkipTutorialWarning}
  icon="⚠"
  iconVariant="warning"
  title="Skip the Tutorial?"
  subtitle={tutorialState.isNewUser ? "You're new to DevSim" : "No tutorial completed yet"}
  description={tutorialState.isNewUser
    ? "You're launching DevSim for the first time. The guided tutorial walks you through the full sprint workflow — board setup, terminal commands, testing, and submission. Skipping it may make the real workspace harder to navigate."
    : "You haven't completed a guided tutorial yet. The tutorial walks you through the full sprint workflow — board setup, terminal commands, testing, and submission. Skipping it may make the workspace harder to navigate."}
  confirmLabel="Skip Tutorial Anyway"
  cancelLabel="Keep Tutorial On"
  variant="warning"
  on:confirm={() => {
    withTutorial = false;
    showSkipTutorialWarning = false;
  }}
  on:cancel={() => {
    withTutorial = true;
    showSkipTutorialWarning = false;
  }}
/>

<style>
  .tutorial-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: rgba(7, 165, 201, 0.05);
    border: 1px solid rgba(7, 165, 201, 0.18);
    border-radius: 6px;
  }

  .tutorial-bar-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  .tutorial-bar-icon {
    font-size: 1.15rem;
    flex-shrink: 0;
  }

  .tutorial-bar-text {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  .tutorial-bar-title {
    font-family: 'Chakra Petch', monospace;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #e2e8f0;
  }

  .tutorial-bar-desc {
    font-size: 0.72rem;
    color: rgba(226, 232, 240, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tutorial-bar-right {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-shrink: 0;
  }

  .tutorial-bar-badge {
    font-family: 'Chakra Petch', monospace;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
    background: rgba(7, 165, 201, 0.12);
    border: 1px solid rgba(7, 165, 201, 0.35);
    color: #07a5c9;
  }

  .tutorial-bar-badge--new {
    background: rgba(0, 229, 160, 0.1);
    border-color: rgba(0, 229, 160, 0.35);
    color: #00e5a0;
  }

  .tutorial-bar-switch {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    cursor: pointer;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    white-space: nowrap;
    border-width: 0;
  }

  .tutorial-bar-track {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 34px;
    height: 18px;
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    transition: background 0.2s, border-color 0.2s;
  }

  .tutorial-bar-track--on {
    background: rgba(7, 165, 201, 0.25);
    border-color: rgba(7, 165, 201, 0.6);
  }

  .tutorial-bar-knob {
    position: absolute;
    left: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    transition: transform 0.2s, background 0.2s;
  }

  .tutorial-bar-track--on .tutorial-bar-knob {
    transform: translateX(16px);
    background: #07a5c9;
  }

  .tutorial-bar-switch-label {
    font-family: 'Chakra Petch', monospace;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(226, 232, 240, 0.45);
    min-width: 1.8rem;
    transition: color 0.2s;
  }

  .tutorial-bar-switch-label--on {
    color: #07a5c9;
  }
</style>
