<script lang="ts">
  import { ArrowLeft } from "lucide-svelte";
  import LevelSection from "$lib/components/cheatsheets/LevelSection.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<svelte:head>
  <title>{data.scenario.name} cheatsheet | DevSim</title>
</svelte:head>

<a
  href={`/cheatsheets/${data.stack.name}`}
  class="inline-flex items-center gap-2 font-heading text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors group mb-6"
>
  <ArrowLeft size={14} class="transition-transform group-hover:-translate-x-1" />
  <span>{data.stack.label}</span>
</a>

<div class="mb-8">
  <div class="flex flex-wrap items-center gap-2 mb-1.5">
    <span class="tag-cyber tag-purple">{data.scenario.ref}</span>
    <span class="font-label text-xs text-[var(--text-muted)]">{data.scenario.folder}</span>
  </div>
  <h1 class="text-3xl font-heading font-bold text-[var(--text-primary)] tracking-tight mb-1">
    {data.scenario.name}
  </h1>
  <p class="text-sm font-body text-[var(--text-muted)]">{data.scenario.description}</p>
  <p class="font-label text-xs text-[var(--text-muted)] mt-2 tabular-nums">
    {data.progress.authored} / {data.progress.total} tasks authored
  </p>
</div>

<div class="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-8 items-start">
  <aside class="hidden lg:block sticky top-24">
    <p class="font-label text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3">
      Jump to level
    </p>
    <nav class="flex flex-col gap-1">
      {#each data.levels as level (level.order)}
        <a
          href={`#level-${level.order}`}
          class="flex items-center gap-2 px-3 py-2 rounded-card font-body text-sm text-[var(--text-muted)] hover:text-obsidian-accent hover:bg-obsidian-accent/5 transition-all"
        >
          <span class="font-label text-xs text-obsidian-accent shrink-0">{level.order}</span>
          <span class="truncate">{level.title}</span>
        </a>
      {/each}
    </nav>
  </aside>

  <div class="flex flex-col gap-8 min-w-0">
    {#each data.levels as level (level.order)}
      <LevelSection {level} />
    {/each}
  </div>
</div>
