<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { ArrowLeft } from "lucide-svelte";
  import Header from "$components/Header.svelte";
  import ProjectsFilter from "$components/projects/ProjectsFilter.svelte";
  import CurrentStacksList from "$components/projects/CurrentStacksList.svelte";
  import FinishedStacksList from "$components/projects/FinishedStacksList.svelte";
  import EmptyState from "$components/projects/EmptyState.svelte";
  import type { IContainer, UserData } from "$types";

  interface ProjectsData {
    user: UserData;
    currentContainers: IContainer[];
    finishedContainers: IContainer[];
    userCoins: number;
  }

  export let data: ProjectsData;

  $: viewParam = ($page.url.searchParams.get("view") ?? "current") as "current" | "finished";
  $: view = viewParam === "finished" ? "finished" : "current";

  $: headerUserData = {
    id: data.user.id,
    name: data.user.name ?? "No Name",
    email: data.user.email,
    image: data.user.image,
    avatar: data.user.avatar ?? data.user.image ?? "",
    coins: data.userCoins,
    xp: data.user.xp,
    level: data.user.level,
    ownedAvatars: data.user.ownedAvatars,
    hasCompletedTutorial: data.user.hasCompletedTutorial,
  };

  function setView(next: "current" | "finished") {
    if (next === view) return;
    const sp = new URLSearchParams($page.url.searchParams);
    sp.set("view", next);
    goto(`?${sp.toString()}`, { replaceState: true, keepFocus: true, noScroll: true });
  }

  function backToDashboard() {
    goto("/dashboard");
  }
</script>

<svelte:head>
  <title>Projects | DevSim</title>
</svelte:head>

<div class="min-h-screen bg-obsidian-bg scanlines ambient-glow bg-grid-cyber">
  <Header userData={headerUserData} />

  <main class="relative z-10 py-6">
    <div class="max-w-[1200px] mx-auto px-6">
      <!-- Back button -->
      <button
        on:click={backToDashboard}
        class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-4"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <!-- Header strip -->
      <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-orbitron font-bold text-obsidian-text-muted tracking-tight">
            Projects
          </h1>
          <p class="text-xs font-mono uppercase tracking-widest text-obsidian-text-primary/50 mt-1">
            {data.currentContainers.length} active · {data.finishedContainers.length} finished
          </p>
        </div>

        <ProjectsFilter
          {view}
          currentCount={data.currentContainers.length}
          finishedCount={data.finishedContainers.length}
          on:change={(e) => setView(e.detail)}
        />
      </div>

      <!-- Views -->
      <section class="pb-12">
        {#if view === "current"}
          {#if data.currentContainers.length > 0}
            <CurrentStacksList containers={data.currentContainers} />
          {:else}
            <EmptyState
              icon="🚀"
              title="No active sprints"
              message="Spin up a stack to start coding. All your in-progress containers will appear here."
              ctaLabel="Browse Stacks"
              ctaHref="/stacks"
            />
          {/if}
        {:else}
          {#if data.finishedContainers.length > 0}
            <FinishedStacksList
              containers={data.finishedContainers}
              userCoins={data.userCoins}
            />
          {:else}
            <EmptyState
              icon="📦"
              title="Archive is empty"
              message="Completed and archived stacks will appear here. You can restore them anytime for 100 coins."
            />
          {/if}
        {/if}
      </section>
    </div>
  </main>

  <!-- Ambient orbs -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <div class="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[120px]" style="background: rgba(7,165,201,0.12);"></div>
    <div class="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[120px]" style="background: rgba(168,85,247,0.08);"></div>
  </div>
</div>
