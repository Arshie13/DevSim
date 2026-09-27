<script lang="ts">
  import TaskCheatsheetCard from "./TaskCheatsheetCard.svelte";
  import type { CheatsheetLevelView } from "$types/cheatsheets";

  export let level: CheatsheetLevelView;
</script>

<section id={`level-${level.order}`} class="scroll-mt-24">
  <header class="flex items-center gap-3 mb-5">
    <span class="font-label text-xs uppercase tracking-widest text-obsidian-accent shrink-0">
      Level {level.order}
    </span>
    <h2 class="text-xl font-heading font-semibold text-[var(--text-primary)]">{level.title}</h2>
    <span class="h-px flex-1 bg-[var(--card-border)]" aria-hidden="true"></span>
    <span class="font-label text-xs text-[var(--text-muted)] shrink-0">
      {level.tasks.length} {level.tasks.length === 1 ? "entry" : "entries"}
    </span>
  </header>

  {#if level.tasks.length === 0}
    <p class="font-body text-sm text-[var(--text-muted)] rounded-card border border-dashed border-[var(--card-border)] p-5">
      Cheatsheet entries for this level have not been written yet.
    </p>
  {:else}
    <div class="flex flex-col gap-5">
      {#each level.tasks as task}
        <TaskCheatsheetCard {task} />
      {/each}
    </div>
  {/if}
</section>
