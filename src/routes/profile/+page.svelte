<script lang="ts">
  import { ArrowLeft, GitCommitHorizontalIcon, Award, Target, Coins } from "lucide-svelte";
  import type { PageData } from "./$types";
  import type { UserData, ProfileMetricsData, RivalEntry } from "$types";

  // ── Modular profile components ────────────────────────────────────────────────
  import ProfileCard      from "$components/profile/ProfileCard.svelte";
  import ProgressSection  from "$components/profile/ProgressSection.svelte";
  import MetricsSection   from "$components/profile/MetricsSection.svelte";
  import FriendsSection   from "$components/profile/FriendsSection.svelte";
  import EditProfile      from "$components/profile/EditProfile.svelte";
  import { toast }        from "$lib/stores/toast";

  // ── Page data ─────────────────────────────────────────────────────────────────
  export let data: PageData;

  // ── User state ────────────────────────────────────────────────────────────────
  let user: UserData = {
    id: data.user.id,
    name: data.user?.name ?? '',
    email: data.user.email,
    image: data.user.image,
    avatar: data.user.avatar ?? data.user.image ?? "",
    xp: data.user.xp ?? 0,
    coins: data.user.coins ?? data.userCoins ?? 0,
    level: data.user.level ?? 1,
    ownedAvatars: data.user.ownedAvatars ?? [],
    // Tutorial
    hasCompletedTutorial: data.user.hasCompletedTutorial ?? false,
    username: data.user.username,
  };

  // ── Profile edit modal ────────────────────────────────────────────────────────
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
    } else {
      toast.success('Profile updated');
    }
  }

  // ── Derive profile values from server data ────────────────────────────────────
  const metrics: ProfileMetricsData = data.metrics;
  const rivals: RivalEntry[] = data.rivals ?? [];

  const memberSince  = new Date(metrics.memberSince).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const streakDays   = metrics.dayStreak;
  const leaderboardRank = metrics.leaderboardRank;
  const weeklyGrowth = metrics.weeklyGrowth;

  // bio / location / role have no DB home yet — leave as empty strings
  const bio      = "";
  const location = "";
  const role     = "";

  // ── Metric cards ─────────────────────────────────────────────────────────────
  const metricCards = [
    { label: "Tasks Completed", value: String(metrics.tasksCompleted), icon: Target,                   color: "#07a5c9", bg: "rgba(7,165,201,0.12)"  },
    { label: "File Edits",      value: String(metrics.fileEdits),      icon: GitCommitHorizontalIcon,   color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
    { label: "Coins Earned",    value: String(metrics.coinsEarned),    icon: Coins,                     color: "#ffb400", bg: "rgba(255,180,0,0.12)"  },
    { label: "Achievements",    value: String(metrics.achievementsCount), icon: Award,                  color: "#00e5a0", bg: "rgba(0,229,160,0.12)"  },
  ];

  function backToDashboard() {
    history.back();
  }
</script>

<svelte:head>
  <title>Profile | DevSim</title>
</svelte:head>

<div class="h-screen flex flex-col bg-obsidian-bg text-obsidian-text-primary text-sm overflow-hidden">

  <!-- Back button -->
  <div class="w-full max-w-[1200px] mx-auto px-4 pt-3 md:px-6 lg:px-8 lg:pt-4 shrink-0">
    <button
      on:click={backToDashboard}
      class="btn-cyber btn-cyber-secondary inline-flex items-center gap-2 !py-2 !px-4"
    >
      <ArrowLeft class="w-4 h-4" />
      <span>Back</span>
    </button>
  </div>

  <!-- ── Main grid ─────────────────────────────────────────────────────────── -->
  <main class="flex-1 w-full max-w-[1200px] mx-auto px-4 py-3 md:px-6 lg:px-8 grid grid-cols-12 gap-3 lg:gap-4 xl:gap-5 min-h-0 overflow-y-auto">

    <!-- LEFT — Profile card -->
    <div class="col-span-12 lg:col-span-4 min-h-0">
      <ProfileCard
        {user}
        {memberSince}
        {bio}
        {location}
        {role}
        {streakDays}
        {leaderboardRank}
        on:editProfile={() => (editProfileOpen = true)}
      />
    </div>

    <!-- RIGHT — Progress + Metrics + Friends -->
    <div class="col-span-12 lg:col-span-8 flex flex-col gap-3 lg:gap-4 min-h-0">

      <ProgressSection {user} {streakDays} {weeklyGrowth} />

      <MetricsSection metrics={metricCards} />

      <FriendsSection {rivals} />

    </div>

  </main>

  <!-- ── Ambient background ────────────────────────────────────────────────── -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <div class="absolute inset-0 bg-grid-cyber"></div>
    <div class="absolute top-0 left-0 right-0 h-[60vh]" style="background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(7,165,201,0.08), transparent);"></div>
    <div class="absolute inset-0" style="background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.015) 4px); z-index: 200; pointer-events: none;"></div>
    <div class="absolute top-1/4 -left-32 w-96 h-96 bg-obsidian-accent/10 rounded-full blur-[120px]"></div>
    <div class="absolute bottom-1/3 -right-32 w-80 h-80 bg-purple-500/8 rounded-full blur-[100px]"></div>
  </div>

</div>

<!-- EditProfile modal (root of all profile editing) -->
<EditProfile
  bind:open={editProfileOpen}
  bind:user
  on:update={handleProfileUpdate}
/>

<style>
  :global(.btn-cyber-secondary) {
    border: 1px solid rgba(39, 39, 42, 0.80);
    color: rgba(208, 215, 221, 0.60);
    background: #12192a;
  }
  :global(.btn-cyber-secondary:hover) {
    border-color: rgba(7, 165, 201, 0.35);
    color: #d0d7dd;
    background: rgba(7, 165, 201, 0.08);
  }
</style>
