<script lang="ts">
  import { Globe, Clock } from 'lucide-svelte';

  /** Whether this panel is visible. */
  export let visible: boolean;
  /** The preview URL (empty while the server hasn't started). */
  export let previewUrl: string;
  /** Fired when the user clicks Refresh. */
  export let onRefresh: () => void;

  /** Bind this to the iframe element from the parent. */
  export let iframeRef: HTMLIFrameElement;
</script>

<div class:hidden={!visible} class="h-full" data-tour="preview-panel-surface">
  <div class="h-full flex flex-col bg-white" data-tour="tutorial-preview-panel">
    <div class="bg-[#12192a] px-4 py-2 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Globe class="w-4 h-4 text-[#d0d7dd]/40" />
        <span class="text-sm text-[#d0d7dd]/40">{previewUrl || 'Waiting for server...'}</span>
      </div>
      <button
        on:click={onRefresh}
        class="text-xs bg-[#2d3446] hover:bg-[#2d3446]/80 px-3 py-1 rounded transition-all flex items-center gap-1"
        disabled={!previewUrl}
      >
        <Clock class="w-3 h-3" />
        Refresh
      </button>
    </div>

    {#if !previewUrl}
      <div class="flex-1 flex items-center justify-center text-[#d0d7dd]/30">
        <div class="text-center">
          <Globe class="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p class="text-lg font-semibold">Preparing Preview...</p>
          <p class="text-sm mt-2">Starting dev server...</p>
        </div>
      </div>
    {/if}

    <div class="flex-1 w-full relative" class:hidden={!previewUrl}>
      {#key previewUrl}
        <iframe
          bind:this={iframeRef}
          src={previewUrl}
          class="absolute inset-0 w-full h-full border-0 bg-white"
          title="Preview"
        ></iframe>
      {/key}
    </div>
  </div>
</div>
