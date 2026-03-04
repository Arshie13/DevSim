<script lang="ts">
  import type { StackSelection } from "$types";
  import { TECH_CATEGORIES, userData } from "$mocks";
  import type { PageData } from "./$types";
  import Header from "$components/Header.svelte";
  import CategorySection from "$components/stacks/CategorySection.svelte";
  import StackSummary from "$components/stacks/StackSummary.svelte";
  import PopularCombos from "$components/stacks/PopularCombos.svelte";
  import StackInfoModal from "$components/stacks/StackInfoModal.svelte";
  import { Layers, Sparkles } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import type { UserData } from "$types";

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
      [categoryId]:
        selection[categoryId as keyof StackSelection] === optionId
          ? null
          : optionId,
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

  function navigateToRoute(containerId: string) {
    goto(`/workspace/${containerId}`);
  }

  // Mapping of tech IDs to folder names
  const techIdToFolderName: Record<string, string> = {
    postgresql: "postgres",
    mongodb: "mongo",
    mysql: "mysql",
    sqlite: "sqlite",
    redis: "redis",
  };

  function buildStackName(selection: StackSelection): string {
    const parts: string[] = [];

    // Frontend (required)
    if (selection.frontend) {
      parts.push(selection.frontend);
    }

    // Backend
    if (selection.backend) {
      parts.push(selection.backend);
    }

    // Database (required for the project structure)
    if (selection.database) {
      parts.push(techIdToFolderName[selection.database] || selection.database);
    }

    // Services (optional, but included if selected)
    if (selection.services) {
      parts.push(selection.services);
    }

    return parts.join("-");
  }

  async function handleStartSprint() {
    const stackName = buildStackName(selection);

    console.log("stack name: ", stackName);

    try {
      // Pre-flight: verify the session is still valid before creating any resources.
      // This catches stale sessions early without touching Docker or the database.
      const sessionCheckResponse = await fetch("/auth/session");
      if (!sessionCheckResponse.ok) {
        alert("Your session is outdated. Please sign out and sign back in.");
        return;
      }
      const sessionData = await sessionCheckResponse.json();
      if (!sessionData?.user?.id) {
        alert("Your session is outdated. Please sign out and sign back in.");
        return;
      }

      // Step 1: Create the container
      const createResponse = await fetch("/api/docker/container/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stackName,
          level: 1, // Default level
          stacks: selection,
        }),
      });

      const createData = await createResponse.json();

      if (!createData.success) {
        console.error("Failed to create container:", createData.error);
        // 401 = stale session — userId missing from DB after a reset
        if (createResponse.status === 401) {
          alert("Your session is outdated. Please sign out and sign back in.");
        } else {
          alert(`Failed to create container: ${createData.error}`);
        }
        return;
      }
      navigateToRoute(createData.dbContainerId);
    } catch (error) {
      console.error("Error starting sprint:", error);
    }
  }

   export let data: PageData;

  const headerUserData: UserData = {
    ...userData,
    name: data.user?.name ?? "No Name",
    avatar: data.user?.image ?? ''
  };
</script>

<svelte:head>
  <title>DevSim - Build Your Stack</title>
</svelte:head>

<div
  class="min-h-screen bg-obsidian-bg text-obsidian-text-primary custom-scrollbar text-[0.8rem]"
>
  <div class="relative z-10">
    <Header userData={headerUserData} />

    <main class="w-full max-w-[1200px] mx-auto px-4 py-5 pb-28 md:px-6 lg:px-8 lg:py-8 lg:pb-32">
      <!-- Page Header with Gamification -->
      <div class="mb-6 lg:mb-8 flex items-start justify-between">
        <div class="flex items-center gap-4">
          <div class="relative">
            <div
              class="w-12 h-12 bg-obsidian-surface border border-obsidian-border rounded-lg flex items-center justify-center"
            >
              <Layers class="w-6 h-6 text-obsidian-text-primary" />
            </div>
            <!-- Corner accents -->
            <div
              class="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 border-t-2 border-l-2 border-obsidian-accent/50 rounded-tl-md"
            ></div>
            <div
              class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-b-2 border-r-2 border-obsidian-accent/50 rounded-br-md"
            ></div>
          </div>
          <div>
            <h1
              class="text-2xl font-bold text-obsidian-text-muted flex items-center gap-2"
            >
              Build Your Stack
              <Sparkles class="w-5 h-5 text-amber-400" />
            </h1>
            <p class="text-sm text-obsidian-text-primary/60 mt-1.5">
              Mix and match technologies — select only what you want to practice
            </p>
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
          <span
            class="bg-obsidian-bg px-5 text-xs text-obsidian-text-primary/40 uppercase tracking-wider"
          >
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
      <StackInfoModal {selection} onClose={() => (showInfoModal = false)} />
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
