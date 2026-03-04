<script lang="ts">
  import type { TechOption } from "$types";
  import { Check } from "lucide-svelte";

  export let option: TechOption;
  export let selected: boolean = false;
  export let onSelect: () => void;
</script>

<button
  on:click={onSelect}
  class="tech-card group relative w-full text-left {selected ? 'selected' : ''}"
>
  <div class="tech-card-inner h-full p-3">
    <!-- Top shimmer line -->
    <div class="shimmer-line"></div>

    <!-- Selection check box (16px square, radius 2px) -->
    <div class="check-box {selected ? 'check-box--active' : ''}">
      {#if selected}
        <Check class="w-2.5 h-2.5" style="color: #0a0e1a;" />
      {/if}
    </div>

    <div class="flex items-center gap-2.5">
      <!-- Icon container -->
      <div class="icon-box flex-shrink-0 text-base w-9 h-9 flex items-center justify-center">
        {option.icon}
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h4 class="card-name truncate">{option.name}</h4>
        <p class="card-desc mt-0.5 line-clamp-2">{option.description}</p>
      </div>
    </div>
  </div>
</button>

<style>
  .tech-card {
    transition: transform 0.18s ease;
  }
  .tech-card:hover {
    transform: translateX(4px);
  }
  .tech-card.selected {
    transform: none;
  }

  .tech-card-inner {
    position: relative;
    overflow: hidden;
    background: #12192a;
    border: 1px solid rgba(7, 165, 201, 0.12);
    border-radius: 4px;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
  }
  .tech-card:hover .tech-card-inner {
    border-color: rgba(7, 165, 201, 0.40);
  }
  .tech-card.selected .tech-card-inner {
    border-color: #07a5c9;
    background: rgba(7, 165, 201, 0.10);
    box-shadow: inset 0 0 20px rgba(7, 165, 201, 0.08), 0 0 12px rgba(7, 165, 201, 0.20);
  }

  /* Top shimmer line — ::before replacement */
  .shimmer-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #07a5c9, transparent);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .tech-card:hover .shimmer-line,
  .tech-card.selected .shimmer-line {
    opacity: 1;
  }

  /* 16×16px square check indicator, radius 2px */
  .check-box {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 16px;
    height: 16px;
    border-radius: 2px;
    border: 1px solid rgba(7, 165, 201, 0.30);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .check-box--active {
    background: #07a5c9;
    border-color: #07a5c9;
  }

  .icon-box {
    background: rgba(7, 165, 201, 0.06);
    border: 1px solid rgba(7, 165, 201, 0.15);
    border-radius: 4px;
  }
  .tech-card.selected .icon-box {
    border-color: rgba(7, 165, 201, 0.35);
    background: rgba(7, 165, 201, 0.12);
  }

  .card-name {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    color: #d0d7dd;
    letter-spacing: 0.04em;
    transition: color 0.15s ease;
  }
  .tech-card:hover .card-name,
  .tech-card.selected .card-name {
    color: #00f5ff;
  }

  .card-desc {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.85rem;
    color: rgba(208, 215, 221, 0.55);
    line-height: 1.35;
  }
</style>
