<script lang="ts">
  import { goto } from "$app/navigation";
  import { ArrowRight, Crown, Lock, Check, Loader2, Info, Zap } from "lucide-svelte";
  import type { PageData } from "./$types";
  import { onMount } from "svelte";

  export let data: PageData;

  let enrollment = data.enrollment;
  let claimedDays: number[] = enrollment?.claimedDays ?? [];
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
    const j = r.rewards as Record<string, unknown>;
    return {
      day: r.day_number,
      rewards: {
        type: (j.displayType as string) ?? "",
        value: (j.displayValue as string) ?? "",
      },
    };
  });

  $: currentLevel = enrollment?.currentDay || 1;
  $: nextAvailableAt = enrollment?.lastClaimedAt
    ? new Date(new Date(enrollment.lastClaimedAt).getTime() + ONE_DAY_MS).toISOString()
    : null;
  $: timeUntilNext = nextAvailableAt ? getTimeUntilNext(nextAvailableAt) : "";
  $: isWaitingForNext = nextAvailableAt && currentTime && new Date(nextAvailableAt) > currentTime;

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

    if (!enrollment.lastClaimedAt) return true;

    const lastClaimDate = new Date(enrollment.lastClaimedAt).toDateString();
    const today = new Date().toDateString();

    return lastClaimDate !== today;
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

          if (enrollment && claimData.streak !== undefined) {
            enrollment = {
              ...enrollment,
              currentDay: claimData.currentDay ?? enrollment.currentDay,
              streak: claimData.streak,
              totalClaimedDays: claimData.totalClaimedDays,
              status: claimData.status ?? enrollment.status,
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

  function handleGoBack() {
    goto("/dashboard");
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
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  });
</script>

<svelte:head>
  <title>Learner Pass | DevSim</title>
</svelte:head>

<div class="min-h-screen bg-obsidian-bg scanlines ambient-glow bg-grid-cyber">
  <!-- Header Section -->
  <div class="relative z-10 border-b border-cyan-500/10 backdrop-blur-sm">
    <div class="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          on:click={handleGoBack}
          class="p-2 hover:bg-cyber-cyan/10 rounded-lg transition-colors text-obsidian-text-muted hover:text-cyber-cyan"
        >
          <ArrowRight class="w-5 h-5 rotate-180" />
        </button>
        <div>
          <h1 class="text-2xl font-orbitron font-bold text-obsidian-text-primary">LEARNER PASS</h1>
          <p class="text-xs font-rajdhani text-obsidian-text-muted">Unlock exclusive rewards daily</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <main class="relative z-10 py-8">
    <div class="max-w-[1400px] mx-auto px-6">
      <!-- Status Section -->
      <div class="mb-8 p-6 rounded-card border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 backdrop-blur">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-orbitron font-semibold text-obsidian-text-primary mb-2">Your Progress</h2>
            <div class="flex gap-6">
              <div class="h-12 w-px bg-cyan-500/20"></div>
              <div class="flex flex-col">
                <span class="text-2xl font-orbitron font-bold text-rose-500">🔥 {enrollment?.streak ?? 0}</span>
                <span class="text-xs font-rajdhani text-obsidian-text-muted">Day Streak</span>
              </div>
              <div class="h-12 w-px bg-cyan-500/20"></div>
              <div class="flex flex-col">
                <span class="text-2xl font-orbitron font-bold text-green-400">✓ {enrollment?.totalClaimedDays ?? 0}</span>
                <span class="text-xs font-rajdhani text-obsidian-text-muted">Claimed</span>
              </div>
            </div>
          </div>
        </div>
        {#if !enrollment}
          <div class="flex items-start gap-2 mt-4 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
            <Info class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p class="text-xs font-rajdhani text-amber-200/90">
              Purchase the Learner Pass to unlock premium daily rewards and build your streak.
            </p>
          </div>
          <div class="flex items-center justify-between mt-4">
            <p class="text-sm font-rajdhani text-obsidian-text-muted">Enroll in the Learner Pass to claim rewards every day.</p>
            <button
              on:click={handleUpgradeMembership}
              class="btn-cyber btn-cyber-solid inline-flex items-center gap-2 !px-6 !py-2 whitespace-nowrap ml-4"
            >
              <Crown class="w-4 h-4" />
              <span class="font-orbitron text-sm">Get Pass</span>
            </button>
          </div>
        {/if}
      </div>

      <!-- Rewards Grid -->
      <div class="mb-8">
        <h2 class="text-lg font-orbitron font-semibold text-obsidian-text-primary mb-6">Daily Rewards</h2>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {#each rewards as reward (reward.day)}
            <div class="group">
              <div class="text-center mb-2 px-2">
                <span class="text-xs font-orbitron font-bold text-obsidian-text-muted">DAY {reward.day}</span>
              </div>

              <div class="relative bg-gradient-to-br from-amber-500/15 to-orange-500/10 rounded-card border border-amber-500/30 hover:border-amber-500/50 p-3 text-center transition-all duration-200 group-hover:shadow-lg group-hover:shadow-amber-500/10 min-h-[100px] flex flex-col items-center justify-center">
                <img src={getRewardIcon(reward.rewards)} alt={reward.rewards.value} class="w-10 h-10 mb-2 object-contain drop-shadow" loading="lazy" />
                <div class="text-xs font-orbitron font-semibold text-obsidian-text-primary mb-2">
                  {reward.rewards.value}
                </div>

                {#if claimedDays.includes(reward.day)}
                  <div class="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40">
                    <Check class="w-3 h-3 text-green-400" />
                  </div>
                  <span class="text-[0.6rem] px-2 py-1 rounded bg-green-500/20 text-green-400 font-semibold">Claimed</span>
                {:else if enrollment && reward.day === currentLevel}
                  {#if isWaitingForNext}
                    <span class="text-[0.6rem] px-2 py-1 rounded bg-obsidian-bg/50 text-obsidian-text-muted font-semibold">
                      {timeUntilNext}
                    </span>
                  {:else if isClaimable(reward)}
                    <button
                      on:click={() => handleClaim(reward.day)}
                      disabled={isClaiming}
                      class="text-[0.65rem] px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {#if isClaiming}
                        <Loader2 class="w-3 h-3 animate-spin" />
                      {/if}
                      Claim
                    </button>
                  {:else if enrollment.status !== 'ACTIVE'}
                    <div class="text-lg opacity-50">
                      <Lock class="w-3 h-3" />
                    </div>
                  {:else}
                    <button
                      on:click={() => handleClaim(reward.day)}
                      disabled={isClaiming}
                      class="text-[0.65rem] px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Claim
                    </button>
                  {/if}
                {:else if enrollment && reward.day > enrollment.currentDay}
                  <div class="text-lg opacity-50">
                    <Lock class="w-3 h-3" />
                  </div>
                {:else if !enrollment}
                  <button
                    on:click={handleUpgradeMembership}
                    class="text-[0.6rem] px-2 py-1 rounded bg-amber-600/50 hover:bg-amber-600 text-white font-semibold transition-colors"
                  >
                    Upgrade
                  </button>
                {:else if isClaimable(reward)}
                  <button
                    on:click={() => handleClaim(reward.day)}
                    disabled={isClaiming}
                    class="text-[0.65rem] px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {#if isClaiming}
                      <Loader2 class="w-3 h-3 animate-spin" />
                    {/if}
                    Claim
                  </button>
                {:else}
                  <span class="text-[0.6rem] px-2 py-1 rounded bg-amber-600/50 text-white font-semibold">Missed</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Pending Unlock Choices -->
      {#if pendingUnlocks.length > 0}
        <div class="mb-8 p-4 rounded-card border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/5">
          <h3 class="text-sm font-orbitron font-bold text-cyan-400 mb-3">Unlock a Scenario</h3>
          <p class="text-xs font-rajdhani text-obsidian-text-muted mb-3">
            You have unclaimed scenario unlocks from your learner pass rewards.
          </p>
          <div class="flex flex-wrap gap-2">
            {#each pendingUnlocks as pending}
              {#each pending.available as scenarioId}
                <button
                  on:click={() => {
                    pickerDay = pending.day;
                    pickerAvailable = pending.available;
                    showUnlockPicker = true;
                  }}
                  class="text-xs px-3 py-1.5 rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition-colors"
                >
                  {SCENARIO_NAMES[scenarioId] ?? scenarioId}
                </button>
              {/each}
            {/each}
          </div>
        </div>
      {/if}

      <!-- Completion Banner -->
      {#if enrollment && enrollment.status === "COMPLETED"}
        <div class="p-6 rounded-card border border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5 text-center">
          <h3 class="text-2xl font-orbitron font-bold text-green-400 mb-2">Pass Completed!</h3>
          <p class="text-sm font-rajdhani text-obsidian-text-muted">You've claimed all 30 days and unlocked all rewards.</p>
        </div>
      {/if}
    </div>
  </main>

  <!-- Unlock Picker Modal -->
  {#if showUnlockPicker}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" on:click={() => showUnlockPicker = false}>
      <div class="w-full max-w-md mx-4 p-6 rounded-card border border-cyan-500/30 bg-gradient-to-br from-[#0f1525] to-[#1a1f35]" on:click|stopPropagation>
        <h3 class="text-md font-orbitron font-bold text-cyan-400 mb-2">Choose Your Unlock</h3>
        <p class="text-xs font-rajdhani text-obsidian-text-muted mb-4">
          Pick a scenario to unlock. This choice is permanent for this reward day.
        </p>
        <div class="space-y-2">
          {#each pickerAvailable as scenarioId}
            <button
              on:click={() => handleChooseUnlock(scenarioId)}
              disabled={isChoosing}
              class="w-full flex items-center gap-3 px-4 py-3 rounded border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-colors disabled:opacity-50 text-left"
            >
              <Zap class="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <div>
                <p class="text-sm font-orbitron text-obsidian-text-primary">{SCENARIO_NAMES[scenarioId] ?? scenarioId}</p>
                <p class="text-xs font-rajdhani text-obsidian-text-muted">{scenarioId}</p>
              </div>
            </button>
          {/each}
        </div>
        <button
          on:click={() => showUnlockPicker = false}
          class="mt-4 w-full text-xs font-rajdhani text-obsidian-text-muted hover:text-obsidian-text-primary transition-colors py-2"
        >
          Skip for now
        </button>
      </div>
    </div>
  {/if}

  <!-- Ambient Background Effects -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <div class="absolute top-1/3 -right-40 w-96 h-96 rounded-full blur-[120px]" style="background: rgba(7,165,201,0.1);"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-[120px]" style="background: rgba(168,85,247,0.08);"></div>
  </div>
</div>
