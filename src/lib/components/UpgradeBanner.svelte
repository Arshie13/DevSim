<script lang="ts">
  import { Crown, Sparkles, Coins, Zap } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  
  export let onUpgrade: (() => void) | null = null;
  export let premiumExpiresAt: string | null = null;
  export let isPremium: boolean = false;
  
  // Check if premium is active (not expired)
  $: isActivePremium = isPremium && (!premiumExpiresAt || new Date(premiumExpiresAt) > new Date());
  
  function handleUpgradeClick() {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Navigate to purchase or open purchase modal
      goto('/pass?action=purchase');
    }
  }
</script>

{#if isActivePremium}
  <!-- Active premium status banner -->
  <div class="relative overflow-hidden rounded-xl border border-cyber-bright/40 bg-gradient-to-r from-cyber-bright/10 via-obsidian-accent/5 to-transparent p-4">
    <div class="absolute top-0 right-0 w-32 h-32 bg-cyber-bright/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
    
    <div class="relative flex items-center gap-4">
      <div class="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyber-bright to-obsidian-accent flex items-center justify-center shadow-lg">
        <Crown class="w-6 h-6 text-obsidian-bg" />
      </div>
      
      <div class="flex-1">
        <h3 class="text-lg font-orbitron font-bold text-cyber-bright">
          Premium Pass Active
        </h3>
        <p class="text-sm text-obsidian-text-muted">
          Enjoy exclusive rewards and boosted AI help limits!
        </p>
      </div>
      
      {#if premiumExpiresAt}
        <div class="text-xs font-mono text-cyber-bright bg-cyber-bright/10 px-3 py-1.5 rounded-full border border-cyber-bright/30">
          Expires: {new Date(premiumExpiresAt).toLocaleDateString()}
        </div>
      {/if}
    </div>
  </div>
{:else}
  <!-- Upgrade prompt banner -->
  <div class="relative overflow-hidden rounded-xl border border-cyber-warn/40 bg-gradient-to-r from-cyber-warn/10 via-obsidian-accent/5 to-transparent p-4">
    <div class="absolute top-0 right-0 w-40 h-40 bg-cyber-warn/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
    <div class="absolute bottom-0 left-0 w-24 h-24 bg-obsidian-accent/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
    
    <div class="relative">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-cyber-warn to-cyber-bright flex items-center justify-center shadow-lg animate-pulse">
          <Crown class="w-7 h-7 text-obsidian-bg" />
        </div>
        
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-orbitron font-bold text-cyber-warn">
              Unlock Premium Pass
            </h3>
            <span class="px-2 py-0.5 text-xs font-bold bg-cyber-warn/20 text-cyber-warn rounded-full border border-cyber-warn/30">
              ₱299
            </span>
          </div>
          
          <p class="text-sm text-obsidian-text-primary mt-1 mb-3">
            Get exclusive rewards, extra AI help credits, and premium cosmetics!
          </p>
          
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-obsidian-text-muted mb-4">
            <li class="flex items-center gap-2">
              <Sparkles class="w-3.5 h-3.5 text-obsidian-accent" />
              +5 extra AI helps daily
            </li>
            <li class="flex items-center gap-2">
              <Zap class="w-3.5 h-3.5 text-cyber-success" />
              XP boost rewards
            </li>
            <li class="flex items-center gap-2">
              <Crown class="w-3.5 h-3.5 text-purple-400" />
              premium avatars
            </li>
            <li class="flex items-center gap-2">
              <Coins class="w-3.5 h-3.5 text-cyber-warn" />
              +2000 bonus coins
            </li>
          </ul>
        </div>
      </div>
      
      <button 
        on:click={handleUpgradeClick}
        class="w-full mt-2 py-3 px-6 rounded-lg bg-gradient-to-r from-cyber-warn via-cyber-bright to-obsidian-accent text-obsidian-bg font-orbitron font-bold text-sm shadow-lg hover:shadow-cyber-warn/40 transition-all active:scale-95 hover:scale-[1.02] flex items-center justify-center gap-2"
      >
        <Crown class="w-5 h-5" />
        Upgrade to Premium — ₱299
      </button>
      
      <p class="text-xs text-center text-obsidian-text-muted mt-2">
        60-day access • One-time payment • No auto-renew
      </p>
    </div>
  </div>
{/if}
