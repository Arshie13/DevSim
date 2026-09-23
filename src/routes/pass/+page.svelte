<script lang="ts">
  import { goto } from "$app/navigation";
  import { ArrowLeft, Lock, Check, Loader2, Zap, Flame, Clock, Coins, Bot, Key, Crown } from "lucide-svelte";
  import type { PageData } from "./$types";
  import type { UserData } from "$types";
  import { onMount } from "svelte";
  import Header from "$components/Header.svelte";
  import DailyRewardsModal from "$lib/components/dailyRewards/DailyRewardsModal.svelte";
  import HelpPanel from "$lib/components/help/HelpPanel.svelte";
  import { helpTrigger } from "$lib/stores/helpTrigger";

  export let data: PageData;

  // ── Shared header user (same construction as /dashboard) ──
  let headerUserData: Partial<UserData> = data.user
    ? {
        id: data.user.id,
        name: data.user.name ?? "No Name",
        email: data.user.email ?? undefined,
        image: data.user.image ?? undefined,
        avatar: data.user.avatar ?? data.user.image ?? "",
        coins: data.user.coins,
        xp: data.user.xp,
        level: data.user.level,
        ownedAvatars: data.user.ownedAvatars,
        hasCompletedTutorial: data.user.hasCompletedTutorial,
      }
    : {};

  // ── Daily Rewards modal (Header gift button) ──
  let isDailyRewardsModalOpen = false;

  // ── Help panel state ──
  let helpMounted = false;
  let helpMinimized = false;
  let helpPrefillCategory = "";
  let helpPrefillDescription = "";

  let enrollment = data.enrollment;
  let claimedDays: number[] = enrollment?.claimedDayNumbers ?? [];
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  let isClaiming = false;
  let currentAvatar = data.currentAvatar ?? null;
  let equippingDay: number | null = null;

  let showUnlockPicker = false;
  let pickerDay = 0;
  let pickerAvailable: string[] = [];
  let isChoosing = false;
  let pendingUnlocks = data.pendingUnlocks ?? [];

  const SCENARIO_NAMES: Record<string, string> = {
    "pern-pos-scenario-3": "IPPO POS (PERN)",
    "mern-tw-scenario-3": "TripWeaver (MERN)",
    "nestjs-pos-scenario-3": "IPPO POS (NestJS)",
    "nextjs-postgres-prisma-3": "Employee Time Tracking",
    "nextjs-shadcn-ui-scenario-3": "Student Portal",
  };

  type RewardEntry = { type: string; value: string };
  type DayReward = { day: number; rewards: RewardEntry };

  let rewards: DayReward[] = (data.rewards ?? []).map((r) => {
    return {
      day: r.reward_index,
      rewards: {
        type: r.display_type ?? "",
        value: r.display_value ?? "",
      },
    };
  });

  $: currentLevel = enrollment?.currentDay || 1;
  $: nextAvailableAt = enrollment?.lastClaimedAt
    ? new Date(new Date(enrollment.lastClaimedAt).getTime() + ONE_DAY_MS).toISOString()
    : null;
  // currentTime is referenced so the countdown recomputes on every tick.
  $: timeUntilNext = nextAvailableAt && currentTime ? getTimeUntilNext(nextAvailableAt) : "";
  $: isWaitingForNext = nextAvailableAt && currentTime && new Date(nextAvailableAt) > currentTime;
  $: progressPct = Math.min(100, (currentLevel / 30) * 100);
  $: nextClaimReady =
    !!currentTime &&
    !!enrollment &&
    enrollment.status === "ACTIVE" &&
    isClaimable({ day: currentLevel, rewards: { type: "", value: "" } });

  function getTimeUntilNext(isoDate: string): string {
    const target = new Date(isoDate);
    const diff = target.getTime() - currentTime.getTime();

    if (diff <= 0) return "";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  }

  const AVATAR_ICONS: Record<string, string> = {
    "blue neon avatar": "avatar-blue-neon.svg",
    "cyber avatar": "avatar-cyber.svg",
    "shadow avatar": "avatar-shadow.svg",
    "legend avatar": "avatar-legend.svg",
    "galaxy avatar": "avatar-galaxy.svg",
    "nova avatar": "avatar-nova.svg",
    "royal avatar": "avatar-royal.svg",
    "neon warrior avatar": "avatar-neon-warrior.svg",
    "mythic avatar": "avatar-mythic.svg",
  };

  const BADGE_ICONS: Record<string, string> = {
    "starter badge": "badge-starter.svg",
    "common badge": "badge-bronze.svg",
    "elite badge": "badge-elite.svg",
    "silver badge": "badge-silver.svg",
    "diamond badge": "diamond.svg",
    "helper badge": "badge-helper.svg",
    "bronze crown": "crown.svg",
    "gold badge": "badge-gold.svg",
    "premium crest": "badge-premium-crest.svg",
    "expert badge": "badge-expert.svg",
    "master badge": "badge-master.svg",
    "season finale badge": "badge-finale.svg",
  };

  function getRewardIcon(entry: RewardEntry): string {
    const base = "/images/pass";
    const key = entry.value.toLowerCase().trim();
    switch (entry.type) {
      case "coins":
        return `${base}/coins.svg`;
      case "help":
        return `${base}/ai-help.svg`;
      case "avatar":
        return `${base}/${AVATAR_ICONS[key] ?? "avatar.svg"}`;
      case "badge":
        return `${base}/${BADGE_ICONS[key] ?? "badge-bronze.svg"}`;
      default:
        return `${base}/crown.svg`;
    }
  }

  function isClaimable(reward: DayReward) {
    if (claimedDays.includes(reward.day)) return false;

    if (reward.day > currentLevel) return false;

    if (!enrollment) return false;

    if (enrollment.status !== "ACTIVE") return false;

    // Past missed days are always claimable (no cooldown).
    if (reward.day < currentLevel) return true;

    // Current day: enforce one-claim-per-real-day cooldown (24h ms comparison,
    // avoids timezone issues with toDateString()).
    if (!enrollment.lastClaimedAt) return true;

    return Date.now() - new Date(enrollment.lastClaimedAt).getTime() >= 24 * 60 * 60 * 1000;
  }

  function handleClaim(dayNumber: number = enrollment?.currentDay || 1) {
    if (isClaiming) return;
    isClaiming = true;

    fetch("/api/user/learner-pass/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayNumber }),
    })
      .then((res) => res.json())
      .then((claimData) => {
        if (claimData.success) {
          claimedDays = [...claimedDays, dayNumber];

          if (enrollment) {
            const newTotalClaimed = claimData.totalClaimedDays ?? enrollment.totalClaimedDays;
            enrollment = {
              ...enrollment,
              currentDay: claimData.currentDay ?? enrollment.currentDay,
              streak: claimData.streak ?? enrollment.streak,
              totalClaimedDays: newTotalClaimed,
              status: newTotalClaimed >= 30 ? "COMPLETED" : enrollment.status,
              lastClaimedAt: new Date().toISOString(),
            };
            startTimer();
          }

          if (claimData.pendingUnlocks && claimData.pendingUnlocks.length > 0) {
            showUnlockPicker = true;
            pickerDay = claimData.pendingUnlocks[0].day;
            pickerAvailable = claimData.pendingUnlocks[0].available;
            pendingUnlocks = [...pendingUnlocks, ...claimData.pendingUnlocks];
          }
        }
      })
      .catch(console.error)
      .finally(() => {
        isClaiming = false;
      });
  }

  function handleChooseUnlock(scenarioId: string) {
    if (isChoosing) return;
    isChoosing = true;

    fetch("/api/user/learner-pass/choose-unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayNumber: pickerDay, scenarioId }),
    })
      .then((res) => res.json())
      .then((resp) => {
        if (resp.success) {
          showUnlockPicker = false;
          // TODO: add type for response
          pendingUnlocks = pendingUnlocks.filter((p: any) => p.day !== pickerDay);
        }
      })
      .catch(console.error)
      .finally(() => {
        isChoosing = false;
      });
  }

  function handleEquipAvatar(level: number, entry: RewardEntry) {
    if (equippingDay !== null) return;
    const path = getRewardIcon(entry);
    equippingDay = level;

    fetch("/api/user/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarPath: path }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          currentAvatar = res.image;
        }
      })
      .catch(console.error)
      .finally(() => {
        equippingDay = null;
      });
  }

  function handleUpgradeMembership() {
    goto("/pass/payment");
  }

  // Browser history first, dashboard as fallback (achievements convention).
  function handleGoBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      goto("/dashboard");
    }
  }

  function openDailyRewardsModal() {
    isDailyRewardsModalOpen = true;
  }

  function closeDailyRewardsModal() {
    isDailyRewardsModalOpen = false;
  }

  function handleRewardClaim(e: CustomEvent<{ day: number; coins: number; xp: number; aiHelps: number; newCoins?: number; newXp?: number; newAiHelpCredits?: number }>) {
    // Update header values if API returned new totals
    if (e.detail.newCoins !== undefined) {
      headerUserData = { ...headerUserData, coins: e.detail.newCoins };
    }
    if (e.detail.newXp !== undefined) {
      headerUserData = { ...headerUserData, xp: e.detail.newXp };
    }
  }

  function handleOpenHelp(category?: string, description?: string) {
    helpPrefillCategory = category || "";
    helpPrefillDescription = description || "";
    if (!helpMounted) {
      helpMounted = true;
    }
    helpMinimized = false;
  }

  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let currentTime = new Date();

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      currentTime = new Date();
    }, 1000);
  }

  onMount(() => {
    startTimer();
    const unsubscribe = helpTrigger.subscribe((payload) => {
      if (payload) {
        helpPrefillCategory = payload.category;
        helpPrefillDescription = payload.description;
        helpMinimized = false;
        helpMounted = true;
        helpTrigger.clear();
      }
    });
    return () => {
      if (timerInterval) clearInterval(timerInterval);
      unsubscribe();
    };
  });
</script>

<svelte:head>
  <title>Learner Pass | DevSim</title>
</svelte:head>

<div class="min-h-screen bg-obsidian-bg scanlines ambient-glow bg-grid-cyber">
  <!-- Shared Header navbar -->
  <Header
    userData={headerUserData}
    onOpenDailyRewards={openDailyRewardsModal}
    onOpenHelp={handleOpenHelp}
  />

  <!-- Back button: own row above the title -->
  <div class="w-full page-container pt-4">
    <button
      on:click={handleGoBack}
      class="inline-flex items-center gap-2 font-heading text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors group"
    >
      <ArrowLeft size={14} class="transition-transform group-hover:-translate-x-1" />
      <span>Back</span>
    </button>
  </div>

  <!-- Main Content -->
  <main class="relative z-10 pt-5 pb-8">
    <div class="page-container">
      <header class="mb-5">
        <h1 class="font-heading text-3xl font-bold text-obsidian-text-primary">LEARNER PASS</h1>
        <p class="font-label text-xs text-obsidian-text-muted uppercase tracking-wider mt-1">
          Unlock exclusive rewards daily
        </p>
      </header>

      <!-- Your Progress (active pass) / Learner Pass promo (no pass) -->
      {#if enrollment}
        <div class="card-cyber mb-8" style="border-color: rgb(var(--warn-rgb) / 0.25)">
          <div class="card-cyber-body">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 class="font-heading text-xl font-semibold text-obsidian-text-primary">Your Progress</h2>
              <span class="tag-cyber tag-warn tabular-nums">Day {currentLevel} / 30</span>
            </div>

            {#if enrollment}
              <div class="xp-track">
                <div
                  class="xp-fill"
                  style="width: {progressPct}%; background: var(--warn); box-shadow: 0 0 8px rgb(var(--warn-rgb) / 0.10);"
                ></div>
              </div>
            {/if}

            <div class="flex flex-wrap items-center gap-x-8 gap-y-3 mt-6">
              <div class="flex items-center gap-2">
                <Flame class="w-4 h-4 text-cyber-warn flex-shrink-0" />
                <span class="font-heading text-2xl font-bold text-cyber-warn tabular-nums">{enrollment?.streak ?? 0}</span>
                <span class="font-label text-xs uppercase tracking-wider text-obsidian-text-muted">Day Streak</span>
              </div>
              <div class="flex items-center gap-2">
                <Check class="w-4 h-4 text-cyber-success flex-shrink-0" />
                <span class="font-heading text-2xl font-bold text-cyber-success tabular-nums">{enrollment?.totalClaimedDays ?? 0}</span>
                <span class="font-label text-xs uppercase tracking-wider text-obsidian-text-muted">Claimed</span>
              </div>
              <div class="flex items-center gap-2">
                <Clock class="w-4 h-4 text-obsidian-text-muted flex-shrink-0" />
                {#if nextClaimReady}
                  <span class="font-label text-xs uppercase tracking-wider text-cyber-success">Ready to claim!</span>
                {:else if timeUntilNext}
                  <span class="font-label text-xs uppercase tracking-wider text-obsidian-text-muted">
                    Next claim in <span class="tabular-nums">{timeUntilNext}</span>
                  </span>
                {:else}
                  <span class="font-label text-xs uppercase tracking-wider text-obsidian-text-muted">No active pass</span>
                {/if}
              </div>
            </div>

            <p class="text-sm text-obsidian-text-muted mt-4">
              Keep the streak alive — claim every day to unlock premium scenario rewards.
            </p>
          </div>
        </div>
      {:else}
        <div class="card-cyber mb-8 rounded-card" style="border-color: rgb(var(--warn-rgb) / 0.25)">
          <div class="card-cyber-body">
            <div class="flex items-center justify-between gap-3 mb-6">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-card border border-cyber-warn/30 bg-cyber-warn/10 text-cyber-warn">
                  <Crown class="h-5 w-5" />
                </div>
                <div>
                  <h2 class="font-heading text-xl font-semibold text-obsidian-text-primary">Unlock the Learner Pass</h2>
                  <p class="text-sm text-obsidian-text-muted">One pass, 30 days of daily rewards — coins, XP, AI helps and exclusive unlocks.</p>
                </div>
              </div>
              <span class="tag-cyber tag-warn">₱299 · 30 days</span>
            </div>

            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5 mb-6">
              <div class="rounded-card border border-obsidian-accent/15 bg-obsidian-bg/60 p-3">
                <Coins class="h-5 w-5 text-cyber-warn" />
                <h3 class="font-label text-xs uppercase tracking-wide text-obsidian-text-primary mt-2">Daily Coins</h3>
                <p class="text-xs text-obsidian-text-muted mt-1">Claim coin rewards every single day.</p>
              </div>
              <div class="rounded-card border border-obsidian-accent/15 bg-obsidian-bg/60 p-3">
                <Zap class="h-5 w-5 text-cyber-cyan" />
                <h3 class="font-label text-xs uppercase tracking-wide text-obsidian-text-primary mt-2">XP Boosts</h3>
                <p class="text-xs text-obsidian-text-muted mt-1">Level up faster with daily XP.</p>
              </div>
              <div class="rounded-card border border-obsidian-accent/15 bg-obsidian-bg/60 p-3">
                <Bot class="h-5 w-5 text-cyber-purple" />
                <h3 class="font-label text-xs uppercase tracking-wide text-obsidian-text-primary mt-2">AI Helps</h3>
                <p class="text-xs text-obsidian-text-muted mt-1">Earn AI helps to use in scenarios.</p>
              </div>
              <div class="rounded-card border border-obsidian-accent/15 bg-obsidian-bg/60 p-3">
                <Key class="h-5 w-5 text-cyber-success" />
                <h3 class="font-label text-xs uppercase tracking-wide text-obsidian-text-primary mt-2">Exclusive Unlocks</h3>
                <p class="text-xs text-obsidian-text-muted mt-1">Avatars and premium scenarios on milestone days.</p>
              </div>
            </div>

            <div class="mb-6">
              <h3 class="font-heading text-lg font-semibold text-obsidian-text-primary mb-3">How it works</h3>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div class="flex items-start gap-3">
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyber-warn/40 bg-cyber-warn/10 font-label text-xs font-semibold text-cyber-warn tabular-nums">1</span>
                  <div>
                    <p class="font-heading text-sm font-semibold text-obsidian-text-primary">Get the Pass</p>
                    <p class="text-xs text-obsidian-text-muted">One-time purchase activates all 30 days instantly.</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyber-warn/40 bg-cyber-warn/10 font-label text-xs font-semibold text-cyber-warn tabular-nums">2</span>
                  <div>
                    <p class="font-heading text-sm font-semibold text-obsidian-text-primary">Claim every day</p>
                    <p class="text-xs text-obsidian-text-muted">Come back daily and claim that day's reward.</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyber-warn/40 bg-cyber-warn/10 font-label text-xs font-semibold text-cyber-warn tabular-nums">3</span>
                  <div>
                    <p class="font-heading text-sm font-semibold text-obsidian-text-primary">Build your streak</p>
                    <p class="text-xs text-obsidian-text-muted">Missed days are lost — daily claims keep it alive.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-4">
              <p class="text-sm text-obsidian-text-muted"></p>
              <button
                on:click={handleUpgradeMembership}
                class="btn-cyber btn-cyber-solid inline-flex items-center gap-2 !px-6 !py-2 whitespace-nowrap"
              >
                <Crown class="w-4 h-4" />
                <span>Get Pass</span>
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- Rewards Grid -->
      <section class="mb-8">
        <h2 class="font-heading text-xl font-semibold text-obsidian-text-primary mb-6">Daily Rewards</h2>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {#each rewards as reward (reward.day)}
            <div class="group flex flex-col">
              <div class="text-center mb-2 px-2">
                <span class="font-label text-xs font-bold uppercase tracking-wider text-obsidian-text-muted tabular-nums">
                  DAY {reward.day}
                </span>
              </div>

              <div
                class="relative flex-1 w-full rounded-card border p-3 text-center transition-all duration-200 group-hover:shadow-lg min-h-[100px] flex flex-col items-center justify-center {claimedDays.includes(reward.day)
                  ? 'bg-gradient-to-br from-cyber-success/10 to-cyber-success/5 border-cyber-success/35 hover:border-cyber-success/55 group-hover:shadow-cyber-success/10'
                  : 'bg-gradient-to-br from-cyber-warn/15 to-cyber-warn/5 border-cyber-warn/30 hover:border-cyber-warn/50 group-hover:shadow-cyber-warn/10'}"
              >
                <img src={getRewardIcon(reward.rewards)} alt={reward.rewards.value} class="w-10 h-10 mb-2 object-contain drop-shadow{claimedDays.includes(reward.day) ? ' opacity-60' : ''}" loading="lazy" />
                <div class="flex min-h-[2rem] items-center justify-center font-label text-xs font-semibold uppercase tracking-wide text-obsidian-text-primary mb-2 tabular-nums">
                  {reward.rewards.value}
                </div>

                <div class="mt-auto flex min-h-[2.25rem] w-full items-center justify-center">
                  {#if claimedDays.includes(reward.day)}
                    <div class="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-cyber-success/20 border border-cyber-success/40">
                      <Check class="w-3 h-3 text-cyber-success" />
                    </div>
                    <span class="tag-cyber tag-green">Claimed</span>
                  {:else if enrollment && reward.day === currentLevel}
                    {#if isWaitingForNext}
                      <span class="tag-cyber bg-obsidian-surface/60 text-obsidian-text-muted border border-obsidian-border tabular-nums">
                        {timeUntilNext}
                      </span>
                    {:else if isClaimable(reward)}
                      <button
                        on:click={() => handleClaim(reward.day)}
                        disabled={isClaiming}
                        class="btn-cyber btn-cyber-solid !px-3 !py-1.5 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {#if isClaiming}
                          <Loader2 class="w-3 h-3 animate-spin" />
                        {/if}
                        Claim
                      </button>
                    {:else if enrollment.status !== 'ACTIVE'}
                      <div class="flex items-center justify-center opacity-40">
                        <Lock class="w-4 h-4 text-obsidian-text-muted" />
                      </div>
                    {:else}
                      <button
                        on:click={() => handleClaim(reward.day)}
                        disabled={isClaiming}
                        class="btn-cyber btn-cyber-solid !px-3 !py-1.5 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Claim
                      </button>
                    {/if}
                  {:else if enrollment && reward.day > enrollment.currentDay}
                    <div class="flex items-center justify-center opacity-40">
                      <Lock class="w-4 h-4 text-obsidian-text-muted" />
                    </div>
                  {:else if !enrollment}
                    <button
                      on:click={handleUpgradeMembership}
                      class="btn-cyber btn-cyber-outline !px-3 !py-1.5"
                    >
                      Upgrade
                    </button>
                  {:else if isClaimable(reward)}
                    <button
                      on:click={() => handleClaim(reward.day)}
                      disabled={isClaiming}
                      class="btn-cyber btn-cyber-outline !px-3 !py-1.5 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {#if isClaiming}
                        <Loader2 class="w-3 h-3 animate-spin" />
                      {/if}
                      Claim
                    </button>
                  {:else}
                    <span class="tag-cyber tag-warn">Missed</span>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>

      <!-- Pending Unlock Choices -->
      {#if pendingUnlocks.length > 0}
        <div class="card-cyber mb-8" style="border-color: rgb(var(--accent-rgb) / 0.3)">
          <div class="card-cyber-body">
            <h3 class="font-heading text-lg font-semibold text-obsidian-text-primary mb-1">Unlock a Scenario</h3>
            <p class="text-sm text-obsidian-text-muted mb-3">
              You have unclaimed scenario unlocks from your Learner Pass rewards.
            </p>
            <div class="flex flex-wrap gap-2">
              {#each pendingUnlocks as pending (pending.day)}
                {#each pending.available as scenarioId}
                  <button
                    on:click={() => {
                      pickerDay = pending.day;
                      pickerAvailable = pending.available;
                      showUnlockPicker = true;
                    }}
                    class="font-label text-xs uppercase tracking-wide px-3 py-1.5 rounded bg-cyber-cyan/10 hover:bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/20 hover:border-cyber-cyan/40 transition-colors"
                  >
                    {SCENARIO_NAMES[scenarioId] ?? scenarioId}
                  </button>
                {/each}
              {/each}
            </div>
          </div>
        </div>
      {/if}

      <!-- Completion Banner -->
      {#if enrollment && enrollment.status === "COMPLETED"}
        <div class="card-cyber text-center" style="border-color: rgb(var(--success-rgb) / 0.3)">
          <div class="card-cyber-body">
            <h3 class="font-heading text-2xl font-bold text-cyber-success mb-2">Pass Completed!</h3>
            <p class="text-sm text-obsidian-text-muted">You've claimed all 30 days and unlocked all rewards.</p>
          </div>
        </div>
      {/if}
    </div>
  </main>

  <!-- Daily Rewards Modal (shared header gift button) -->
  <DailyRewardsModal bind:isOpen={isDailyRewardsModalOpen} on:claim={handleRewardClaim} />

  <!-- Help Panel — mounted once opened, visibility via minimized prop -->
  {#if helpMounted}
    <HelpPanel
      prefillCategory={helpPrefillCategory}
      prefillDescription={helpPrefillDescription}
      minimized={helpMinimized}
      onClose={() => {
        helpMounted = false;
        helpMinimized = false;
        helpPrefillCategory = "";
        helpPrefillDescription = "";
      }}
      onMinimize={() => {
        helpMinimized = true;
      }}
    />
  {/if}

  <!-- Unlock Picker Modal -->
  {#if showUnlockPicker}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(var(--bg-rgb)/0.6)] backdrop-blur-sm" on:click={() => showUnlockPicker = false}>
      <div class="w-full max-w-md mx-4 p-6 rounded-card bg-obsidian-bg-light border border-cyber-cyan/30" on:click|stopPropagation>
        <h3 class="font-heading text-lg font-bold text-cyber-cyan mb-2">Choose Your Unlock</h3>
        <p class="text-sm text-obsidian-text-muted mb-4">
          Pick a scenario to unlock. This choice is permanent for this reward day.
        </p>
        <div class="space-y-2">
          {#each pickerAvailable as scenarioId}
            <button
              on:click={() => handleChooseUnlock(scenarioId)}
              disabled={isChoosing}
              class="w-full flex items-center gap-3 px-4 py-3 rounded border border-cyber-cyan/20 bg-cyber-cyan/5 hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40 transition-colors disabled:opacity-50 text-left"
            >
              <Zap class="w-4 h-4 text-cyber-cyan flex-shrink-0" />
              <div>
                <p class="text-sm font-heading text-obsidian-text-primary">{SCENARIO_NAMES[scenarioId] ?? scenarioId}</p>
                <p class="text-xs font-label text-obsidian-text-muted">{scenarioId}</p>
              </div>
            </button>
          {/each}
        </div>
        <button
          on:click={() => showUnlockPicker = false}
          class="mt-4 w-full font-label text-xs uppercase tracking-wide text-obsidian-text-muted hover:text-obsidian-text-primary transition-colors py-2"
        >
          Skip for now
        </button>
      </div>
    </div>
  {/if}

  <!-- Ambient Background Effects -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <div class="absolute top-1/3 -right-40 w-96 h-96 rounded-full blur-[120px]" style="background: rgb(var(--accent-rgb) / 0.1);"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-[120px]" style="background: rgb(var(--purple-rgb) / 0.08);"></div>
  </div>
</div>
