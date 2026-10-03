<!--
  AdminFilterTabs — segmented pill filter used across the admin list pages.

  Options are plain string values so callers can map them straight onto a local
  union type. Optional `count` renders a tabular badge, e.g. "Active 12".
-->
<script lang="ts" context="module">
  export interface FilterOption {
    value: string;
    label: string;
    count?: number;
  }
</script>

<script lang="ts">
  export let options: FilterOption[] = [];
  export let value: string;
  export let label = "Filter";
</script>

<div class="flex flex-wrap items-center gap-2" role="tablist" aria-label={label}>
  {#each options as opt (opt.value)}
    <button
      type="button"
      role="tab"
      aria-selected={value === opt.value}
      class="inline-flex items-center gap-1.5 rounded-card border px-3 py-1.5 font-label text-sm uppercase tracking-[0.04em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-obsidian-accent/50 {value ===
      opt.value
        ? 'border-obsidian-accent/60 bg-obsidian-accent/10 text-obsidian-accent'
        : 'border-[var(--card-border)] text-obsidian-text-muted hover:border-obsidian-accent/40 hover:text-obsidian-text-primary'}"
      on:click={() => (value = opt.value)}
    >
      {opt.label}
      {#if opt.count !== undefined}
        <span
          class="rounded-chrome px-1.5 py-0.5 font-mono text-xs tabular-nums {value ===
          opt.value
            ? 'bg-obsidian-accent/20 text-obsidian-accent'
            : 'bg-obsidian-surface/60 text-obsidian-text-muted'}"
        >
          {opt.count}
        </span>
      {/if}
    </button>
  {/each}
</div>
