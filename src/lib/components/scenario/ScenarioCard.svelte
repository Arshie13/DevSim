<script lang="ts">
  import type { ScenarioMeta } from '$types';
  import { Star, Layers, ArrowUpRight } from 'lucide-svelte';

  export let scenario: ScenarioMeta;
  export let isSelected: boolean;
  export let onSelect: (id: string) => void;

  function handleClick() {
    onSelect(scenario.id);
  }

  // Map difficulty base word → color token
  const difficultyColors: Record<string, string> = {
    beginner: '#00e5a0',
    easy:     '#00e5a0',
    medium:   '#ffb400',
    hard:     '#ff3860',
    expert:   '#ff3860',
    master:   '#a855f7',
    advanced: '#ffb400',
  };

  $: diffBase = scenario.difficulty.split(/[→\s]/)[0].trim().toLowerCase();
  $: diffColor = difficultyColors[diffBase] ?? '#07a5c9';

  $: shortDesc =
    scenario.description.length > 200
      ? scenario.description.slice(0, 200).trimEnd() + '…'
      : scenario.description;
</script>

<button
  class="card-scenario w-full text-left {isSelected ? 'card-scenario--selected' : ''}"
  on:click={handleClick}
  aria-pressed={isSelected}
  aria-label="Select scenario {scenario.number}: {scenario.title}"
>
  <!-- Left selected-accent bar -->
  {#if isSelected}
    <div class="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--accent)] shadow-[0_0_8px_rgba(7,165,201,0.5)]" aria-hidden="true"></div>
  {/if}

  <div class="p-5 pl-6">
    <!-- Header row: badge + title + chevron -->
    <div class="flex items-start justify-between gap-3 mb-3.5">
      <div class="flex items-center gap-3 min-w-0">
        <!-- Scenario number badge -->
        <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-[4px]
                    bg-[var(--accent)]/10 border border-[var(--accent)]/30" aria-hidden="true">
          <span class="font-label text-[0.72rem] font-bold text-[var(--accent)] tracking-wide">
            S{scenario.number.toString().padStart(2, '0')}
          </span>
        </div>
        <div class="min-w-0">
          <h3 class="font-heading text-base font-semibold text-[var(--text-primary)] tracking-wide
                     leading-tight truncate">
            {scenario.title}
          </h3>
          <p class="font-label text-[0.63rem] text-[var(--text-muted)]/65 uppercase tracking-widest mt-0.5">
            Scenario {scenario.number}
          </p>
        </div>
      </div>
      <!-- Details icon -->
      <div class="details-icon mt-1 flex-shrink-0">
        <ArrowUpRight class="w-4 h-4" />
      </div>
    </div>

    <!-- Description -->
    {#if shortDesc}
      <p class="font-body text-[0.88rem] text-[var(--text-primary)]/60 leading-relaxed mb-4">
        {shortDesc}
      </p>
    {/if}

    <!-- Footer row: difficulty + level count -->
    <div class="flex items-center gap-2.5 flex-wrap">
      <!-- Difficulty tag — dynamic color via inline style -->
      <div
        class="tag-cyber flex items-center gap-1.5"
        style="color:{diffColor}; border:1px solid {diffColor}99; background:{diffColor}18;"
      >
        <Star class="w-3 h-3 flex-shrink-0" />
        <span>{scenario.difficulty}</span>
      </div>

      {#if scenario.hasLevels}
        <div class="tag-cyber flex items-center gap-1.5
                    text-[var(--text-muted)]/75 border border-[var(--text-muted)]/18">
          <Layers class="w-3 h-3 flex-shrink-0" />
          <span>{scenario.levelCount} Level{scenario.levelCount !== 1 ? 's' : ''}</span>
        </div>
      {:else}
        <div class="tag-cyber text-[var(--text-muted)]/50 border border-[var(--text-muted)]/18 opacity-50">
          No levels defined
        </div>
      {/if}
    </div>
  </div>
</button>

<style>
  /* card-scenario wraps card-cyber behaviour but needs shimmer + selected state */
  .card-scenario {
    background: var(--bg-light);
    border: 1px solid var(--card-border);
    border-radius: 4px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    padding: 0;
    transition: border-color 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
  }
  .card-scenario::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  .card-scenario:hover {
    border-color: var(--card-hover);
    transform: translateY(-2px);
    box-shadow: 0 0 25px var(--accent-glow);
  }
  .card-scenario:hover::before,
  .card-scenario--selected::before {
    opacity: 1;
  }
  .card-scenario--selected {
    border-color: var(--accent);
    box-shadow: 0 0 20px rgba(7, 165, 201, 0.25);
  }

  /* Details icon — shows on hover / selected */
  .details-icon {
    color: rgba(136, 146, 160, 0.35);
    transition: color 0.2s ease, transform 0.2s ease;
  }
  .card-scenario:hover .details-icon,
  .card-scenario--selected .details-icon {
    color: var(--accent);
    transform: translate(1px, -1px);
  }
</style>
