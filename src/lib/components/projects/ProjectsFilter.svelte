<script lang="ts">
  import { Layers, Trophy } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";

  export let view: "current" | "finished" = "current";
  export let currentCount: number = 0;
  export let finishedCount: number = 0;

  const dispatch = createEventDispatcher<{ change: "current" | "finished" }>();

  function select(next: "current" | "finished") {
    if (next === view) return;
    view = next;
    dispatch("change", next);
  }
</script>

<div class="filter-bar" role="tablist" aria-label="Projects view filter">
  <button
    role="tab"
    aria-selected={view === "current"}
    class="filter-btn"
    class:active={view === "current"}
    on:click={() => select("current")}
  >
    <Layers class="w-3.5 h-3.5" />
    <span>Current</span>
    <span class="count">{currentCount}</span>
  </button>

  <button
    role="tab"
    aria-selected={view === "finished"}
    class="filter-btn"
    class:active={view === "finished"}
    on:click={() => select("finished")}
  >
    <Trophy class="w-3.5 h-3.5" />
    <span>Finished</span>
    <span class="count">{finishedCount}</span>
  </button>
</div>

<style>
  .filter-bar {
    display: inline-flex;
    gap: 0.5rem;
    padding: 0.35rem;
    background: rgba(10, 14, 26, 0.6);
    border: 1px solid var(--card-border);
    border-radius: 4px;
    backdrop-filter: blur(6px);
  }

  .filter-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0.55rem 1rem;
    border-radius: 3px;
    border: 1px solid transparent;
    background: transparent;
    color: rgba(208, 215, 221, 0.55);
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }

  .filter-btn:hover {
    color: var(--text-primary);
    border-color: rgba(7, 165, 201, 0.25);
    background: rgba(7, 165, 201, 0.06);
  }

  .filter-btn.active {
    color: var(--accent);
    border-color: rgba(7, 165, 201, 0.6);
    background: rgba(7, 165, 201, 0.12);
    box-shadow: 0 0 14px rgba(7, 165, 201, 0.18);
  }

  .count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.1rem;
    padding: 0 0.4rem;
    border-radius: 999px;
    background: rgba(7, 165, 201, 0.1);
    border: 1px solid rgba(7, 165, 201, 0.25);
    font-size: 0.62rem;
    color: rgba(208, 215, 221, 0.85);
  }

  .filter-btn.active .count {
    background: rgba(7, 165, 201, 0.22);
    border-color: rgba(7, 165, 201, 0.55);
    color: var(--accent);
  }
</style>
