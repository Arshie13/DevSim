<script lang="ts">
  import type { TechCategory, TechOption } from "$types";
  import TechOptionCard from "./TechOptionCard.svelte";

  export let category: TechCategory;
  export let selectedId: string | null = null;
  export let onSelect: (optionId: string) => void;

  function handleSelect(option: TechOption) {
    onSelect(option.id);
  }
</script>

<div class="mb-8">
  <!-- Category Header with futuristic line -->
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center gap-3">
      <div
        class="relative w-9 h-9 bg-obsidian-surface border border-obsidian-border rounded-lg flex items-center justify-center text-lg"
      >
        {category.icon}
        <!-- Corner accents -->
        <div class="absolute -top-px -left-px w-1.5 h-1.5 border-t border-l border-obsidian-accent/50 rounded-tl-md"></div>
        <div class="absolute -bottom-px -right-px w-1.5 h-1.5 border-b border-r border-obsidian-accent/50 rounded-br-md"></div>
      </div>
      <div>
        <h3 class="text-base font-bold text-obsidian-text-muted">{category.name}</h3>
        <p class="text-xs text-obsidian-text-primary/60">{category.description}</p>
      </div>
    </div>
    <!-- Optional badge -->
    <span class="text-[10px] text-obsidian-text-primary/40 uppercase tracking-wider px-2 py-0.5 border border-obsidian-border rounded-full">Optional</span>
  </div>

  <!-- Options Grid - 5 columns for optimal layout -->
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
