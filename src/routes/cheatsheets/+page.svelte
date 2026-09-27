<script lang="ts">
  import { ChevronRight, Terminal } from "lucide-svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<svelte:head>
  <title>Cheatsheets | DevSim</title>
</svelte:head>

<div class="mb-8">
  <div class="flex items-center gap-5">
    <div
      class="p-4 rounded-card border text-[var(--accent)]"
      style="background: rgb(var(--accent-rgb) / 0.08); border-color: rgb(var(--accent-rgb) / 0.3)"
    >
      <Terminal size={28} />
    </div>
    <div>
      <h1 class="text-4xl font-heading font-bold text-[var(--text-primary)] tracking-tight mb-1">
        Cheatsheets
      </h1>
      <p class="text-sm font-body text-[var(--text-muted)]">
        Copy-paste snippets for every graded task, grouped by stack, scenario and level.
      </p>
    </div>
  </div>
</div>

{#if data.stacks.length === 0}
  <p class="font-body text-sm text-[var(--text-muted)] rounded-card border border-dashed border-[var(--card-border)] p-5">
    No cheatsheets have been authored yet.
  </p>
{:else}
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
    {#each data.stacks as stack (stack.name)}
      <a
        href={`/cheatsheets/${stack.name}`}
        class="card-cyber block group"
        data-testid="cheatsheet-stack-card"
      >
        <div class="card-cyber-body flex flex-col gap-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h2 class="text-lg font-heading font-semibold text-[var(--text-primary)]">
                {stack.label}
              </h2>
              <p class="font-label text-xs uppercase tracking-wider text-[var(--text-muted)] mt-1">
                {stack.scenarioCount} scenarios
              </p>
            </div>
            <ChevronRight
              size={18}
              class="shrink-0 text-[var(--text-muted)] group-hover:text-obsidian-accent group-hover:translate-x-0.5 transition-all"
            />
          </div>

          <p class="text-sm font-body text-[var(--text-muted)]">{stack.description}</p>

          <div class="flex items-center gap-3">
            <div class="xp-track flex-1">
              <div
                class="xp-fill"
                style={`width: ${stack.progress.total === 0 ? 0 : (stack.progress.authored / stack.progress.total) * 100}%`}
              ></div>
            </div>
            <span class="font-label text-xs text-[var(--text-muted)] shrink-0 tabular-nums">
              {stack.progress.authored} / {stack.progress.total} tasks
            </span>
          </div>
        </div>
      </a>
    {/each}
  </div>
{/if}
