<script lang="ts">
  import type { StackSelection } from "$types";
  import type { PageData } from "./$types";
  import Header from "$components/Header.svelte";
  import StackSummary from "$components/stacks/StackSummary.svelte";
  import PopularCombos from "$components/stacks/PopularCombos.svelte";
  import StackInfoModal from "$components/stacks/StackInfoModal.svelte";
  import { POPULAR_COMBOS } from "$mocks";
  import { Layers, Sparkles } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import type { UserData } from "$types";

  // Pre-select the first available combo so the button is active on load
  const _default = POPULAR_COMBOS.find(c => !c.comingSoon);
  let selection: StackSelection = {
    frontend: _default?.frontend ?? null,
    backend: _default?.backend ?? null,
    database: _default?.database ?? null,
    services: _default?.services ?? null,
  };

  let showInfoModal = false;

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

  async function handleViewScenarios() {
    const stackName = buildStackName(selection);
    const encoded = encodeURIComponent(JSON.stringify(selection));
    await goto(`/scenario?stack=${stackName}&selection=${encoded}`);
  }

   export let data: PageData;

  const headerUserData: Partial<UserData> = {
    name: data.user?.name ?? 'No Name',
    email: data.user.email,
    image: data.user.image,
    id: data.user.id,
    avatar: data.user.image,
    givenName: data.user.givenName,
    fullName: data.user?.fullName ?? data.user?.name ?? 'No Name',
    coins: data.userCoins,
  };
</script>

<svelte:head>
  <title>DevSim - Choose Your Stack</title>
</svelte:head>

<div class="page-root">
  <!-- Full-bleed background layers -->
  <div class="bg-grid" aria-hidden="true"></div>
  <div class="bg-orb" aria-hidden="true"></div>
  <div class="bg-scanlines" aria-hidden="true"></div>

  <div class="relative z-10">
    <Header userData={headerUserData} />

    <main class="w-full max-w-[1200px] mx-auto px-4 pt-4 pb-28 md:px-6 lg:px-8 lg:pt-5 lg:pb-32">
      <!-- Page Header with Gamification -->
      <div class="mb-4 lg:mb-6 flex items-start justify-between">
        <div class="flex items-center gap-4">
          <div class="relative">
            <div
              class="w-8 h-8 flex items-center justify-center"
              style="background:#12192a; border:1px solid rgba(7,165,201,0.25); border-radius:4px;"
            >
              <Layers class="w-4 h-4" style="color:#07a5c9;" />
            </div>
            <!-- Corner accents -->
            <div
              class="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 border-t-2 border-l-2"
              style="border-color:#07a5c9;"
            ></div>
            <div
              class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-b-2 border-r-2"
              style="border-color:#07a5c9;"
            ></div>
          </div>
          <div>
            <h1 class="page-title flex items-center gap-2">
              Choose Your Stack
              <Sparkles class="w-5 h-5" style="color:#ffb400;" />
            </h1>
            <p class="page-subtitle">
              Select your loadout. Launch your simulation. Earn Coins & XP.
            </p>
          </div>
        </div>
      </div>

      <!-- Stack Loadouts -->
      <PopularCombos onSelectCombo={handleQuickSelect} {selection} />
    </main>

    <!-- Bottom Summary Bar -->
    <StackSummary
      {selection}
      onClear={handleClearSelection}
      onStart={handleViewScenarios}
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
    background-color: #0a0e1a;
  }

  /* Full-page dark bg */
  .page-root {
    min-height: 100vh;
    background: #0a0e1a;
    color: #d0d7dd;
    position: relative;
  }

  /* 40×40px cyan grid texture */
  .bg-grid {
    position: fixed;
    inset: 0;
    z-index: 0;
    background-image:
      repeating-linear-gradient(0deg,   rgba(7,165,201,0.06) 0, rgba(7,165,201,0.06) 1px, transparent 1px, transparent 40px),
      repeating-linear-gradient(90deg,  rgba(7,165,201,0.06) 0, rgba(7,165,201,0.06) 1px, transparent 1px, transparent 40px);
    pointer-events: none;
  }

  /* Radial ambient glow at top-center */
  .bg-orb {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60vh;
    z-index: 0;
    background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(7,165,201,0.08), transparent);
    pointer-events: none;
  }

  /* Scanlines overlay */
  .bg-scanlines {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(0,0,0,0.015) 4px
    );
    pointer-events: none;
  }

  /* Page heading — Orbitron */
  .page-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.4rem;
    font-weight: 700;
    color: #d0d7dd;
    letter-spacing: 0.04em;
  }

  /* Subtitle — Rajdhani */
  .page-subtitle {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.78rem;
    color: rgba(208, 215, 221, 0.55);
  }

</style>
