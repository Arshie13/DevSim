<script lang="ts">
  import { User, AlertTriangle, FileText, ChevronLeft, ChevronRight } from "lucide-svelte";
  import { getMessageClasses, getIconClasses, splitMessageIntoParts } from "$lib/utils/aiHelpHelpers";
  import { formatMessage } from "$lib/ai";
  import type { ChatMessage } from "$lib/stores/ai";

  export let msg: ChatMessage;

  // Props to control SAZ avatar states (passed from parent)
  export let isLoading: boolean = false;
  export let isFirstMessage: boolean = false;

  // Callback for removing attached files (to be passed from parent)
  export const onRemoveFile: ((path: string) => void) | null = null;

  // Break long AI hints into readable parts (markdown-safe). Short messages
  // and user/warning messages stay as a single part.
  let parts: string[] = [msg.content];
  let currentPart = 0;
  let lastContent = "";
  $: if (msg.content !== lastContent) {
    parts =
      msg.role === "ai" && !msg.isWarning
        ? splitMessageIntoParts(msg.content)
        : [msg.content];
    lastContent = msg.content;
    currentPart = 0;
  }
  $: safePart = Math.min(currentPart, parts.length - 1);

  function prevPart() {
    if (currentPart > 0) currentPart -= 1;
  }
  function nextPart() {
    if (currentPart < parts.length - 1) currentPart += 1;
  }
</script>

<div class="flex gap-3 {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
  {#if msg.role === 'ai'}
    <div class={getIconClasses(msg)}>
      {#if msg.isWarning}
        <AlertTriangle class="w-4 h-4 text-white" />
      {:else}
        <!-- Show SAZ avatar image for AI messages -->
        <div class="w-8 h-8 rounded-full overflow-hidden bg-cyan-500/20 border border-cyan-500/30">
          {#if isLoading && isFirstMessage}
            <img
              src="/images/saz_thinking.png"
              alt="SAZ Thinking"
              class="w-full h-full object-cover animate-pulse"
            />
          {:else}
            <img
              src="/images/saz-lightbulb.png"
              alt="SAZ"
              class="w-full h-full object-cover"
            />
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  <div class={getMessageClasses(msg)}>
    <div class="whitespace-pre-wrap break-words leading-relaxed">{@html formatMessage(parts[safePart])}</div>

    {#if parts.length > 1}
      <div class="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between">
        <button
          on:click={prevPart}
          disabled={safePart === 0}
          class="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft class="w-3 h-3" />
          Prev
        </button>
        <span class="text-xs text-cyan-400">Part {safePart + 1} / {parts.length}</span>
        <button
          on:click={nextPart}
          disabled={safePart === parts.length - 1}
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
