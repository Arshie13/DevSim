<!--
  AchievementFilter.svelte — Tab-style filter for the achievements page.
-->
<script lang="ts">
  export let filter: "all" | "completed" | "in-progress" = "all";

  const OPTIONS = [
    { value: "all",         label: "All"         },
    { value: "completed",   label: "Completed"   },
    { value: "in-progress", label: "In Progress" },
  ] as const;
</script>

<div class="filter-bar" role="tablist">
  {#each OPTIONS as opt (opt.value)}
    <button
      role="tab"
      aria-selected={filter === opt.value}
      class="filter-btn"
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
  }

  .filter-btn {
    font-family: "Space Mono", monospace;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.35rem 0.9rem;
    border-radius: 4px;
    border: 1px solid rgba(168, 85, 247, 0.2);
    background: transparent;
    color: rgba(208, 215, 221, 0.45);
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }

  .filter-btn:hover {
    border-color: rgba(168, 85, 247, 0.5);
    color: rgba(208, 215, 221, 0.85);
  }

  .filter-btn.active {
    border-color: rgba(168, 85, 247, 0.7);
    background: rgba(168, 85, 247, 0.12);
    color: #c084fc;
  }
</style>
