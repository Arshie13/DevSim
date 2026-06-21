<script lang="ts">
  import { Trophy, Search, Users, Filter, ArrowLeft } from "lucide-svelte";
  import { fade, fly } from "svelte/transition";
  import Header from "$lib/components/Header.svelte";
  import RivalCard from "$lib/components/rivals/RivalCard.svelte";
  import type { UserData } from "$types";

  export let data: {
    rivals: any[];
    user: UserData;
    userCoins: number;
  };

  let searchQuery = "";
  let filterType: "all" | "top" | "friends" = "all";

  $: filteredRivals = data.rivals.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  let headerUserData: UserData = {
    ...data.user,
    coins: data.userCoins
  };

  function goBack() {
    window.history.back();
  }
</script>

<svelte:head>
  <title>Rivals | DevSim</title>
</svelte:head>

<div class="min-h-screen bg-obsidian-bg scanlines ambient-glow bg-grid-cyber">
  <Header userData={headerUserData} />

  <main class="relative z-10 py-8 lg:py-12">
    <div class="max-w-[1200px] mx-auto px-6">
      
      <!-- Top Actions -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div in:fade={{ duration: 400 }}>
          <button 
            on:click={goBack}
            class="flex items-center gap-2 text-obsidian-text-primary/50 hover:text-obsidian-accent transition-colors mb-4 group font-mono text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={14} class="transition-transform group-hover:-translate-x-1" />
            Back to Simulation
          </button>
          <div class="flex items-center gap-4 mb-2">
            <div class="p-3 rounded-card bg-obsidian-accent/10 border border-obsidian-accent/30 text-obsidian-accent">
              <Users size={24} />
            </div>
            <div>
              <h1 class="text-3xl font-orbitron font-bold text-obsidian-text-muted tracking-tight">Rivals</h1>
              <p class="text-sm font-rajdhani text-obsidian-text-primary/50">Benchmark your progress against the world's top developers.</p>
            </div>
          </div>
        </div>

        <!-- Search & Filter -->
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto" in:fade={{ delay: 100, duration: 400 }}>
          <div class="relative flex-1 sm:w-64 lg:w-80">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-text-primary/30" size={18} />
            <input 
              type="text" 
              bind:value={searchQuery}
              placeholder="Search by name or username..."
              class="w-full bg-obsidian-bg-light/60 border border-obsidian-accent/20 rounded-card py-3 pl-10 pr-4 text-sm text-obsidian-text-muted focus:outline-none focus:border-obsidian-accent/50 focus:ring-1 focus:ring-obsidian-accent/30 transition-all font-rajdhani"
            />
          </div>
          <div class="flex border border-obsidian-accent/20 rounded-card overflow-hidden h-[46px]">
             <button 
               class="px-4 text-xs font-orbitron transition-all {filterType === 'all' ? 'bg-obsidian-accent text-obsidian-bg' : 'text-obsidian-text-primary/60 hover:bg-obsidian-accent/10'}"
               on:click={() => filterType = 'all'}
             >
               GLOBAL
             </button>
             <button 
               class="px-4 text-xs font-orbitron transition-all {filterType === 'top' ? 'bg-obsidian-accent text-obsidian-bg' : 'text-obsidian-text-primary/60 hover:bg-obsidian-accent/10'}"
               on:click={() => filterType = 'top'}
             >
               TOP 10
             </button>
          </div>
        </div>
      </div>

      <!-- Main Rivals Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredRivals as rival, index (rival.id)}
          <div in:fly={{ y: 20, delay: 50 * index, duration: 500 }}>
             <RivalCard {rival} />
          </div>
        {:else}
          <div class="col-span-full py-20 flex flex-col items-center justify-center opacity-50" in:fade>
            <Users size={64} class="mb-4 text-obsidian-text-primary/20" />
            <p class="font-orbitron text-lg text-obsidian-text-primary/40 uppercase tracking-widest">No rivals found matching your criteria</p>
          </div>
        {/each}
      </div>

    </div>
  </main>

  <!-- Ambient Background Effects (Consistent with Dashboard) -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <div class="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[120px]" style="background: rgba(7,165,201,0.12);"></div>
    <div class="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[120px]" style="background: rgba(168,85,247,0.08);"></div>
  </div>
</div>

<style>
  /* Scanline effect override if needed */
  :global(.scanlines::before) {
    opacity: 0.03;
  }
</style>
