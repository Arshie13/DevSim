<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Calendar, Check, Lock, Coins, Zap, Clock, Bot } from 'lucide-svelte';

  // -- Props --------------------------------------------------------------------
  export let isOpen = false;

  // -- Events -------------------------------------------------------------------
  const dispatch = createEventDispatcher<{
    close: void;
    claim: { day: number; coins: number; xp: number; aiHelps: number; newCoins: number; newXp: number; newAiHelpCredits: number };
  }>();

  // -- Types --------------------------------------------------------------------
  interface DailyReward {
    day: number;
    coins: number;
    xp: number;
    aiHelps: number;
    claimed: boolean;
  }

  const REWARD_SCHEDULE: DailyReward[] = [
    { day: 1, coins: 50, xp: 10, aiHelps: 1, claimed: false },
    { day: 2, coins: 75, xp: 20, aiHelps: 1, claimed: false },
    { day: 3, coins: 100, xp: 30, aiHelps: 2, claimed: false },
    { day: 4, coins: 150, xp: 40, aiHelps: 2, claimed: false },
    { day: 5, coins: 200, xp: 50, aiHelps: 2, claimed: false },
    { day: 6, coins: 300, xp: 75, aiHelps: 3, claimed: false },
    { day: 7, coins: 500, xp: 100, aiHelps: 5, claimed: false },
  ];

  // -- State --------------------------------------------------------------------
  let rewards: DailyReward[] = REWARD_SCHEDULE.map((reward) => ({ ...reward }));
  let currentDay = 1;
  let isClaiming = false;
  let claimingDay: number | null = null;
  let loadError = false;
  let cooldownInfo: { hours: number; minutes: number } | null = null;

  // -- Lifecycle ----------------------------------------------------------------
  $: if (isOpen) {
    fetchRewardState();
  }

  // -- API ---------------------------------------------------------------------
  async function fetchRewardState() {
    try {
      const res = await fetch('/api/user/daily-rewards', {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await res.json();

      const claimedIndices: number[] = data.claimedDays ?? [];
      currentDay = data.currentDay ?? 1;
      cooldownInfo = data.canClaimToday ? null : {
        hours: data.cooldown?.hours ?? 0,
        minutes: data.cooldown?.minutes ?? 0,
      };

      rewards = REWARD_SCHEDULE.map((r) => ({
        ...r,
        claimed: claimedIndices.includes(r.day - 1),
      }));

      loadError = false;
    } catch (err) {
      console.error('[DailyRewards] Failed to load state:', err);
      loadError = true;
    }
  }

  async function claimReward(dayIndex: number) {
    if (dayIndex >= currentDay) {
      console.warn(`[DailyRewards] Invalid claim: day ${dayIndex + 1} not yet available`);
      return;
    }
    if (rewards[dayIndex].claimed) {
      console.warn(`[DailyRewards] Already claimed: day ${dayIndex + 1}`);
      return;
    }
    if (isClaiming) return;

    const reward = rewards[dayIndex];
    isClaiming = true;
    claimingDay = dayIndex;

    try {
      const res = await fetch('/api/user/daily-rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dayIndex }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to claim' }));
        if (res.status === 429) {
          // Parse cooldown from error message or fetch fresh state
          await fetchRewardState();
          throw new Error(err.message || 'Please wait 24h between claims');
        }
        throw new Error(err.message || 'Failed to claim');
      }

      const result = await res.json();

      // Update local state from server response
      currentDay = result.currentDay;
      cooldownInfo = result.canClaimToday ? null : {
        hours: result.cooldown?.hours ?? 0,
        minutes: result.cooldown?.minutes ?? 0,
      };
      rewards = REWARD_SCHEDULE.map((r) => ({
        ...r,
        claimed: result.claimedDays.includes(r.day - 1),
      }));

      dispatch('claim', {
        day: reward.day,
        coins: reward.coins,
        xp: reward.xp,
        aiHelps: reward.aiHelps,
        newCoins: result.newCoins,
        newXp: result.newXp,
        newAiHelpCredits: result.newAiHelpCredits,
      });
    } catch (err) {
      console.error('[DailyRewards] Claim failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to claim reward');
    } finally {
      isClaiming = false;
      claimingDay = null;
    }
  }

  // -- UI -----------------------------------------------------------------------
  function close() {
    dispatch('close');
    isOpen = false;
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-obsidian-bg/85 backdrop-blur-[6px] p-4"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    on:click={handleBackdropClick}
    on:keydown={handleKeyDown}
  >
    <div
      class="relative w-[min(56rem,95vw)] overflow-hidden rounded-card border bg-obsidian-bg-light shadow-accent-glow-lg"
      style="border-color: rgb(var(--accent-rgb) / 0.25)"
    >
      <div class="absolute left-0 right-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--accent),transparent)]"></div>

      <!-- Header -->
      <div class="flex items-center justify-between gap-4 border-b border-[var(--card-border)] px-6 py-5">
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-card border border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan">
            <Calendar class="h-5 w-5" />
          </div>
          <div>
            <h2 class="font-heading text-xl font-bold tracking-tight text-obsidian-text-primary">Daily Login Rewards</h2>
            {#if cooldownInfo}
              <p class="mt-1 font-body text-sm text-cyber-warn">
                Next reward available in {cooldownInfo.hours}h {cooldownInfo.minutes}m
              </p>
            {:else}
              <p class="mt-1 font-body text-sm text-obsidian-text-muted">
                Claim your daily streak bonuses
              </p>
            {/if}
          </div>
        </div>
        <span class="tag-cyber tag-cyan whitespace-nowrap">Day {currentDay}/7</span>
      </div>

      <!-- Rewards Grid -->
      <div class="px-6 py-5">
        {#if loadError}
          <div class="py-10 text-center">
            <p class="font-body text-sm text-obsidian-text-muted">Failed to load rewards. Please try again.</p>
            <button class="btn-cyber btn-cyber-outline mt-5" on:click={fetchRewardState}>Retry</button>
          </div>
        {:else}
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-7 sm:gap-3">
            {#each rewards as reward, idx (reward.day)}
              <div
                class="flex w-full min-w-0 flex-col items-center rounded-lg border border-obsidian-accent/25 bg-obsidian-bg px-3 py-3.5 transition-all duration-200"
                class:claimed={reward.claimed}
                class:pending={!reward.claimed && idx < currentDay}
                class:locked={idx >= currentDay}
              >
                <span class="font-label text-xs font-semibold uppercase tracking-[0.04em] text-obsidian-text-muted">
                  Day {reward.day}
                </span>

                <div class="mt-2.5 grid w-full min-w-0 grid-cols-3 gap-1">
                  <span class="flex min-w-0 flex-col items-center gap-0.5 overflow-hidden whitespace-nowrap rounded-full bg-cyber-warn/10 px-0.5 py-1">
                    <Coins class="h-2.5 w-2.5 shrink-0 text-cyber-warn" />
                    <span class="font-label text-[0.65rem] font-semibold leading-none text-cyber-warn tabular-nums">{reward.coins}</span>
                  </span>
                  <span class="flex min-w-0 flex-col items-center gap-0.5 overflow-hidden whitespace-nowrap rounded-full bg-cyber-cyan/10 px-0.5 py-1">
                    <Zap class="h-2.5 w-2.5 shrink-0 text-cyber-cyan" />
                    <span class="font-label text-[0.65rem] font-semibold leading-none text-cyber-cyan tabular-nums">{reward.xp}</span>
                  </span>
                  <span class="flex min-w-0 flex-col items-center gap-0.5 overflow-hidden whitespace-nowrap rounded-full bg-cyber-purple/10 px-0.5 py-1">
                    <Bot class="h-2.5 w-2.5 shrink-0 text-cyber-purple" />
                    <span class="font-label text-[0.65rem] font-semibold leading-none text-cyber-purple tabular-nums">{reward.aiHelps}</span>
                  </span>
                </div>

                <div class="mt-auto flex min-h-[2.25rem] w-full items-center justify-center pt-2.5">
                  {#if reward.claimed}
                    <span class="flex items-center gap-1.5 font-label text-[0.65rem] uppercase tracking-[0.04em] text-cyber-success">
                      <Check class="h-3.5 w-3.5" />
                      Claimed
                    </span>
                  {:else if idx < currentDay}
                    {#if cooldownInfo}
                      <span class="flex flex-col items-center gap-1 text-cyber-warn">
                        <span class="flex items-center gap-1 font-label text-xs tabular-nums">
                          <Clock class="h-3 w-3" />
                          {cooldownInfo.hours}h {cooldownInfo.minutes}m
                        </span>
                        <span class="font-body text-[0.65rem] text-obsidian-text-muted">until next claim</span>
                      </span>
                    {:else}
                      <button
                        class="btn-cyber btn-cyber-outline w-full !px-3 !py-2"
                        class:opacity-50={isClaiming}
                        class:cursor-not-allowed={isClaiming}
                        on:click={() => claimReward(idx)}
                        disabled={isClaiming}
                      >
                        {#if isClaiming && claimingDay === idx}
                          <svg class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        {:else}
                          Claim
                        {/if}
                      </button>
                    {/if}
                  {:else}
                    <span class="flex items-center gap-1.5 text-obsidian-text-muted/60">
                      <Lock class="h-3 w-3" />
                      <span class="font-label text-[0.65rem] uppercase tracking-[0.04em]">Locked</span>
                    </span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex justify-end border-t border-[var(--card-border)] bg-obsidian-bg/40 px-6 py-4">
        <button class="btn-cyber btn-cyber-outline !px-6 !py-2.5" on:click={close}>
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .claimed {
    border-color: rgb(var(--success-rgb) / 0.25);
    background: rgb(var(--success-rgb) / 0.05);
  }
  .pending {
    border-color: rgb(var(--accent-rgb) / 0.35);
    box-shadow: 0 0 15px rgb(var(--accent-rgb) / 0.15);
  }
  .locked {
    opacity: 0.5;
    pointer-events: none;
  }
</style>
