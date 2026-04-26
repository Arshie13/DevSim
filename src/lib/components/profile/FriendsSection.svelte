<!--
  FriendsSection.svelte — Rivals grid showing top players by XP.
-->
<script lang="ts">
  import { Users } from "lucide-svelte";
  import type { RivalEntry } from "$types";

  export let rivals: RivalEntry[] = [];

  function isImagePath(avatar: string | null): avatar is string {
    return !!avatar && (avatar.startsWith("/") || /^https?:\/\//i.test(avatar));
  }
</script>

<section
  class="relative flex-1 min-h-0 bg-obsidian-bg-light border border-obsidian-accent/25 rounded-card overflow-hidden shadow-[0_0_30px_rgba(7,165,201,0.15)] hover:shadow-[0_0_40px_rgba(7,165,201,0.25)] transition-shadow duration-500 flex flex-col"
>
  <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-accent/40 to-transparent"></div>

  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-3 border-b border-obsidian-border/60 shrink-0">
    <div class="flex items-center gap-2.5">
      <div class="w-6 h-6 rounded-md bg-obsidian-accent/15 flex items-center justify-center">
        <Users class="w-5 h-5 text-obsidian-accent" />
      </div>
      <h3 class="text-lg font-orbitron font-semibold text-obsidian-text-muted">Rivals</h3>
      <span class="text-[0.6rem] font-mono text-obsidian-text-primary/30 bg-obsidian-bg-light px-1.5 py-0.5 rounded-card">
        {rivals.length}
      </span>
    </div>
    <span class="text-[0.65rem] font-mono text-obsidian-text-primary/40 uppercase tracking-widest">Top players by XP</span>
  </div>

  <!-- Grid -->
  <div class="flex-1 p-3 lg:p-4 flex items-center">
    {#if rivals.length === 0}
      <div class="w-full flex flex-col items-center justify-center gap-3 text-center py-8">
        <div class="w-12 h-12 rounded-card bg-obsidian-accent/10 border border-obsidian-accent/20 flex items-center justify-center">
          <Users class="w-6 h-6 text-obsidian-accent/40" />
        </div>
        <p class="text-sm font-orbitron text-obsidian-text-primary/40 uppercase tracking-wider">No rivals yet</p>
        <p class="text-[0.65rem] font-mono text-obsidian-text-primary/25">Complete scenarios to rank up and find rivals</p>
      </div>
    {:else}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 w-full h-full">
      {#each rivals as rival (rival.id)}
        <button
          class="group relative flex flex-col items-center justify-center gap-3 bg-obsidian-bg-light border border-obsidian-accent/25 rounded-card transition-all duration-300 shadow-[0_0_25px_rgba(7,165,201,0.1)] hover:border-obsidian-accent/50 hover:shadow-[0_0_35px_rgba(7,165,201,0.25)] hover:-translate-y-0.5 cursor-pointer overflow-hidden p-3"
        >
          <!-- Inner glow -->
          <div class="absolute inset-0 bg-gradient-to-br from-obsidian-accent/[0.06] to-transparent"></div>
          <!-- Hover shimmer -->
          <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <!-- Avatar -->
          <div class="relative">
            <div
              class="w-16 h-16 lg:w-24 lg:h-24 xl:w-32 xl:h-32 2xl:w-40 2xl:h-40 bg-gradient-to-br from-obsidian-surface to-obsidian-bg-light border border-obsidian-accent/25 group-hover:border-obsidian-accent/50 rounded-card flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(7,165,201,0.2)] overflow-hidden"
            >
              {#if isImagePath(rival.image)}
                <img
                  src={rival.image}
                  alt={rival.username}
                  class="w-full h-full object-contain"
                  on:error={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              {:else}
                <span class="text-3xl lg:text-5xl xl:text-6xl 2xl:text-8xl">🧑‍💻</span>
              {/if}
            </div>
            <!-- Level badge -->
            <div
              class="absolute -bottom-1.5 -right-1.5 min-w-[2rem] h-[2rem] rounded-card bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-orbitron text-xs font-bold text-white shadow-[0_0_10px_rgba(251,191,36,0.5)] border-2 border-obsidian-surface px-1.5"
            >
              {rival.level}
            </div>
          </div>

          <!-- Name -->
          <span class="relative text-[0.65rem] font-mono uppercase tracking-wide text-obsidian-text-primary/70 group-hover:text-obsidian-accent truncate w-full text-center transition-colors duration-300 px-3">
            {rival.username}
          </span>

          <!-- XP -->
          <span class="relative text-[0.6rem] font-mono text-obsidian-accent/60 group-hover:text-obsidian-accent/90 transition-colors duration-300">
            {rival.xp} XP
          </span>

          <!-- Accent bottom line -->
          <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-obsidian-accent/20 to-transparent opacity-60"></div>
        </button>
      {/each}
    </div>
    {/if}
  </div>
</section>
