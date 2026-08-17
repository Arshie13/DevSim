<script lang="ts">
  import { enhance } from "$app/forms";
  import { Loader2, Plus, Trash2, Edit3, ChevronDown, ChevronRight, Lock, Unlock, Layers, ListTodo, BookOpen, Code, Terminal, FileCode } from "lucide-svelte";
  import type { IInteractiveConfig } from "$lib/types/IContainer";

  interface Task {
    id: string;
    taskName: string;
    userStory: string;
    order: number;
    isComplete: boolean;
    testType: string;
    levelId: string;
    acceptanceCriteria: { id: string; description: string; isRequired: boolean; order: number }[];
    learningSections: LearningSection[];
  }

  interface Level {
    id: string;
    title: string;
    subtitle: string;
    order: number;
    sprintNumber: number;
    deadline: string;
    levelDescription: string;
    xpReward: number;
    coinReward: number;
    keyTakeaways: string;
    scenarioId: string;
    tasks: Task[];
  }

  interface Scenario {
    id: string;
    name: string;
    description: string;
    difficulty: string;
    isPaywalled: boolean;
    stackName: string;
    levels: Level[];
  }

  interface LearningSection {
    id: string;
    taskId: string;
    title: string;
    content: string;
    order: number;
    sectionType: 'PLAIN_TEXT' | 'INTERACTIVE';
    interactiveMode: 'TERMINAL_CD' | 'CODE_EDITOR' | 'TERMINAL_CMD' | null;
    interactiveConfig: IInteractiveConfig | null;
  }

  export let data: {
    scenarios: Scenario[];
    availableImages: { tag: string; mappedId: string | null }[];
  };

  let isSubmitting = false;
  let message: { type: "success" | "error"; text: string } | null = null;
  let showCreateForm = false;
  let expandedScenario: string | null = null;
  let expandedLevel: string | null = null;
  let editingScenarioId: string | null = null;
  let editingLevelId: string | null = null;
  let editingTaskId: string | null = null;
  let showCreateLevelForScenario: string | null = null;
  let showCreateTaskForLevel: string | null = null;
  let expandedTaskLearningSections: string | null = null;
  let editingLearningSectionId: string | null = null;
  let showCreateLearningSectionForTask: string | null = null;
  let selectedImage = "";
  let manualId = "";

  $: selectedImageMappedId = data.availableImages.find(i => i.tag === selectedImage)?.mappedId ?? null;
  $: scenarioIdFromImage = selectedImageMappedId || selectedImage;

  function toggleScenario(id: string) {
    expandedScenario = expandedScenario === id ? null : id;
    expandedLevel = null;
  }

  function toggleLevel(id: string) {
    expandedLevel = expandedLevel === id ? null : id;
  }

  const TEST_TYPES = ['none', 'client', 'server', 'both'];
  const SECTION_TYPES = ['PLAIN_TEXT', 'INTERACTIVE'] as const;
  const INTERACTIVE_MODES = ['CODE_EDITOR', 'TERMINAL_CD', 'TERMINAL_CMD'] as const;
  const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'sql', 'bash'];
</script>

<div class="p-6">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="[font-family:var(--font-heading)] text-2xl font-medium text-[var(--text-primary)]">
        <Layers class="inline h-6 w-6 mr-2" />
        Scenario Manager
      </h1>
      <p class="mt-1 [font-family:var(--font-mono)] text-sm text-[var(--text-muted)]">
        Manage scenarios, levels, and tasks
      </p>
    </div>
    <button
      on:click={() => { showCreateForm = !showCreateForm; selectedImage = ""; manualId = ""; }}
      class="flex items-center gap-2 rounded bg-[rgba(7,165,201,0.1)] px-4 py-2 text-sm text-[var(--accent)] hover:bg-[rgba(7,165,201,0.2)]"
    >
      <Plus class="h-4 w-4" />
      New Scenario
    </button>
  </div>

  {#if message}
    <div
      class="mb-4 p-3 rounded border {message.type === 'success'
        ? 'border-[rgba(0,229,160,0.3)] bg-[rgba(0,229,160,0.1)] text-[var(--success)]'
        : 'border-[rgba(255,68,68,0.3)] bg-[rgba(255,68,68,0.1)] text-[var(--danger)]'}"
    >
      <p class="[font-family:var(--font-mono)] text-sm">{message.text}</p>
    </div>
  {/if}

  {#if showCreateForm}
    <div class="mb-6 rounded border border-[rgba(7,165,201,0.2)] bg-[rgba(10,14,26,0.72)] p-4">
      <h2 class="[font-family:var(--font-heading)] text-lg text-[var(--text-primary)] mb-4">Create Scenario</h2>
      <form
        method="POST"
        action="?/createScenario"
        use:enhance={() => {
          isSubmitting = true;
          return async ({ result, update }) => {
            isSubmitting = false;
            if (result.type === "success") {
              message = { type: "success", text: "Scenario created" };
              showCreateForm = false;
            } else if (result.type === "failure") {
              message = { type: "error", text: (result.data?.message as string) || "Failed to create" };
            }
            await update({ reset: false });
            setTimeout(() => (message = null), 3000);
          };
        }}
        class="space-y-3"
      >
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1" for="docker_image">Docker Image</label>
            <select
              class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)] font-mono"
              bind:value={selectedImage}
            >
              <option value="">-- Manual ID --</option>
              {#each data.availableImages as img}
                <option value={img.tag}>{img.tag}</option>
              {/each}
            </select>
            {#if data.availableImages.length === 0}
              <p class="text-[0.6rem] text-[var(--text-muted)] mt-1">No unused devsim-project images found (all already mapped to a scenario)</p>
            {/if}
          </div>
          <div>
            <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1" for="scenario_id">
              {selectedImage ? "ID" : "ID (manual)"}
            </label>
            {#if selectedImage}
              <input type="text" id="scenario_id" value={scenarioIdFromImage} disabled
                class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)] font-mono disabled:opacity-50" />
              <input type="hidden" name="id" value={scenarioIdFromImage} />
            {:else}
              <input type="text" name="id" bind:value={manualId} placeholder="e.g. my-scenario-1"
                class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)] font-mono" />
            {/if}
          </div>
          <div>
            <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1" for="name">Name</label>
            <input id="name" type="text" name="name" required
              class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)]" />
          </div>
          <div class="col-span-2">
            <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1" for="description">Description</label>
            <input id="description" type="text" name="description" required
              class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)]" />
          </div>
          <div>
            <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1" for="difficulty">Difficulty</label>
            <input id="difficulty" type="text" name="difficulty" value="Easy" placeholder="Easy / Medium / Hard"
              class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)]" />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" on:click={() => (showCreateForm = false)}
            class="rounded bg-[rgba(136,146,160,0.15)] px-4 py-2 text-sm text-[var(--text-muted)]"
          >Cancel</button>
          <button type="submit" disabled={isSubmitting}
            class="flex items-center gap-2 rounded bg-[rgba(0,229,160,0.15)] px-4 py-2 text-sm text-[var(--success)] hover:bg-[rgba(0,229,160,0.25)] disabled:opacity-50"
          >
            {#if isSubmitting}<Loader2 class="h-4 w-4 animate-spin" />{/if}
            Create
          </button>
        </div>
      </form>
    </div>
  {/if}

  <div class="space-y-3">
    {#each data.scenarios as scenario}
      <div class="rounded border border-[rgba(7,165,201,0.15)] bg-[rgba(10,14,26,0.72)]">
        {#if editingScenarioId === scenario.id}
          <div class="p-4">
            <form
              method="POST"
              action="?/updateScenario"
              use:enhance={() => {
                isSubmitting = true;
                return async ({ result, update }) => {
                  isSubmitting = false;
                  editingScenarioId = null;
                  if (result.type === "success") {
                    message = { type: "success", text: "Scenario updated" };
                  } else if (result.type === "failure") {
                    message = { type: "error", text: (result.data?.message as string) || "Failed to update" };
                  }
                  await update({ reset: false });
                  setTimeout(() => (message = null), 3000);
                };
              }}
              class="space-y-3"
            >
              <input type="hidden" name="id" value={scenario.id} />
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1" for="name">Name</label>
                  <input id="name" type="text" name="name" value={scenario.name} required
                    class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)]" />
                </div>
                <div>
                  <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1" for="difficulty">Difficulty</label>
                  <input id="difficulty" type="text" name="difficulty" value={scenario.difficulty}
                    class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)]" />
                </div>
                <div class="col-span-2">
                  <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1" for="description">Description</label>
                  <input id="description" type="text" name="description" value={scenario.description} required
                    class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)]" />
                </div>
                <div>
                  <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1" for="paywalled">Paywalled</label>
                  <select id="paywalled" name="isPaywalled"
                    class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)]"
                  >
                    <option value="false" selected={!scenario.isPaywalled}>No</option>
                    <option value="true" selected={scenario.isPaywalled}>Yes</option>
                  </select>
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <button type="button" on:click={() => (editingScenarioId = null)}
                  class="rounded bg-[rgba(136,146,160,0.15)] px-3 py-1 text-xs text-[var(--text-muted)]"
                >Cancel</button>
                <button type="submit" disabled={isSubmitting}
                  class="flex items-center gap-1 rounded bg-[rgba(0,229,160,0.15)] px-3 py-1 text-xs text-[var(--success)] hover:bg-[rgba(0,229,160,0.25)] disabled:opacity-50"
                >
                  {#if isSubmitting}<Loader2 class="h-3 w-3 animate-spin" />{/if}
                  Save
                </button>
              </div>
            </form>
          </div>
        {:else}
          <div class="flex items-center justify-between p-4">
            <div class="flex items-center gap-3 flex-1 min-w-0" role="button" tabindex="0" on:click={() => toggleScenario(scenario.id)} on:keydown={(e) => e.key === 'Enter' && toggleScenario(scenario.id)}>
              {#if scenario.isPaywalled}<Lock class="h-4 w-4 text-yellow-400 shrink-0" />{:else}<Unlock class="h-4 w-4 text-[var(--text-muted)] shrink-0" />{/if}
              <div class="min-w-0">
                <h3 class="[font-family:var(--font-heading)] text-base text-[var(--text-primary)]">{scenario.name}</h3>
                <p class="text-xs text-[var(--text-muted)] truncate">{scenario.description}</p>
                <span class="text-[0.6rem] font-mono text-[var(--accent)] px-1.5 py-0.5 rounded bg-[rgba(7,165,201,0.1)]">{scenario.stackName}</span>
              </div>
              <span class="text-xs font-mono text-[var(--text-muted)]">[{scenario.difficulty}]</span>
              <span class="text-xs text-[var(--text-muted)]">{scenario.levels.length} level{scenario.levels.length !== 1 ? 's' : ''}</span>
              {#if expandedScenario === scenario.id}<ChevronDown class="h-4 w-4 text-[var(--text-muted)]" />{:else}<ChevronRight class="h-4 w-4 text-[var(--text-muted)]" />{/if}
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button on:click={() => (editingScenarioId = scenario.id)}
                class="rounded bg-[rgba(7,165,201,0.1)] p-1.5 text-[var(--accent)] hover:bg-[rgba(7,165,201,0.2)]"
              ><Edit3 class="h-4 w-4" /></button>
              <form method="POST" action="?/deleteScenario" use:enhance>
                <input type="hidden" name="id" value={scenario.id} />
                <button type="submit" class="rounded bg-[rgba(255,68,68,0.1)] p-1.5 text-[var(--danger)] hover:bg-[rgba(255,68,68,0.2)]"
                  on:click={() => confirm('Delete this scenario and all its levels/tasks?')}
                ><Trash2 class="h-4 w-4" /></button>
              </form>
            </div>
          </div>
        {/if}

        {#if expandedScenario === scenario.id}
          <div class="border-t border-[rgba(255,255,255,0.06)] px-4 py-3">
            <div class="flex items-center justify-between mb-2">
              <h4 class="[font-family:var(--font-mono)] text-xs text-[var(--text-muted)] uppercase tracking-wider">Levels</h4>
              <button
                on:click={() => (showCreateLevelForScenario = showCreateLevelForScenario === scenario.id ? null : scenario.id)}
                class="flex items-center gap-1 rounded bg-[rgba(7,165,201,0.1)] px-2 py-1 text-xs text-[var(--accent)] hover:bg-[rgba(7,165,201,0.2)]"
              >
                <Plus class="h-3 w-3" /> Add Level
              </button>
            </div>

            {#if showCreateLevelForScenario === scenario.id}
              <div class="mb-3 rounded border border-[rgba(7,165,201,0.2)] bg-[rgba(7,165,201,0.05)] p-3">
                <form
                  method="POST"
                  action="?/createLevel"
                  use:enhance={() => {
                    isSubmitting = true;
                    return async ({ result, update }) => {
                      isSubmitting = false;
                      showCreateLevelForScenario = null;
                      if (result.type === "success") {
                        message = { type: "success", text: "Level created" };
                      } else if (result.type === "failure") {
                        message = { type: "error", text: (result.data?.message as string) || "Failed to create level" };
                      }
                      await update({ reset: false });
                      setTimeout(() => (message = null), 3000);
                    };
                  }}
                  class="space-y-2"
                >
                  <input type="hidden" name="scenarioId" value={scenario.id} />
                  <div class="grid grid-cols-3 gap-2">
                    <div>
                      <label class="text-[var(--text-muted)] text-xs" for="title">Title</label>
                      <input id="title" type="text" name="title" required
                        class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                    </div>
                    <div>
                      <label class="text-[var(--text-muted)] text-xs" for="order">Order</label>
                      <input id="order" type="number" name="order" value={scenario.levels.length + 1}
                        class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                    </div>
                    <div>
                      <label class="text-[var(--text-muted)] text-xs" for="sprint">Sprint</label>
                      <input id="sprint" type="number" name="sprintNumber" value="1"
                        class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                    </div>
                    <div>
                      <label class="text-[var(--text-muted)] text-xs" for="deadline">Deadline</label>
                      <input id="deadline" type="date" name="deadline"
                        class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                    </div>
                    <div>
                      <label class="text-[var(--text-muted)] text-xs" for="xp">XP</label>
                      <input id="xp" type="number" name="xpReward" value="100"
                        class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                    </div>
                    <div>
                      <label class="text-[var(--text-muted)] text-xs" for="coins">Coins</label>
                      <input id="coins" type="number" name="coinReward" value="50"
                        class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                    </div>
                    <div class="col-span-3">
                      <label class="text-[var(--text-muted)] text-xs" for="description">Description</label>
                      <input id="description" type="text" name="levelDescription"
                        class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                    </div>
                    <div class="col-span-3">
                      <label class="text-[var(--text-muted)] text-xs" for="key_takeaways">Key Takeaways</label>
                      <input id="key_takeaways" type="text" name="keyTakeaways"
                        class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                    </div>
                  </div>
                  <div class="flex justify-end gap-2">
                    <button type="button" on:click={() => (showCreateLevelForScenario = null)}
                      class="rounded bg-[rgba(136,146,160,0.15)] px-2 py-1 text-xs text-[var(--text-muted)]"
                    >Cancel</button>
                    <button type="submit" disabled={isSubmitting}
                      class="flex items-center gap-1 rounded bg-[rgba(0,229,160,0.15)] px-2 py-1 text-xs text-[var(--success)] disabled:opacity-50"
                    >
                      {#if isSubmitting}<Loader2 class="h-3 w-3 animate-spin" />{/if}
                      Create
                    </button>
                  </div>
                </form>
              </div>
            {/if}

            <div class="space-y-2">
              {#each scenario.levels as level}
                <div class="rounded border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
                  {#if editingLevelId === level.id}
                    <div class="p-3">
                      <form
                        method="POST"
                        action="?/updateLevel"
                        use:enhance={() => {
                          isSubmitting = true;
                          return async ({ result, update }) => {
                            isSubmitting = false;
                            editingLevelId = null;
                            if (result.type === "success") {
                              message = { type: "success", text: "Level updated" };
                            } else if (result.type === "failure") {
                              message = { type: "error", text: (result.data?.message as string) || "Failed to update level" };
                            }
                            await update({ reset: false });
                            setTimeout(() => (message = null), 3000);
                          };
                        }}
                        class="space-y-2"
                      >
                        <input type="hidden" name="id" value={level.id} />
                        <div class="grid grid-cols-3 gap-2">
                          <div>
                            <label class="text-[var(--text-muted)] text-xs" for="title">Title</label>
                            <input id="title" type="text" name="title" value={level.title}
                              class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                          </div>
                          <div>
                            <label class="text-[var(--text-muted)] text-xs" for="order">Order</label>
                            <input id="order" type="number" name="order" value={level.order}
                              class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                          </div>
                          <div>
                            <label class="text-[var(--text-muted)] text-xs" for="sprint">Sprint</label>
                            <input id="sprint" type="number" name="sprintNumber" value={level.sprintNumber}
                              class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                          </div>
                          <div>
                            <label class="text-[var(--text-muted)] text-xs" for="deadline">Deadline</label>
                            <input id="deadline" type="date" name="deadline" value={level.deadline}
                              class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                          </div>
                          <div>
                            <label class="text-[var(--text-muted)] text-xs" for="xp">XP</label>
                            <input id="xp" type="number" name="xpReward" value={level.xpReward}
                              class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                          </div>
                          <div>
                            <label class="text-[var(--text-muted)] text-xs" for="coins">Coins</label>
                            <input id="coins" type="number" name="coinReward" value={level.coinReward}
                              class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                          </div>
                          <div class="col-span-3">
                            <label class="text-[var(--text-muted)] text-xs" for="description">Description</label>
                            <input id="description" type="text" name="levelDescription" value={level.levelDescription}
                              class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                          </div>
                          <div class="col-span-3">
                            <label class="text-[var(--text-muted)] text-xs" for="key_takeaways">Key Takeaways</label>
                            <input id="key_takeaways" type="text" name="keyTakeaways" value={level.keyTakeaways}
                              class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                          </div>
                        </div>
                        <div class="flex justify-end gap-2">
                          <button type="button" on:click={() => (editingLevelId = null)}
                            class="rounded bg-[rgba(136,146,160,0.15)] px-2 py-1 text-xs text-[var(--text-muted)]"
                          >Cancel</button>
                          <button type="submit" disabled={isSubmitting}
                            class="flex items-center gap-1 rounded bg-[rgba(0,229,160,0.15)] px-2 py-1 text-xs text-[var(--success)] disabled:opacity-50"
                          >
                            {#if isSubmitting}<Loader2 class="h-3 w-3 animate-spin" />{/if}
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  {:else}
                    <div class="flex items-center justify-between px-3 py-2">
                      <div class="flex items-center gap-3 flex-1 min-w-0" role="button" tabindex="0" on:click={() => toggleLevel(level.id)} on:keydown={(e) => e.key === 'Enter' && toggleLevel(level.id)}>
                        <span class="[font-family:var(--font-heading)] text-sm text-[var(--accent)] font-bold">L{level.order}</span>
                        <div class="min-w-0">
                          <span class="text-sm text-[var(--text-primary)]">{level.title}</span>
                          {#if level.subtitle}
                            <span class="text-xs text-[var(--text-muted)] ml-1">— {level.subtitle}</span>
                          {/if}
                        </div>
                        <span class="text-xs text-[var(--text-muted)] font-mono">Sprint {level.sprintNumber}</span>
                        <span class="text-xs text-[var(--text-muted)] font-mono">{level.xpReward}XP / {level.coinReward}c</span>
                        <span class="text-xs text-[var(--text-muted)]">{level.tasks.length} task{level.tasks.length !== 1 ? 's' : ''}</span>
                        {#if expandedLevel === level.id}<ChevronDown class="h-3 w-3 text-[var(--text-muted)]" />{:else}<ChevronRight class="h-3 w-3 text-[var(--text-muted)]" />{/if}
                      </div>
                      <div class="flex items-center gap-1 shrink-0">
                        <button on:click={() => (editingLevelId = level.id)}
                          class="rounded bg-[rgba(7,165,201,0.1)] p-1 text-[var(--accent)] hover:bg-[rgba(7,165,201,0.2)]"
                        ><Edit3 class="h-3 w-3" /></button>
                        <form method="POST" action="?/deleteLevel" use:enhance>
                          <input type="hidden" name="id" value={level.id} />
                          <button type="submit" class="rounded bg-[rgba(255,68,68,0.1)] p-1 text-[var(--danger)] hover:bg-[rgba(255,68,68,0.2)]"
                            on:click={() => confirm('Delete this level and all its tasks?')}
                          ><Trash2 class="h-3 w-3" /></button>
                        </form>
                      </div>
                    </div>
                  {/if}

                  {#if expandedLevel === level.id}
                    <div class="border-t border-[rgba(255,255,255,0.04)] px-4 py-2">
                      <div class="flex items-center justify-between mb-2">
                        <h5 class="[font-family:var(--font-mono)] text-[0.65rem] text-[var(--text-muted)] uppercase tracking-wider">Tasks</h5>
                        <button
                          on:click={() => (showCreateTaskForLevel = showCreateTaskForLevel === level.id ? null : level.id)}
                          class="flex items-center gap-1 rounded bg-[rgba(7,165,201,0.1)] px-2 py-0.5 text-[0.65rem] text-[var(--accent)] hover:bg-[rgba(7,165,201,0.2)]"
                        >
                          <Plus class="h-3 w-3" /> Add Task
                        </button>
                      </div>

                      {#if showCreateTaskForLevel === level.id}
                        <div class="mb-2 rounded border border-[rgba(7,165,201,0.2)] bg-[rgba(7,165,201,0.05)] p-2">
                          <form
                            method="POST"
                            action="?/createTask"
                            use:enhance={() => {
                              isSubmitting = true;
                              return async ({ result, update }) => {
                                isSubmitting = false;
                                showCreateTaskForLevel = null;
                                if (result.type === "success") {
                                  message = { type: "success", text: "Task created" };
                                } else if (result.type === "failure") {
                                  message = { type: "error", text: (result.data?.message as string) || "Failed to create task" };
                                }
                                await update({ reset: false });
                                setTimeout(() => (message = null), 3000);
                              };
                            }}
                            class="space-y-2"
                          >
                            <input type="hidden" name="levelId" value={level.id} />
                            <div class="grid grid-cols-2 gap-2">
                              <div>
                                <label class="text-[var(--text-muted)] text-xs" for="task_name">Task Name</label>
                                <input id="task_name" type="text" name="taskName" required
                                  class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                              </div>
                              <div>
                                <label class="text-[var(--text-muted)] text-xs" for="order">Order</label>
                                <input id="order" type="number" name="order" value={level.tasks.length + 1}
                                  class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                              </div>
                              <div>
                                <label class="text-[var(--text-muted)] text-xs" for="test_type">Test Type</label>
                                <select id="test_type" name="testType"
                                  class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]"
                                >
                                  {#each TEST_TYPES as tt}
                                    <option value={tt}>{tt}</option>
                                  {/each}
                                </select>
                              </div>
                              <div class="col-span-2">
                                <label class="text-[var(--text-muted)] text-xs" for="user_story">User Story</label>
                                <input id="user_story" type="text" name="userStory"
                                  class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                              </div>
                              <div class="col-span-2">
                                <label class="text-[var(--text-muted)] text-xs" for="acceptance_criteria_one_per_line">Acceptance Criteria (one per line)</label>
                                <textarea id="acceptance_criteria_one_per_line" name="acceptanceCriteria" rows="3" placeholder="A member can view all books&#10;Search filters by title&#10;Empty state when no results"
                                  class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)] font-mono"></textarea>
                              </div>
                            </div>
                            <div class="flex justify-end gap-2">
                              <button type="button" on:click={() => (showCreateTaskForLevel = null)}
                                class="rounded bg-[rgba(136,146,160,0.15)] px-2 py-0.5 text-xs text-[var(--text-muted)]"
                              >Cancel</button>
                              <button type="submit" disabled={isSubmitting}
                                class="flex items-center gap-1 rounded bg-[rgba(0,229,160,0.15)] px-2 py-0.5 text-xs text-[var(--success)] disabled:opacity-50"
                              >
                                {#if isSubmitting}<Loader2 class="h-3 w-3 animate-spin" />{/if}
                                Create
                              </button>
                            </div>
                          </form>
                        </div>
                      {/if}

                      <div class="space-y-1">
                        {#each level.tasks as task}
                          <div class="rounded border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)]">
                            {#if editingTaskId === task.id}
                              <div class="p-2">
                                <form
                                  method="POST"
                                  action="?/updateTask"
                                  use:enhance={() => {
                                    isSubmitting = true;
                                    return async ({ result, update }) => {
                                      isSubmitting = false;
                                      editingTaskId = null;
                                      if (result.type === "success") {
                                        message = { type: "success", text: "Task updated" };
                                      } else if (result.type === "failure") {
                                        message = { type: "error", text: (result.data?.message as string) || "Failed to update task" };
                                      }
                                      await update({ reset: false });
                                      setTimeout(() => (message = null), 3000);
                                    };
                                  }}
                                  class="space-y-2"
                                >
                                  <input type="hidden" name="id" value={task.id} />
                                  <div class="grid grid-cols-2 gap-2">
                                    <div>
                                      <label class="text-[var(--text-muted)] text-xs" for="task_name">Task Name</label>
                                      <input id="task_name" type="text" name="taskName" value={task.taskName}
                                        class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                                    </div>
                                    <div>
                                      <label class="text-[var(--text-muted)] text-xs" for="order">Order</label>
                                      <input id="order" type="number" name="order" value={task.order}
                                        class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                                    </div>
                                    <div>
                                      <label class="text-[var(--text-muted)] text-xs" for="test_type">Test Type</label>
                                      <select id="test_type" name="testType"
                                        class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]"
                                      >
                                        {#each TEST_TYPES as tt}
                                          <option value={tt} selected={task.testType === tt}>{tt}</option>
                                        {/each}
                                      </select>
                                    </div>
                                    <div>
                                      <label class="text-[var(--text-muted)] text-xs" for="complete">Complete</label>
                                      <select id="complete" name="isComplete"
                                        class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]"
                                      >
                                        <option value="false" selected={!task.isComplete}>No</option>
                                        <option value="true" selected={task.isComplete}>Yes</option>
                                      </select>
                                    </div>
                                    <div class="col-span-2">
                                      <label class="text-[var(--text-muted)] text-xs" for="user_story">User Story</label>
                                      <input id="user_story" type="text" name="userStory" value={task.userStory}
                                        class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                                    </div>
                                    <div class="col-span-2">
                                      <label class="text-[var(--text-muted)] text-xs" for="acceptance_criteria_one_per_line">Acceptance Criteria (one per line)</label>
                                      <textarea id="acceptance_criteria_one_per_line" name="acceptanceCriteria" rows="3"
                                        class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)] font-mono"
                                      >{task.acceptanceCriteria.map(ac => ac.description).join('\n')}</textarea>
                                    </div>
                                  </div>
                                  <div class="flex justify-end gap-2">
                                    <button type="button" on:click={() => (editingTaskId = null)}
                                      class="rounded bg-[rgba(136,146,160,0.15)] px-2 py-0.5 text-xs text-[var(--text-muted)]"
                                    >Cancel</button>
                                    <button type="submit" disabled={isSubmitting}
                                      class="flex items-center gap-1 rounded bg-[rgba(0,229,160,0.15)] px-2 py-0.5 text-xs text-[var(--success)] disabled:opacity-50"
                                    >
                                      {#if isSubmitting}<Loader2 class="h-3 w-3 animate-spin" />{/if}
                                      Save
                                    </button>
                                  </div>
                                </form>
                              </div>
                            {:else}
                              <div>
                                <div class="flex items-center justify-between px-2 py-1.5">
                                  <div class="flex items-center gap-2 min-w-0">
                                    <ListTodo class="h-3 w-3 text-[var(--text-muted)] shrink-0" />
                                    <span class="text-xs text-[var(--text-primary)] font-mono">{task.taskName}</span>
                                    <span class="text-[0.6rem] text-[var(--text-muted)]">({task.testType})</span>
                                    {#if task.acceptanceCriteria.length > 0}
                                      <span class="text-[0.55rem] text-[var(--text-muted)] bg-[rgba(7,165,201,0.1)] px-1 py-0.5 rounded">{task.acceptanceCriteria.length} crit</span>
                                    {/if}
                                  </div>
                                  <div class="flex items-center gap-1 shrink-0">
                                    <button on:click={() => (editingTaskId = task.id)}
                                      class="rounded bg-[rgba(7,165,201,0.1)] p-0.5 text-[var(--accent)] hover:bg-[rgba(7,165,201,0.2)]"
                                    ><Edit3 class="h-3 w-3" /></button>
                                    <form method="POST" action="?/deleteTask" use:enhance>
                                      <input type="hidden" name="id" value={task.id} />
                                      <button type="submit" class="rounded bg-[rgba(255,68,68,0.1)] p-0.5 text-[var(--danger)] hover:bg-[rgba(255,68,68,0.2)]"
                                        on:click={() => confirm('Delete this task?')}
                                      ><Trash2 class="h-3 w-3" /></button>
                                    </form>
                                  </div>
                                </div>
                                {#if task.acceptanceCriteria.length > 0}
                                  <div class="px-6 pb-1.5 space-y-0.5">
                                    {#each task.acceptanceCriteria as ac}
                                      <div class="flex items-center gap-1.5">
                                        <span class="text-[0.5rem] text-[var(--text-muted)]">{ac.order}.</span>
                                        <span class="text-[0.6rem] text-[var(--text-muted)]">{ac.description}</span>
                                      </div>
                                    {/each}
                                  </div>
                                {/if}
                              </div>
                            {/if}

                            <div class="mt-3">
                              <div class="flex items-center justify-between mb-2">
                                <h5 class="[font-family:var(--font-mono)] text-xs text-[var(--text-muted)] uppercase tracking-wider">Learning Sections</h5>
                                <button
                                  on:click={() => (showCreateLearningSectionForTask = showCreateLearningSectionForTask === task.id ? null : task.id)}
                                  class="flex items-center gap-1 rounded bg-[rgba(7,165,201,0.1)] px-2 py-0.5 text-[0.65rem] text-[var(--accent)] hover:bg-[rgba(7,165,201,0.2)]"
                                >
                                  <Plus class="h-3 w-3" /> Add Section
                                </button>
                              </div>

                              {#if showCreateLearningSectionForTask === task.id}
                                <div class="mb-2 rounded border border-[rgba(7,165,201,0.2)] bg-[rgba(7,165,201,0.05)] p-2">
                                  <form
                                    method="POST"
                                    action="?/createLearningSection"
                                    use:enhance={() => {
                                      isSubmitting = true;
                                      return async ({ result, update }) => {
                                        isSubmitting = false;
                                        showCreateLearningSectionForTask = null;
                                        if (result.type === "success") {
                                          message = { type: "success", text: "Learning section created" };
                                        } else if (result.type === "failure") {
                                          message = { type: "error", text: (result.data?.message as string) || "Failed to create learning section" };
                                        }
                                        await update({ reset: false });
                                        setTimeout(() => (message = null), 3000);
                                      };
                                    }}
                                    class="space-y-2"
                                  >
                                    <input type="hidden" name="taskId" value={task.id} />
                                    <input type="hidden" name="order" value={task.learningSections.length + 1} />
                                    <div class="grid grid-cols-2 gap-2">
                                      <div class="col-span-2">
                                        <label class="text-[var(--text-muted)] text-xs" for="title">Title</label>
                                        <input id="title" type="text" name="title" required
                                          class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                                      </div>
                                      <div>
                                        <label class="text-[var(--text-muted)] text-xs" for="section_type">Section Type</label>
                                        <select id="section_type" name="sectionType"
                                          class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]"
                                        >
                                          {#each SECTION_TYPES as st}
                                            <option value={st}>{st}</option>
                                          {/each}
                                        </select>
                                      </div>
                                      <div>
                                        <label class="text-[var(--text-muted)] text-xs" for="interactive_mode">Interactive Mode</label>
                                        <select id="interactive_mode" name="interactiveMode"
                                          class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]"
                                        >
                                          <option value="">-- None --</option>
                                          {#each INTERACTIVE_MODES as im}
                                            <option value={im}>{im}</option>
                                          {/each}
                                        </select>
                                      </div>
                                      <div class="col-span-2">
                                        <label class="text-[var(--text-muted)] text-xs" for="content">Content</label>
                                        <textarea id="content" name="content" rows="3"
                                          class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)] font-mono"></textarea>
                                      </div>
                                      <div class="col-span-2">
                                        <label class="text-[var(--text-muted)] text-xs" for="interactive_config_json">Interactive Config (JSON)</label>
                                        <textarea id="interactive_config_json" name="interactiveConfig" rows="4" placeholder="Paste JSON config here"
                                          class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)] font-mono"></textarea>
                                      </div>
                                    </div>
                                    <div class="flex justify-end gap-2">
                                      <button type="button" on:click={() => (showCreateLearningSectionForTask = null)}
                                        class="rounded bg-[rgba(136,146,160,0.15)] px-2 py-0.5 text-xs text-[var(--text-muted)]"
                                      >Cancel</button>
                                      <button type="submit" disabled={isSubmitting}
                                        class="flex items-center gap-1 rounded bg-[rgba(0,229,160,0.15)] px-2 py-0.5 text-xs text-[var(--success)] disabled:opacity-50"
                                      >
                                        {#if isSubmitting}<Loader2 class="h-3 w-3 animate-spin" />{/if}
                                        Create
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              {/if}

                              <div class="space-y-1">
                                {#each task.learningSections as section}
                                  <div class="rounded border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)]">
                                    {#if editingLearningSectionId === section.id}
                                      <div class="p-2">
                                        <form
                                          method="POST"
                                          action="?/updateLearningSection"
                                          use:enhance={() => {
                                            isSubmitting = true;
                                            return async ({ result, update }) => {
                                              isSubmitting = false;
                                              editingLearningSectionId = null;
                                              if (result.type === "success") {
                                                message = { type: "success", text: "Learning section updated" };
                                              } else if (result.type === "failure") {
                                                message = { type: "error", text: (result.data?.message as string) || "Failed to update learning section" };
                                              }
                                              await update({ reset: false });
                                              setTimeout(() => (message = null), 3000);
                                            };
                                          }}
                                          class="space-y-2"
                                        >
                                          <input type="hidden" name="id" value={section.id} />
                                          <div class="grid grid-cols-2 gap-2">
                                            <div class="col-span-2">
                                              <label class="text-[var(--text-muted)] text-xs" for="title">Title</label>
                                              <input id="title" type="text" name="title" value={section.title}
                                                class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                                            </div>
                                            <div>
                                              <label class="text-[var(--text-muted)] text-xs" for="order">Order</label>
                                              <input id="order" type="number" name="order" value={section.order}
                                                class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                                            </div>
                                            <div>
                                              <label class="text-[var(--text-muted)] text-xs" for="section_type">Section Type</label>
                                              <select id="section_type" name="sectionType"
                                                class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]"
                                              >
                                                {#each SECTION_TYPES as st}
                                                  <option value={st} selected={section.sectionType === st}>{st}</option>
                                                {/each}
                                              </select>
                                            </div>
                                            {#if section.sectionType === "INTERACTIVE"}
                                              <div>
                                                <label class="text-[var(--text-muted)] text-xs" for="interactive_mode">Interactive Mode</label>
                                                <select id="interactive_mode" name="interactiveMode"
                                                  class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]"
                                                >
                                                  <option value="">-- None --</option>
                                                  {#each INTERACTIVE_MODES as im}
                                                    <option value={im} selected={section.interactiveMode === im}>{im}</option>
                                                  {/each}
                                                </select>
                                              </div>
                                              <div>
                                                <label class="text-[var(--text-muted)] text-xs" for="interactive_config_json">Interactive Config (JSON)</label>
                                                <textarea id="interactive_config_json" name="interactiveConfig" rows="3"
                                                  class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)] font-mono"
                                                >{section.interactiveConfig ? JSON.stringify(section.interactiveConfig, null, 2) : ''}</textarea>
                                              </div>
                                            {/if}
                                            <div class="col-span-2">
                                              <label class="text-[var(--text-muted)] text-xs" for="content">Content</label>
                                              <textarea id="content" name="content" rows="3"
                                                class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)] font-mono"
                                              >{section.content}</textarea>
                                            </div>
                                          </div>
                                          <div class="flex justify-end gap-2">
                                            <button type="button" on:click={() => (editingLearningSectionId = null)}
                                              class="rounded bg-[rgba(136,146,160,0.15)] px-2 py-0.5 text-xs text-[var(--text-muted)]"
                                            >Cancel</button>
                                            <button type="submit" disabled={isSubmitting}
                                              class="flex items-center gap-1 rounded bg-[rgba(0,229,160,0.15)] px-2 py-0.5 text-xs text-[var(--success)] disabled:opacity-50"
                                            >
                                              {#if isSubmitting}<Loader2 class="h-3 w-3 animate-spin" />{/if}
                                              Save
                                            </button>
                                          </div>
                                        </form>
                                      </div>
                                    {:else}
                                      <div class="flex items-center justify-between px-2 py-1.5">
                                        <div class="flex items-center gap-2 min-w-0">
                                          <BookOpen class="h-3 w-3 text-[var(--text-muted)] shrink-0" />
                                          <span class="text-xs text-[var(--text-primary)] font-mono">{section.title}</span>
                                          <span class="text-[0.6rem] text-[var(--text-muted)]">({section.sectionType})</span>
                                          {#if section.interactiveMode}
                                            <span class="text-[0.55rem] text-[var(--accent)] bg-[rgba(7,165,201,0.1)] px-1 py-0.5 rounded">{section.interactiveMode}</span>
                                          {/if}
                                        </div>
                                        <div class="flex items-center gap-1 shrink-0">
                                          <button on:click={() => (editingLearningSectionId = section.id)}
                                            class="rounded bg-[rgba(7,165,201,0.1)] p-0.5 text-[var(--accent)] hover:bg-[rgba(7,165,201,0.2)]"
                                          ><Edit3 class="h-3 w-3" /></button>
                                          <form method="POST" action="?/deleteLearningSection" use:enhance>
                                            <input type="hidden" name="id" value={section.id} />
                                            <button type="submit" class="rounded bg-[rgba(255,68,68,0.1)] p-0.5 text-[var(--danger)] hover:bg-[rgba(255,68,68,0.2)]"
                                              on:click={() => confirm('Delete this learning section?')}
                                            ><Trash2 class="h-3 w-3" /></button>
                                          </form>
                                        </div>
                                      </div>
                                    {/if}
                                  </div>
                                {/each}
                              </div>
                            </div>
                          </div>
                        {/each}
                        {#if level.tasks.length === 0}
                          <p class="text-xs text-[var(--text-muted)] italic py-1">No tasks yet</p>
                        {/if}
                      </div>

                    </div>
                  {/if}
                </div>
              {/each}
              {#if scenario.levels.length === 0}
                <p class="text-xs text-[var(--text-muted)] italic py-1">No levels yet</p>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
