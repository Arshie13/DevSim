<script lang="ts">
  import { X, FileText } from "lucide-svelte";
  import { filterSourceFiles } from "$lib/utils/aiHelpHelpers";
  import type { ChatMessage } from "$lib/stores/ai";

  export let show: boolean = false;
  export let files: string[] = [];
  export let attachedFiles: { path: string; name: string }[] = [];
  export let onAttach: (path: string) => void = () => {};
  export let onClose: () => void = () => {};

  $: filteredFiles = filterSourceFiles(files, attachedFiles);
</script>

{#if show}
  <div 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" 
    onclick={onClose}
    onkeydown={(e) => { if (e.key === 'Escape') onClose(); }}
    role="button"
    tabindex="0"
  >
    <div 
      class="bg-[#12192a] border border-[#27272a] rounded-lg max-w-md w-full max-h-[70vh] flex flex-col"
      onclick={(e) => { e.stopPropagation(); }}
      role="presentation"
    >
      <div class="flex items-center justify-between p-4 border-b border-[#27272a]">
        <div class="flex items-center gap-2">
          <FileText class="w-5 h-5 text-cyan-500" />
          <h3 class="text-lg font-semibold text-gray-200">Attach Files</h3>
        </div>
        <button
          type="button"
          onclick={onClose}
          onkeydown={(e) => e.key === 'Enter' && onClose()}
          class="text-gray-400 hover:text-gray-200"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        {#if filteredFiles.length === 0}
          <p class="text-gray-400 text-center py-4">No source files available</p>
        {:else}
          <div class="space-y-1">
            {#each filteredFiles as filePath}
              <button
                type="button"
                onclick={() => onAttach(filePath)}
                onkeydown={(e) => e.key === 'Enter' && onAttach(filePath)}
                class="w-full text-left px-3 py-2 rounded hover:bg-slate-800 text-gray-300 hover:text-white transition-colors text-sm truncate"
              >
                {filePath}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
