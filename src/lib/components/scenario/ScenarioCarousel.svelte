<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';
  import type { ScenarioMeta } from '$types';
  import ScenarioCard from './ScenarioCard.svelte';
  import PreviewImages from './PreviewImages.svelte';

  export let scenarios: ScenarioMeta[];
  export let isLoading: boolean = false;
  export let activeIndex: number = 0;

  const dispatch = createEventDispatcher<{
    launchSprint: void;
  }>();

  let isTransitioning = false;
  let glitching = false;

  // Preview modal state
  let previewOpen = false;
  let previewImages: string[] = [];
  let previewInitialIndex = 0;

  function openPreviewModal(images: string[], initialIndex: number = 0) {
    previewImages = images;
    previewInitialIndex = initialIndex;
    previewOpen = true;
  }

  function closePreviewModal() {
    previewOpen = false;
  }

  const difficultyColors: Record<string, string> = {
    beginner: '#00e5a0', easy: '#00e5a0', medium: '#ffb400',
    hard: '#ff3860', expert: '#ff3860', master: '#a855f7', advanced: '#ffb400',
  };

  function getDiffColor(difficulty: string): string {
    const base = difficulty.split(/[→\s]/)[0].trim().toLowerCase();
    return difficultyColors[base] ?? '#07a5c9';
  }

  function triggerGlitch() {
    glitching = true;
    setTimeout(() => { glitching = false; }, 200);
  }

  function navigate(dir: -1 | 1) {
    if (isTransitioning) return;
    const n = scenarios.length;
    const next = (activeIndex + dir + n) % n;
    triggerGlitch();
    isTransitioning = true;
    setTimeout(() => { activeIndex = next; }, 80);
    setTimeout(() => { isTransitioning = false; }, 550);
  }

  function goTo(idx: number) {
    if (idx === activeIndex || isTransitioning) return;
    triggerGlitch();
    isTransitioning = true;
    setTimeout(() => { activeIndex = idx; }, 80);
    setTimeout(() => { isTransitioning = false; }, 550);
  }

  /** Shortest-path signed distance around the ring */
  function wrapDist(i: number, active: number, n: number): number {
    let d = (i - active + n) % n;
    if (d > n / 2) d -= n;
    return d;
  }

  /** CSS transform for a card at `dist` positions from active */
  function getCardTransform(dist: number): string {
    if (dist === 0)  return 'translateX(-50%) translateY(-50%) rotateY(0deg) scale(1)';
    if (dist === 1)  return 'translateX(calc(-50% + 300px)) translateY(-50%) rotateY(-44deg) scale(0.78)';
    if (dist === -1) return 'translateX(calc(-50% - 300px)) translateY(-50%) rotateY(44deg) scale(0.78)';
    const dir = Math.sign(dist);
    return `translateX(calc(-50% + ${dir * 660}px)) translateY(-50%) rotateY(${dir > 0 ? -60 : 60}deg) scale(0.5)`;
  }

  onMount(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate(-1);
      else if (e.key === 'ArrowRight') navigate(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });
</script>

<div class="relative w-full pb-10" style="overflow-x: hidden;">

  <!-- Glitch flash overlay -->
  <div class="glitch-flash" class:flashing={glitching} aria-hidden="true"></div>

  <!-- 3D Carousel scene (nav arrows live inside for correct vertical centering) -->
  <div class="carousel-scene" aria-live="polite" aria-atomic="true">

    <!-- Left arrow -->
    <button
      class="nav-arrow left-[calc(50%-360px)] w-12 h-12 flex items-center justify-center
             bg-[rgba(7,165,201,0.14)] border border-[rgba(7,165,201,0.55)]
             text-[#07a5c9] rounded-sm shadow-[0_0_18px_rgba(7,165,201,0.3)]
             hover:bg-[rgba(7,165,201,0.26)] hover:border-[rgba(7,165,201,0.8)]
             hover:shadow-[0_0_28px_rgba(7,165,201,0.5)]
             disabled:opacity-20 disabled:cursor-not-allowed"
      on:click={() => navigate(-1)}
      disabled={isTransitioning}
      aria-label="Previous scenario"
    >
      <ChevronLeft class="w-8 h-8" />
    </button>

    <!-- Right arrow -->
    <button
      class="nav-arrow right-[calc(50%-360px)] w-12 h-12 flex items-center justify-center
             bg-[rgba(7,165,201,0.14)] border border-[rgba(7,165,201,0.55)]
             text-[#07a5c9] rounded-sm shadow-[0_0_18px_rgba(7,165,201,0.3)]
             hover:bg-[rgba(7,165,201,0.26)] hover:border-[rgba(7,165,201,0.8)]
             hover:shadow-[0_0_28px_rgba(7,165,201,0.5)]
             disabled:opacity-20 disabled:cursor-not-allowed"
      on:click={() => navigate(1)}
      disabled={isTransitioning}
      aria-label="Next scenario"
    >
      <ChevronRight class="w-8 h-8" />
    </button>

    {#each scenarios as scenario, i (scenario.id)}
      {@const dist = wrapDist(i, activeIndex, scenarios.length)}
      {@const diffColor = getDiffColor(scenario.difficulty)}
      <ScenarioCard
        {scenario}
        isActive={dist === 0}
        {dist}
        transform={getCardTransform(dist)}
        {diffColor}
        {isLoading}
        on:launchSprint={() => dispatch('launchSprint')}
        on:select={() => goTo(i)}
        // on:requestSkipConfirm={() => dispatch('requestSkipConfirm')}
        on:openPreview={(e) => openPreviewModal(e.detail.images, e.detail.initialIndex)}
      />
    {/each}

  </div>

  <!-- Dot indicators -->
  <div class="flex justify-center gap-2.5 mt-2" role="tablist" aria-label="Scenario navigation">
    {#each scenarios as scenario, i}
      <button
        class="dot {i === activeIndex ? 'dot--active' : ''}"
        on:click={() => goTo(i)}
        role="tab"
        aria-selected={i === activeIndex}
        aria-label="Scenario {i + 1}: {scenario.title}"
      ></button>
    {/each}
  </div>

  <!-- Keyboard hint -->
  <p class="text-center font-mono text-[0.68rem] text-[rgba(208,215,221,0.25)] mt-3.5 tracking-[0.04em]" aria-hidden="true">
    <kbd class="bg-white/5 border border-white/10 rounded-sm px-[5px] text-[0.65rem]">←</kbd>
    <kbd class="bg-white/5 border border-white/10 rounded-sm px-[5px] text-[0.65rem]">→</kbd>
    to navigate
  </p>

  <!-- Preview Modal -->
  <PreviewImages 
    images={previewImages}
    alt="Scenario preview"
    initialIndex={previewInitialIndex}
    showInline={false}
  />
</div>

<style>
  /* ── 3D Carousel scene ───────────────────────────────────────── */
  .carousel-scene {
    perspective: 1200px;
    perspective-origin: 50% 40%;
    position: relative;
    height: 360px;
    margin: 16px 0 12px;
  }

  /* ── Nav arrows ──────────────────────────────────────────────── */
  .nav-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
    clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
  }

  /* ── Glitch flash ────────────────────────────────────────────── */
  .glitch-flash {
    position: absolute;
    inset: 0;
    z-index: 30;
    pointer-events: none;
    opacity: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(7,165,201,0.04) 4px);
    mix-blend-mode: screen;
    transition: opacity 0.05s;
  }
  .glitch-flash.flashing { opacity: 1; animation: glitch-frames 0.18s steps(4) forwards; }

  @keyframes glitch-frames {
    0%   { opacity: 1; clip-path: inset(15% 0 70% 0);   transform: translateX(-3px); }
    25%  {              clip-path: inset(60% 2px 20% 0); transform: translateX(3px);  }
    50%  {              clip-path: inset(30% 0 50% 2px); transform: translateX(-2px); }
    75%  {              clip-path: inset(5% 3px 80% 0);  transform: translateX(2px);  }
    100% { opacity: 0;  clip-path: inset(0 0 0 0);       transform: translateX(0);    }
  }

  /* ── Dots ────────────────────────────────────────────────────── */
  .dot {
    width: 28px;
    height: 3px;
    background: rgba(7,165,201,0.18);
    border: none;
    cursor: pointer;
    padding: 0;
    border-radius: 2px;
    transition: background 0.25s, width 0.25s, box-shadow 0.25s;
  }
  .dot--active { width: 48px; background: rgba(7,165,201,0.8); box-shadow: 0 0 10px rgba(7,165,201,0.4); }

  /* ── Responsive ──────────────────────────────────────────────── */
  @media (max-width: 700px) {
    .carousel-scene { height: 300px; }
  }
</style>
