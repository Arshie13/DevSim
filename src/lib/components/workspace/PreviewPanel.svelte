<script lang="ts">
  import { Globe, Clock, Database } from 'lucide-svelte';

  let { 
    visible = false,
    previewUrl = '',
    studioUrl = null as string | null,
    onRefresh = (() => {}) as () => void,
    iframeRef = $bindable(null as HTMLIFrameElement | null),
    studioIframeRef = $bindable(null as HTMLIFrameElement | null),
  } = $props();

  let activeTab: 'preview' | 'studio' = $state('preview');

  function switchTab(tab: 'preview' | 'studio') {
    activeTab = tab;
    onRefresh();
  }
</script>

<div class:hidden={!visible} class="h-full" data-tour="preview-panel-surface">
  <div class="h-full flex flex-col bg-white" data-tour="tutorial-preview-panel">
    <div class="bg-[#12192a] px-4 py-2 flex items-center justify-between">
      <div class="flex items-center gap-1">
        <button
          class="px-3 py-1 text-xs rounded transition-all {activeTab === 'preview' ? 'bg-[#2d3446] text-white' : 'text-[#d0d7dd]/40 hover:text-[#d0d7dd]/70'}"
          onclick={() => switchTab('preview')}
        >
          <Globe class="w-3 h-3 inline mr-1" />
          Preview
        </button>
        <button
          class="px-3 py-1 text-xs rounded transition-all {activeTab === 'studio' ? 'bg-[#2d3446] text-white' : 'text-[#d0d7dd]/40 hover:text-[#d0d7dd]/70'}"
          onclick={() => switchTab('studio')}
          disabled={!studioUrl}
        >
          <Database class="w-3 h-3 inline mr-1" />
          Prisma Studio
        </button>
      </div>
      <span class="text-xs text-[#d0d7dd]/40 truncate max-w-[40%]">
        {activeTab === 'preview' ? (previewUrl || 'Waiting...') : (studioUrl || 'Not running')}
      </span>
      <button
        onclick={onRefresh}
        class="text-xs bg-[#2d3446] hover:bg-[#2d3446]/80 px-3 py-1 rounded transition-all flex items-center gap-1"
        disabled={activeTab === 'preview' ? !previewUrl : !studioUrl}
      >
        <Clock class="w-3 h-3" />
        Refresh
      </button>
    </div>

    {#if activeTab === 'preview'}
      {#if !previewUrl}
        <div class="flex-1 flex items-center justify-center text-[#d0d7dd]/30">
          <div class="text-center">
            <Globe class="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p class="text-lg font-semibold">Preparing Preview...</p>
            <p class="text-sm mt-2">Starting dev server...</p>
          </div>
        </div>
      {:else}
        <div class="flex-1 w-full relative">
          {#key previewUrl}
            <iframe
              bind:this={iframeRef}
              src={previewUrl}
              class="absolute inset-0 w-full h-full border-0 bg-white"
              title="Preview"
            ></iframe>
          {/key}
        </div>
      {/if}
    {:else}
      {#if !studioUrl}
        <div class="flex-1 flex items-center justify-center text-[#d0d7dd]/30">
          <div class="text-center">
            <Database class="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p class="text-lg font-semibold">Prisma Studio Not Running</p>
            <p class="text-sm mt-2">Run <code class="text-xs bg-[#2d3446] px-1 py-0.5 rounded">npx prisma studio</code> in the terminal, then refresh</p>
          </div>
        </div>
      {:else}
        <div class="flex-1 w-full relative">
          {#key studioUrl}
            <iframe
              bind:this={studioIframeRef}
              src={studioUrl}
              class="absolute inset-0 w-full h-full border-0 bg-white"
              title="Prisma Studio"
            ></iframe>
          {/key}
        </div>
      {/if}
    {/if}
  </div>
</div>
