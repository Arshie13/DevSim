<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-svelte';

  function portal(node: HTMLElement) {
    if (typeof document === 'undefined') return;
    document.body.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      },
    };
  }

  interface Props {
    /** Array of image URLs to display. Single image = no navigation shown. */
    images?: string[];
    /** Alt text for the image(s). */
    alt?: string;
    /** Label shown on the trigger button. */
    buttonLabel?: string;
    /** Starting image index when modal opens. */
    initialIndex?: number;
    /** Show inline image preview instead of button */
    showInline?: boolean;
    /** Suppress the trigger button — use when isOpen is controlled externally */
    noTrigger?: boolean;
    /** Controlled open state (two-way bindable) */
    isOpen?: boolean;
  }

  let {
    images = [],
    alt = 'Preview image',
    buttonLabel = 'View Preview',
    initialIndex = 0,
    showInline = false,
    noTrigger = false,
    isOpen = $bindable(false),
  }: Props = $props();

  const dispatch = createEventDispatcher<{ open: void; close: void }>();

  // svelte-ignore state_referenced_locally
  let currentIndex = $state(initialIndex);

  // Track which image URLs have finished loading so we can show a spinner until then
  let loaded = $state<Record<string, boolean>>({});

  function onImageLoad() {
    if (src) loaded[src] = true;
  }

  function onImageError() {
    // Mark as "loaded" so a broken image doesn't leave the spinner spinning forever
    if (src) loaded[src] = true;
  }

  function resetLoaded() {
    loaded = {};
  }

  // svelte-ignore state_referenced_locally
  function openModal() {
    currentIndex = initialIndex;
    resetLoaded();
    isOpen = true;
    dispatch('open');
  }

  function closeModal() {
    resetLoaded();
    isOpen = false;
    dispatch('close');
  }

  function next(e?: Event) {
    e?.stopPropagation();
    currentIndex = (currentIndex + 1) % images.length;
  }

  function prev(e?: Event) {
    e?.stopPropagation();
    currentIndex = (currentIndex - 1 + images.length) % images.length;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight' && images.length > 1) next();
    if (e.key === 'ArrowLeft' && images.length > 1) prev();
  }

  const hasMultiple = $derived(images.length > 1);
  const src = $derived(images[currentIndex] ?? '');

  // Seed the loading state for the current image when it changes
  $effect(() => {
    if (src) {
      loaded[src] = loaded[src] ?? false;
    }
  });
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- ── Inline Image Preview ── -->
{#if showInline && images.length > 0}
  <div class="inline-preview">
    <button class="preview-image-wrapper" onclick={openModal} aria-haspopup="dialog">
      {#if !loaded[images[0]]}
        <div class="inline-loading" aria-hidden="true">
          <div class="skeleton skeleton--inline"></div>
        </div>
      {/if}
      <img
        src={images[0]}
        {alt}
        class="preview-image"
        style={loaded[images[0]] ? 'opacity: 1;' : 'opacity: 0;'}
        onload={onImageLoad}
        onerror={onImageError}
      />
      <div class="zoom-overlay">
        <ZoomIn class="w-6 h-6" />
      </div>
    </button>
    {#if images.length > 1}
      <div class="preview-count">
        <span>{images.length} images</span>
      </div>
    {/if}
    <p class="preview-label">What you'll build</p>
  </div>
{:else if !noTrigger}
<!-- ── Trigger Button ── -->
  <button class="trigger-btn" onclick={openModal} aria-haspopup="dialog">
    <ZoomIn class="w-3.5 h-3.5" />
    <span>{buttonLabel}</span>
    <span class="trigger-corner tl" aria-hidden="true" ></span>
    <span class="trigger-corner tr" aria-hidden="true" ></span>
    <span class="trigger-corner bl" aria-hidden="true" ></span>
    <span class="trigger-corner br" aria-hidden="true" ></span>
  </button>
{/if}

<!-- ── Modal Overlay ── -->
{#if isOpen}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="overlay"
    use:portal
    role="dialog"
    aria-modal="true"
    aria-label={alt}
    tabindex="-1"
    onclick={closeModal}
    onkeydown={handleKeydown}
    transition:fade={{ duration: 220 }}
  >
    <!-- Scanline texture overlay -->
    <div class="scanlines" aria-hidden="true" ></div>

    <!-- Modal panel -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="panel"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      transition:scale={{ duration: 280, easing: cubicOut, start: 0.92 }}
    >
      <!-- Top bar accent -->
      <div class="panel-topbar" aria-hidden="true" ></div>

      <!-- Corner brackets -->
      <span class="corner tl" aria-hidden="true" ></span>
      <span class="corner tr" aria-hidden="true" ></span>
      <span class="corner bl" aria-hidden="true" ></span>
      <span class="corner br" aria-hidden="true" ></span>

      <!-- Header -->
      <div class="panel-header">
        <div class="panel-label">
          <span class="label-tag">PREVIEW</span>
          <div class="panel-title-group">
            <span class="panel-title">What You'll Build</span>
            {#if hasMultiple}
              <span class="label-index">{currentIndex + 1} / {images.length}</span>
            {/if}
          </div>
        </div>
        <button class="close-btn" onclick={closeModal} aria-label="Close modal">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Image area -->
      <div class="image-area">
        {#if hasMultiple}
          <button class="nav-btn left" onclick={prev} aria-label="Previous image">
            <ChevronLeft class="w-5 h-5" />
          </button>
        {/if}

        {#key currentIndex}
          {#if !loaded[src]}
            <div class="modal-loading" aria-hidden="true">
              <div class="skeleton skeleton--modal"></div>
            </div>
          {/if}
          <img
            {src}
            {alt}
            class="modal-image"
            style={loaded[src] ? 'opacity: 1;' : 'opacity: 0;'}
            onload={onImageLoad}
            onerror={onImageError}
            transition:fade={{ duration: 150 }}
          />
        {/key}

        {#if hasMultiple}
          <button class="nav-btn right" onclick={next} aria-label="Next image">
            <ChevronRight class="w-5 h-5" />
          </button>
        {/if}
      </div>

      <!-- Dot indicators -->
      {#if hasMultiple}
        <div class="indicators" role="tablist">
          {#each images as _, i}
            <button
              class="dot"
              class:dot--active={i === currentIndex}
              role="tab"
              aria-selected={i === currentIndex}
              aria-label="Go to image {i + 1}"
              onclick={(e) => { e.stopPropagation(); currentIndex = i; }}
            ></button>
          {/each}
        </div>
      {/if}

      <!-- Sweep animation -->
      <div class="sweep" aria-hidden="true" ></div>
    </div>
  </div>
{/if}

<style>
  /* ── Trigger button ──────────────────────────────────────────────── */
  .trigger-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 20px;
    font-family: 'Chakra Petch', monospace;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #07a5c9;
    background: rgba(7, 165, 201, 0.08);
    border: 1px solid rgba(7, 165, 201, 0.35);
    border-radius: 3px;
    cursor: pointer;
    overflow: hidden;
    clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
    transition: background 0.2s, border-color 0.2s, box-shadow 0.2s, color 0.2s;
  }
  .trigger-btn:hover {
    background: rgba(7, 165, 201, 0.18);
    border-color: rgba(7, 165, 201, 0.7);
    box-shadow: 0 0 20px rgba(7, 165, 201, 0.25);
    color: #fff;
  }
  .trigger-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(7, 165, 201, 0.15), transparent);
    transform: translateX(-100%);
    transition: transform 0.4s ease;
  }
  .trigger-btn:hover::before { transform: translateX(100%); }

  /* Corner tick marks on trigger */
  .trigger-corner {
    position: absolute;
    width: 6px;
    height: 6px;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .trigger-btn:hover .trigger-corner { opacity: 1; }
  .trigger-corner.tl { top: 3px;    left:  3px;  border-top:  1px solid #07a5c9; border-left:  1px solid #07a5c9; }
  .trigger-corner.tr { top: 3px;    right: 3px;  border-top:  1px solid #07a5c9; border-right: 1px solid #07a5c9; }
  .trigger-corner.bl { bottom: 3px; left:  3px;  border-bottom: 1px solid #07a5c9; border-left:  1px solid #07a5c9; }
  .trigger-corner.br { bottom: 3px; right: 3px;  border-bottom: 1px solid #07a5c9; border-right: 1px solid #07a5c9; }

  /* ── Inline Preview ─────────────────────────────────────────────── */
  .inline-preview {
    width: 100%;
  }
  .preview-image-wrapper {
    position: relative;
    width: 100%;
    height: 180px;
    border-radius: 4px;
    border: 1px solid rgba(7, 165, 201, 0.2);
    background: rgba(0, 0, 0, 0.3);
    /* overflow: hidden; */
    cursor: pointer;
    display: block;
    padding: 0;
  }
  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .zoom-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    color: #07a5c9;
  }
  .preview-image-wrapper:hover .zoom-overlay {
    opacity: 1;
  }
  .preview-count {
    display: inline-block;
    margin-top: 4px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.6rem;
    color: rgba(7, 165, 201, 0.7);
    background: rgba(7, 165, 201, 0.1);
    padding: 2px 6px;
    border-radius: 2px;
  }
  .preview-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #ffb400;
    margin-top: 4px;
  }

  /* ── Overlay ─────────────────────────────────────────────────────── */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(5, 8, 18, 0.88);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
  .scanlines {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 3px,
      rgba(7, 165, 201, 0.015) 3px,
      rgba(7, 165, 201, 0.015) 4px
    );
    pointer-events: none;
  }

  /* ── Panel ───────────────────────────────────────────────────────── */
  .panel {
    position: relative;
    background: linear-gradient(155deg, #0d1525 0%, #0a0e1a 60%, #0d1525 100%);
    border: 1px solid rgba(7, 165, 201, 0.45);
    border-radius: 6px;
    width: min(1200px, 95vw);
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(7, 165, 201, 0.12),
      0 0 60px rgba(7, 165, 201, 0.18),
      0 0 120px rgba(7, 165, 201, 0.08);
    animation: panel-glow 3.5s ease-in-out infinite;
  }

  @keyframes panel-glow {
    0%, 100% { box-shadow: 0 0 0 1px rgba(7,165,201,0.12), 0 0 60px rgba(7,165,201,0.18), 0 0 120px rgba(7,165,201,0.08); }
    50%       { box-shadow: 0 0 0 1px rgba(7,165,201,0.22), 0 0 80px rgba(7,165,201,0.28), 0 0 140px rgba(7,165,201,0.12); }
  }

  .panel-topbar {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: #07a5c9;
    z-index: 3;
  }

  /* Corner brackets */
  .corner { position: absolute; width: 14px; height: 14px; }
  .corner.tl { top: 8px;    left:  8px;  border-top:    1.5px solid #07a5c9; border-left:   1.5px solid #07a5c9; }
  .corner.tr { top: 8px;    right: 8px;  border-top:    1.5px solid #07a5c9; border-right:  1.5px solid #07a5c9; }
  .corner.bl { bottom: 8px; left:  8px;  border-bottom: 1.5px solid #07a5c9; border-left:   1.5px solid #07a5c9; }
  .corner.br { bottom: 8px; right: 8px;  border-bottom: 1.5px solid #07a5c9; border-right:  1.5px solid #07a5c9; }

  /* Sweep animation */
  .sweep {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(7,165,201,0.04) 50%, transparent 100%);
    background-size: 100% 40%;
    animation: sweep 4s linear infinite;
    pointer-events: none;
    z-index: 1;
  }
  @keyframes sweep {
    0%   { background-position: 0 -40%; }
    100% { background-position: 0 140%; }
  }

  /* ── Header ──────────────────────────────────────────────────────── */
  .panel-header {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px 12px;
    border-bottom: 1px solid rgba(7, 165, 201, 0.15);
    background: rgba(7, 165, 201, 0.03);
  }
  .panel-label {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .panel-title-group {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .panel-title {
    font-family: 'Chakra Petch', monospace;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #e2e8f0;
  }
  .label-tag {
    font-family: 'Chakra Petch', monospace;
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #07a5c9;
    background: rgba(7, 165, 201, 0.12);
    border: 1px solid rgba(7, 165, 201, 0.35);
    padding: 3px 7px;
    border-radius: 2px;
    flex-shrink: 0;
  }
  .label-index {
    font-family: 'Chakra Petch', monospace;
    font-size: 0.6rem;
    color: rgba(7, 165, 201, 0.5);
    letter-spacing: 0.06em;
  }
  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(7, 165, 201, 0.08);
    border: 1px solid rgba(7, 165, 201, 0.25);
    border-radius: 3px;
    color: rgba(7, 165, 201, 0.7);
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }
  .close-btn:hover {
    background: rgba(7, 165, 201, 0.2);
    border-color: rgba(7, 165, 201, 0.6);
    color: #fff;
  }

  /* ── Image area ──────────────────────────────────────────────────── */
  .image-area {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 0;
    padding: 16px 20px;
    background: rgba(0, 0, 0, 0.25);
    overflow-y: visible;
  }
  .modal-image {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    object-position: top center;
    border-radius: 3px;
    border: 1px solid rgba(7, 165, 201, 0.18);
    box-shadow: 0 4px 32px rgba(0, 0, 0, 0.5);
    display: block;
  }

  /* ── Loading skeleton ────────────────────────────────────────────── */
  .modal-loading,
  .inline-loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .skeleton {
    background: rgba(10, 14, 26, 0.72);
  }

  .skeleton--modal {
    width: min(100%, 1000px);
    height: 60vh;
    max-height: 80vh;
    border-radius: 3px;
    border: 1px solid rgba(7, 165, 201, 0.18);
    box-shadow: 0 4px 32px rgba(0, 0, 0, 0.5);
  }

  .skeleton--inline {
    width: 100%;
    height: 180px;
    border-radius: 4px;
    border: 1px solid rgba(7, 165, 201, 0.2);
  }

  /* ── Nav buttons ─────────────────────────────────────────────────── */
  .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(7, 165, 201, 0.12);
    border: 1px solid rgba(7, 165, 201, 0.35);
    border-radius: 3px;
    color: #07a5c9;
    cursor: pointer;
    z-index: 3;
    transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
  }
  .nav-btn:hover {
    background: rgba(7, 165, 201, 0.28);
    border-color: rgba(7, 165, 201, 0.7);
    box-shadow: 0 0 12px rgba(7, 165, 201, 0.3);
  }
  .nav-btn.left  { left:  8px; }
  .nav-btn.right { right: 8px; }

  /* ── Dot indicators ──────────────────────────────────────────────── */
  .indicators {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: center;
    gap: 6px;
    padding: 10px 0 14px;
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(7, 165, 201, 0.25);
    border: none;
    cursor: pointer;
    padding: 0;
    transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
  }
  .dot:hover { background: rgba(7, 165, 201, 0.55); transform: scale(1.2); }
  .dot--active {
    background: #07a5c9;
    box-shadow: 0 0 8px rgba(7, 165, 201, 0.6);
    transform: scale(1.15);
  }
</style>