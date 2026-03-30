<script lang="ts">
  import { Bot, User, AlertTriangle, FileText, ChevronLeft, ChevronRight } from "lucide-svelte";
  import { getMessageClasses, getIconClasses, formatMessageContent, chunkHintMessage } from "$lib/utils/aiHelpHelpers";
  import type { ChatMessage } from "$lib/stores/ai";
  import Scrollbar from "$lib/components/ui/Scrollbar.svelte";

  export let msg: ChatMessage;

  // Callback for removing attached files (to be passed from parent)
  export const onRemoveFile: ((path: string) => void) | null = null;

  // Chunk AI messages that are too long
  $: hintChunks = msg.role === 'ai' && msg.content.length > 300 
    ? chunkHintMessage(msg.content) 
    : [msg.content];
  $: currentChunk = 0;
  $: displayContent = hintChunks[currentChunk] || msg.content;

  // Format message content with HTML (for syntax highlighting, etc.)
  function formatMessage(content: string): string {
    return formatMessageContent(content);
  }

  function prevChunk() {
    if (currentChunk > 0) {
      currentChunk--;
    }
  }

  function nextChunk() {
    if (currentChunk < hintChunks.length - 1) {
      currentChunk++;
    }
  }
</script>

<div class="flex gap-3 {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
  {#if msg.role === 'ai'}
    <div class={getIconClasses(msg)}>
      {#if msg.isWarning}
        <AlertTriangle class="w-4 h-4 text-white" />
      {:else}
        <Bot class="w-4 h-4 text-white" />
      {/if}
    </div>
  {/if}

  <div class={getMessageClasses(msg)}>
    <Scrollbar className="max-h-[300px]">
      <div class="whitespace-pre-wrap">{@html formatMessage(displayContent)}</div>
    </Scrollbar>
    
    <!-- Pagination for chunked messages -->
    {#if hintChunks.length > 1}
      <div class="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between">
        <button
          onclick={prevChunk}
          disabled={currentChunk === 0}
          class="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft class="w-3 h-3" />
          Prev
        </button>
        <span class="text-xs text-cyan-400">💡 {currentChunk + 1} / {hintChunks.length}</span>
        <button
          onclick={nextChunk}
          disabled={currentChunk === hintChunks.length - 1}
          class="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight class="w-3 h-3" />
        </button>
      </div>
    {/if}
    
    {#if msg.role === "user" && msg.attachedFiles && msg.attachedFiles.length > 0}
      <div class="mt-2 pt-2 border-t border-slate-700/50">
        <div class="text-xs text-gray-500 mb-1">📎 Attached files:</div>
        <div class="flex flex-wrap gap-1">
          {#each msg.attachedFiles as file}
            <div class="flex items-center gap-1 bg-slate-800/50 border border-zinc-700/50 rounded px-2 py-0.5 text-xs">
              <FileText class="w-3 h-3 text-cyan-500" />
              <span class="text-gray-400">{file.name}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  {#if msg.role === 'user'}
    <div class={getIconClasses(msg)}>
      <User class="w-4 h-4 text-white" />
    </div>
  {/if}
</div>
