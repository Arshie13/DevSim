<script lang="ts">
  import { ArrowLeft, GitCommitHorizontalIcon, Award, Target, Coins } from "lucide-svelte";
  import type { PageData } from "./$types";
  import type { UserData, ProfileMetricsData, RivalEntry } from "$types";

  // ── Modular profile components ────────────────────────────────────────────
  import ProfileCard         from "$components/profile/ProfileCard.svelte";
  import MetricsSection      from "$components/profile/MetricsSection.svelte";
  import FriendsSection      from "$components/profile/FriendsSection.svelte";
  import EditProfile         from "$components/profile/EditProfile.svelte";
  import AchievementSnapshot from "$components/achivements/AchievementSnapshot.svelte";
  import ProfileActivityFeed from "$components/profile/ProfileActivityFeed.svelte";
  import { goto }            from "$app/navigation";
  import { toast }           from "$lib/stores/toast";

  export let data: PageData;

  // ── User state ────────────────────────────────────────────────────────────
  let user: UserData = {
    id: data.user.id,
    name: data.user?.name ?? 'Name not found',
    email: data.user.email ?? 'no email found',
    image: data.user.image ?? 'static/avatars/defaultcyan.svg',
    avatar: data.user.avatar ?? data.user.image ?? "",
    xp: data.user.xp ?? 0,
    coins: data.user.coins ?? data.userCoins ?? 0,
    level: data.user.level ?? 1,
    ownedAvatars: data.user.ownedAvatars ?? [],
    hasCompletedTutorial: data.user.hasCompletedTutorial ?? false,
    username: data.user.username,
  };

  let editProfileOpen = false;

  async function handleProfileUpdate(event: CustomEvent<UserData>) {
    const updated = event.detail;
    user = updated;
    if (updated.image && updated.image !== data.user?.image) {
      try {
        await fetch('/api/user/avatar', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarPath: updated.image }),
        });
        toast.success('Avatar updated');
      } catch (err) {
        console.error('Failed to persist avatar:', err);
        toast.error('Failed to save avatar');
      }
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const metrics: ProfileMetricsData = data.metrics;
  const rivals: RivalEntry[] = data.rivals ?? [];

  const memberSince     = new Date(metrics.memberSince).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const leaderboardRank = metrics.leaderboardRank;

  const metricCards = [
    { label: "Tasks Completed", value: String(metrics.tasksCompleted),    icon: Target,                  color: "var(--accent)",  bg: "rgb(var(--accent-rgb) / 0.12)"  },
    { label: "File Edits",      value: String(metrics.fileEdits),         icon: GitCommitHorizontalIcon, color: "var(--purple)",  bg: "rgb(var(--purple-rgb) / 0.12)" },
    { label: "Coins Earned",    value: String(metrics.coinsEarned),       icon: Coins,                   color: "var(--warn)",    bg: "rgb(var(--warn-rgb) / 0.12)"  },
    { label: "Achievements",    value: String(metrics.achievementsCount), icon: Award,                   color: "var(--success)", bg: "rgb(var(--success-rgb) / 0.12)"  },
  ];

  function handleBack() {
    if (window.history.length > 1) {
      history.back();
    } else {
      goto('/dashboard');
    }
  }
</script>

<svelte:head>
  <title>Profile | DevSim</title>
</svelte:head>

<div class="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-obsidian-bg bg-grid-cyber scanlines ambient-glow text-obsidian-text-primary text-sm">

  <!-- Back button bar -->
  <div class="shrink-0 w-full page-container pt-8">
    <button
      on:click={handleBack}
      class="inline-flex items-center gap-2 font-heading text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors group"
    >
      <ArrowLeft size={14} class="transition-transform group-hover:-translate-x-1" />
      <span>Back</span>
    </button>
  </div>

  <!-- ── Main asymmetric grid ─────────────────────────────────────────────── -->
  <main
    class="flex-1 min-h-0 w-full page-container py-3 grid grid-cols-1 lg:[grid-template-columns:clamp(18rem,30%,24rem)_1fr] gap-3 lg:gap-4"
  >
    <!-- LEFT COLUMN — Profile + Snapshot -->
    <div class="flex flex-col gap-3 lg:gap-4 min-h-0">
      <!-- S1: Profile data -->
      <div class="flex-[3] min-h-0">
        <ProfileCard
          {user}
          {memberSince}
          {leaderboardRank}
          isOwnProfile={true}
          on:editProfile={() => (editProfileOpen = true)}
        />
      </div>

      <!-- S2: Achievement snapshot -->
      <div class="flex-[2] min-h-0">
        <AchievementSnapshot snapshots={data.topAchievements ?? []} />
      </div>
    </div>

    <!-- RIGHT COLUMN (70%) — KPIs + Rivals + Activity -->
    <div class="flex flex-col gap-3 lg:gap-4 min-h-0">
      <!-- S3: KPIs (metric cards) -->
      <div class="shrink-0">
        <MetricsSection metrics={metricCards} />
      </div>

      <!-- S4: Top rivals -->
      <div class="shrink-0 flex flex-col">
        <FriendsSection {rivals} />
      </div>

      <!-- S5: Recent activity -->
      <div class="flex-1 min-h-0">
        <ProfileActivityFeed activities={data.activity ?? []} />
      </div>
    </div>
  </main>

  <!-- Ambient background -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <div class="absolute top-1/4 -left-32 w-96 h-96 bg-obsidian-accent/10 rounded-full blur-[120px]"></div>
    <div class="absolute bottom-1/3 -right-32 w-80 h-80 bg-purple-500/8 rounded-full blur-[100px]"></div>
  </div>
</div>

<EditProfile
  bind:open={editProfileOpen}
  bind:user
  on:update={handleProfileUpdate}
/>
