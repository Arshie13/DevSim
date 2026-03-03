<script lang="ts">
  import type { TechCategory, TechOption } from "$types";
  import TechOptionCard from "./TechOptionCard.svelte";

  export let category: TechCategory;
  export let selectedId: string | null = null;
  export let onSelect: (optionId: string) => void;

  function handleSelect(option: TechOption) {
    onSelect(option.id);
  }

  // Per design spec: ◈ icon color per layer
  const layerColors: Record<string, string> = {
    frontend: '#07a5c9',
    backend:  '#ffb400',
    database: '#00e5a0',
    services: '#a855f7',
  };
  $: diamondColor = layerColors[category.id] ?? '#07a5c9';
</script>

<div class="category-section mb-8">
  <!-- Category header -->
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center gap-3">
      <!-- Diamond prefix icon + category icon -->
      <div class="icon-wrap flex items-center justify-center text-base w-9 h-9 relative">
        {category.icon}
        <!-- Corner tick marks -->
        <span class="corner-tl" style="border-color: {diamondColor};"></span>
        <span class="corner-br" style="border-color: {diamondColor};"></span>
      </div>

      <div>
        <h3 class="cat-name">
          <span class="diamond" style="color: {diamondColor};">◈</span>
          {category.name}
        </h3>
        <p class="cat-desc">{category.description}</p>
      </div>
    </div>

    <!-- Optional badge — Share Tech Mono tag style -->
    <span class="opt-tag">Optional</span>
  </div>

  <!-- Options grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
    {#each category.options as option (option.id)}
      <TechOptionCard
        {option}
        selected={selectedId === option.id}
        onSelect={() => handleSelect(option)}
      />
    {/each}
  </div>
</div>

<style>
  .icon-wrap {
    position: relative;
    background: #12192a;
    border: 1px solid rgba(7, 165, 201, 0.18);
    border-radius: 4px;
  }
  .corner-tl {
    position: absolute;
    top: -1px;
    left: -1px;
    width: 6px;
    height: 6px;
    border-top: 1px solid;
    border-left: 1px solid;
    border-radius: 1px 0 0 0;
  }
  .corner-br {
    position: absolute;
    bottom: -1px;
    right: -1px;
    width: 6px;
    height: 6px;
    border-bottom: 1px solid;
    border-right: 1px solid;
    border-radius: 0 0 1px 0;
  }

  .cat-name {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: #d0d7dd;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .diamond {
    font-size: 0.9rem;
  }

  .cat-desc {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.78rem;
    color: rgba(208, 215, 221, 0.50);
    margin-top: 1px;
  }

  /* Share Tech Mono tag — muted style */
  .opt-tag {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.2rem 0.6rem;
    border-radius: 2px;
    color: rgba(208, 215, 221, 0.40);
    border: 1px solid rgba(208, 215, 221, 0.12);
    background: transparent;
  }
</style>
