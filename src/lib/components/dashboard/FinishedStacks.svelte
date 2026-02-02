<script lang="ts">
  import { Trophy, Star, ChevronRight, Coins, Zap } from "lucide-svelte";
  import type { FinishedStack } from "$types";

  export let stacks: FinishedStack[];
  export let maxVisible: number = 2;

  $: visibleStacks = stacks.slice(0, maxVisible);
</script>

<div class="relative bg-obsidian-surface/40 border border-amber-500/25 rounded-xl overflow-hidden shadow-[0_0_35px_rgba(251,191,36,0.1)] hover:shadow-[0_0_45px_rgba(251,191,36,0.18)] transition-shadow duration-500">
  <!-- Top edge glow -->
  <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-text-primary/40 to-transparent"></div>
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-4 border-b border-obsidian-border/60">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
        <Trophy class="w-4 h-4 text-amber-400" />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-obsidian-text-muted">Completed</h3>
        <p class="text-xs text-obsidian-text-primary/50">{stacks.length} stack{stacks.length !== 1 ? 's' : ''} mastered</p>
      </div>
    </div>
    <button
      class="flex items-center gap-1 text-xs text-obsidian-accent hover:text-obsidian-accent/80 transition-colors font-medium"
    >
      See All
      <ChevronRight class="w-3 h-3" />
    </button>
  </div>

  <!-- Completed Stack Cards -->
  <div class="p-4 min-h-[280px] flex flex-col">
    {#if stacks.length > 0}
      <div class="space-y-3">
        {#each visibleStacks as stack}
          <div class="group relative bg-obsidian-bg-light border border-obsidian-border/60 rounded-lg p-4 hover:border-amber-500/30 transition-all duration-300">
            <!-- Success gradient overlay -->
            <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="relative">
                    <span class="text-2xl">{stack.icon}</span>
                    <!-- Completion badge -->
                    <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 class="text-sm font-semibold text-obsidian-text-muted">{stack.name}</h4>
                    <p class="text-xs text-obsidian-text-primary/50">
                      {stack.frontend} • {stack.backend} • {stack.database}
                    </p>
                  </div>
                </div>
                
                <!-- Rating -->
                <div class="flex items-center gap-0.5">
                  {#each Array(5) as _, i}
                    <Star 
                      class="w-3 h-3 {i < stack.rating ? 'text-amber-400 fill-amber-400' : 'text-obsidian-border'}" 
                    />
                  {/each}
                </div>
              </div>

              <!-- Stats Row -->
              <div class="flex items-center gap-4 text-xs">
                <div class="flex items-center gap-1.5 text-obsidian-text-primary/60">
                  <Zap class="w-3 h-3 text-cyan-400" />
                  <span>+{stack.xpEarned.toLocaleString()} XP</span>
                </div>
                <div class="flex items-center gap-1.5 text-obsidian-text-primary/60">
                  <Coins class="w-3 h-3 text-amber-400" />
                  <span>+{stack.coinsEarned}</span>
                </div>
                <div class="ml-auto text-obsidian-text-primary/40">
                  {stack.completedAt}
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center text-obsidian-text-primary/40">
          <p class="text-lg">No completed stacks yet</p>
          <p class="text-md mt-1">Complete your first stack to see it here!</p>
        </div>
      </div>
    {/if}
  </div>
</div>
