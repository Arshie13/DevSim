<script lang="ts">
  import { goto } from "$app/navigation";
  import { ArrowLeft, Layers, GitBranch, CheckCircle, Clock, Play, Loader2, User } from "lucide-svelte";
  import type { PageData } from "./$types";
  import { toast } from "$lib/stores/toast";
  import { userData } from "$mocks";
  import type { UserData } from "$types";

  export let data: PageData;

  // User data for header
  const headerUserData: UserData = {
    ...userData,
    name: "User",
    avatar: "",
    coins: 0,
  };

  // Selected UGC state
  let selectedUgcId: string | null = null;
  let isCreating = false;

  // Get the selected UGC object
  $: selectedUgc = data.ugcList.find((ugc) => ugc.id === selectedUgcId);

  // Calculate total tasks from all levels
  function getTotalTasks(ugc: typeof data.ugcList[0]): number {
    return ugc.levels.reduce((sum, level) => sum + level.tasks.length, 0);
  }

  // Handle selecting a UGC
  function selectUgc(ugcId: string) {
    selectedUgcId = selectedUgcId === ugcId ? null : ugcId;
  }

  // Handle creating container from UGC
  async function handleSelectStack() {
    if (!selectedUgc) return;

    isCreating = true;

    try {
      // Create container with UGC data
      const response = await fetch("/api/ugc/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ugcId: selectedUgc.id,
          repoLink: selectedUgc.repoLink,
          scenario: selectedUgc.scenario,
          techStacks: selectedUgc.techStacks.map((t) => t.name),
          levels: selectedUgc.levels.map((level) => ({
            id: level.id,
            title: level.title,
            order: level.order,
            description: level.description,
            xpReward: level.xpReward,
          })),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "Failed to create container");
        return;
      }

      // Navigate to the workspace
      goto(`/workspace/${result.containerId}`);
    } catch (error) {
      console.error("Error creating container:", error);
      toast.error("An unexpected error occurred");
    } finally {
      isCreating = false;
    }
  }
</script>

<svelte:head>
  <title>Select UGC Stack | DevSim</title>
</svelte:head>

<div class="page-root">
  <!-- Full-bleed background layers -->
  <div class="bg-grid" aria-hidden="true"></div>
  <div class="bg-orb" aria-hidden="true"></div>
  <div class="bg-scanlines" aria-hidden="true"></div>

  <div class="relative z-10">
    <!-- Header -->
    <header class="border-b border-obsidian-border bg-obsidian-surface/50 backdrop-blur-sm">
      <div class="max-w-[1200px] mx-auto px-6 py-4">
        <div class="flex items-center gap-4">
          <a
            href="/dashboard"
            class="p-2 hover:bg-obsidian-bg/50 rounded-lg transition-colors"
          >
            <ArrowLeft class="w-5 h-5 text-obsidian-text-muted" />
          </a>
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 flex items-center justify-center"
              style="background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 4px;"
            >
              <Layers class="w-5 h-5" style="color: #a855f7;" />
            </div>
            <div>
              <h1 class="text-xl font-orbitron font-bold text-obsidian-text-primary">
                Select Community Stack
              </h1>
              <p class="text-sm font-rajdhani text-obsidian-text-muted">
                Choose from user-generated content to practice
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="w-full max-w-[1200px] mx-auto px-6 py-8 pb-32">
      {#if data.ugcList.length === 0}
        <!-- Empty State -->
        <div class="text-center py-16">
          <div
            class="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style="background: rgba(168, 85, 247, 0.1);"
          >
            <Layers class="w-10 h-10 text-obsidian-text-muted" />
          </div>
          <h2 class="text-2xl font-orbitron font-bold text-obsidian-text-primary mb-3">
            No Community Stacks Available
          </h2>
          <p class="text-obsidian-text-muted max-w-md mx-auto mb-8">
            There are no approved community submissions yet. Be the first to create one!
          </p>
          <a
            href="/ugc/new"
            class="inline-flex items-center gap-2 px-6 py-3 bg-cyber-bright hover:bg-cyber-bright/90 text-obsidian-bg font-orbitron font-semibold rounded-lg transition-colors"
          >
            <Play class="w-4 h-4" />
            Create Submission
          </a>
        </div>
      {:else}
        <!-- UGC Grid -->
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {#each data.ugcList as ugc (ugc.id)}
            <button
              type="button"
              on:click={() => selectUgc(ugc.id)}
              class="ugc-card text-left {selectedUgcId === ugc.id ? 'selected' : ''}"
            >
              <!-- Card Header -->
              <div class="p-5 border-b border-obsidian-border">
                <div class="flex items-start justify-between mb-3">
                  <span
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    style="background: rgba(168, 85, 247, 0.15); color: #a855f7;"
                  >
                    Approved
                  </span>
                  <span class="text-xs text-obsidian-text-muted">
                    {new Date(ugc.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 class="font-semibold text-lg text-obsidian-text-primary line-clamp-1 mb-2">
                  {ugc.repoLink.split("/").pop() || "Untitled"}
                </h3>
                {#if ugc.scenario}
                  <p class="text-sm text-obsidian-text-muted line-clamp-2">
                    {ugc.scenario}
                  </p>
                {/if}
              </div>

              <!-- Tech Stacks -->
              <div class="px-5 py-3" style="background: rgba(0, 0, 0, 0.2);">
                <div class="flex flex-wrap gap-1.5">
                  {#each ugc.techStacks.slice(0, 4) as stack}
                    <span
                      class="px-2 py-0.5 rounded text-xs"
                      style="background: rgba(7, 165, 201, 0.1); color: #07a5c9;"
                    >
                      {stack.name}
                    </span>
                  {/each}
                  {#if ugc.techStacks.length > 4}
                    <span class="px-2 py-0.5 rounded text-xs text-obsidian-text-muted">
                      +{ugc.techStacks.length - 4}
                    </span>
                  {/if}
                </div>
              </div>

              <!-- Stats -->
              <div class="px-5 py-3 border-t border-obsidian-border flex items-center justify-between text-sm">
                <div class="flex items-center gap-4 text-obsidian-text-muted">
                  <span class="flex items-center gap-1">
                    <Layers class="w-4 h-4" />
                    {ugc.levels.length} levels
                  </span>
                  <span class="flex items-center gap-1">
                    <CheckCircle class="w-4 h-4" />
                    {getTotalTasks(ugc)} tasks
                  </span>
                </div>
              </div>

              <!-- Author -->
              <div class="px-5 py-3 border-t border-obsidian-border flex items-center gap-2">
                {#if ugc.user.image}
                  <img
                    src={ugc.user.image}
                    alt={ugc.user.name}
                    class="w-6 h-6 rounded-full"
                  />
                {:else}
                  <div
                    class="w-6 h-6 rounded-full flex items-center justify-center"
                    style="background: rgba(168, 85, 247, 0.2);"
                  >
                    <User class="w-3 h-3 text-obsidian-text-muted" />
                  </div>
                {/if}
                <span class="text-sm text-obsidian-text-muted">
                  by {ugc.user.name}
                </span>
              </div>

              <!-- Selection Indicator -->
              {#if selectedUgcId === ugc.id}
                <div class="absolute inset-0 rounded-xl pointer-events-none" style="border: 2px solid #a855f7;"></div>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </main>

    <!-- Bottom Action Bar -->
    {#if selectedUgc}
      <div class="fixed bottom-0 left-0 right-0 z-50 border-t border-obsidian-border bg-obsidian-surface/95 backdrop-blur-sm">
        <div class="max-w-[1200px] mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 flex items-center justify-center rounded-lg"
                style="background: rgba(168, 85, 247, 0.15);"
              >
                <GitBranch class="w-6 h-6" style="color: #a855f7;" />
              </div>
              <div>
                <p class="font-semibold text-obsidian-text-primary">
                  {selectedUgc.repoLink.split("/").pop()}
                </p>
                <p class="text-sm text-obsidian-text-muted">
                  {selectedUgc.levels.length} levels • {getTotalTasks(selectedUgc)} tasks
                </p>
              </div>
            </div>
            <button
              on:click={handleSelectStack}
              disabled={isCreating}
              class="btn-cyber btn-cyber-solid flex items-center gap-2 !px-6 !py-3"
            >
              {#if isCreating}
                <Loader2 class="w-4 h-4 animate-spin" />
                Creating...
              {:else}
                <Play class="w-4 h-4" />
                Select Stack
              {/if}
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .page-root {
    min-height: 100vh;
    background: #0a0e1a;
    color: #d0d7dd;
    position: relative;
  }

  .bg-grid {
    position: fixed;
    inset: 0;
    z-index: 0;
    background-image:
      repeating-linear-gradient(0deg, rgba(7, 165, 201, 0.06) 0, rgba(7, 165, 201, 0.06) 1px, transparent 1px, transparent 40px),
      repeating-linear-gradient(90deg, rgba(7, 165, 201, 0.06) 0, rgba(7, 165, 201, 0.06) 1px, transparent 1px, transparent 40px);
    pointer-events: none;
  }

  .bg-orb {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60vh;
    z-index: 0;
    background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(168, 85, 247, 0.08), transparent);
    pointer-events: none;
  }

  .bg-scanlines {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(0, 0, 0, 0.015) 4px
    );
    pointer-events: none;
  }

  .ugc-card {
    position: relative;
    background: #12192a;
    border: 1px solid rgba(7, 165, 201, 0.12);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .ugc-card:hover {
    border-color: rgba(168, 85, 247, 0.4);
    transform: translateY(-2px);
  }

  .ugc-card.selected {
    border-color: #a855f7;
    box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
  }

  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
