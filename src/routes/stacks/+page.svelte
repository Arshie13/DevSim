<script lang="ts">
  import type { StackSelection } from "$types";
  import { TECH_CATEGORIES, userData } from "$mocks";
  import Header from "$components/Header.svelte";
  import CategorySection from "$components/stacks/CategorySection.svelte";
  import StackSummary from "$components/stacks/StackSummary.svelte";
  import PopularCombos from "$components/stacks/PopularCombos.svelte";
  import StackInfoModal from "$components/stacks/StackInfoModal.svelte";
  import { Layers, Sparkles, Target } from "lucide-svelte";

  // Stack selection state
  let selection: StackSelection = {
    frontend: null,
    backend: null,
    database: null,
    services: null,
  };

  let showInfoModal = false;

  function handleCategorySelect(categoryId: string, optionId: string) {
    selection = {
      ...selection,
      [categoryId]: selection[categoryId as keyof StackSelection] === optionId ? null : optionId,
    };
  }

  function handleClearSelection(category: keyof StackSelection) {
    selection = {
      ...selection,
      [category]: null,
    };
  }

  function handleQuickSelect(combo: StackSelection) {
    selection = {
      frontend: combo.frontend,
      backend: combo.backend,
      database: combo.database,
      services: combo.services,
    };
  }

  function handleShowInfo() {
    showInfoModal = true;
  }

  function handleStartSprint() {
    console.log("Starting sprint with:", selection);
    // Navigate to coding environment
    // window.location.href = `/workspace/${selection.frontend}-${selection.backend}-${selection.database}`;
  }

  $: selectedCount = [
    selection.frontend,
    selection.backend,
    selection.database,
    selection.services,
  ].filter(Boolean).length;
</script>

<svelte:head>
  <title>DevSim - Build Your Stack</title>
</svelte:head>

<div class="min-h-screen bg-obsidian-bg text-obsidian-text-primary custom-scrollbar text-[0.8rem]">
  
  <div class="relative z-10">
    <Header {userData} />

    <main class="w-full px-12 py-8 pb-32">
      <!-- Page Header with Gamification -->
      <div class="mb-8 flex items-start justify-between">
        <div class="flex items-center gap-4">
          <div class="relative">
            <div class="w-12 h-12 bg-obsidian-surface border border-obsidian-border rounded-lg flex items-center justify-center">
              <Layers class="w-6 h-6 text-obsidian-text-primary" />
            </div>
            <!-- Corner accents -->
            <div class="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 border-t-2 border-l-2 border-obsidian-accent/50 rounded-tl-md"></div>
            <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-b-2 border-r-2 border-obsidian-accent/50 rounded-br-md"></div>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-obsidian-text-muted flex items-center gap-2">
              Build Your Stack
              <Sparkles class="w-5 h-5 text-amber-400" />
            </h1>
            <p class="text-sm text-obsidian-text-primary/60 mt-1.5">
              Mix and match technologies — select only what you want to practice
            </p>
          </div>
        </div>

        <!-- Quest/Mission indicator -->
        <div class="hidden lg:flex items-center gap-3 bg-obsidian-surface/80 border border-obsidian-border rounded-lg px-4 py-3">
          <div class="relative">
            <Target class="w-5 h-5 text-obsidian-accent" />
            <div class="absolute inset-0 bg-obsidian-accent/20 blur-md"></div>
          </div>
          <div>
            <p class="text-xs text-obsidian-text-primary/60 uppercase tracking-wider">Daily Quest</p>
            <p class="text-sm font-medium text-obsidian-text-muted">Complete a Full Stack Sprint</p>
          </div>
          <div class="text-xs px-2.5 py-1 rounded-full bg-obsidian-accent/20 text-obsidian-accent border border-obsidian-accent/30 font-medium">
          +500 XP
        </div>
      </div>
    </div>

    <!-- Popular Combos -->
    <PopularCombos onSelectCombo={handleQuickSelect} />

    <!-- Divider -->
    <div class="relative my-8">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-obsidian-border"></div>
      </div>
      <div class="relative flex justify-center">
        <span class="bg-obsidian-bg px-5 text-xs text-obsidian-text-primary/40 uppercase tracking-wider">
          Or build your own
        </span>
      </div>
    </div>

    <!-- Technology Categories -->
    <div class="space-y-6">
      {#each TECH_CATEGORIES as category (category.id)}
        <CategorySection
          {category}
          selectedId={selection[category.id as keyof StackSelection]}
          onSelect={(optionId) => handleCategorySelect(category.id, optionId)}
        />
      {/each}
    </div>
  </main>

  <!-- Bottom Summary Bar -->
  <StackSummary
    {selection}
    onClear={handleClearSelection}
    onStart={handleStartSprint}
    onShowInfo={handleShowInfo}
  />

  <!-- Stack Info Modal -->
  {#if showInfoModal}
    <StackInfoModal {selection} onClose={() => showInfoModal = false} />
  {/if}
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family:
      "Inter",
      system-ui,
      -apple-system,
      sans-serif;
    background-color: #18181b;
  }
</style>
