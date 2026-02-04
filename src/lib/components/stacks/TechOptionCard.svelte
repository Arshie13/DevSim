<script lang="ts">
  import type { TechOption } from "$types";
  import { Check } from "lucide-svelte";

  export let option: TechOption;
  export let selected: boolean = false;
  export let onSelect: () => void;
</script>

<button
  on:click={onSelect}
  class="group relative w-full text-left transition-all duration-200 {selected
    ? 'scale-[1.01]'
    : 'hover:scale-[1.01]'}"
>
  <!-- Glow effect on selection -->
  {#if selected}
    <div
      class="absolute inset-0 bg-gradient-to-r {option.color} rounded-lg blur-lg opacity-25"
    ></div>
  {/if}

  <div
    class="relative bg-obsidian-surface/80 border rounded-lg p-3 transition-all duration-200 h-full backdrop-blur-sm {selected
      ? 'border-obsidian-accent/50 shadow-[0_0_20px_rgba(7,165,201,0.15)] bg-obsidian-surface'
      : 'border-obsidian-border hover:border-obsidian-accent/30 hover:bg-obsidian-surface'}"
  >
    <!-- Futuristic corner accent -->
    <div class="absolute top-0 right-0 w-6 h-6 overflow-hidden rounded-tr-lg">
      <div class="absolute top-0 right-0 w-[1px] h-3 bg-gradient-to-b {selected ? 'from-obsidian-accent' : 'from-obsidian-border'} to-transparent"></div>
      <div class="absolute top-0 right-0 h-[1px] w-3 bg-gradient-to-l {selected ? 'from-obsidian-accent' : 'from-obsidian-border'} to-transparent"></div>
    </div>

    <!-- Selection indicator -->
    {#if selected}
      <div
        class="absolute top-2 right-2 w-5 h-5 bg-gradient-to-br from-obsidian-accent to-emerald-400 rounded-full flex items-center justify-center shadow-lg"
      >
        <Check class="w-3 h-3 text-white" />
      </div>
    {/if}

    <div class="flex items-center gap-3">
      <!-- Icon -->
      <div
        class="text-lg flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gradient-to-br {option.color} rounded-lg shadow-lg"
      >
        {option.icon}
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h4
          class="text-sm font-semibold text-obsidian-text-muted group-hover:text-white transition-colors"
        >
          {option.name}
        </h4>
        <p class="text-xs text-obsidian-text-primary/60 mt-0.5 line-clamp-2">
          {option.description}
        </p>
      </div>
    </div>
  </div>
</button>
