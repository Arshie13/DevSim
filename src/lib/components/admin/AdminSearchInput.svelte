<!--
  AdminSearchInput — bordered search field with a leading icon and a clear button.

  Purely client-side: bind:value and filter in the consuming page's reactive
  statements. Kept tiny so every admin list page shares the exact same search UX.
-->
<script lang="ts">
  import { Search, X } from "lucide-svelte";

  export let value = "";
  export let placeholder = "Search…";
  export let label = "Search";
  export let inputId: string | undefined = undefined;
</script>

<div class="relative w-full min-w-[16rem] flex-1">
  <Search
    class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-obsidian-text-muted"
  />
  <input
    id={inputId}
    type="search"
    bind:value
    {placeholder}
    aria-label={label}
    autocomplete="off"
    class="w-full rounded-card border border-[var(--card-border)] bg-obsidian-surface/40 py-2 pl-9 pr-9 font-body text-base text-obsidian-text-primary placeholder:text-obsidian-text-muted focus:border-obsidian-accent/50 focus:outline-none"
  />
  {#if value}
    <button
      type="button"
      on:click={() => (value = "")}
      aria-label="Clear search"
      class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-obsidian-text-muted transition-colors hover:text-obsidian-text-primary"
    >
      <X class="h-4 w-4" />
    </button>
  {/if}
</div>
