<script lang='ts'>
  import { Coins, Sparkles, Zap, Trophy, Crown, ArrowRight, ShoppingCart, Loader2 } from 'lucide-svelte';
  import Header from '$components/Header.svelte';
  import type { PageData } from './$types';
  import { fade, fly } from 'svelte/transition';
  import { goto } from '$app/navigation';

  export let data: PageData;

  let isPurchasing = false;
  let customAmount = 0;
  let selectedPackage: string | null = null;
  let userCoins = data.user.coins;

  const coinPackages = [
    {
      id: 'starter',
      name: 'Starter Pouch',
      amount: 500,
      price: '₱249.00',
      description: 'Perfect for getting started',
      icon: Zap,
      color: 'from-blue-500 to-cyan-400',
      tag: null
    },
    {
      id: 'pro',
      name: 'Pro Hoard',
      amount: 2000,
      price: '₱749.00',
      description: 'Most popular for rising devs',
      icon: Trophy,
      color: 'from-purple-500 to-indigo-400',
      tag: 'POPULAR'
    },
    {
      id: 'elite',
      name: 'Elite Vault',
      amount: 5000,
      price: '₱1,499.00',
      description: 'Maximize your potential',
      icon: Crown,
      color: 'from-amber-500 to-orange-400',
      tag: 'BEST VALUE'
    },
    {
      id: 'omega',
      name: 'Omega Nexus',
      amount: 15000,
      price: '₱3,999.00',
      description: 'Unlimited power core',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-400',
      tag: 'WHALE'
    }
  ];

  function handlePurchase(packageId: string | null, amount: number | null) {
    const params = new URLSearchParams();
    if (packageId) params.append('packageId', packageId);
    if (amount) params.append('amount', amount.toString());
    
    goto(`/marketplace/coins/payment?${params.toString()}`);
  }

  function handleCustomPurchase() {
    if (customAmount < 100) return;
    handlePurchase(null, customAmount);
  }
</script>

<svelte:head>
  <title>Coins Marketplace | DevSim</title>
</svelte:head>

<div class='min-h-screen bg-obsidian-bg scanlines ambient-glow bg-grid-cyber pb-20'>
  <Header userData={{ ...data.user, coins: userCoins }} />

  <main class='relative z-10 py-12 px-6'>
    <div class='max-w-[1200px] mx-auto'>
      <div class='text-center mb-16' in:fade={{ duration: 800 }}>
        <h2 class='text-4xl font-orbitron font-bold text-obsidian-text-muted mb-4 tracking-tighter'>
          COINS <span class='text-cyber-warn'>MARKETPLACE</span>
        </h2>
        <p class='text-lg font-rajdhani text-obsidian-text-primary/60 max-w-2xl mx-auto'>
          Power up your simulation experience. Purchase coins to unlock premium features, exclusive avatars, and advanced project stacks.
        </p>
      </div>

      <div class='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16'>
        {#each coinPackages as pkg, i}
          <div 
            class='group relative bg-obsidian-bg-light/40 border border-obsidian-accent/10 rounded-card p-8 flex flex-col items-center text-center transition-all duration-500 hover:border-cyber-warn/40 hover:shadow-[0_0_30px_rgba(255,180,0,0.05)] overflow-hidden'
            in:fly={{ y: 20, delay: i * 100, duration: 600 }}
          >
            <div class='absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br {pkg.color} opacity-0 group-hover:opacity-10 blur-[40px] transition-opacity duration-500'></div>

            {#if pkg.tag}
              <div class='absolute top-4 right-4 bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan px-2 py-1 rounded text-[0.6rem] font-orbitron font-bold tracking-widest'>
                {pkg.tag}
              </div>
            {/if}

            <div class='w-16 h-16 rounded-2xl bg-gradient-to-br {pkg.color} p-4 mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500'>
              <svelte:component this={pkg.icon} class='w-full h-full text-obsidian-bg' />
            </div>

            <h3 class='text-xl font-orbitron font-bold text-obsidian-text-muted mb-2'>{pkg.name}</h3>
            <div class='flex items-center gap-2 mb-4 justify-center'>
              <Coins class='w-5 h-5 text-cyber-warn' />
              <span class='text-3xl font-orbitron font-bold text-cyber-warn'>{pkg.amount.toLocaleString()}</span>
            </div>
            <p class='text-sm font-rajdhani text-obsidian-text-primary/50 mb-8 min-h-[40px]'>{pkg.description}</p>

            <div class='mt-auto w-full'>
              <button 
                on:click={() => handlePurchase(pkg.id, pkg.amount)}
                disabled={isPurchasing}
                class='btn-cyber {pkg.tag === 'POPULAR' ? 'btn-cyber-solid' : 'btn-cyber-outline'} w-full flex items-center justify-center gap-2 !py-4'
              >
                {#if isPurchasing && selectedPackage === pkg.id}
                  <Loader2 class='w-4 h-4 animate-spin' />
                  <span>Processing...</span>
                {:else}
                  <ShoppingCart class='w-4 h-4' />
                  <span class='font-orbitron'>{pkg.price}</span>
                {/if}
              </button>
            </div>
          </div>
        {/each}
      </div>

      <div 
        class='bg-obsidian-bg-light/20 border border-obsidian-accent/10 rounded-card p-10 backdrop-blur-sm'
        in:fade={{ delay: 600, duration: 800 }}
      >
        <div class='flex flex-col md:flex-row items-center justify-between gap-8'>
          <div class='flex-1'>
            <h3 class='text-2xl font-orbitron font-bold text-obsidian-text-muted mb-3 flex items-center gap-3'>
              <Sparkles class='w-6 h-6 text-cyber-cyan' />
              CUSTOM DATA INJECTION
            </h3>
            <p class='text-base font-rajdhani text-obsidian-text-primary/60'>
              Need a specific amount? Inject custom coin data directly into your simulation core. 
              ₱0.50 per coin (Min 100 coins).
            </p>
          </div>

          <div class='flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto'>
            <div class='relative w-full sm:w-48'>
              <input 
                type='number' 
                bind:value={customAmount}
                placeholder='Amount'
                class='w-full bg-obsidian-bg border border-obsidian-accent/30 focus:border-cyber-cyan/50 text-cyber-cyan font-orbitron px-4 py-4 rounded-card outline-none transition-colors'
                min='100'
              />
              <div class='absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none'>
                <Coins class='w-4 h-4 text-cyber-warn' />
              </div>
            </div>

            <div class='text-right sm:text-left min-w-[120px]'>
              <p class='text-[0.6rem] font-orbitron text-obsidian-text-primary/40 uppercase tracking-widest mb-1'>TOTAL COST</p>
              <p class='text-xl font-orbitron font-bold text-obsidian-text-muted'>
                ₱{((customAmount || 0) * 0.50).toFixed(2)}
              </p>
            </div>

            <button 
              on:click={handleCustomPurchase}
              disabled={isPurchasing || customAmount < 100}
              class='btn-cyber btn-cyber-solid w-full sm:w-auto !px-8 !py-4 flex items-center justify-center gap-3 group disabled:opacity-30 disabled:grayscale transition-all duration-300'
            >
              {#if isPurchasing && selectedPackage === 'custom'}
                <Loader2 class='w-5 h-5 animate-spin' />
              {:else}
                <ShoppingCart class='w-5 h-5 group-hover:scale-110 transition-transform' />
              {/if}
              <span class='font-orbitron font-bold uppercase tracking-wider'>Purchase</span>
            </button>
          </div>
        </div>
      </div>

      <div class='mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-obsidian-accent/10 pt-12'>
        <div class='flex gap-4'>
          <div class='p-3 rounded-xl bg-obsidian-surface h-fit'>
            <Zap class='w-6 h-6 text-cyber-cyan' />
          </div>
          <div>
            <h4 class='font-orbitron font-bold text-obsidian-text-muted text-sm mb-1 uppercase tracking-wider'>Instant Delivery</h4>
            <p class='text-xs font-rajdhani text-obsidian-text-primary/50'>Coins are injected into your account core immediately after processing.</p>
          </div>
        </div>
        <div class='flex gap-4'>
          <div class='p-3 rounded-xl bg-obsidian-surface h-fit'>
            <Crown class='w-6 h-6 text-amber-500' />
          </div>
          <div>
            <h4 class='font-orbitron font-bold text-obsidian-text-muted text-sm mb-1 uppercase tracking-wider'>Secure Transfer</h4>
            <p class='text-xs font-rajdhani text-obsidian-text-primary/50'>All transactions are encrypted with 256-bit cyber-mesh protocols.</p>
          </div>
        </div>
        <div class='flex gap-4'>
          <div class='p-3 rounded-xl bg-obsidian-surface h-fit'>
            <Trophy class='w-6 h-6 text-cyber-cyan' />
          </div>
          <div>
            <h4 class='font-orbitron font-bold text-obsidian-text-muted text-sm mb-1 uppercase tracking-wider'>No Expiration</h4>
            <p class='text-xs font-rajdhani text-obsidian-text-primary/50'>Your coins remain valid across all future seasons and simulation resets.</p>
          </div>
        </div>
      </div>
    </div>
  </main>

  <div class='fixed inset-0 pointer-events-none overflow-hidden -z-10'>
    <div class='absolute top-1/4 -right-32 w-96 h-96 rounded-full blur-[150px]' style='background: rgba(255,180,0,0.05);'></div>
    <div class='absolute bottom-1/4 -left-32 w-96 h-96 rounded-full blur-[150px]' style='background: rgba(7,165,201,0.08);'></div>
  </div>
</div>

<style>
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>