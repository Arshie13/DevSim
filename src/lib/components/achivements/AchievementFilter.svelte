<!--
  AchievementFilter.svelte — Tab-style filter for the achievements page.
-->
<script lang="ts">
  export let filter: "default" | "category" | "completed" | "in-progress" = "default";

  const OPTIONS = [
    { value: "default",     label: "Default"     },
    { value: "category",    label: "Category"    },
    { value: "completed",   label: "Completed"   },
    { value: "in-progress", label: "In Progress" },
  ] as const;
</script>

<div class="filter-bar" role="tablist">
  {#each OPTIONS as opt (opt.value)}
    <button
      role="tab"
      aria-selected={filter === opt.value}
      class="filter-btn font-label"
      class:active={filter === opt.value}
      on:click={() => (filter = opt.value)}
    >
      {opt.label}
    </button>
  {/each}
</div>

<style>
  .filter-bar {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .filter-btn {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.35rem 0.9rem;
    border-radius: var(--radius-card);
    border: 1px solid rgb(var(--purple-rgb) / 0.2);
    background: transparent;
    color: rgb(var(--text-primary-rgb) / 0.45);
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }

  .filter-btn:hover {
    border-color: rgb(var(--purple-rgb) / 0.5);
    color: rgb(var(--text-primary-rgb) / 0.85);
  }

  .filter-btn.active {
    border-color: rgb(var(--purple-rgb) / 0.7);
    background: rgb(var(--purple-rgb) / 0.12);
    color: rgb(var(--purple-rgb) / 0.9);
  }
</style>
