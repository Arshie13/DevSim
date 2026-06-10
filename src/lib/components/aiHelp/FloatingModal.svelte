<script lang="ts">
  import { tick } from "svelte";
  import { X, Send, Paperclip } from "lucide-svelte";
  import ChatMessage from "./ChatMessage.svelte";
  import FilePicker from "./FilePicker.svelte";
  import { filterSourceFiles } from "$lib/utils/aiHelpHelpers";
  import {
    QUICK_HINT_CREDIT_COST,
    COINS_PER_AI_HELP_CREDIT,
  } from "$lib/utils/aiHelpConstants";
  import type { ChatMessage as ChatMessageType } from "$lib/stores/ai";

  export let messages: ChatMessageType[] = [];
  export let userMessage: string = "";
  export let isLoading: boolean = false;
  // AI help credit cost of the next message (1 = quick hint, 2 = chat).
  export let creditCost: number = 0;
  export let aiHelps: number = 0;
  export let canAttachMore: boolean = false;
  export let attachedFiles: { path: string; name: string }[] = [];
  export let fileTree: string[] = [];
  export let showFilePicker: boolean = false;
  export let hasHint: boolean = false;
  export let onClose: () => void = () => {};
  export let onSend: () => void = () => {};
  export let onMessageChange: (value: string) => void = () => {};
  export let onToggleFilePicker: () => void = () => {};
  export let onRemoveFile: (path: string) => void = () => {};
  export let onKeydown: (event: KeyboardEvent) => void = () => {};
  export let onAttachFile: (path: string) => void = () => {};
  export let onCloseFilePicker: () => void = () => {};
  export let onQuickHint: () => void = () => {};
  // A staged hint waiting for the user to approve converting coins into the
  // missing credits (null = popup hidden).
  export let convertPrompt: {
    kind: "chat" | "quick";
    creditsShort: number;
    coinsNeeded: number;
  } | null = null;
  export let onConfirmConvert: () => void = () => {};
  export let onCancelConvert: () => void = () => {};

  // Local state
  let localUserMessage: string = "";
  let attachButtonEl: HTMLButtonElement | null = null;
  let filePickerAnchorX: number | null = null;
  let filePickerAnchorY: number | null = null;
  let scrollEl: HTMLDivElement | null = null;

  // Sync local state with prop
  $: localUserMessage = userMessage;
  $: canSend = localUserMessage.trim().length > 0 && !isLoading;
  $: filteredFileTree = filterSourceFiles(fileTree || [], attachedFiles || []);

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    localUserMessage = target.value;
    onMessageChange(target.value);
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

  // Keep the conversation pinned to the newest message whenever it grows
  // or the thinking indicator toggles.
  async function scrollToBottom() {
    await tick();
    if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
  }
  $: {
    messages.length;
    isLoading;
    scrollToBottom();
  }
</script>

<svelte:window
  on:resize={() => { if (showFilePicker) updateFilePickerAnchor(); }}
  on:scroll={() => { if (showFilePicker) updateFilePickerAnchor(); }}
/>

<!-- Docked chat panel — fills its parent column. -->
<div class="relative w-full h-full bg-[#0f172a] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="relative bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-cyan-500/20 px-4 py-3 flex-shrink-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full overflow-hidden bg-cyan-500/20 border border-cyan-500/30">
                {#if isLoading}
                  <img src="/images/saz_thinking.png" alt="SAZ Thinking" class="w-full h-full object-cover animate-pulse" />
                {:else if hasHint}
                  <img src="/images/saz-lightbulb.png" alt="SAZ Hint Ready" class="w-full h-full object-cover" />
                {:else}
                  <img
                    src="/images/saz.png"
                    alt="SAZ"
                    class="w-full h-full object-cover"
                    onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
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
              aria-label="Close chat"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Quick Hint Button -->
        <div class="px-3 py-2 bg-cyan-900/20 border-b border-cyan-500/20 flex-shrink-0">
          <button
            type="button"
            onclick={onQuickHint}
            disabled={isLoading}
            class="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all shadow-lg hover:shadow-cyan-500/30"
          >
            <span>💡</span>
            <span class="font-medium">Quick Hint</span>
            <span class="text-xs opacity-80">
              -{QUICK_HINT_CREDIT_COST} credit{QUICK_HINT_CREDIT_COST === 1 ? "" : "s"}
            </span>
          </button>
        </div>

        <!-- Conversation -->
        <div bind:this={scrollEl} class="chat-scroll flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {#if messages.length === 0}
            <div class="flex flex-col items-center justify-center h-full text-center px-2">
              <div class="w-14 h-14 rounded-full overflow-hidden border border-cyan-500/30 mb-3">
                <img src="/images/saz.png" alt="SAZ" class="w-full h-full object-cover" />
              </div>
              <p class="text-sm text-gray-200">Hi! I'm SAZ 👋</p>
              <p class="text-xs text-gray-400 mt-1">
                Ask me anything about your task, or hit <span class="text-cyan-400">Quick Hint</span> to get unstuck.
              </p>
              <p class="text-[10px] text-yellow-300/80 mt-3 leading-relaxed">
                I give hints, not full code solutions — and I can be wrong, so verify important details.
              </p>
            </div>
          {:else}
            {#each messages as msg, i}
              <ChatMessage {msg} isFirstMessage={i === 0} {isLoading} />
            {/each}
          {/if}

          {#if isLoading}
            <div class="flex gap-2 justify-start items-end">
              <div class="w-8 h-8 rounded-full overflow-hidden border border-cyan-500/30 flex-shrink-0">
                <img src="/images/saz_thinking.png" alt="SAZ thinking" class="w-full h-full object-cover animate-pulse" />
              </div>
              <div class="bg-slate-900/60 text-gray-300 px-3 py-2 rounded-lg rounded-bl-none">
                <div class="flex gap-1">
                  <span class="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style="animation-delay:0ms;"></span>
                  <span class="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style="animation-delay:150ms;"></span>
                  <span class="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style="animation-delay:300ms;"></span>
                </div>
              </div>
            </div>
          {/if}
        </div>

        <!-- Cost / credits -->
        <div class="px-3 py-1.5 border-t border-slate-700/50 flex items-center justify-between text-xs flex-shrink-0">
          <div class="flex items-center gap-1 text-gray-400">
            <span>Cost: <span class="text-cyan-400 font-medium">{creditCost} credit{creditCost === 1 ? "" : "s"}</span></span>
          </div>
          <div class="flex items-center gap-1 text-gray-400">
            <span class="text-cyan-500">💡</span>
            <span>Credits: <span class="text-cyan-400 font-medium">{aiHelps}</span></span>
          </div>
        </div>

        <!-- Attached Files -->
        {#if attachedFiles && attachedFiles.length > 0}
          <div class="px-3 py-1.5 border-t border-slate-700/50 flex-shrink-0">
            <div class="flex flex-wrap gap-1">
              {#each attachedFiles as file}
                <div class="flex items-center gap-1 bg-slate-800/50 border border-zinc-700/50 rounded px-1.5 py-0.5 text-xs">
                  <span class="text-cyan-400 text-xs">{file.name}</span>
                  <button
                    type="button"
                    onclick={() => onRemoveFile(file.path)}
                    class="text-gray-400 hover:text-red-400"
                    aria-label="Remove file"
                  >
                    <X class="w-2.5 h-2.5" />
                  </button>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Input Area -->
        <div class="p-2 border-t border-slate-700/50 flex-shrink-0">
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
              placeholder="Ask SAZ for a hint..."
              class="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              disabled={isLoading}
            />

            <button
              type="button"
              onclick={onSend}
              disabled={!canSend}
              class="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Coins → credits exchange confirmation popup -->
        {#if convertPrompt}
          {@const promptCost = convertPrompt.kind === "quick" ? QUICK_HINT_CREDIT_COST : creditCost}
          <div class="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              class="w-full max-w-[300px] bg-[#0f172a] border border-cyan-500/30 rounded-xl p-4 shadow-xl shadow-cyan-500/10"
              role="alertdialog"
              aria-labelledby="convert-prompt-title"
            >
              <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">💡</span>
                <h3 id="convert-prompt-title" class="text-sm font-bold text-gray-100">Out of AI help credits</h3>
              </div>

              <p class="text-xs text-gray-400 leading-relaxed mb-3">
                This {convertPrompt.kind === "quick" ? "quick hint" : "chat message"} costs
                <span class="text-cyan-400 font-medium">{promptCost} credit{promptCost === 1 ? "" : "s"}</span>
                and you have <span class="text-cyan-400 font-medium">{aiHelps}</span>.
                Exchange
                <span class="text-yellow-500 font-medium">{convertPrompt.coinsNeeded} coins</span>
                for the missing {convertPrompt.creditsShort} credit{convertPrompt.creditsShort === 1 ? "" : "s"}?
              </p>

              <div class="text-[11px] text-gray-500 mb-3">
                {COINS_PER_AI_HELP_CREDIT} coins = 1 credit
              </div>

              <div class="flex gap-2">
                <button
                  type="button"
                  onclick={onCancelConvert}
                  class="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-600 text-gray-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onclick={onConfirmConvert}
                  class="flex-1 px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium transition-all"
                >
                  {convertPrompt.kind === "quick" ? "Exchange & Hint" : "Exchange & Send"}
                </button>
              </div>
            </div>
          </div>
        {/if}
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

<style>
  .chat-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .chat-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .chat-scroll::-webkit-scrollbar-thumb {
    background: #27272a;
    border-radius: 3px;
  }
  .chat-scroll::-webkit-scrollbar-thumb:hover {
    background: #3f3f46;
  }
</style>
