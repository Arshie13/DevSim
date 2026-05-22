<script lang="ts">
  import { onMount } from 'svelte';
  import { Code, Coins, ChartBar, Sparkles, Zap, Crown, ArrowLeft } from 'lucide-svelte';
  
  import type { PageData } from './$types';
  import { 
    passData, 
    passLoading, 
    passError, 
    daysRemaining, 
    aiHelpsRemainingPass, 
    hasPremium,
    currentSeasonXp,
    currentFreeLevel,
    unclaimedRewardsCount
  } from '$lib/stores/passStore';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import CountdownTimer from '$lib/components/CountdownTimer.svelte';
  import RewardCard from '$lib/components/RewardCard.svelte';
  import UpgradeBanner from '$lib/components/UpgradeBanner.svelte';
  import ClaimButton from '$lib/components/ClaimButton.svelte';
  import { goto } from '$app/navigation';
  
  export let data: PageData;
  
  // Initialize store with server data
  $: $passData = data.passData;
  $: $passLoading = false;
  $: daysRemaining.set(data.daysRemaining);
  $: aiHelpsRemainingPass.set(data.aiHelpsRemaining);
  
  let selectedTrack: 'free' | 'premium' = 'free';
  let claimingRewardId: string | null = null;
  
  // Redirect logic if premium is requested
  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    if (action === 'purchase' && !$hasPremium) {
      // Could open purchase modal or navigate
      // For now, we'll show the banner
    }
  });
  
  // Handle reward claim
  async function handleClaimReward(rewardId: string, passType: 'FREE' | 'PREMIUM') {
    claimingRewardId = rewardId;
    try {
      const response = await fetch('/api/pass/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId, passType })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to claim reward');
      }
      
      // Optimistically update store
      const track = passType === 'FREE' ? 'free' : 'premium';
      passData.update(current => {
        if (!current) return current;
        return {
          ...current,
          availableRewards: {
            free: current.availableRewards.free.map(r =>
              r.id === rewardId ? { ...r, claimed: true } : r
            ),
            premium: current.availableRewards.premium.map(r =>
              r.id === rewardId ? { ...r, claimed: true } : r
            )
          }
        };
      });
      
    } catch (error) {
      console.error('Claim error:', error);
      alert(error instanceof Error ? error.message : 'Failed to claim reward');
    } finally {
      claimingRewardId = null;
    }
  }
  
  // Handle premium upgrade click
  async function handleUpgrade() {
    try {
      const response = await fetch('/api/pass/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to initiate purchase');
      }
      
      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to start purchase: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  
  // Toggle between free/premium track view (mobile friendly)
  function toggleTrack(track: 'free' | 'premium') {
    selectedTrack = track;
  }
</script>

<svelte:head>
  <title>Learner's Pass — DevSim</title>
</svelte:head>

{#if $passLoading}
  <div class="flex items-center justify-center min-h-screen">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-obsidian-accent"></div>
  </div>
{:else if $passError}
  <div class="flex flex-col items-center justify-center min-h-screen text-cyber-alert">
    <p class="text-lg font-orbitron">Error loading pass data</p>
    <p class="text-sm text-obsidian-text-muted">{$passError}</p>
  </div>
{:else if $passData && data.season}
  <div class="max-w-6xl mx-auto px-4 py-8 md:px-8 lg:px-12">
    
     <!-- Back to Dashboard Button -->
     <div class="mb-6">
        <button
          on:click={() => goto('/dashboard')}
          class="btn-cyber btn-cyber-outline group flex items-center gap-2 !px-4 !py-2.5"
        >
          <ArrowLeft class="w-4 h-4 text-cyber-cyan transition-transform group-hover:-translate-x-1" />
          <span class="text-sm font-orbitron font-semibold text-cyber-cyan">Back to Dashboard</span>
        </button>
      </div>
    
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div class="relative">
              <div class="bg-gradient-to-br from-obsidian-accent to-cyber-bright p-3 rounded-xl shadow-accent-glow">
                <Crown class="w-6 h-6 text-obsidian-bg" />
              </div>
            </div>
            <div>
              <h1 class="text-3xl md:text-4xl font-orbitron font-bold text-obsidian-text-muted tracking-tight">
                Learner's Pass
              </h1>
              <p class="text-obsidian-text-primary/70 text-sm">
                {data.season.name}
              </p>
            </div>
          </div>
          
          <!-- Season timer -->
          <div class="ml-12">
            <CountdownTimer endDate={data.season.endDate} showIcon={true} compact={false} />
          </div>
        </div>
        
        <!-- Quick stats -->
        <div class="flex items-center gap-4">
          <div class="bg-obsidian-surface border border-obsidian-accent/20 rounded-lg px-4 py-2">
            <p class="text-xs text-obsidian-text-muted uppercase tracking-wider mb-1">Season XP</p>
            <p class="text-xl font-orbitron font-bold text-cyber-bright">
              {$currentSeasonXp.toLocaleString()}
            </p>
          </div>
          
          <div class="bg-obsidian-surface border border-obsidian-accent/20 rounded-lg px-4 py-2">
            <p class="text-xs text-obsidian-text-muted uppercase tracking-wider mb-1">Level</p>
            <p class="text-xl font-orbitron font-bold text-obsidian-accent">
              {$currentFreeLevel}
            </p>
          </div>
        </div>
      </div>
      
      <!-- XP Progress Bar -->
      <div class="bg-obsidian-surface border border-obsidian-accent/20 rounded-xl p-6 mb-8">
        <ProgressBar 
          currentXp={$currentSeasonXp}
          xpToNextLevel={$passData.progression.levelInfo.xpToNext}
          level={$currentFreeLevel}
          size="lg"
          animated={true}
        />
      </div>
    </div>
    
    <!-- Premium Banner (if not premium) -->
    {#if !$hasPremium}
      <div class="mb-8">
        <UpgradeBanner 
          isPremium={false}
          onUpgrade={handleUpgrade}
        />
      </div>
    {/if}
    
    <!-- AI Helps Remaining -->
    <div class="mb-8 bg-obsidian-surface border border-obsidian-accent/20 rounded-xl p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Sparkles class="w-5 h-5 text-obsidian-accent" />
          <div>
            <p class="text-sm font-orbitron text-obsidian-text-primary">AI Help Credits</p>
            <p class="text-xs text-obsidian-text-muted">
              Remaining today: <span class="font-bold text-cyber-bright">{$aiHelpsRemainingPass.today}</span> / {$aiHelpsRemainingPass.total}
            </p>
          </div>
        </div>
        
        {#if $hasPremium}
          <div class="text-xs font-mono text-cyber-success bg-cyber-success/10 px-3 py-1.5 rounded-full border border-cyber-success/30">
            Premium Active
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Track Selector -->
    <div class="flex gap-4 mb-6 border-b border-obsidian-accent/20 pb-2">
      <button
        on:click={() => toggleTrack('free')}
        class="relative px-6 py-2 text-sm font-orbitron font-semibold transition-all
          {selectedTrack === 'free' 
            ? 'text-cyber-bright' 
            : 'text-obsidian-text-muted hover:text-obsidian-text-primary'}"
      >
        Free Track
        {#if selectedTrack === 'free'}
          <div class="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-gradient-to-r from-cyber-bright to-obsidian-accent rounded-full"></div>
        {/if}
      </button>
      
      <button
        on:click={() => toggleTrack('premium')}
        class="relative px-6 py-2 text-sm font-orbitron font-semibold transition-all flex items-center gap-2
          {selectedTrack === 'premium' 
            ? 'text-cyber-warn' 
            : 'text-obsidian-text-muted hover:text-obsidian-text-primary'}"
      >
        <Crown class="w-4 h-4" />
        Premium Track
        {#if selectedTrack === 'premium'}
          <div class="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-gradient-to-r from-cyber-warn to-cyber-bright rounded-full"></div>
        {/if}
      </button>
    </div>
    
    <!-- Rewards Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-12">
       {#if selectedTrack === 'free'}
         {#each $passData.availableRewards.free as reward (reward.id)}
           <RewardCard 
             {reward}
             isPremium={false}
             onClaim={(id) => handleClaimReward(id, 'FREE')}
           />
         {/each}
       {:else}
         {#each $passData.availableRewards.premium as reward (reward.id)}
           <RewardCard 
             {reward}
             isPremium={true}
             onClaim={(id) => handleClaimReward(id, 'PREMIUM')}
           />
         {/each}
       {/if}
    </div>
    
    <!-- Current Progress Summary -->
    <div class="bg-obsidian-surface/50 border border-obsidian-accent/10 rounded-xl p-6">
      <h3 class="text-lg font-orbitron font-bold text-obsidian-text-primary mb-4">Season Progress</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 rounded-lg bg-obsidian-bg-light/30">
          <p class="text-xs text-obsidian-text-muted uppercase mb-1">Free Track</p>
          <p class="text-2xl font-bold text-cyber-bright">Level {$passData.progression.freeTrackLevel} / 20</p>
          <p class="text-sm text-obsidian-text-primary mt-1">
            {($currentFreeLevel >= 20) ? 'Max level reached!' : `${$passData.progression.levelInfo.xpToNext} XP to next level`}
          </p>
        </div>
        
        <div class="p-4 rounded-lg bg-obsidian-bg-light/30">
          <p class="text-xs text-obsidian-text-muted uppercase mb-1">Premium Track</p>
          <p class="text-2xl font-bold text-cyber-warn">
            {$passData.progression.premiumTrackLevel || 0} / 20
          </p>
          <p class="text-sm text-obsidian-text-primary mt-1">
            {(! $hasPremium) ? 'Purchase premium to unlock' : $passData.progression.premiumTrackLevel ? 'Active progression' : 'Not started'}
          </p>
        </div>
        
        <div class="p-4 rounded-lg bg-obsidian-bg-light/30">
          <p class="text-xs text-obsidian-text-muted uppercase mb-1">Unclaimed Rewards</p>
          <p class="text-2xl font-bold text-obsidian-accent">
            {$unclaimedRewardsCount.free + $unclaimedRewardsCount.premium}
          </p>
          <p class="text-sm text-obsidian-text-primary mt-1">
            Free: {$unclaimedRewardsCount.free} | Premium: {$unclaimedRewardsCount.premium}
          </p>
        </div>
      </div>
    </div>
    
   </div>
 {/if}
