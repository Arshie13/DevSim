<script lang="ts">
  import { ArrowLeft, ChevronRight } from "lucide-svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<svelte:head>
  <title>{data.stack.label} cheatsheets | DevSim</title>
</svelte:head>

<a
  href="/cheatsheets"
  class="inline-flex items-center gap-2 font-heading text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors group mb-6"
>
  <ArrowLeft size={14} class="transition-transform group-hover:-translate-x-1" />
  <span>All stacks</span>
</a>

<div class="mb-8">
  <h1 class="text-3xl font-heading font-bold text-[var(--text-primary)] tracking-tight mb-1">
    {data.stack.label}
  </h1>
  <p class="text-sm font-body text-[var(--text-muted)]">{data.stack.description}</p>
</div>

<div class="flex flex-col gap-5">
  {#each data.scenarios as scenario (scenario.ref)}
    <a
      href={`/cheatsheets/${data.stack.name}/${scenario.ref}`}
      class="card-cyber block group"
      data-testid="cheatsheet-scenario-card"
    >
      <div class="card-cyber-body flex flex-col gap-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1.5">
              <span class="tag-cyber tag-purple">{scenario.ref}</span>
              <span class="font-label text-xs text-[var(--text-muted)]">{scenario.folder}</span>
            </div>
            <h2 class="text-lg font-heading font-semibold text-[var(--text-primary)]">
              {scenario.name}
            </h2>
          </div>
          <ChevronRight
            size={18}
            class="shrink-0 text-[var(--text-muted)] group-hover:text-obsidian-accent group-hover:translate-x-0.5 transition-all"
          />
        </div>

        <p class="text-sm font-body text-[var(--text-muted)]">{scenario.description}</p>

        <div class="flex flex-wrap gap-2">
          {#each scenario.levels as level (level.order)}
            <span class="tag-cyber tag-cyan">L{level.order} · {level.title}</span>
          {/each}
        </div>

        <div class="flex items-center gap-3">
          <div class="xp-track flex-1">
            <div
              class="xp-fill"
              style={`width: ${scenario.progress.total === 0 ? 0 : (scenario.progress.authored / scenario.progress.total) * 100}%`}
            ></div>
          </div>
          <span class="font-label text-xs text-[var(--text-muted)] shrink-0 tabular-nums">
            {scenario.progress.authored} / {scenario.progress.total} tasks
          </span>
        </div>
      </div>
    </a>
  {/each}
</div>
