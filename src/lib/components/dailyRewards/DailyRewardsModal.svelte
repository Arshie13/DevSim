<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Calendar, Gift, Check, Lock, Coins, Zap, X, Clock } from 'lucide-svelte';

  // -- Props --------------------------------------------------------------------
  export let isOpen = false;

  // -- Events -------------------------------------------------------------------
  const dispatch = createEventDispatcher<{
    close: void;
    claim: { day: number; coins: number; xp: number; newCoins: number; newXp: number };
  }>();

  // -- Types --------------------------------------------------------------------
  interface DailyReward {
    day: number;
    coins: number;
    xp: number;
    claimed: boolean;
  }

  const REWARD_SCHEDULE: DailyReward[] = [
    { day: 1, coins: 50,  xp: 10,  claimed: false },
    { day: 2, coins: 75,  xp: 20,  claimed: false },
    { day: 3, coins: 100, xp: 30,  claimed: false },
    { day: 4, coins: 150, xp: 40,  claimed: false },
    { day: 5, coins: 200, xp: 50,  claimed: false },
    { day: 6, coins: 300, xp: 75,  claimed: false },
    { day: 7, coins: 500, xp: 100, claimed: false },
  ];

  // -- State --------------------------------------------------------------------
  let rewards: DailyReward[] = REWARD_SCHEDULE.map(r => ({ ...r }));
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

      rewards = REWARD_SCHEDULE.map((r, idx) => ({
        ...r,
        claimed: claimedIndices.includes(idx),
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
      cooldownInfo = null; // Reset cooldown on successful claim
      rewards = REWARD_SCHEDULE.map((r, idx) => ({
        ...r,
        claimed: result.claimedDays.includes(idx),
      }));

      dispatch('claim', {
        day: reward.day,
        coins: reward.coins,
        xp: reward.xp,
        newCoins: result.newCoins,
        newXp: result.newXp,
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
    <div class="relative w-full max-w-2xl overflow-hidden rounded-[4px] border border-cyber-cyan/30 bg-obsidian-bg-light shadow-[0_0_0_1px_rgba(7,165,201,0.07),0_0_50px_rgba(7,165,201,0.25),0_24px_60px_rgba(0,0,0,0.6)]">
      <div class="absolute left-0 right-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--accent),transparent)]"></div>

      <!-- Header -->
      <div class="flex items-center justify-between border-b border-cyber-cyan/10 px-6 py-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-[4px] border border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan">
            <Calendar class="w-5 h-5" />
          </div>
          <div>
            <h2 class="font-heading text-base font-bold uppercase tracking-[0.08em] text-obsidian-text-primary">Daily Login Rewards</h2>
            {#if cooldownInfo}
              <p class="mt-1 font-mono text-[0.65rem] text-cyber-warn">
                Next reward available in {cooldownInfo}h {cooldownInfo.minutes}m
              </p>
            {:else}
              <p class="mt-1 font-mono text-[0.65rem] text-obsidian-text-muted">
                Claim your daily streak bonuses (Day {currentDay}/7)
              </p>
            {/if}
          </div>
        </div>
        <button
          class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[4px] border border-transparent bg-transparent text-obsidian-text-muted transition-all duration-150 ease-in-out hover:border-cyber-danger/30 hover:bg-cyber-danger/10 hover:text-cyber-danger"
          on:click={close}
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Rewards Grid -->
      <div class="px-6 py-6">
        {#if loadError}
          <div class="text-center py-8">
            <p class="text-obsidian-text-muted font-mono text-sm">Failed to load rewards. Please try again.</p>
            <button class="btn-cyber btn-cyber-outline mt-4" on:click={fetchRewardState}>Retry</button>
          </div>
        {:else}
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {#each rewards as reward, idx (reward.day)}
              <div
                class="relative flex flex-col items-center rounded-[4px] border border-obsidian-accent/25 bg-obsidian-bg p-4 transition-all duration-200"
                class:claimed={reward.claimed}
                class:pending={!reward.claimed && idx < currentDay}
                class:locked={idx >= currentDay}
              >
                {#if reward.claimed}
                  <div class="absolute inset-0 flex items-center justify-center bg-cyber-success/5 opacity-60">
                    <div class="rounded-full bg-cyber-success/10 p-2">
                      <Check class="w-6 h-6 text-cyber-success" />
                    </div>
                  </div>
                {/if}

                <div class="mb-2 flex items-center justify-center">
                  <span class="font-heading text-[0.75rem] font-bold uppercase tracking-wider text-obsidian-text-muted">
                    Day {reward.day}
                  </span>
                </div>

                <div class="flex items-center gap-2 mb-3">
                  <div class="flex items-center gap-1 rounded-full bg-cyber-warn/10 px-2 py-0.5">
                    <Coins class="w-3.5 h-3.5 text-cyber-warn" />
                    <span class="font-mono text-xs font-semibold text-cyber-warn">{reward.coins}</span>
                  </div>
                  <div class="flex items-center gap-1 rounded-full bg-cyber-cyan/10 px-2 py-0.5">
                    <Zap class="w-3.5 h-3.5 text-cyber-cyan" />
                    <span class="font-mono text-xs font-semibold text-cyber-cyan">{reward.xp}</span>
                  </div>
                </div>

                {#if reward.claimed}
                  <span class="font-mono text-[0.6rem] text-cyber-success uppercase">Claimed</span>
                {:else if idx < currentDay}
                  {#if cooldownInfo}
                    <div class="text-center">
                      <div class="flex items-center justify-center gap-1 text-cyber-warn text-[0.6rem] font-mono">
                        <Clock class="w-3 h-3" />
                        <span>{cooldownInfo.hours}h {cooldownInfo.minutes}m</span>
                      </div>
                      <p class="text-[0.55rem] text-obsidian-text-muted/70 mt-1">until next claim</p>
                    </div>
                  {:else}
                    <button
                      class="btn-cyber btn-cyber-outline !px-3 !py-1.5 text-[0.6rem] w-full"
                      class:opacity-50={isClaiming}
                      class:cursor-not-allowed={isClaiming}
                      on:click={() => claimReward(idx)}
                      disabled={isClaiming}
                    >
                      {#if isClaiming && claimingDay === idx}
                        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      {:else}
                        Claim
                      {/if}
                    </button>
                  {/if}
                {:else}
                  <div class="flex items-center gap-1 text-obsidian-text-muted/60">
                    <Lock class="w-3 h-3" />
                    <span class="font-mono text-[0.6rem] uppercase">Locked</span>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex justify-end border-t border-cyber-cyan/10 bg-obsidian-bg/40 px-6 py-4">
        <button
          class="btn-cyber border border-obsidian-accent/25 bg-transparent !px-[1rem] !py-[0.55rem] text-obsidian-text-muted hover:border-obsidian-accent/50 hover:bg-obsidian-accent/10 hover:text-obsidian-text-primary transition-all duration-150"
          on:click={close}
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .claimed {
    border-color: rgba(0, 229, 160, 0.25);
    background: rgba(0, 229, 160, 0.05);
  }
  .pending {
    border-color: rgba(7, 165, 201, 0.35);
    box-shadow: 0 0 15px rgba(7, 165, 201, 0.15);
  }
  .locked {
    opacity: 0.5;
    pointer-events: none;
  }
</style>
