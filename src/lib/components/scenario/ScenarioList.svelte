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
  export let userId: string;
  export let tutorialState: {
    isNewUser: boolean;
    isNewToStack: boolean;
    isExistingUser: boolean;
    tutorialRequired: boolean;
    tutorialPromptEligible: boolean;
  };

  let activeIndex = 0;
  let isLoading = false;
  let showExistingModal = false;
  let existingContainerDbId = '';
  let existingContainerMessage = '';

  let withTutorial = false;
  let showTutorialPrompt = false;

  const TUTORIAL_PROMPT_VERSION = 'v1';

  function getTutorialPromptStorageKey() {
    return `tutorial-prompt:${TUTORIAL_PROMPT_VERSION}:${userId}:${stackName}`;
  }

  function markTutorialPromptSeen() {
    if (!browser) return;
    try {
      localStorage.setItem(getTutorialPromptStorageKey(), '1');
    } catch {
      // Ignore storage issues so tutorial flow still works.
    }
  }

  function hasSeenTutorialPrompt() {
    if (!browser) return false;
    try {
      return localStorage.getItem(getTutorialPromptStorageKey()) === '1';
    } catch {
      return false;
    }
  }

  onMount(() => {
    if (tutorialState.tutorialRequired) {
      withTutorial = true;
      return;
    }

    withTutorial = false;

    if (tutorialState.tutorialPromptEligible && !hasSeenTutorialPrompt()) {
      showTutorialPrompt = true;
    }
  });

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
      params.set('tutorialRequired', tutorialState.tutorialRequired ? '1' : '0');
      params.set('stackName', stackName);
      params.set('selection', JSON.stringify(selection));
      if (activeScenario?.id) params.set('scenarioId', activeScenario.id);
      if (activeScenario?.projectFolder) params.set('projectFolder', activeScenario.projectFolder);
      if (activeScenario?.title) params.set('scenarioTitle', activeScenario.title);
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

      if (tutorialState.tutorialRequired) {
        withTutorial = true;
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

      if (withTutorial && !tutorialState.tutorialRequired) {
        toast.success('Tutorial mode enabled. Launching isolated tutorial workspace...');
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
      bind:withTutorial
      tutorialRequired={tutorialState.tutorialRequired}
      on:launchSprint={handleStartSprint}
      on:requestDisableTutorialConfirm={() => {
        if (tutorialState.tutorialRequired) {
          toast.error('Tutorial is required for your first stack experience.');
          return;
        }
      }}
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

<!-- Optional tutorial prompt for existing users trying a new stack -->
<ConfirmationModal
  bind:open={showTutorialPrompt}
  icon="🧭"
  iconVariant="accent"
  title="Take Stack Tutorial First?"
  subtitle="You're launching a stack you haven't used before"
  description="Would you like to start with the stack tutorial before entering the real workspace? The tutorial uses an isolated environment, so your real project data stays untouched."
  confirmLabel="Start Tutorial"
  cancelLabel="Go Directly to Workspace"
  variant="primary"
  on:confirm={() => {
    withTutorial = true;
    showTutorialPrompt = false;
    toast.success('Tutorial enabled for this stack.');
  }}
  on:cancel={() => {
    withTutorial = false;
    showTutorialPrompt = false;
    markTutorialPromptSeen();
    toast.info('Tutorial dismissed for this stack. You can still enable it from the card toggle.');
  }}
/>
