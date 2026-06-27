<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { Play, Clock, ChevronRight, Container, Archive } from "lucide-svelte";
  import { parseStackName } from '$lib/utils/stacks';
  import type { IContainer } from "$types";

  export let containers: IContainer[];
  export let currentStacks: IContainer[];
  export let maxVisible: number = 2;

  let archivedIds = new Set<string>();

  $: visibleContainers = containers.filter(c => !archivedIds.has(c.id)).slice(0, maxVisible);

  let archivingId: string | null = null;

  async function handleArchive(container: IContainer) {
    archivingId = container.id;
    archivedIds.add(container.id);
    try {
      await fetch(`/api/docker/container/${container.id}/archive`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isComplete: false })
      });
    } catch {
      // ponytail: network errors (HMR, etc.) don't matter — server still processed it
    }
    archivingId = null;
    await invalidateAll();
  }

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
</script>

<div class="card-cyber shadow-card-glow hover:shadow-card-glow-hover transition-shadow duration-500">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-card bg-obsidian-accent/15 flex items-center justify-center border border-obsidian-accent/30">
        <Play class="w-4 h-4 text-obsidian-accent" />
      </div>
      <div>
        <h3 class="text-sm font-orbitron font-bold text-obsidian-text-muted">In Progress</h3>
        <p class="text-xs font-mono text-[var(--text-muted)]">{containers.length} active container{containers.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
    <a
      href="/projects?view=current"
      class="tag-cyber tag-cyan flex items-center gap-1 hover:bg-obsidian-accent/15 transition-colors cursor-pointer"
    >
      See All
      <ChevronRight class="w-3 h-3" />
    </a>
  </div>

    <!-- Stack Cards -->
  <div class="p-4 min-h-[280px] flex flex-col">
    {#if containers.length > 0}
      <div class="space-y-3">
        {#each visibleContainers as container}
          <div class="group relative bg-obsidian-bg border border-[var(--card-border)] rounded-card p-4 hover:border-[var(--card-hover)] transition-all duration-300 hover:translate-x-1">
            <!-- Hover glow -->
            <div class="absolute inset-0 rounded-card bg-obsidian-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <!-- Top shimmer -->
            <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-card bg-obsidian-accent/10 border border-obsidian-accent/25 flex items-center justify-center text-obsidian-accent">
                    <Container class="w-5 h-5" />
                  </div>
                  <div>
                    <h4 class="text-sm font-orbitron font-semibold text-obsidian-text-muted">
                      {container.scenario.name}
                    </h4>
                    {#if container.scenario.name}
                      <p class="text-xs font-mono text-[var(--accent)] opacity-70 mt-0.5 truncate">
                        {parseStackName(container.workspace_stacks ?? container.containerStacks ?? [])}
                      </p>
                    {/if}
                    <p class="text-xs font-mono text-[var(--text-muted)] mt-0.5">
                      Level {container.level} • {container.status}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-1 font-mono text-xs text-[var(--text-muted)]">
                  <Clock class="w-3 h-3" />
                  <span>{formatLastActive(container.status)}</span>
                </div>
              </div>

              <!-- Progress (XP bar style) -->
              <div class="mb-2">
                <div class="flex justify-between text-xs mb-1.5">
                  <span class="font-mono text-[var(--text-muted)]">Level {container.level}</span>
                  <span class="tag-cyber tag-cyan">{container.status}</span>
                </div>
                <div class="xp-track">
                  <div 
                    class="xp-fill"
                    style="width: {container.status === 'running' ? 100 : 50}%"
                  ></div>
                </div>
              </div>

              <!-- Continue Button (clip-path) -->
              <a href="/workspace/{container.id}" class="btn-cyber btn-cyber-outline w-full mt-3 !py-2 !px-4 flex items-center justify-center gap-2 text-xs">
                <Play class="w-3 h-3" />
                Continue Sprint
              </a>

              <!-- Archive Button -->
              <button
                on:click={() => handleArchive(container)}
                disabled={archivingId === container.id}
                class="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-cyber-warn/10 border border-cyber-warn/25 text-cyber-warn text-xs rounded hover:bg-cyber-warn/20 hover:border-cyber-warn/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {#if archivingId === container.id}
                  <span class="inline-block w-3 h-3 border-2 border-cyber-warn/40 border-t-cyber-warn rounded-full animate-spin"></span>
                  Archiving...
                {:else}
                  <Archive class="w-3 h-3" />
                  Archive
                {/if}
              </button>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <p class="text-lg font-orbitron text-obsidian-text-primary/40">No stacks in progress</p>
          {#if currentStacks.length > 0}
            <p class="text-md font-rajdhani text-[var(--text-muted)] mt-1">Browse available stacks to start learning!</p>
          {:else}
            <p class="text-md font-rajdhani text-[var(--text-muted)] mt-1">Start a new stack to begin your journey!</p>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
