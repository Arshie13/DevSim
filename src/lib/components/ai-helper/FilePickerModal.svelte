<script lang="ts">
  import { X, Paperclip, FileText } from 'lucide-svelte';
  import { LIMITS } from './constants';
  import type { AttachedFile } from './types';
  
  export let show: boolean;
  export let files: string[];
  export let attachedCount: number;
  export let onClose: () => void;
  export let onSelect: (path: string) => void;
  
  $: remaining = LIMITS.MAX_ATTACHED_FILES - attachedCount;
</script>

{#if show}
  <div 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
    on:click={onClose}
    role="button"
    tabindex="0"
    on:keydown={(e) => e.key === 'Escape' && onClose()}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div 
      class="bg-[#12192a] border border-[#27272a] rounded-lg max-w-md w-full max-h-[70vh] flex flex-col" 
      on:click|stopPropagation
      role="dialog"
      aria-modal="true"
      tabindex={1}
    >
      <div class="flex items-center justify-between p-4 border-b border-[#27272a]">
        <div class="flex items-center gap-2">
          <Paperclip class="w-5 h-5 text-cyan-500" />
          <span class="font-medium text-gray-200">Attach Files</span>
          <span class="text-xs text-gray-500">({attachedCount}/{LIMITS.MAX_ATTACHED_FILES})</span>
        </div>
        <button on:click={onClose} class="text-gray-400 hover:text-gray-200">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-2">
        {#if files.length === 0}
          <p class="text-sm text-gray-400 text-center py-4">No files available to attach</p>
        {:else}
          <div class="space-y-1">
            {#each files as filePath}
              <button
                on:click={() => onSelect(filePath)}
                class="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-800 text-left transition-colors"
              >
                <FileText class="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span class="text-sm text-gray-300 truncate">{filePath}</span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
      
      <div class="p-3 border-t border-[#27272a] text-xs text-gray-500">
        💡 Click a file to attach it. The file contents will be included in your AI request for better context.
        {#if remaining > 0}
          <span class="block mt-1">You can attach {remaining} more file{remaining !== 1 ? 's' : ''}.</span>
        {/if}
      </div>
    </div>
  </div>
{/if}