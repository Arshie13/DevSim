<script lang="ts">
  import { enhance } from "$app/forms";
  import { Loader2, Plus, Trash2, Edit3, ChevronDown, ChevronRight, Lock, Unlock, Layers, ListTodo, BookOpen, Code, Terminal, FileCode } from "lucide-svelte";
  import type { IInteractiveConfig } from "$lib/types/IContainer";
  import InteractiveConfigEditor from "$lib/components/admin/InteractiveConfigEditor.svelte";
  import AdminFilterBar from "$lib/components/admin/AdminFilterBar.svelte";
  import AdminFilterTabs from "$lib/components/admin/AdminFilterTabs.svelte";
  import AdminSearchInput from "$lib/components/admin/AdminSearchInput.svelte";
  import type { InteractiveMode } from "$lib/utils/interactive-config";

  interface Task {
    id: string;
    taskName: string;
    userStory: string;
    order: number;
    testType: string;
    levelId: string;
    acceptanceCriteria: { id: string; description: string; isRequired: boolean; order: number }[];
    hints: { id: string; description: string; order: number }[];
    learningSections: LearningSection[];
  }

  interface Level {
    id: string;
    title: string;
    subtitle: string;
    order: number;
    sprintNumber: number;
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

  // Client-side filters over the loaded scenario hierarchy.
  let search = "";
  let difficulty = "all";
  let paywall = "all";

  $: query = search.trim().toLowerCase();
  $: difficulties = [...new Set(data.scenarios.map((s) => s.difficulty).filter(Boolean))].sort();
  $: paywalledCount = data.scenarios.filter((s) => s.isPaywalled).length;
  $: freeCount = data.scenarios.length - paywalledCount;
  $: hasFilters = query !== "" || difficulty !== "all" || paywall !== "all";
  $: filteredScenarios = data.scenarios.filter((s) => {
    if (difficulty !== "all" && s.difficulty !== difficulty) return false;
    if (paywall === "paywalled" && !s.isPaywalled) return false;
    if (paywall === "free" && s.isPaywalled) return false;
    if (!query) return true;
    return [s.name, s.description, s.difficulty, s.stackName, ...s.levels.map((l) => l.title)]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  function clearFilters() {
    search = "";
    difficulty = "all";
    paywall = "all";
  }

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

  type SectionType = (typeof SECTION_TYPES)[number];

  // Only one create form and one edit form are open at a time, so a single set of
  // variables per form is enough to drive the section type / interactive mode selectors.
  let createSectionType: SectionType = 'PLAIN_TEXT';
  let createInteractiveMode: InteractiveMode | '' = '';
  let editSectionType: SectionType = 'PLAIN_TEXT';
  let editInteractiveMode: InteractiveMode | '' = '';
  let editConfig: Record<string, unknown> | null = null;

  function toggleCreateSection(taskId: string) {
    if (showCreateLearningSectionForTask === taskId) {
      showCreateLearningSectionForTask = null;
      return;
    }
    showCreateLearningSectionForTask = taskId;
    createSectionType = 'PLAIN_TEXT';
    createInteractiveMode = '';
  }

  /** Section type is PLAIN_TEXT unless INTERACTIVE, in which case a mode is mandatory. */
  function onSectionTypeChange(sectionType: SectionType, currentMode: InteractiveMode | ''): InteractiveMode | '' {
    if (sectionType !== 'INTERACTIVE') return '';
    return currentMode || INTERACTIVE_MODES[0];
  }

  function startEditLearningSection(section: LearningSection) {
    editingLearningSectionId = section.id;
    editSectionType = section.sectionType;
    editInteractiveMode = section.interactiveMode ?? '';
    editConfig = (section.interactiveConfig as unknown as Record<string, unknown> | null) ?? null;
  }
</script>

<div class="page-container py-6">
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="font-heading text-3xl font-bold tracking-tight text-obsidian-text-primary">
        <Layers class="inline h-6 w-6 mr-2" />
        Scenario Manager
      </h1>
      <p class="mt-1 font-body text-base text-obsidian-text-muted">
        Manage scenarios, levels, and tasks
      </p>
    </div>
    <button
      on:click={() => { showCreateForm = !showCreateForm; selectedImage = ""; manualId = ""; }}
      class="btn-cyber btn-cyber-solid flex items-center gap-2 !px-4 !py-2"
    >
      <Plus class="h-4 w-4" />
      New Scenario
    </button>
  </div>

  {#if message}
    <div
      class="mb-4 rounded-card border p-3 {message.type === 'success'
        ? 'border-cyber-success/30 bg-cyber-success/10 text-cyber-success'
        : 'border-cyber-danger/30 bg-cyber-danger/10 text-cyber-danger'}"
    >
      <p class="font-label text-sm">{message.text}</p>
    </div>
  {/if}

  {#if showCreateForm}
    <div class="card-cyber mb-8" style="border-color: rgb(var(--accent-rgb) / 0.15)">
      <div class="card-cyber-body">
      <h2 class="font-heading text-xl font-semibold text-obsidian-text-primary mb-4">Create Scenario</h2>
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
            <label class="block font-label text-sm text-obsidian-text-muted mb-1" for="docker_image">Docker Image</label>
            <select
              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary font-mono"
              bind:value={selectedImage}
            >
              <option value="">-- Manual ID --</option>
              {#each data.availableImages as img}
                <option value={img.tag}>{img.tag}</option>
              {/each}
            </select>
            {#if data.availableImages.length === 0}
              <p class="text-sm text-obsidian-text-muted mt-1">No unused devsim-project images found (all already mapped to a scenario)</p>
            {/if}
          </div>
          <div>
            <label class="block font-label text-sm text-obsidian-text-muted mb-1" for="scenario_id">
              {selectedImage ? "ID" : "ID (manual)"}
            </label>
            {#if selectedImage}
              <input type="text" id="scenario_id" value={scenarioIdFromImage} disabled
                class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary font-mono disabled:opacity-50" />
              <input type="hidden" name="id" value={scenarioIdFromImage} />
            {:else}
              <input type="text" name="id" bind:value={manualId} placeholder="e.g. my-scenario-1"
                class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary font-mono" />
            {/if}
          </div>
          <div>
            <label class="block font-label text-sm text-obsidian-text-muted mb-1" for="name">Name</label>
            <input id="name" type="text" name="name" required
              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary" />
          </div>
          <div class="col-span-2">
            <label class="block font-label text-sm text-obsidian-text-muted mb-1" for="description">Description</label>
            <input id="description" type="text" name="description" required
              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary" />
          </div>
          <div>
            <label class="block font-label text-sm text-obsidian-text-muted mb-1" for="difficulty">Difficulty</label>
            <input id="difficulty" type="text" name="difficulty" value="Easy" placeholder="Easy / Medium / Hard"
              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary" />
          </div>
          <div class="col-span-2 mt-2 border-t border-[var(--card-border)] pt-3">
            <h3 class="font-heading text-base font-semibold text-obsidian-text-primary">First Level</h3>
            <p class="text-sm text-obsidian-text-muted">A scenario must have at least one level, so its first level is created with it.</p>
          </div>
          <div class="col-span-2">
            <label class="block font-label text-sm text-obsidian-text-muted mb-1" for="levelTitle">Title</label>
            <input id="levelTitle" type="text" name="levelTitle" required
              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary" />
          </div>
          <div>
            <label class="block font-label text-sm text-obsidian-text-muted mb-1" for="levelSubtitle">Subtitle</label>
            <input id="levelSubtitle" type="text" name="levelSubtitle"
              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary" />
          </div>
          <div>
            <label class="block font-label text-sm text-obsidian-text-muted mb-1" for="order">Order</label>
            <input id="order" type="number" name="order" value="1"
              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary" />
          </div>
          <div>
            <label class="block font-label text-sm text-obsidian-text-muted mb-1" for="sprint">Sprint</label>
            <input id="sprint" type="number" name="sprintNumber" value="1"
              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary" />
          </div>
          <div>
            <label class="block font-label text-sm text-obsidian-text-muted mb-1" for="xp">XP</label>
            <input id="xp" type="number" name="xpReward" value="100"
              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary" />
          </div>
          <div>
            <label class="block font-label text-sm text-obsidian-text-muted mb-1" for="coins">Coins</label>
            <input id="coins" type="number" name="coinReward" value="50"
              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary" />
          </div>
          <div class="col-span-2">
            <label class="block font-label text-sm text-obsidian-text-muted mb-1" for="levelDescription">Description</label>
            <input id="levelDescription" type="text" name="levelDescription"
              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary" />
          </div>
          <div class="col-span-2">
            <label class="block font-label text-sm text-obsidian-text-muted mb-1" for="keyTakeaways">Key Takeaways</label>
            <input id="keyTakeaways" type="text" name="keyTakeaways"
              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary" />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" on:click={() => (showCreateForm = false)}
            class="btn-cyber btn-cyber-secondary !px-4 !py-2"
          >Cancel</button>
          <button type="submit" disabled={isSubmitting}
            class="btn-cyber btn-cyber-solid flex items-center gap-2 !px-4 !py-2 disabled:opacity-50"
          >
            {#if isSubmitting}<Loader2 class="h-4 w-4 animate-spin" />{/if}
            Create
          </button>
        </div>
      </form>
      </div>
    </div>
  {/if}

  <AdminFilterBar
    count={filteredScenarios.length}
    total={data.scenarios.length}
    noun="scenario"
    active={hasFilters}
    onClear={clearFilters}
  >
    <AdminSearchInput
      bind:value={search}
      label="Search scenarios"
      placeholder="Search scenario, description, stack or level…"
    />
    {#if difficulties.length > 1}
      <AdminFilterTabs
        label="Difficulty filter"
        bind:value={difficulty}
        options={[
          { value: "all", label: "All levels" },
          ...difficulties.map((d) => ({
            value: d,
            label: d,
            count: data.scenarios.filter((s) => s.difficulty === d).length
          }))
        ]}
      />
    {/if}
    <AdminFilterTabs
      label="Paywall filter"
      bind:value={paywall}
      options={[
        { value: "all", label: "All", count: data.scenarios.length },
        { value: "paywalled", label: "Paywalled", count: paywalledCount },
        { value: "free", label: "Free", count: freeCount }
      ]}
    />
  </AdminFilterBar>

  <div class="space-y-5">
    {#each filteredScenarios as scenario (scenario.id)}
      <div class="card-cyber" style="border-color: rgb(var(--accent-rgb) / 0.15)">
        {#if editingScenarioId === scenario.id}
          <div class="card-cyber-body">
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
                  <label class="block font-label text-sm text-obsidian-text-muted mb-1" for="name">Name</label>
                  <input id="name" type="text" name="name" value={scenario.name} required
                    class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary" />
                </div>
                <div>
                  <label class="block font-label text-sm text-obsidian-text-muted mb-1" for="difficulty">Difficulty</label>
                  <input id="difficulty" type="text" name="difficulty" value={scenario.difficulty}
                    class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary" />
                </div>
                <div class="col-span-2">
                  <label class="block font-label text-sm text-obsidian-text-muted mb-1" for="description">Description</label>
                  <input id="description" type="text" name="description" value={scenario.description} required
                    class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary" />
                </div>
                <div>
                  <label class="block font-label text-sm text-obsidian-text-muted mb-1" for="paywalled">Paywalled</label>
                  <select id="paywalled" name="isPaywalled"
                    class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 text-sm text-obsidian-text-primary"
                  >
                    <option value="false" selected={!scenario.isPaywalled}>No</option>
                    <option value="true" selected={scenario.isPaywalled}>Yes</option>
                  </select>
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <button type="button" on:click={() => (editingScenarioId = null)}
                  class="btn-cyber btn-cyber-secondary !px-3 !py-1"
                >Cancel</button>
                <button type="submit" disabled={isSubmitting}
                  class="btn-cyber btn-cyber-solid flex items-center gap-1 !px-3 !py-1 disabled:opacity-50"
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
              {#if scenario.isPaywalled}<Lock class="h-4 w-4 text-cyber-warn shrink-0" />{:else}<Unlock class="h-4 w-4 text-obsidian-text-muted shrink-0" />{/if}
              <div class="min-w-0">
                <h3 class="font-heading text-lg font-semibold text-obsidian-text-primary">{scenario.name}</h3>
                <p class="text-sm text-obsidian-text-muted truncate">{scenario.description}</p>
                <span class="text-sm font-mono text-obsidian-accent px-1.5 py-0.5 rounded bg-obsidian-accent/10">{scenario.stackName}</span>
              </div>
              <span class="text-sm font-mono text-obsidian-text-muted">[{scenario.difficulty}]</span>
              <span class="text-sm text-obsidian-text-muted">{scenario.levels.length} level{scenario.levels.length !== 1 ? 's' : ''}</span>
              {#if expandedScenario === scenario.id}<ChevronDown class="h-4 w-4 text-obsidian-text-muted" />{:else}<ChevronRight class="h-4 w-4 text-obsidian-text-muted" />{/if}
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button on:click={() => (editingScenarioId = scenario.id)}
                class="rounded bg-obsidian-accent/10 p-1.5 text-obsidian-accent hover:bg-obsidian-accent/20"
              ><Edit3 class="h-4 w-4" /></button>
              <form method="POST" action="?/deleteScenario" use:enhance>
                <input type="hidden" name="id" value={scenario.id} />
                <button type="submit" class="rounded bg-cyber-danger/10 p-1.5 text-cyber-danger hover:bg-cyber-danger/20"
                  on:click={() => confirm('Delete this scenario and all its levels/tasks?')}
                ><Trash2 class="h-4 w-4" /></button>
              </form>
            </div>
          </div>
        {/if}

        {#if expandedScenario === scenario.id}
          <div class="border-t border-[var(--card-border)] px-4 py-3">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-label text-sm text-obsidian-text-muted uppercase tracking-[0.04em]">Levels</h4>
              <button
                on:click={() => (showCreateLevelForScenario = showCreateLevelForScenario === scenario.id ? null : scenario.id)}
                class="btn-cyber btn-cyber-outline flex items-center gap-1 !px-2.5 !py-1.5"
              >
                <Plus class="h-3 w-3" /> Add Level
              </button>
            </div>

            {#if showCreateLevelForScenario === scenario.id}
              <div class="mb-3 rounded border border-obsidian-accent/20 bg-obsidian-accent/5 p-3">
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
                      <label class="text-obsidian-text-muted text-sm" for="title">Title</label>
                      <input id="title" type="text" name="title" required
                        class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                    </div>
                    <div>
                      <label class="text-obsidian-text-muted text-sm" for="order">Order</label>
                      <input id="order" type="number" name="order" value={scenario.levels.length + 1}
                        class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                    </div>
                    <div>
                      <label class="text-obsidian-text-muted text-sm" for="sprint">Sprint</label>
                      <input id="sprint" type="number" name="sprintNumber" value="1"
                        class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                    </div>
                    <div>
                      <label class="text-obsidian-text-muted text-sm" for="xp">XP</label>
                      <input id="xp" type="number" name="xpReward" value="100"
                        class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                    </div>
                    <div>
                      <label class="text-obsidian-text-muted text-sm" for="coins">Coins</label>
                      <input id="coins" type="number" name="coinReward" value="50"
                        class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                    </div>
                    <div class="col-span-3">
                      <label class="text-obsidian-text-muted text-sm" for="description">Description</label>
                      <input id="description" type="text" name="levelDescription"
                        class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                    </div>
                    <div class="col-span-3">
                      <label class="text-obsidian-text-muted text-sm" for="key_takeaways">Key Takeaways</label>
                      <input id="key_takeaways" type="text" name="keyTakeaways"
                        class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                    </div>
                  </div>
                  <div class="flex justify-end gap-2">
                    <button type="button" on:click={() => (showCreateLevelForScenario = null)}
                      class="btn-cyber btn-cyber-secondary !px-2.5 !py-1.5"
                    >Cancel</button>
                    <button type="submit" disabled={isSubmitting}
                      class="btn-cyber btn-cyber-solid flex items-center gap-1 !px-2.5 !py-1.5 disabled:opacity-50"
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
                <div class="rounded-card border border-[var(--card-border)] bg-obsidian-surface/40">
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
                            <label class="text-obsidian-text-muted text-sm" for="title">Title</label>
                            <input id="title" type="text" name="title" value={level.title}
                              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                          </div>
                          <div>
                            <label class="text-obsidian-text-muted text-sm" for="order">Order</label>
                            <input id="order" type="number" name="order" value={level.order}
                              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                          </div>
                          <div>
                            <label class="text-obsidian-text-muted text-sm" for="sprint">Sprint</label>
                            <input id="sprint" type="number" name="sprintNumber" value={level.sprintNumber}
                              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                          </div>
                          <div>
                            <label class="text-obsidian-text-muted text-sm" for="xp">XP</label>
                            <input id="xp" type="number" name="xpReward" value={level.xpReward}
                              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                          </div>
                          <div>
                            <label class="text-obsidian-text-muted text-sm" for="coins">Coins</label>
                            <input id="coins" type="number" name="coinReward" value={level.coinReward}
                              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                          </div>
                          <div class="col-span-3">
                            <label class="text-obsidian-text-muted text-sm" for="description">Description</label>
                            <input id="description" type="text" name="levelDescription" value={level.levelDescription}
                              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                          </div>
                          <div class="col-span-3">
                            <label class="text-obsidian-text-muted text-sm" for="key_takeaways">Key Takeaways</label>
                            <input id="key_takeaways" type="text" name="keyTakeaways" value={level.keyTakeaways}
                              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                          </div>
                        </div>
                        <div class="flex justify-end gap-2">
                          <button type="button" on:click={() => (editingLevelId = null)}
                            class="btn-cyber btn-cyber-secondary !px-2.5 !py-1.5"
                          >Cancel</button>
                          <button type="submit" disabled={isSubmitting}
                            class="btn-cyber btn-cyber-solid flex items-center gap-1 !px-2.5 !py-1.5 disabled:opacity-50"
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
                        <span class="font-heading text-base text-obsidian-accent font-bold">L{level.order}</span>
                        <div class="min-w-0">
                          <span class="text-base text-obsidian-text-primary">{level.title}</span>
                          {#if level.subtitle}
                            <span class="text-sm text-obsidian-text-muted ml-1">— {level.subtitle}</span>
                          {/if}
                        </div>
                        <span class="text-sm text-obsidian-text-muted font-mono">Sprint {level.sprintNumber}</span>
                        <span class="text-sm text-obsidian-text-muted font-mono">{level.xpReward}XP / {level.coinReward}c</span>
                        <span class="text-sm text-obsidian-text-muted">{level.tasks.length} task{level.tasks.length !== 1 ? 's' : ''}</span>
                        {#if expandedLevel === level.id}<ChevronDown class="h-3 w-3 text-obsidian-text-muted" />{:else}<ChevronRight class="h-3 w-3 text-obsidian-text-muted" />{/if}
                      </div>
                      <div class="flex items-center gap-1 shrink-0">
                        <button on:click={() => (editingLevelId = level.id)}
                          class="rounded bg-obsidian-accent/10 p-1 text-obsidian-accent hover:bg-obsidian-accent/20"
                        ><Edit3 class="h-3 w-3" /></button>
                        <form method="POST" action="?/deleteLevel" use:enhance>
                          <input type="hidden" name="id" value={level.id} />
                          <button type="submit" class="rounded bg-cyber-danger/10 p-1 text-cyber-danger hover:bg-cyber-danger/20"
                            on:click={() => confirm('Delete this level and all its tasks?')}
                          ><Trash2 class="h-3 w-3" /></button>
                        </form>
                      </div>
                    </div>
                  {/if}

                  {#if expandedLevel === level.id}
                    <div class="border-t border-obsidian-accent/10 px-4 py-2">
                      <div class="flex items-center justify-between mb-2">
                        <h5 class="font-label text-sm text-obsidian-text-muted uppercase tracking-[0.04em]">Tasks</h5>
                        <button
                          on:click={() => (showCreateTaskForLevel = showCreateTaskForLevel === level.id ? null : level.id)}
                          class="btn-cyber btn-cyber-outline flex items-center gap-1 !px-2.5 !py-1"
                        >
                          <Plus class="h-3 w-3" /> Add Task
                        </button>
                      </div>

                      {#if showCreateTaskForLevel === level.id}
                        <div class="mb-2 rounded border border-obsidian-accent/20 bg-obsidian-accent/5 p-2">
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
                                <label class="text-obsidian-text-muted text-sm" for="task_name">Task Name</label>
                                <input id="task_name" type="text" name="taskName" required
                                  class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                              </div>
                              <div>
                                <label class="text-obsidian-text-muted text-sm" for="order">Order</label>
                                <input id="order" type="number" name="order" value={level.tasks.length + 1}
                                  class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                              </div>
                              <div>
                                <label class="text-obsidian-text-muted text-sm" for="test_type">Test Type</label>
                                <select id="test_type" name="testType"
                                  class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary"
                                >
                                  {#each TEST_TYPES as tt}
                                    <option value={tt}>{tt}</option>
                                  {/each}
                                </select>
                              </div>
                              <div class="col-span-2">
                                <label class="text-obsidian-text-muted text-sm" for="user_story">User Story</label>
                                <input id="user_story" type="text" name="userStory"
                                  class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                              </div>
                              <div class="col-span-2">
                                <label class="text-obsidian-text-muted text-sm" for="acceptance_criteria_one_per_line">Acceptance Criteria (one per line)</label>
                                <textarea id="acceptance_criteria_one_per_line" name="acceptanceCriteria" rows="3" placeholder="A member can view all books&#10;Search filters by title&#10;Empty state when no results"
                                  class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary font-mono"></textarea>
                              </div>
                              <div class="col-span-2">
                                <label class="text-obsidian-text-muted text-sm" for="task_hints_one_per_line">Hints (one per line)</label>
                                <textarea id="task_hints_one_per_line" name="hints" rows="3" placeholder="Check the useEffect dependency array&#10;Reuse the existing formatDate helper"
                                  class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary font-mono"></textarea>
                              </div>
                            </div>
                            <div class="flex justify-end gap-2">
                              <button type="button" on:click={() => (showCreateTaskForLevel = null)}
                                class="btn-cyber btn-cyber-secondary !px-2.5 !py-1"
                              >Cancel</button>
                              <button type="submit" disabled={isSubmitting}
                                class="btn-cyber btn-cyber-solid flex items-center gap-1 !px-2.5 !py-1 disabled:opacity-50"
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
                          <div class="rounded border border-obsidian-accent/10 bg-obsidian-surface/20">
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
                                      <label class="text-obsidian-text-muted text-sm" for="task_name">Task Name</label>
                                      <input id="task_name" type="text" name="taskName" value={task.taskName}
                                        class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                                    </div>
                                    <div>
                                      <label class="text-obsidian-text-muted text-sm" for="order">Order</label>
                                      <input id="order" type="number" name="order" value={task.order}
                                        class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                                    </div>
                                    <div>
                                      <label class="text-obsidian-text-muted text-sm" for="test_type">Test Type</label>
                                      <select id="test_type" name="testType"
                                        class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary"
                                      >
                                        {#each TEST_TYPES as tt}
                                          <option value={tt} selected={task.testType === tt}>{tt}</option>
                                        {/each}
                                      </select>
                                    </div>
                                    <div class="col-span-2">
                                      <label class="text-obsidian-text-muted text-sm" for="user_story">User Story</label>
                                      <input id="user_story" type="text" name="userStory" value={task.userStory}
                                        class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                                    </div>
                                    <div class="col-span-2">
                                      <label class="text-obsidian-text-muted text-sm" for="acceptance_criteria_one_per_line">Acceptance Criteria (one per line)</label>
                                      <textarea id="acceptance_criteria_one_per_line" name="acceptanceCriteria" rows="3"
                                        class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary font-mono"
                                      >{task.acceptanceCriteria.map(ac => ac.description).join('\n')}</textarea>
                                    </div>
                                    <div class="col-span-2">
                                      <label class="text-obsidian-text-muted text-sm" for="task_hints_one_per_line">Hints (one per line)</label>
                                      <textarea id="task_hints_one_per_line" name="hints" rows="3"
                                        class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary font-mono"
                                      >{task.hints.map(h => h.description).join('\n')}</textarea>
                                    </div>
                                  </div>
                                  <div class="flex justify-end gap-2">
                                    <button type="button" on:click={() => (editingTaskId = null)}
                                      class="btn-cyber btn-cyber-secondary !px-2.5 !py-1"
                                    >Cancel</button>
                                    <button type="submit" disabled={isSubmitting}
                                      class="btn-cyber btn-cyber-solid flex items-center gap-1 !px-2.5 !py-1 disabled:opacity-50"
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
                                    <ListTodo class="h-3 w-3 text-obsidian-text-muted shrink-0" />
                                    <span class="text-sm text-obsidian-text-primary font-mono">{task.taskName}</span>
                                    <span class="text-sm text-obsidian-text-muted">({task.testType})</span>
                                    {#if task.acceptanceCriteria.length > 0}
                                      <span class="text-[0.65rem] text-obsidian-text-muted bg-obsidian-accent/10 px-1 py-0.5 rounded">{task.acceptanceCriteria.length} crit</span>
                                    {/if}
                                    {#if task.hints.length > 0}
                                      <span class="text-[0.65rem] text-obsidian-text-muted bg-cyber-warn/10 px-1 py-0.5 rounded">{task.hints.length} hint{task.hints.length === 1 ? '' : 's'}</span>
                                    {/if}
                                  </div>
                                  <div class="flex items-center gap-1 shrink-0">
                                    <button on:click={() => (editingTaskId = task.id)}
                                      class="rounded bg-obsidian-accent/10 p-0.5 text-obsidian-accent hover:bg-obsidian-accent/20"
                                    ><Edit3 class="h-3 w-3" /></button>
                                    <form method="POST" action="?/deleteTask" use:enhance>
                                      <input type="hidden" name="id" value={task.id} />
                                      <button type="submit" class="rounded bg-cyber-danger/10 p-0.5 text-cyber-danger hover:bg-cyber-danger/20"
                                        on:click={() => confirm('Delete this task?')}
                                      ><Trash2 class="h-3 w-3" /></button>
                                    </form>
                                  </div>
                                </div>
                                {#if task.acceptanceCriteria.length > 0}
                                  <div class="px-6 pb-1 space-y-0.5">
                                    <p class="text-[0.65rem] uppercase tracking-[0.04em] text-obsidian-text-muted opacity-60">Acceptance Criteria</p>
                                    {#each task.acceptanceCriteria as ac}
                                      <div class="flex items-start gap-1.5">
                                        <span class="text-[0.65rem] text-obsidian-text-muted shrink-0">{ac.order}.</span>
                                        <span class="text-sm text-obsidian-text-muted min-w-0">{ac.description}</span>
                                      </div>
                                    {/each}
                                  </div>
                                {/if}
                                {#if task.hints.length > 0}
                                  <div class="px-6 pb-1.5 space-y-0.5">
                                    <p class="text-[0.65rem] uppercase tracking-[0.04em] text-obsidian-text-muted opacity-60">Hints</p>
                                    {#each task.hints as hint}
                                      <div class="flex items-start gap-1.5">
                                        <span class="text-[0.65rem] text-obsidian-text-muted shrink-0">{hint.order}.</span>
                                        <span class="text-sm text-obsidian-text-muted min-w-0">{hint.description}</span>
                                      </div>
                                    {/each}
                                  </div>
                                {/if}
                              </div>
                            {/if}

                            <div class="mt-3">
                              <div class="flex items-center justify-between mb-2">
                                <h5 class="font-label text-sm text-obsidian-text-muted uppercase tracking-[0.04em]">Learning Sections</h5>
                                <button
                                  on:click={() => toggleCreateSection(task.id)}
                                  class="btn-cyber btn-cyber-outline flex items-center gap-1 !px-2.5 !py-1"
                                >
                                  <Plus class="h-3 w-3" /> Add Section
                                </button>
                              </div>

                              {#if showCreateLearningSectionForTask === task.id}
                                <div class="mb-2 rounded border border-obsidian-accent/20 bg-obsidian-accent/5 p-2">
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
                                        <label class="text-obsidian-text-muted text-sm" for="title">Title</label>
                                        <input id="title" type="text" name="title" required
                                          class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                                      </div>
                                      <div>
                                        <label class="text-obsidian-text-muted text-sm" for="section_type">Section Type</label>
                                        <select id="section_type" name="sectionType"
                                          class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary"
                                          value={createSectionType}
                                          on:change={(e) => {
                                            createSectionType = e.currentTarget.value as SectionType;
                                            createInteractiveMode = onSectionTypeChange(createSectionType, createInteractiveMode);
                                          }}
                                        >
                                          {#each SECTION_TYPES as st}
                                            <option value={st}>{st}</option>
                                          {/each}
                                        </select>
                                      </div>
                                      <div>
                                        <label class="text-obsidian-text-muted text-sm" for="interactive_mode">Interactive Mode</label>
                                        <select id="interactive_mode" name="interactiveMode"
                                          class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                                          value={createInteractiveMode}
                                          disabled={createSectionType !== 'INTERACTIVE'}
                                          on:change={(e) => (createInteractiveMode = e.currentTarget.value as InteractiveMode | '')}
                                        >
                                          {#if createSectionType !== 'INTERACTIVE'}
                                            <option value="">-- None --</option>
                                          {/if}
                                          {#each INTERACTIVE_MODES as im}
                                            <option value={im}>{im}</option>
                                          {/each}
                                        </select>
                                      </div>
                                      <div class="col-span-2">
                                        <label class="text-obsidian-text-muted text-sm" for="content">Content</label>
                                        <textarea id="content" name="content" rows="3"
                                          class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary font-mono"></textarea>
                                      </div>
                                      <InteractiveConfigEditor
                                        mode={createInteractiveMode}
                                        disabled={createSectionType !== 'INTERACTIVE'}
                                      />
                                    </div>
                                    <div class="flex justify-end gap-2">
                                      <button type="button" on:click={() => (showCreateLearningSectionForTask = null)}
                                        class="btn-cyber btn-cyber-secondary !px-2.5 !py-1"
                                      >Cancel</button>
                                      <button type="submit" disabled={isSubmitting}
                                        class="btn-cyber btn-cyber-solid flex items-center gap-1 !px-2.5 !py-1 disabled:opacity-50"
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
                                  <div class="rounded border border-obsidian-accent/10 bg-obsidian-surface/20">
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
                                              <label class="text-obsidian-text-muted text-sm" for="title">Title</label>
                                              <input id="title" type="text" name="title" value={section.title}
                                                class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                                            </div>
                                            <div>
                                              <label class="text-obsidian-text-muted text-sm" for="order">Order</label>
                                              <input id="order" type="number" name="order" value={section.order}
                                                class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary" />
                                            </div>
                                            <div>
                                              <label class="text-obsidian-text-muted text-sm" for="section_type">Section Type</label>
                                              <select id="section_type" name="sectionType"
                                                class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary"
                                                value={editSectionType}
                                                on:change={(e) => {
                                                  editSectionType = e.currentTarget.value as SectionType;
                                                  editInteractiveMode = onSectionTypeChange(editSectionType, editInteractiveMode);
                                                }}
                                              >
                                                {#each SECTION_TYPES as st}
                                                  <option value={st}>{st}</option>
                                                {/each}
                                              </select>
                                            </div>
                                            <div>
                                              <label class="text-obsidian-text-muted text-sm" for="interactive_mode">Interactive Mode</label>
                                              <select id="interactive_mode" name="interactiveMode"
                                                class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                                                value={editInteractiveMode}
                                                disabled={editSectionType !== 'INTERACTIVE'}
                                                on:change={(e) => (editInteractiveMode = e.currentTarget.value as InteractiveMode | '')}
                                              >
                                                {#if editSectionType !== 'INTERACTIVE'}
                                                  <option value="">-- None --</option>
                                                {/if}
                                                {#each INTERACTIVE_MODES as im}
                                                  <option value={im}>{im}</option>
                                                {/each}
                                              </select>
                                            </div>
                                            <div class="col-span-2">
                                              <label class="text-obsidian-text-muted text-sm" for="content">Content</label>
                                              <textarea id="content" name="content" rows="3"
                                                class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-2 py-1 text-sm text-obsidian-text-primary font-mono"
                                              >{section.content}</textarea>
                                            </div>
                                            <InteractiveConfigEditor
                                              mode={editInteractiveMode}
                                              config={editConfig}
                                              disabled={editSectionType !== 'INTERACTIVE'}
                                            />
                                          </div>
                                          <div class="flex justify-end gap-2">
                                            <button type="button" on:click={() => (editingLearningSectionId = null)}
                                              class="btn-cyber btn-cyber-secondary !px-2.5 !py-1"
                                            >Cancel</button>
                                            <button type="submit" disabled={isSubmitting}
                                              class="btn-cyber btn-cyber-solid flex items-center gap-1 !px-2.5 !py-1 disabled:opacity-50"
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
                                          <BookOpen class="h-3 w-3 text-obsidian-text-muted shrink-0" />
                                          <span class="text-sm text-obsidian-text-primary font-mono">{section.title}</span>
                                          <span class="text-sm text-obsidian-text-muted">({section.sectionType})</span>
                                          {#if section.interactiveMode}
                                            <span class="text-[0.65rem] text-obsidian-accent bg-obsidian-accent/10 px-1 py-0.5 rounded">{section.interactiveMode}</span>
                                          {/if}
                                        </div>
                                        <div class="flex items-center gap-1 shrink-0">
                                          <button on:click={() => startEditLearningSection(section)}
                                            class="rounded bg-obsidian-accent/10 p-0.5 text-obsidian-accent hover:bg-obsidian-accent/20"
                                          ><Edit3 class="h-3 w-3" /></button>
                                          <form method="POST" action="?/deleteLearningSection" use:enhance>
                                            <input type="hidden" name="id" value={section.id} />
                                            <button type="submit" class="rounded bg-cyber-danger/10 p-0.5 text-cyber-danger hover:bg-cyber-danger/20"
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
                          <p class="text-sm text-obsidian-text-muted italic py-1">No tasks yet</p>
                        {/if}
                      </div>

                    </div>
                  {/if}
                </div>
              {/each}
              {#if scenario.levels.length === 0}
                <p class="text-sm text-obsidian-text-muted italic py-1">No levels yet</p>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <div class="card-cyber" style="border-color: rgb(var(--accent-rgb) / 0.15)">
        <div class="card-cyber-body text-center font-body text-md text-obsidian-text-muted">
          {hasFilters
            ? "No scenarios match the current filters."
            : "No scenarios yet. Create one to get started."}
        </div>
      </div>
    {/each}
  </div>
</div>
