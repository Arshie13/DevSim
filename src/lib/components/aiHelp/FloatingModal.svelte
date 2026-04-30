<script lang="ts">
  import { X, Send, Coins, Paperclip, AlertTriangle, Clock } from "lucide-svelte";
  import ChatMessage from "./ChatMessage.svelte";
  import FilePicker from "./FilePicker.svelte";
  import Scrollbar from "$lib/components/ui/Scrollbar.svelte";
  import { filterSourceFiles, type BubbleHistoryItem } from "$lib/utils/aiHelpHelpers";
  import { MAX_ATTACHED_FILES, QUICK_HINT_COST } from "$lib/utils/aiHelpConstants";
  import type { ChatMessage as ChatMessageType } from "$lib/stores/ai";

  export let show: boolean = false;
  export let messages: ChatMessageType[] = [];
  export let history: BubbleHistoryItem[] = [];
  export let userMessage: string = "";
  export let isLoading: boolean = false;
  export let currentCoins: number = 0;
  export let totalCost: number = 0;
  export let canAttachMore: boolean = false;
  export let attachedFiles: { path: string; name: string }[] = [];
  export let fileTree: string[] = [];
  export let showFilePicker: boolean = false;
  export let onClose: () => void = () => {};
  export let onSend: () => void = () => {};
  export let onMessageChange: (value: string) => void = () => {};
  export let onToggleFilePicker: () => void = () => {};
  export let onRemoveFile: (path: string) => void = () => {};
  export let onKeydown: (event: KeyboardEvent) => void = () => {};
  export let onAttachFile: (path: string) => void = () => {};
  export let onCloseFilePicker: () => void = () => {};
  export let onQuickHint: () => void = () => {};
  export let showBubble: boolean = false;
  export let onSelectHistory: (item: BubbleHistoryItem) => void = () => {};
  export let onToggleHistory: () => void = () => {};
  // Props for SAZ avatar states (passed from parent)
  export let hasHint: boolean = false;

  // Local state
  let localUserMessage: string = "";
  let attachButtonEl: HTMLButtonElement | null = null;
  let filePickerAnchorX: number | null = null;
  let filePickerAnchorY: number | null = null;
  
  // Sync local state with prop
  $: localUserMessage = userMessage;
  
  // Filter messages based on bubble state
  // When showBubble is true (quick hint mode), don't show any chat messages - only input, history, and quick hint button
  $: filteredMessages = showBubble 
    ? [] 
    : (messages || []);
  
  // Calculate canSend locally
  $: canSend = localUserMessage.trim().length > 0 && !isLoading;
  $: filteredFileTree = filterSourceFiles(fileTree || [], attachedFiles || []);
  $: recentHistory = (history || []).slice(-6);
  
  // Handle input change
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    localUserMessage = target.value;
    onMessageChange(target.value);
  }

  // Handle history item selection
  function handleSelectHistoryItem(item: BubbleHistoryItem) {
    onSelectHistory(item);
  }

  function updateFilePickerAnchor() {
    if (!attachButtonEl) return;
    const rect = attachButtonEl.getBoundingClientRect();
    filePickerAnchorX = rect.left;
    filePickerAnchorY = rect.top;
  }

  function handleToggleFilePicker() {
    updateFilePickerAnchor();
    onToggleFilePicker();
  }

  $: if (showFilePicker) {
    requestAnimationFrame(() => {
      updateFilePickerAnchor();
    });
  }
</script>

<svelte:window
  on:resize={() => { if (showFilePicker) updateFilePickerAnchor(); }}
  on:scroll={() => { if (showFilePicker) updateFilePickerAnchor(); }}
/>

{#if show}
  <div 
    class="fixed inset-0 bg-black/20 backdrop-blur-[0.5px] z-50 flex items-end justify-end pr-10 pb-40"
    onclick={onClose}
    onkeydown={(e) => { if (e.key === 'Escape') onClose(); }}
    role="button"
    tabindex="0"
  >
    <!-- Chat bubble container with pointer -->
    <div class="relative" style="width: 460px;">
      <!-- Pointer/connector to avatar -->
      <div class="absolute -bottom-3 right-8 w-6 h-6 bg-[#0f172a] rotate-45 border-r border-b border-cyan-400/50"></div>
      
      <div 
        class="w-full bg-[#0f172a] border-2 border-cyan-400/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style="box-shadow: 0 0 30px rgba(6, 182, 212, 0.15);"
        onclick={(e) => { e.stopPropagation(); }}
        role="presentation"
      >
        <!-- Header -->
        <div class="relative bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-cyan-500/20 px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full overflow-hidden bg-cyan-500/20 border border-cyan-500/30">
                {#if isLoading}
                  <img 
                    src="/images/saz_thinking.png" 
                    alt="SAZ Thinking" 
                    class="w-full h-full object-cover animate-pulse"
                  />
                {:else if hasHint}
                  <img 
                    src="/images/saz-lightbulb.png" 
                    alt="SAZ Hint Ready" 
                    class="w-full h-full object-cover"
                  />
                {:else}
                  <img 
                    src="/images/saz.png" 
                    alt="SAZ" 
                    class="w-full h-full object-cover"
                    onerror={(e) => (e.currentTarget as HTMLImageElement).style.display = 'none'}
                  />
                {/if}
              </div>
              <div>
                <h2 class="text-sm font-bold text-gray-100">SAZ</h2>
                <p class="text-xs text-cyan-400">AI Coding Assistant</p>
              </div>
            </div>
            <button
              onclick={onClose}
              class="text-gray-400 hover:text-gray-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Quick Hint Button -->
        <div class="px-3 py-2 bg-cyan-900/20 border-b border-cyan-500/20">
          <button
            type="button"
            onclick={onQuickHint}
            class="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm rounded-lg transition-all shadow-lg hover:shadow-cyan-500/30"
          >
            <span>💡</span>
            <span class="font-medium">Quick Hint</span>
            <span class="text-xs opacity-80">-{QUICK_HINT_COST}</span>
          </button>
        </div>

        <!-- History Toggle Button (shown when history exists) -->
        {#if history && history.length > 0}
          <div class="px-3 py-1.5 border-b border-cyan-500/20">
            <button
              type="button"
              onclick={() => { onToggleHistory(); }}
              class="w-full flex items-center justify-center gap-2 px-3 py-1 bg-slate-800/50 hover:bg-slate-700/50 border border-cyan-500/30 text-gray-300 text-xs rounded-lg transition-all"
            >
              <Clock class="w-3 h-3 text-cyan-400" />
              <span>Previous Hints ({recentHistory.length})</span>
            </button>
          </div>
        {/if}

        <!-- Chat Container - Only show history, not chat messages -->
        <div style="max-height: 180px;">
          <Scrollbar className="flex-1">
            {#if !history || history.length === 0}
              <div class="flex flex-col items-center justify-center h-full text-center py-4">
                <AlertTriangle class="w-8 h-8 text-yellow-500/50 mb-2" />
                <p class="text-gray-400 text-xs">SAZ provides hints, not complete code solutions.</p>
                <p class="text-gray-500 text-xs mt-0.5">AI responses can be wrong, so always verify important details.</p>
              </div>
            {:else}
              <!-- Show history items -->
              <div class="px-3 py-2 bg-slate-800/30 border-b border-cyan-500/20">
                <div class="flex items-center gap-1 mb-2">
                  <Clock class="w-3 h-3 text-cyan-400" />
                  <span class="text-xs text-gray-400">Previous Hints</span>
                </div>
                <div class="flex flex-wrap gap-1">
                  {#each recentHistory as item (item.id)}
                    <button
                      type="button"
                      onclick={() => onSelectHistory(item)}
                      class="flex items-center gap-1 px-2 py-1 bg-slate-700/50 hover:bg-slate-600/50 border border-cyan-500/20 rounded text-xs transition-colors max-w-[140px]"
                      title={item.fullMessage}
                    >
                      <span class="{item.isChatMode ? 'text-green-400' : 'text-yellow-400'}">
                        {item.isChatMode ? '💬' : '💡'}
                      </span>
                      <span class="text-gray-300 truncate">{item.preview}</span>
                    </button>
                  {/each}
                </div>
              </div>
            {/if}
            
            {#if isLoading}
              <div class="flex gap-2 justify-start">
                <div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-700">
                  <div class="w-2.5 h-2.5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div class="bg-slate-900/60 text-gray-300 px-2 py-1.5 rounded-lg text-xs">
                  Thinking...
                </div>
              </div>
            {/if}
          </Scrollbar>
        </div>

        <!-- AI Reliability Reminder -->
        <div class="px-3 py-1.5 border-t border-cyan-500/20 bg-slate-900/40">
          <p class="text-[10px] leading-relaxed text-yellow-300/90">AI can make mistakes. Double-check critical code, commands, and outputs.</p>
          <p class="text-[10px] leading-relaxed text-gray-400">Use specific prompts with files, errors, and goals. Vague prompts can increase hallucinations.</p>
        </div>

        <!-- Cost Display -->
        <div class="px-3 py-1.5 border-t border-slate-700/50 flex items-center justify-between text-xs">
          <div class="flex items-center gap-1 text-gray-400">
            <Coins class="w-3 h-3 text-yellow-500" />
            <span>Cost: <span class="text-yellow-500 font-medium">{totalCost}</span></span>
          </div>
          <div class="text-gray-400">
            Balance: <span class="text-green-400 font-medium">{currentCoins}</span>
          </div>
        </div>

        <!-- Attached Files -->
        {#if attachedFiles && attachedFiles.length > 0}
          <div class="px-3 py-1.5 border-t border-slate-700/50">
            <div class="flex flex-wrap gap-1">
              {#each attachedFiles as file}
                <div class="flex items-center gap-1 bg-slate-800/50 border border-zinc-700/50 rounded px-1.5 py-0.5 text-xs">
                  <span class="text-cyan-400 text-xs">{file.name}</span>
                  <button
                    type="button"
                    onclick={() => onRemoveFile(file.path)}
                    class="text-gray-400 hover:text-red-400"
                  >
                    <X class="w-2.5 h-2.5" />
                  </button>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Input Area -->
        <div class="p-2 border-t border-slate-700/50">
          <div class="flex items-center gap-1.5">
            <button
              bind:this={attachButtonEl}
              type="button"
              onclick={handleToggleFilePicker}
              disabled={!canAttachMore}
              class="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={canAttachMore ? "Attach file" : "Max files attached"}
            >
              <Paperclip class="w-4 h-4" />
            </button>
            
            <input
              type="text"
              value={localUserMessage}
              oninput={handleInput}
              onkeydown={onKeydown}
              placeholder="Ask for a hint..."
              class="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              disabled={isLoading}
            />
            
            <button
              type="button"
              onclick={onSend}
              disabled={!canSend}
              class="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <FilePicker
    show={showFilePicker}
    files={filteredFileTree}
    {attachedFiles}
    anchorX={filePickerAnchorX}
    anchorY={filePickerAnchorY}
    onAttach={onAttachFile}
    onClose={onCloseFilePicker}
  />
{/if}
