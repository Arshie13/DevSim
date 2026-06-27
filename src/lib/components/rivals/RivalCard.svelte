<script lang="ts">
  import { Award, Code, Zap, Trophy } from "lucide-svelte";
  import type { RivalEntry } from "$lib/types/dashboard";

  export let rival: RivalEntry & {
    completedProjects: number;
    achievementsCount: number;
    isCurrentUser?: boolean;
  };
</script>

<a
  href="/rivals/{rival.username}"
  class="relative block overflow-hidden rounded-card border transition-all duration-300 group
    {rival.isCurrentUser
      ? 'border-obsidian-accent bg-obsidian-accent/5 shadow-[0_0_20px_rgba(7,165,204,0.15)]'
      : 'border-obsidian-accent/10 bg-obsidian-bg-light/40 hover:border-obsidian-accent/30 hover:bg-obsidian-bg-light/60 hover:shadow-lg hover:-translate-y-1'}"
>
  <!-- Background Decor -->
  <div class="absolute -right-4 -top-4 text-obsidian-accent/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
    <Trophy size={100} />
  </div>

  <div class="p-5">
    <div class="flex items-start justify-between mb-6">
      <div class="flex items-center gap-4">
        <!-- Avatar/Rank Section -->
        <div class="relative">
          <div
            class="w-16 h-16 rounded-full border-2 border-obsidian-border bg-obsidian-surface flex items-center justify-center overflow-hidden
              {rival.isCurrentUser ? 'border-obsidian-accent shadow-[0_0_15px_rgba(7,165,204,0.3)]' : ''}"
          >
            {#if rival.image}
              <img src={rival.image} alt={rival.name} class="w-full h-full object-cover" />
            {:else}
              <span class="text-2xl font-orbitron font-bold text-obsidian-accent">
                {rival.name[0].toUpperCase()}
              </span>
            {/if}
          </div>

        </div>

        <div>
          <h3 class="text-lg font-orbitron font-bold text-obsidian-text-muted transition-colors group-hover:text-obsidian-accent">
            {rival.name}
            {#if rival.isCurrentUser}
              <span class="ml-2 text-[0.6rem] font-mono px-2 py-0.5 rounded border border-obsidian-accent/30 bg-obsidian-accent/10 text-obsidian-accent align-middle">YOU</span>
            {/if}
          </h3>
          <p class="text-xs font-mono text-obsidian-text-primary/50 tracking-wider">@{rival.username}</p>
        </div>
      </div>

      <div class="flex flex-col items-end">
        <div class="flex items-center gap-1.5 text-cyber-cyan">
          <Zap size={14} fill="currentColor" />
          <span class="text-sm font-orbitron font-bold">{rival.xp.toLocaleString()} XP</span>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-3 mb-1">
      <div class="bg-obsidian-bg/40 rounded p-3 border border-obsidian-accent/5">
        <div class="flex items-center gap-2 mb-1">
          <Code size={14} class="text-obsidian-accent" />
           <span class="text-[0.6rem] font-mono text-obsidian-text-primary/50 uppercase tracking-tighter">Projects</span>
        </div>
        <div class="text-xl font-orbitron font-bold text-obsidian-text-muted">
          {rival.completedProjects}
        </div>
      </div>

      <div class="bg-obsidian-bg/40 rounded p-3 border border-obsidian-accent/5">
        <div class="flex items-center gap-2 mb-1">
          <Award size={14} class="text-obsidian-accent" />
          <span class="text-[0.6rem] font-mono text-obsidian-text-primary/50 uppercase tracking-tighter">Awards</span>
        </div>
        <div class="text-xl font-orbitron font-bold text-obsidian-text-muted">
          {rival.achievementsCount}
        </div>
      </div>
    </div>
  </div>

  <!-- Progress Bar (Subtle decoration) -->
  <div class="absolute bottom-0 left-0 h-0.5 bg-obsidian-accent transition-all duration-500 ease-out" style="width: {(rival.xp % 1000) / 10}%"></div>
</a>
