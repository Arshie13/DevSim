<script lang="ts">
  import { Play, Clock, ChevronRight, Container } from "lucide-svelte";
  import { parseStackName } from '$lib/utils/stacks';
  import type { IContainer } from "$types";

  export let containers: IContainer[];
  export let maxVisible: number = 2;

  $: visibleContainers = containers.slice(0, maxVisible);

  function formatLastActive(date: Date | string | undefined): string {
    if (!date) return 'Just now';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return 'Just now';
    const now = new Date().getTime();
    const diff = now - d.getTime();
    if (diff < 0) return 'Just now';

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
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
        <p class="text-xs font-mono text-[var(--text-muted)]">{containers.length} stack{containers.length !== 1 ? 's' : ''}</p>
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
          <div class="bg-obsidian-bg border border-[var(--card-border)] rounded-card p-4 hover:border-[var(--card-hover)] transition-colors duration-300">
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
                        {parseStackName(container.stackName ?? '')}
                      </p>
                    {/if}
                  </div>
                </div>
                <div class="flex items-center gap-1 font-mono text-xs text-[var(--text-muted)]">
                  <Clock class="w-3 h-3" />
                  <span>{formatLastActive(container.updated_at)}</span>
                </div>
              </div>

              <div class="flex justify-between text-xs">
                <span class="font-mono text-[var(--text-muted)]">Level {container.level}</span>
                <span class="tag-cyber tag-cyan">{container.status}</span>
              </div>

              <a href="/workspace/{container.id}" class="btn-cyber btn-cyber-outline w-full mt-3 !py-2 !px-4 flex items-center justify-center gap-2 text-xs">
                <Play class="w-3 h-3" />
                Continue
              </a>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <p class="text-lg font-orbitron text-obsidian-text-primary/40">No stacks in progress</p>
          <a href="/stacks" class="btn-cyber btn-cyber-outline inline-flex items-center gap-2 !px-4 !py-2 mt-4 text-xs">
            <Play class="w-3 h-3" />
            Start a Stack
          </a>
        </div>
      </div>
    {/if}
  </div>
</div>
