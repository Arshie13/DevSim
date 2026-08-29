<script lang="ts">
  import { Globe, Clock, X, ExternalLink } from 'lucide-svelte';

  let {
    visible = $bindable(false),
    previewUrl = $bindable(''),
    previewImages = $bindable([]),
    onRefresh,
    iframeRef = $bindable(null as HTMLIFrameElement | null),
    hasSwagger = $bindable(false),
    apiDocsUrl = $bindable(null as string | null),
  } = $props<{
    visible: boolean;
    previewUrl: string;
    previewImages?: string[];
    onRefresh: () => void;
    iframeRef?: HTMLIFrameElement | null;
    hasSwagger?: boolean;
    apiDocsUrl?: string | null;
  }>();

  let selectedImage: string | null = $state(null);
  let iframeEl: HTMLIFrameElement | null = $state(null);

  $effect(() => {
    iframeRef = iframeEl;
  });
</script>

<div class:hidden={!visible} class="h-full" data-tour="preview-panel-surface">
  <div class="h-full flex flex-col bg-white" data-tour="tutorial-preview-panel">
    <div class="bg-[#12192a] px-4 py-2 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Globe class="w-4 h-4 text-[#d0d7dd]/40" />
        {#if hasSwagger && apiDocsUrl}
          <a href={apiDocsUrl} target="_blank" rel="noopener noreferrer" class="text-sm text-[#07a5c9] hover:underline flex items-center gap-1">
            {apiDocsUrl}
            <ExternalLink class="w-3 h-3" />
          </a>
        {:else}
          <span class="text-sm text-[#d0d7dd]/40">{previewUrl || 'Waiting for server...'}</span>
        {/if}
      </div>
      <button
        type="button"
        onclick={onRefresh}
        class="text-xs bg-[#2d3446] hover:bg-[#2d3446]/80 px-3 py-1 rounded transition-all flex items-center gap-1"
        disabled={!previewUrl && !hasSwagger}
      >
        <Clock class="w-3 h-3" />
        Refresh
      </button>
    </div>

    {#if !previewUrl && !hasSwagger}
      <div class="flex-1 flex items-center justify-center text-[#d0d7dd]/30">
        <div class="text-center">
          <Globe class="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p class="text-lg font-semibold">Preparing Preview...</p>
          <p class="text-sm mt-2">Starting dev server...</p>
        </div>
      </div>
    {/if}

    {#if hasSwagger && apiDocsUrl}
      <div class="flex-1 w-full flex items-center justify-center bg-[#f5f5f5]">
        <div class="text-center p-8">
          <Globe class="w-12 h-12 mx-auto mb-4 text-[#07a5c9]/50" />
          <p class="text-sm text-[#a7b6c6] mb-2">API documentation is available</p>
          <a
            href={apiDocsUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-4 py-2 bg-[#07a5c9] text-white text-sm font-medium rounded hover:bg-[#07a5c9]/80 transition-colors"
          >
            Open Swagger Docs
            <ExternalLink class="w-4 h-4" />
          </a>
        </div>
      </div>
    {:else if previewUrl}
      <div class="flex-1 w-full relative">
        {#key previewUrl}
          <iframe
            bind:this={iframeEl}
            src={previewUrl}
            class="absolute inset-0 w-full h-full border-0 bg-white"
            title="Preview"
          ></iframe>
        {/key}
      </div>
    {/if}

    {#if previewImages.length > 0}
      <div class="bg-[#0a0e1a] border-t border-[rgba(7,165,201,0.15)] px-4 py-3">
        <p class="text-xs text-[#07a5c9] font-semibold uppercase tracking-wider mb-2" style="font-family:'Orbitron',monospace;">
          Scenario Previews
        </p>
        <div class="flex gap-3 overflow-x-auto pb-1">
          {#each previewImages as img, i (img)}
            <button
              type="button"
              class="shrink-0 w-32 h-20 rounded border border-[rgba(7,165,201,0.3)] overflow-hidden hover:border-[#07a5c9] transition-all"
              onclick={() => (selectedImage = img)}
              aria-label={`Preview ${i + 1}`}
            >
              <img
                src={img}
                alt={`Preview ${i + 1}`}
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

{#if selectedImage}
  <div
    role="button"
    tabindex="0"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
    onclick={() => (selectedImage = null)}
    onkeydown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') selectedImage = null; }}
  >
    <button
      type="button"
      class="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
      onclick={() => (selectedImage = null)}
      aria-label="Close preview"
    >
      <X class="w-8 h-8" />
    </button>
    <img
      src={selectedImage}
      alt="Preview"
      class="max-w-[90vw] max-h-[90vh] rounded shadow-2xl pointer-events-none"
    />
  </div>
{/if}
