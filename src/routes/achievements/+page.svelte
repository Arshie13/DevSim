<script lang="ts">
  import { ArrowLeft, Award } from "lucide-svelte";
  import AchievementsSection from "$components/achivements/AchievementsSection.svelte";
  import AchievementFilter   from "$components/achivements/AchievementFilter.svelte";
  import Header from "$lib/components/Header.svelte";
  import type { UserData } from "$types";
  import type { PageData } from "./$types";

  export let data: PageData;

  let filter: "default" | "category" | "completed" | "in-progress" = "default";

  $: achievements = data.achievements;
  $: totalTiers   = achievements.reduce((sum, a) => sum + a.tiers.length, 0);
  $: unlockedTiers = achievements.reduce(
    (sum, a) => sum + a.tiers.filter((t) => t.unlocked).length,
    0,
  );
  $: completedFamilies = achievements.filter(
    (a) => a.tiers.length > 0 && a.tiers.every((t) => t.unlocked),
  ).length;

  $: headerUserData = {
    ...data.user,
    fullName: data.user.fullName ?? data.user.name,
    coins: data.userCoins,
  } as UserData;

  // For "completed" and "in-progress" we filter the list; for the rest we pass everything.
  $: filtered = (() => {
    if (filter === "completed") {
      return achievements.filter((a) => a.tiers.length > 0 && a.tiers.every((t) => t.unlocked));
    }
    if (filter === "in-progress") {
      return achievements.filter((a) => {
        const done = a.tiers.length > 0 && a.tiers.every((t) => t.unlocked);
        return !done;
      });
    }
    return achievements;
  })();

  // "default" → flat sorted, "category" → grouped by category
  $: sectionMode = (filter === "category" ? "category" : "default") as "default" | "category";

  function backToDashboard() {
    history.back();
  }
</script>

<svelte:head>
  <title>Achievements | DevSim</title>
</svelte:head>

<div class="min-h-screen bg-obsidian-bg text-obsidian-text-primary text-sm scanlines ambient-glow bg-grid-cyber [overflow-x:clip]">
  <Header userData={headerUserData} />

  <main class="page-container py-8">
    <!-- Back button -->
    <button
      on:click={backToDashboard}
      class="inline-flex items-center gap-2 font-heading text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors group mb-6"
    >
      <ArrowLeft size={14} class="transition-transform group-hover:-translate-x-1" />
      <span>Back</span>
    </button>

    <div class="mb-8">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-5">
          <div class="relative">
            <div
              class="p-4 rounded-card border text-[var(--purple)]"
              style="background: rgb(var(--purple-rgb) / 0.08); border-color: rgb(var(--purple-rgb) / 0.3)"
            >
              <Award size={28} />
            </div>
            <div class="absolute inset-0 rounded-card bg-[rgb(var(--purple-rgb)/0.2)] blur-xl animate-pulse"></div>
          </div>
          <div>
            <h1 class="text-4xl font-heading font-bold text-[var(--text-primary)] tracking-tight mb-1">Achievements</h1>
            <p class="text-sm font-body text-[var(--text-muted)]">{unlockedTiers} / {totalTiers} tiers unlocked</p>
          </div>
        </div>

        <div class="hidden lg:flex items-center gap-6">
          <div class="text-right">
            <p class="text-2xl font-heading font-bold text-[var(--purple)] tabular-nums">{unlockedTiers}</p>
            <p class="text-xs font-label uppercase tracking-wider text-[var(--text-muted)]">Tiers unlocked</p>
          </div>
          <div class="w-px h-10 bg-[var(--border)]"></div>
          <div class="text-right">
            <p class="text-2xl font-heading font-bold text-[var(--success)] tabular-nums">{completedFamilies}</p>
            <p class="text-xs font-label uppercase tracking-wider text-[var(--text-muted)]">Families completed</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="mb-8">
      <AchievementFilter bind:filter />
    </div>

    <AchievementsSection achievements={filtered} mode={sectionMode} />
  </main>

  <!-- Ambient background -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <div class="absolute top-1/4 -left-32 w-96 h-96 bg-obsidian-accent/10 rounded-full blur-[120px]"></div>
    <div class="absolute bottom-1/3 -right-32 w-80 h-80 bg-[rgb(var(--purple-rgb)/0.08)] rounded-full blur-[100px]"></div>
  </div>
</div>
