<script lang="ts">
  import { Loader2, Check, Gift, Lock } from 'lucide-svelte';
  import type { RewardInfo } from '$lib/stores/passStore';
  
  export let reward: RewardInfo;
  export let onClaim: ((rewardId: string) => Promise<void>) | null = null;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  
  let isClaiming = false;
  let claimed = reward.claimed;
  let error: string | null = null;
  
  // Reactive states
  $: isLocked = !reward.isUnlocked;
  $: canClaim = reward.isClaimable && !claimed && !isLocked && !isClaiming;
  
  // Size variants
  const buttonClasses = {
    sm: 'py-1.5 px-3 text-xs',
    md: 'py-2.5 px-5 text-sm',
    lg: 'py-3 px-6 text-base'
  };
  
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  async function handleClaim() {
    if (!onClaim || !canClaim || isClaiming) return;
    
    isClaiming = true;
    error = null;
    
    try {
      await onClaim(reward.id);
      claimed = true;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to claim reward';
    } finally {
      isClaiming = false;
    }
  }
</script>

<button
  on:click={handleClaim}
  disabled={!canClaim}
  class="relative w-full rounded-lg font-orbitron font-semibold transition-all duration-200
    {buttonClasses[size]}
    
    {claimed
      ? 'bg-cyber-success/20 border border-cyber-success/30 text-cyber-success cursor-default'
      : isLocked
        ? 'bg-obsidian-surface border border-obsidian-accent/20 text-obsidian-text-muted cursor-not-allowed'
        : canClaim
          ? 'bg-gradient-to-r from-cyber-bright to-obsidian-accent border border-cyber-bright/50 text-obsidian-bg shadow-md hover:shadow-lg hover:shadow-cyber-bright/30 active:scale-95'
          : 'bg-obsidian-surface border border-obsidian-accent/20 text-obsidian-text-muted cursor-wait'
    }
    
    disabled:opacity-50
    disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyber-bright
  "
>
  <!-- Loading spinner -->
  {#if isClaiming}
    <span class="flex items-center justify-center gap-2">
      <Loader2 class="{iconSizes[size]} animate-spin" />
      <span>Claiming...</span>
    </span>
  {:else if claimed}
    <span class="flex items-center justify-center gap-2">
      <Check class="{iconSizes[size]}" />
      <span>Claimed</span>
    </span>
  {:else if isLocked}
    <span class="flex items-center justify-center gap-2">
      <Lock class="{iconSizes[size]}" />
      <span>Locked (Lvl {reward.level})</span>
    </span>
  {:else}
    <span class="flex items-center justify-center gap-2">
      <Gift class="{iconSizes[size]}" />
      <span>Claim Reward</span>
    </span>
  {/if}
</button>

{#if error}
  <p class="text-xs text-cyber-alert mt-2 text-center">
    {error}
  </p>
{/if}
