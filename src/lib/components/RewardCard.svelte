<script lang="ts">
  import { Check, Lock, Gift, Sparkles, Coins, Zap, BadgeCheck, Crown } from 'lucide-svelte';
  import type { RewardInfo } from '$lib/stores/passStore';
  
  export let reward: RewardInfo;
  export let isPremium: boolean = false;
  export let onClaim: ((rewardId: string) => Promise<void>) | null = null;
  
  let isClaiming = false;
  let claimed = reward.claimed;
  
  // Determine if reward is locked
  $: isLocked = !reward.isUnlocked;
  $: canClaim = reward.isClaimable && !claimed && !isLocked && !isClaiming;
  
  // Get reward display info based on type
  function getRewardDisplay() {
    switch (reward.rewardType) {
      case 'COINS':
        return {
          icon: Coins,
          color: 'text-cyber-warn',
          bgColor: 'bg-cyber-warn/10',
          borderColor: 'border-cyber-warn/30',
          label: `${reward.rewardValue.amount} Coins`
        };
      case 'XP_BOOST':
        return {
          icon: Zap,
          color: 'text-cyber-success',
          bgColor: 'bg-cyber-success/10',
          borderColor: 'border-cyber-success/30',
          label: `+${reward.rewardValue.percent}% XP Boost`
        };
      case 'AI_HELP_CREDITS':
        return {
          icon: Sparkles,
          color: 'text-obsidian-accent',
          bgColor: 'bg-obsidian-accent/10',
          borderColor: 'border-obsidian-accent/30',
          label: `+${reward.rewardValue.amount} AI Helps`
        };
      case 'AVATAR':
        return {
          icon: Crown,
          color: 'text-purple-400',
          bgColor: 'bg-purple-400/10',
          borderColor: 'border-purple-400/30',
          label: 'Exclusive Avatar'
        };
      case 'TITLE':
        return {
          icon: BadgeCheck,
          color: 'text-cyber-bright',
          bgColor: 'bg-cyber-bright/10',
          borderColor: 'border-cyber-bright/30',
          label: 'Exclusive Title'
        };
      case 'BADGE':
        return {
          icon: BadgeCheck,
          color: 'text-cyber-alert',
          bgColor: 'bg-cyber-alert/10',
          borderColor: 'border-cyber-alert/30',
          label: 'Badge'
        };
      case 'BORDER':
        return {
          icon: Crown,
          color: 'text-pink-400',
          bgColor: 'bg-pink-400/10',
          borderColor: 'border-pink-400/30',
          label: 'Profile Border'
        };
      default:
        return {
          icon: Gift,
          color: 'text-obsidian-text-primary',
          bgColor: 'bg-obsidian-surface',
          borderColor: 'border-obsidian-accent/30',
          label: 'Reward'
        };
    }
  }
  
  const rewardDisplay = getRewardDisplay();
  const IconComponent = rewardDisplay.icon;
  
  async function handleClaim() {
    if (!onClaim || !canClaim) return;
    
    isClaiming = true;
    try {
      await onClaim(reward.id);
      claimed = true;
    } catch (error) {
      console.error('Failed to claim reward:', error);
    } finally {
      isClaiming = false;
    }
  }
</script>

<div 
  class="relative flex flex-col items-center p-4 rounded-xl border transition-all duration-300
    {isPremium 
      ? 'bg-gradient-to-b from-cyber-bright/5 to-obsidian-accent/5 border-cyber-bright/40' 
      : 'bg-obsidian-surface border-obsidian-accent/30'}
    {isLocked ? 'opacity-60 cursor-not-allowed' : 'opacity-100'}
    {!isLocked && !claimed ? 'hover:shadow-lg hover:shadow-cyber-bright/10 hover:scale-102' : ''}"
>
  <!-- Premium indicator -->
  {#if isPremium}
    <div class="absolute -top-2 -right-2 bg-gradient-to-br from-cyber-bright to-obsidian-accent rounded-full p-1 shadow-lg">
      <Crown class="w-3 h-3 text-obsidian-bg" />
    </div>
  {/if}
  
  <!-- Locked overlay */}
  {#if isLocked}
    <div class="absolute inset-0 bg-obsidian-bg/50 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-10">
      <Lock class="w-8 h-8 text-obsidian-text-muted" />
    </div>
  {/if}
  
  <!-- Level number -->
  <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-obsidian-bg-dark border border-obsidian-accent/30 rounded-full px-3 py-0.5">
    <span class="text-xs font-orbitron font-bold text-obsidian-accent">Lvl {reward.level}</span>
  </div>
  
  <!-- Reward content -->
  <div class="flex flex-col items-center gap-3 pt-2">
    <!-- Icon container -->
    <div 
      class="w-16 h-16 rounded-full flex items-center justify-center {rewardDisplay.bgColor} border-2 {rewardDisplay.borderColor}"
    >
      <IconComponent class="w-8 h-8 {rewardDisplay.color}" />
    </div>
    
    <!-- Reward label -->
    <div class="text-center">
      <p class="text-sm font-semibold text-obsidian-text-primary font-orbitron">
        {rewardDisplay.label}
      </p>
      {#if reward.rewardValue?.description}
        <p class="text-xs text-obsidian-text-muted mt-0.5">
          {reward.rewardValue.description}
        </p>
      {/if}
    </div>
    
    <!-- XP required indicator -->
    <div class="text-xs font-mono text-obsidian-text-muted">
      {reward.xpRequired.toLocaleString()} XP
    </div>
  </div>
  
  <!-- Claim button or claimed state -->
  {#if claimed}
    <div class="mt-3 w-full">
      <button 
        disabled
        class="w-full py-2 px-4 rounded-lg bg-cyber-success/20 border border-cyber-success/30 text-cyber-success font-orbitron text-sm flex items-center justify-center gap-2 cursor-default"
      >
        <Check class="w-4 h-4" />
        <span>Claimed</span>
      </button>
    </div>
  {:else if canClaim}
    <div class="mt-3 w-full">
      <button 
        on:click={handleClaim}
        disabled={isClaiming}
        class="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-cyber-bright to-obsidian-accent border border-cyber-bright/50 text-obsidian-bg font-orbitron text-sm font-bold hover:shadow-lg hover:shadow-cyber-bright/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        class:animate-pulse={!isClaiming}
      >
        {#if isClaiming}
          <span>Claiming...</span>
        {:else}
          <span class="flex items-center justify-center gap-2">
            <Gift class="w-4 h-4" />
            Claim Now
          </span>
        {/if}
      </button>
    </div>
  {:else if isLocked}
    <div class="mt-3 w-full">
      <button 
        disabled
        class="w-full py-2 px-4 rounded-lg bg-obsidian-surface border border-obsidian-accent/20 text-obsidian-text-muted font-orbitron text-sm cursor-not-allowed"
      >
        <Lock class="w-4 h-4 inline mr-2" />
        Reach Level {reward.level}
      </button>
    </div>
  {/if}
</div>
