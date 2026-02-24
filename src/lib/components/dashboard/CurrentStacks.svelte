<script lang="ts">
  import { Play, Clock, ChevronRight, Container } from "lucide-svelte";
  import type { Container as ContainerType } from '$prismaclient';

  export let containers: ContainerType[];
  export let finishedStacks: any[] = [];
  export let maxVisible: number = 2;

  $: visibleContainers = containers.slice(0, maxVisible);

  // Helper to format date
  function formatLastActive(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  }

  // Get display name from stacks array
  function getStackName(stacks: string[]): string {
    return stacks.length > 0 ? stacks.join(' + ') : 'Unknown Stack';
  }
</script>

<div class="relative bg-obsidian-surface/40 border border-obsidian-accent/25 rounded-xl overflow-hidden shadow-[0_0_35px_rgba(7,165,201,0.12)] hover:shadow-[0_0_45px_rgba(7,165,201,0.2)] transition-shadow duration-500">
  <!-- Top edge glow -->
  <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-text-primary/40 to-transparent"></div>
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-4 border-b border-obsidian-border/60">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-obsidian-accent/20 flex items-center justify-center">
        <Play class="w-4 h-4 text-obsidian-accent" />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-obsidian-text-muted">In Progress</h3>
        <p class="text-xs text-obsidian-text-primary/50">{containers.length} active container{containers.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
    <button
      class="flex items-center gap-1 text-xs text-obsidian-accent hover:text-obsidian-accent/80 transition-colors font-medium"
    >
      See All
      <ChevronRight class="w-3 h-3" />
    </button>
  </div>

    <!-- Stack Cards -->
  <div class="p-4 min-h-[280px] flex flex-col">
    {#if containers.length > 0}
      <div class="space-y-3">
        {#each visibleContainers as container}
          <div class="group relative bg-obsidian-bg-light border border-obsidian-border/60 rounded-lg p-4 hover:border-obsidian-accent/30 transition-all duration-300">
            <!-- Hover glow -->
            <div class="absolute inset-0 rounded-lg bg-obsidian-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-obsidian-accent/20 flex items-center justify-center text-obsidian-accent">
                    <Container class="w-5 h-5" />
                  </div>
                  <div>
                    <h4 class="text-sm font-semibold text-obsidian-text-muted">{getStackName(container.stacks)}</h4>
                    <p class="text-xs text-obsidian-text-primary/50">
                      Level {container.level} • {container.status}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-1 text-xs text-obsidian-text-primary/40">
                  <Clock class="w-3 h-3" />
                  <span>{formatLastActive(container.startedAt)}</span>
                </div>
              </div>

              <!-- Progress (showing level as progress) -->
              <div class="mb-2">
                <div class="flex justify-between text-xs mb-1.5">
                  <span class="text-obsidian-text-primary/60">Level {container.level}</span>
                  <span class="text-obsidian-accent font-medium">{container.status}</span>
                </div>
                <div class="h-2 bg-obsidian-border rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-obsidian-accent to-cyan-400 rounded-full transition-all duration-500"
                    style="width: {container.status === 'running' ? 100 : 50}%"
                  ></div>
                </div>
              </div>

              <!-- Continue Button -->
              <a href="/workspace/{container.id}" class="w-full mt-3 py-2 px-4 bg-obsidian-accent/10 border border-obsidian-accent/30 rounded-lg text-xs font-medium text-obsidian-accent hover:bg-obsidian-accent/20 transition-all flex items-center justify-center gap-2">
                <Play class="w-3 h-3" />
                Continue Sprint
              </a>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center text-obsidian-text-primary/40">
          <p class="text-lg">No stacks in progress</p>
          {#if finishedStacks.length > 0}
            <p class="text-md mt-1">Browse available stacks to start learning!</p>
          {:else}
            <p class="text-md mt-1">Start a new stack to begin your journey!</p>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
