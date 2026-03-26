<script lang="ts">
  import { Send, Paperclip, X, FileText } from 'lucide-svelte';
  import type { AttachedFile } from './types';
  
  export let value: string;
  export let isLoading: boolean;
  export let canSend: boolean;
  export let attachedFiles: AttachedFile[];
  export let canAttachMore: boolean;
  export let onSend: () => void;
  export let onAttachClick: () => void;
  export let onRemoveFile: (path: string) => void;
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }
</script>

<div class="p-4 border-t border-zinc-800">
  <!-- Attached Files Display -->
  {#if attachedFiles.length > 0}
    <div class="flex flex-wrap gap-2 mb-3">
      {#each attachedFiles as file}
        <div class="flex items-center gap-1 bg-slate-800 border border-zinc-700 rounded-md px-2 py-1 text-xs">
          <FileText class="w-3 h-3 text-cyan-500" />
          <span class="text-gray-300 max-w-[120px] truncate">{file.name}</span>
          <button 
            on:click={() => onRemoveFile(file.path)}
            class="text-gray-500 hover:text-red-400 ml-1"
          >
            <X class="w-3 h-3" />
          </button>
        </div>
      {/each}
    </div>
  {/if}
  
  <div class="flex gap-2">
    <button
      on:click={onAttachClick}
      disabled={!canAttachMore}
      class="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-all"
      title={canAttachMore ? "Attach up to 3 files" : "Maximum files attached"}
    >
      <Paperclip class="w-4 h-4 text-gray-400" />
    </button>
    
    <input
      type="text"
      bind:value
      on:keydown={handleKeydown}
      placeholder="Ask for a hint..."
      class="flex-1 bg-slate-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
      disabled={isLoading}
    />
    <button
      on:click={onSend}
      disabled={!canSend}
      class="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-all"
    >
      <Send class="w-4 h-4 text-white" />
    </button>
  </div>
  
  {#if attachedFiles.length > 0}
    <p class="text-xs text-gray-500 mt-2">
      📎 {attachedFiles.length}/3 files attached for context
    </p>
  {/if}
</div>