<script lang="ts">
  import type { StackSelection } from "$types";
  import type { PageData } from "./$types";
  import Header from "$components/Header.svelte";
  import PopularCombos from "$components/stacks/PopularCombos.svelte";
  import StackPreviewPanel from "$components/stacks/StackPreviewPanel.svelte";
  import StackInfoModal from "$components/stacks/StackInfoModal.svelte";
  import { Layers, Sparkles, ArrowLeft, Terminal } from "lucide-svelte";
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
  let previewSelection: StackSelection | null = null;

  function handleClearSelection(category: keyof StackSelection) {
    selection = {
      ...selection,
      [category]: null,
    };
  }

  function handleSelectCombo(combo: StackSelection) {
    selection = {
      frontend: combo.frontend,
      backend: combo.backend,
      database: combo.database,
      services: combo.services,
      name: combo.name,
      stackType: combo.stackType,
    };
    previewSelection = { ...selection };
  }

  function handleViewAnalysis() {
    if (previewSelection) {
      showInfoModal = true;
    }
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

  function goBack() {
    window.history.back();
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

  <div class="relative z-10 h-screen flex flex-col overflow-hidden">
    <Header userData={headerUserData} />

    <main class="flex-1 w-full max-w-[1320px] mx-auto px-4 pt-6 pb-4 md:px-5 lg:px-6 min-h-0 flex flex-col gap-4">
      <!-- Page Header (matches leaderboards format) -->
      <div class="flex-shrink-0">
        <button
          on:click={goBack}
          class="flex items-center gap-2 text-[rgba(208,215,221,0.40)] hover:text-[#07a5c9] transition-colors mb-5 group"
          style="font-family: 'Orbitron', sans-serif; font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase;"
        >
          <ArrowLeft size={14} class="transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        <div class="flex items-start justify-between">
          <div class="flex items-center gap-5">
            <!-- Icon box with glow -->
            <div class="relative">
              <div
                class="w-14 h-14 flex items-center justify-center rounded-lg"
                style="background: rgba(7,165,201,0.10); border: 1px solid rgba(7,165,201,0.30); color: #07a5c9;"
              >
                <Layers size={28} />
              </div>
              <div
                class="absolute inset-0 rounded-lg blur-xl animate-pulse"
                style="background: rgba(7,165,201,0.15);"
              ></div>
            </div>

            <!-- Title block -->
            <div>
              <h1 class="page-title-big">Choose Your Stack</h1>
              <div class="flex items-center gap-3 mt-1">
                <p class="page-subtitle-big">Select your loadout. Launch your simulation.</p>
                <span
                  class="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider"
                  style="font-family: 'Share Tech Mono', monospace; background: rgba(7,165,201,0.08); border: 1px solid rgba(7,165,201,0.20); color: #07a5c9;"
                >
                  V2.0
                </span>
                <div
                  class="flex items-center gap-2 px-2.5 py-1 rounded"
                  style="background: rgba(0,229,160,0.08); border: 1px solid rgba(0,229,160,0.25);"
                >
                  <span class="w-2 h-2 rounded-full bg-[#00e5a0] animate-pulse"></span>
                  <span
                    class="text-xs uppercase tracking-widest"
                    style="font-family: 'Orbitron', sans-serif; color: #00e5a0; font-size: 0.65rem;"
                  >
                    Ready
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right side stats -->
          <div class="hidden lg:flex items-center gap-6">
            <div class="text-right">
              <p class="page-stat-num">5</p>
              <p class="page-stat-label">Stacks</p>
            </div>
            <div class="w-px h-10" style="background: rgba(7,165,201,0.15);"></div>
            <div class="text-right">
              <p class="page-stat-num">4</p>
              <p class="page-stat-label">Layers</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Two-column terminal area -->
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_540px] gap-4 min-h-0 flex-1 items-stretch">
        <!-- Left: Stack Cards -->
        <div class="min-h-0 h-full">
          <PopularCombos
            onSelectCombo={handleSelectCombo}
            {selection}
          />
        </div>

        <!-- Right: Loadout Terminal -->
        <div class="min-h-0 h-full">
          <StackPreviewPanel
            {selection}
            onClear={handleClearSelection}
            onStart={handleViewScenarios}
            onViewAnalysis={handleViewAnalysis}
          />
        </div>
      </div>
    </main>

    <!-- Stack Analysis Modal -->
    {#if showInfoModal && previewSelection}
      <StackInfoModal
        selection={previewSelection}
        onClose={() => (showInfoModal = false)}
      />
    {/if}
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #0a0e1a;
    overflow: hidden;
  }

  /* Full-page dark bg */
  .page-root {
    height: 100vh;
    background: #0a0e1a;
    color: #d0d7dd;
    position: relative;
    overflow: hidden;
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

  /* Big header title — matches leaderboards */
  .page-title-big {
    font-family: 'Orbitron', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: #d0d7dd;
    letter-spacing: 0.03em;
    line-height: 1.1;
  }

  .page-subtitle-big {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.9rem;
    color: rgba(208, 215, 221, 0.55);
  }

  .page-stat-num {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #07a5c9;
    line-height: 1;
  }

  .page-stat-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.65rem;
    color: rgba(208, 215, 221, 0.40);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 0.15rem;
  }
</style>
