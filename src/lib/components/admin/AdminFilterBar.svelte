<!--
  AdminFilterBar — consistent frame for the client-side filters on admin pages.

  Slots:
    - default: search + tab/select controls (wrapped to the left)
    - `actions`: extra controls (e.g. "Expand all"), pushed to the right

  Shows a result counter and, when `active` is set, a Clear button that calls
  `onClear`.
-->
<script lang="ts">
  import { X } from "lucide-svelte";

  export let count: number | null = null;
  export let total: number | null = null;
  export let noun = "result";
  export let active = false;
  export let onClear: (() => void) | undefined = undefined;
</script>

<div
  class="mb-5 rounded-card border border-[var(--card-border)] bg-obsidian-surface/40 p-3"
>
  <div class="flex flex-wrap items-center gap-3">
    <slot />
    <div class="ml-auto flex items-center gap-3">
      <slot name="actions" />
      {#if count !== null}
        <span class="font-mono text-sm tabular-nums text-obsidian-text-muted">
          {count}{#if total !== null && total !== count}<span> / {total}</span>{/if}
          {noun}{count === 1 ? "" : "s"}
        </span>
      {/if}
      {#if active && onClear}
        <button
          type="button"
          on:click={onClear}
          class="btn-cyber btn-cyber-secondary flex items-center gap-1.5 !px-3 !py-1.5"
        >
          <X class="h-3.5 w-3.5" />
          Clear
        </button>
      {/if}
    </div>
  </div>
</div>
