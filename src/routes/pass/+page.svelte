<script lang="ts">
  import { rewards } from "./rewards";
  import { goto } from "$app/navigation";
  import { ArrowRight, Crown, Gift, Lock, Check } from "lucide-svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  $: enrollment = data.enrollment;
  $: claimedDays = data.claimedDays || [];
  $: currentLevel = enrollment?.currentDay || 1;

  function getStatusColor(): string {
    if (!enrollment) return "text-orange-400";
    if (enrollment.status === "COMPLETED") return "text-green-400";
    if (enrollment.status === "EXPIRED") return "text-red-400";
    return "text-cyber-cyan";
  }

  function getStatusBadge(): string {
    if (!enrollment) return "NOT ENROLLED";
    if (enrollment.status === "COMPLETED") return "COMPLETED";
    if (enrollment.status === "EXPIRED") return "EXPIRED";
    return "ACTIVE";
  }

  function handleClaim(dayNumber: number = enrollment?.currentDay || 1) {
    fetch("/api/user/learner-pass/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayNumber }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          window.location.reload();
        }
      })
      .catch(console.error);
  }

  function handleUpgradeMembership() {
    goto("/pass/payment");
  }

  function handleGoBack() {
    goto("/dashboard");
  }
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
      {#if enrollment}
        <div class="mb-8 p-6 rounded-card border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 backdrop-blur">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-orbitron font-semibold text-obsidian-text-primary mb-2">Your Progress</h2>
              <div class="flex gap-6">
                <div class="flex flex-col">
                  <span class="text-3xl font-orbitron font-bold text-cyber-cyan">{enrollment.currentDay}</span>
                  <span class="text-xs font-rajdhani text-obsidian-text-muted">/ 30 Days</span>
                </div>
                <div class="h-12 w-px bg-cyan-500/20"></div>
                <div class="flex flex-col">
                  <span class="text-2xl font-orbitron font-bold text-rose-500">🔥 {enrollment.streak}</span>
                  <span class="text-xs font-rajdhani text-obsidian-text-muted">Day Streak</span>
                </div>
                <div class="h-12 w-px bg-cyan-500/20"></div>
                <div class="flex flex-col">
                  <span class="text-2xl font-orbitron font-bold text-green-400">✓ {enrollment.totalClaimedDays}</span>
                  <span class="text-xs font-rajdhani text-obsidian-text-muted">Claimed</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <span
                class="inline-block px-4 py-2 rounded-full text-sm font-orbitron font-semibold {getStatusColor()} border border-current/30 bg-current/5"
              >
                {getStatusBadge()}
              </span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-6 bg-obsidian-bg/40 rounded-full h-2 overflow-hidden border border-cyan-500/10">
            <div
              class="h-full bg-gradient-to-r from-cyber-cyan to-blue-600 transition-all duration-500"
              style="width: {(enrollment.currentDay / 30) * 100}%"
            ></div>
          </div>
        </div>
      {:else}
        <div class="mb-8 p-6 rounded-card border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 backdrop-blur">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-orbitron font-semibold text-obsidian-text-primary mb-2">Free Rewards Available</h2>
              <p class="text-sm font-rajdhani text-obsidian-text-muted">Claim daily free rewards every day. Unlock premium rewards by enrolling in the Learner Pass.</p>
            </div>
            <button
              on:click={handleUpgradeMembership}
              class="btn-cyber btn-cyber-solid inline-flex items-center gap-2 !px-6 !py-2 whitespace-nowrap"
            >
              <Crown class="w-4 h-4" />
              <span class="font-orbitron text-sm">Get Pass</span>
            </button>
          </div>
        </div>
      {/if}

      <!-- Rewards Grid -->
      <div class="mb-8">
        <h2 class="text-lg font-orbitron font-semibold text-obsidian-text-primary mb-6">Daily Rewards</h2>

        <!-- Track Labels -->
        <div class="flex gap-6 mb-4 px-4">
          <div class="flex items-center gap-2 text-xs font-rajdhani text-obsidian-text-muted">
            <div class="w-4 h-4 rounded border border-cyan-500/30 bg-cyan-500/5"></div>
            Free Rewards
          </div>
          <div class="flex items-center gap-2 text-xs font-rajdhani text-obsidian-text-muted">
            <Crown class="w-4 h-4 text-amber-400" />
            Premium Rewards
          </div>
        </div>

        <!-- Rewards Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {#each rewards as reward (reward.level)}
            <div class="group">
              <!-- Level Header -->
              <div class="text-center mb-2 px-2">
                <span class="text-xs font-orbitron font-bold text-obsidian-text-muted">DAY {reward.level}</span>
              </div>

              <!-- Free Reward Card - Always Claimable -->
              <div
                class="relative bg-gradient-to-br from-blue-600/10 to-cyan-600/5 rounded-card border border-blue-500/20 hover:border-blue-500/40 p-3 text-center transition-all duration-200 group-hover:shadow-lg group-hover:shadow-blue-500/10 min-h-[100px] flex flex-col items-center justify-center"
              >
                <div class="text-2xl mb-2">💎</div>
                <div class="text-xs font-orbitron font-semibold text-obsidian-text-primary mb-2">
                  {reward.free.value}
                </div>

                {#if claimedDays.includes(reward.level)}
                  <div class="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40">
                    <Check class="w-3 h-3 text-green-400" />
                  </div>
                {:else}
                  <button
                    on:click={() => handleClaim(reward.level)}
                    class="text-[0.65rem] px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                  >
                    Claim
                  </button>
                {/if}
              </div>

              <!-- Premium Reward Card - Only with Pass -->
              <div
                class="relative bg-gradient-to-br from-amber-500/15 to-orange-500/10 rounded-card border border-amber-500/30 hover:border-amber-500/50 p-3 text-center transition-all duration-200 group-hover:shadow-lg group-hover:shadow-amber-500/10 min-h-[100px] flex flex-col items-center justify-center mt-2"
              >
                <div class="text-2xl mb-2">👑</div>
                <div class="text-xs font-orbitron font-semibold text-obsidian-text-primary mb-2">
                  {reward.premium.value}
                </div>

                {#if claimedDays.includes(reward.level)}
                  <div class="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40">
                    <Check class="w-3 h-3 text-green-400" />
                  </div>
                {:else if enrollment && reward.level === enrollment.currentDay}
                  <button
                    on:click={() => handleClaim(reward.level)}
                    class="text-[0.65rem] px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors"
                  >
                    Claim
                  </button>
                {:else if enrollment && reward.level > enrollment.currentDay}
                  <div class="text-lg opacity-50">
                    <Lock class="w-3 h-3" />
                  </div>
                {:else}
                  <button
                    on:click={handleUpgradeMembership}
                    class="text-[0.6rem] px-2 py-1 rounded bg-amber-600/50 hover:bg-amber-600 text-white font-semibold transition-colors"
                  >
                    Upgrade
                  </button>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Completion Banner -->
      {#if enrollment && enrollment.status === "COMPLETED"}
        <div class="p-6 rounded-card border border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5 text-center">
          <h3 class="text-2xl font-orbitron font-bold text-green-400 mb-2">🎉 Pass Completed!</h3>
          <p class="text-sm font-rajdhani text-obsidian-text-muted">You've claimed all 30 days and unlocked all rewards.</p>
        </div>
      {/if}
    </div>
  </main>

  <!-- Ambient Background Effects -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <!-- Cyan glow -->
    <div class="absolute top-1/3 -right-40 w-96 h-96 rounded-full blur-[120px]" style="background: rgba(7,165,201,0.1);"></div>
    <!-- Purple glow -->
    <div class="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-[120px]" style="background: rgba(168,85,247,0.08);"></div>
  </div>
</div>