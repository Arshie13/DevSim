<script lang="ts">
  import { Send, X, Paperclip } from "lucide-svelte";
  import {
    aiChatHistory,
    aiCoins,
    aiSelectedFile,
    aiFileTree,
    aiFileContents,
  } from "$lib/stores/ai";
  import {
    isAskingForCode,
    getCodeWarningMessage,
    getInsufficientCoinsMessage,
    getErrorMessage,
    getApiErrorMessage,
  } from "$lib/ai";
  import { type ITask } from "$lib/types";
  import ThoughtBubble from "./ThoughtBubble.svelte";
  import FloatingModal from "./FloatingModal.svelte";
  import {
    chunkHintMessage,
    calculateTotalCost,
    areAllTasksCompleted,
    filterSourceFiles,
  } from "$lib/utils/aiHelpHelpers";
  import {
    MAX_ATTACHED_FILES,
    QUICK_HINT_COST,
  } from "$lib/utils/aiHelpConstants";
  import { generateContext as generateContextHelper } from "$lib/utils/aiHelpApi";
  import Scrollbar from "$lib/components/ui/Scrollbar.svelte";

  // Props
  export let scenario: string = "";
  export let tasks: ITask[] = [];
  export let containerId: string = "";
  export let userId: string = "";
  export let projectName: string = "DevSim Project";
  export let level: number = 1;
  export let mode: "chat" | "quick" = "quick";
  export let initialSelectedFile: string = "";
  export let initialFileTree: string[] = [];
  export let initialFileContents: Record<string, string> = {};
  export let initialCoins: number = 1000;

  // State
  let showFloatingModal = false;
  let attachedFiles: { path: string; name: string }[] = [];
  let showFilePicker = false;
  let userMessage = "";
  let isLoading = false;
  let chatContainer: HTMLDivElement | undefined;
  let previousMessageCount = 0;
  let userScrolling = false;

  let showQuickHint = false;
  let quickHintMessage = "";
  let quickHintLoading = false;
  let hintChunks: string[] = [];
  let currentHintChunk = 0;
  let hintsShown: string[] = [];
  let isBubbleHidden = false;
  let showCloseConfirmation = false;
  
  // Track if we should use bubble mode for chat responses
  let useBubbleMode = false;
  let bubbleChatMessage = "";
  let bubbleChatLoading = false;

  // Track hint/chat history for bubble display
  let hintHistory: string[] = [];

  // Reactive
  $: filteredFileTree = filterSourceFiles(initialFileTree, attachedFiles);
  $: canAttachMore = attachedFiles.length < MAX_ATTACHED_FILES;
  $: currentSelectedFile = initialSelectedFile || $aiSelectedFile;
  $: currentFileTree =
    initialFileTree.length > 0 ? initialFileTree : $aiFileTree;
  $: currentFileContents =
    Object.keys(initialFileContents).length > 0
      ? initialFileContents
      : $aiFileContents;
  $: currentCoins =
    $aiCoins !== 1000 || initialCoins === 1000 ? $aiCoins : initialCoins;
  $: totalCost = calculateTotalCost(mode, attachedFiles.length);
  $: allTasksCompleted = areAllTasksCompleted(tasks);

  // Initialize stores
  $: if (initialSelectedFile) aiSelectedFile.set(initialSelectedFile);
  $: if (initialFileTree.length > 0) aiFileTree.set(initialFileTree);
  $: if (Object.keys(initialFileContents).length > 0)
    aiFileContents.set(initialFileContents);
  $: if (initialCoins !== 1000) aiCoins.set(initialCoins);

  // Auto-scroll chat
  $: {
    const currentCount = $aiChatHistory.length;
    if (
      currentCount > previousMessageCount &&
      !userScrolling &&
      chatContainer
    ) {
      setTimeout(() => {
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 50);
    }
    previousMessageCount = currentCount;
  }

  // Auto-close when tasks completed
  $: if (allTasksCompleted && showQuickHint) {
    setTimeout(() => {
      showQuickHint = false;
      isBubbleHidden = false;
    }, 2000);
  }
  $: if (hintsShown.length >= 5 && showQuickHint) {
    setTimeout(() => {
      showQuickHint = false;
      isBubbleHidden = false;
    }, 3000);
  }

  // Handlers
  function toggleFloatingModal() {
    showFloatingModal = !showFloatingModal;
  }
  function closeFloatingModal() {
    showFloatingModal = false;
  }

  async function generateContext() {
    return generateContextHelper(
      scenario,
      projectName,
      mode,
      containerId,
      tasks,
      currentSelectedFile,
      currentFileTree,
      currentFileContents,
      attachedFiles,
    );
  }

  async function sendMessage() {
    if (!userMessage.trim() || isLoading) return;
    const message = userMessage.trim();
    userMessage = "";

    console.log("[AI Help] sendMessage called with:", message);
    console.log("[AI Help] Current mode:", mode);
    console.log("[AI Help] Current coins:", currentCoins, "Total cost:", totalCost);

    if (isAskingForCode(message)) {
      aiChatHistory.update((msgs) => [
        ...msgs,
        { role: "user", content: message },
        { role: "ai", content: getCodeWarningMessage(), isWarning: true },
      ]);
      clearAttachedFiles();
      return;
    }
    if (currentCoins < totalCost) {
      aiChatHistory.update((msgs) => [
        ...msgs,
        { role: "user", content: message },
        {
          role: "ai",
          content: getInsufficientCoinsMessage(totalCost, currentCoins),
          isWarning: true,
        },
      ]);
      clearAttachedFiles();
      return;
    }

    const filesToInclude = [...attachedFiles];
    aiChatHistory.update((msgs) => [
      ...msgs,
      {
        role: "user",
        content: message,
        attachedFiles: filesToInclude.length > 0 ? filesToInclude : undefined,
      },
    ]);
    clearAttachedFiles();
    isLoading = true;

    try {
      const context = await generateContext();
      console.log("[AI Help] Sending request to API...");
      
      const response = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context,
          containerId,
          userId,
          hintType: mode,
          attachedFilesCount: filesToInclude.length,
          attachedFiles: filesToInclude,
          level,
        }),
      });
      const data = await response.json();
      console.log("[AI Help] API response:", data);
      
      if (data.success) {
        aiChatHistory.update((msgs) => [
          ...msgs,
          { role: "ai", content: data.hint },
        ]);
        if (data.coinsRemaining !== undefined) {
          aiCoins.set(data.coinsRemaining);
          initialCoins = data.coinsRemaining;
        }
      } else {
        aiChatHistory.update((msgs) => [
          ...msgs,
          { role: "ai", content: getApiErrorMessage(data.error) },
        ]);
      }
    } catch (error) {
      console.error("[AI Help] Error:", error);
      aiChatHistory.update((msgs) => [
        ...msgs,
        { role: "ai", content: getErrorMessage() },
      ]);
    } finally {
      isLoading = false;
      clearAttachedFiles();
    }
  }

  async function requestQuickHint() {
    if (isLoading || !containerId || !userId) return;
    if (currentCoins < totalCost) {
      quickHintMessage = getInsufficientCoinsMessage(totalCost, currentCoins);
      showFloatingModal = false;
      showQuickHint = true;
      hintChunks = chunkHintMessage(quickHintMessage);
      currentHintChunk = 0;
      return;
    }
    quickHintLoading = true;
    showFloatingModal = false;
    showQuickHint = true;
    quickHintMessage = "";
    hintChunks = [];
    currentHintChunk = 0;
    attachedFiles = [];

    const currentTask = tasks?.find((t) => !t.isCompleted);
    let hintMessage = currentTask
      ? `Current task: "${currentTask.taskName}" (${tasks.filter((t) => t.isCompleted).length}/${tasks.length} done). Give me a SHORT, specific hint - which file and exactly what to do?`
      : tasks?.every((t) => t.isCompleted)
        ? `All tasks done! Quick congrats and ask if they need help with anything else.`
        : `Give me a SHORT hint for my current sprint task. Which file should I work on and what specifically needs to be done?`;

    try {
      const context = await generateContext();
      const response = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: hintMessage,
          context,
          containerId,
          userId,
          hintType: "quick",
          attachedFilesCount: 0,
          attachedFiles: [],
          level,
        }),
      });
      const data = await response.json();
      if (data.success) {
        quickHintMessage = data.hint;
        // Add to history
        hintHistory = [...hintHistory, data.hint];
        hintChunks = chunkHintMessage(data.hint);
        currentHintChunk = 0;
        if (data.coinsRemaining !== undefined) {
          aiCoins.set(data.coinsRemaining);
          initialCoins = data.coinsRemaining;
        }
      } else {
        quickHintMessage = getApiErrorMessage(data.error);
        // Add error to history
        hintHistory = [...hintHistory, getApiErrorMessage(data.error)];
        hintChunks = chunkHintMessage(quickHintMessage);
        currentHintChunk = 0;
      }
    } catch (error) {
      quickHintMessage = getErrorMessage();
      hintChunks = chunkHintMessage(getErrorMessage());
      currentHintChunk = 0;
    } finally {
      quickHintLoading = false;
    }
  }

  // Send chat message and show response in ThoughtBubble
  async function sendChatMessage() {
    if (!userMessage.trim() || isLoading) return;
    const message = userMessage.trim();
    userMessage = "";

    if (isAskingForCode(message)) {
      // For code requests, show warning in bubble mode
      bubbleChatMessage = getCodeWarningMessage();
      bubbleChatLoading = false;
      showQuickHint = true;
      useBubbleMode = true;
      isBubbleHidden = false;
      showFloatingModal = false;
      hintChunks = chunkHintMessage(bubbleChatMessage);
      currentHintChunk = 0;
      return;
    }
    if (currentCoins < totalCost) {
      bubbleChatMessage = getInsufficientCoinsMessage(totalCost, currentCoins);
      bubbleChatLoading = false;
      showQuickHint = true;
      useBubbleMode = true;
      isBubbleHidden = false;
      showFloatingModal = false;
      hintChunks = chunkHintMessage(bubbleChatMessage);
      currentHintChunk = 0;
      return;
    }

    clearAttachedFiles();
    bubbleChatLoading = true;
    bubbleChatMessage = "";
    showQuickHint = true;
    useBubbleMode = true;
    isBubbleHidden = false;
    showFloatingModal = false;
    hintChunks = [];
    currentHintChunk = 0;

    try {
      const context = await generateContext();
      const response = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context,
          containerId,
          userId,
          hintType: mode,
          attachedFilesCount: 0,
          attachedFiles: [],
          level,
        }),
      });
      const data = await response.json();
      if (data.success) {
        bubbleChatMessage = data.hint;
        // Add to history
        hintHistory = [...hintHistory, data.hint];
        hintChunks = chunkHintMessage(data.hint);
        currentHintChunk = 0;
        if (data.coinsRemaining !== undefined) {
          aiCoins.set(data.coinsRemaining);
          initialCoins = data.coinsRemaining;
        }
      } else {
        bubbleChatMessage = getApiErrorMessage(data.error);
        // Add error to history
        hintHistory = [...hintHistory, getApiErrorMessage(data.error)];
        hintChunks = chunkHintMessage(bubbleChatMessage);
        currentHintChunk = 0;
      }
    } catch (error) {
      bubbleChatMessage = getErrorMessage();
      // Add error to history
      hintHistory = [...hintHistory, getErrorMessage()];
      hintChunks = chunkHintMessage(getErrorMessage());
      currentHintChunk = 0;
    } finally {
      bubbleChatLoading = false;
    }
  }

  function attachFile(filePath: string) {
    if (!canAttachMore) return;
    const fileName = filePath.split("/").pop() || filePath;
    attachedFiles = [...attachedFiles, { path: filePath, name: fileName }];
    showFilePicker = false;
  }

  function removeAttachedFile(filePath: string) {
    attachedFiles = attachedFiles.filter((f) => f.path !== filePath);
  }
  function clearAttachedFiles() {
    attachedFiles = [];
  }
  function toggleFilePicker() {
    showFilePicker = !showFilePicker;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendChatMessage();
    }
  }


  // Quick hint handlers
  function hideBubble() {
    isBubbleHidden = true;
  }
  function showBubble() {
    isBubbleHidden = false;
  }
  function prevHintChunk() {
    if (currentHintChunk > 0) currentHintChunk--;
  }
  function nextHintChunk() {
    if (currentHintChunk < hintChunks.length - 1) currentHintChunk++;
  }

  function openChatFromBubble() {
    // Close the bubble and open the floating modal for more questions
    showQuickHint = false;
    showFloatingModal = true;
    useBubbleMode = false;
    bubbleChatMessage = "";
    bubbleChatLoading = false;
    isBubbleHidden = false;
  }

  function requestCloseWithConfirmation() {
    if (allTasksCompleted || hintsShown.length >= 5) {
      closeQuickHintWithCheck();
      return;
    }
    showCloseConfirmation = true;
  }
  function confirmClose() {
    showCloseConfirmation = false;
    closeQuickHintWithCheck();
  }
  function cancelClose() {
    showCloseConfirmation = false;
  }

  function closeQuickHintWithCheck() {
    if (
      quickHintMessage &&
      !hintsShown.includes(quickHintMessage.substring(0, 50))
    ) {
      hintsShown.push(quickHintMessage.substring(0, 50));
    }
    if (allTasksCompleted || hintsShown.length >= 5) {
      showQuickHint = false;
      quickHintMessage = "";
      hintChunks = [];
      currentHintChunk = 0;
      hintsShown = [];
      isBubbleHidden = false;
      return;
    }
    showQuickHint = false;
    quickHintMessage = "";
    hintChunks = [];
    currentHintChunk = 0;
    isBubbleHidden = false;
  }

  function handleScroll() {
    if (!chatContainer) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainer;
    userScrolling = scrollHeight - scrollTop - clientHeight >= 50;
  }
</script>

<!-- ─── SAZ Avatar toggle button ─── -->
<button
  data-tour="ai-toggle"
  onclick={toggleFloatingModal}
  class="fixed bottom-6 right-6 z-40 w-28 h-28 overflow-hidden shadow-2xl transition-transform hover:scale-110"
  style="background: transparent; padding: 0; border: none; border-radius: 0;"
  aria-label="Open AI Assistant"
>
  {#if quickHintLoading}
    <img
      src="/images/saz_thinking.png"
      alt="SAZ Thinking"
      class="w-full h-full object-cover animate-pulse"
    />
  {:else if showQuickHint && quickHintMessage}
    <img
      src="/images/saz-lightbulb.png"
      alt="SAZ Hint Ready"
      class="w-full h-full object-cover"
    />
  {:else}
    <img
      src="/images/saz-full.png"
      alt="SAZ"
      class="w-full h-full object-cover"
    />
  {/if}
</button>

<!-- ─── "Need help? Click Me!" bubble ───
     Shown when modal is closed and no quick hint is active.
     Sits at bottom:160px right:24px — same slot as the "Show hint" restore button. -->
{#if !showFloatingModal && !showQuickHint}
  <div class="fixed z-30 animate-pulse" style="bottom: 160px; right: 36px;">
    <div class="relative">
      <div
        class="bg-[#0f172a] border-2 border-yellow-500/70 shadow-2xl px-5 py-3"
        style="border-radius:30px;"
      >
        <div class="flex items-center gap-1 whitespace-nowrap">
          <span class="text-yellow-400 text-lg">💡</span>
          <span class="text-white font-medium text-sm"
            >Need help? Click Me!</span
          >
        </div>
      </div>
      <!-- Downward pointer toward SAZ avatar -->
      <div
        class="absolute -bottom-[11px] right-8"
        style="width: 0; height: 0; border-left: 11px solid transparent; border-right: 11px solid transparent; border-top: 11px solid rgba(234,179,8,0.7);"
      ></div>
      <div
        class="absolute -bottom-[8px] right-[37px]"
        style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #0f172a;"
      ></div>
    </div>
  </div>
{/if}

<!-- ─── Main Chat Modal ─── -->
<FloatingModal
  show={showFloatingModal}
  showBubble={showQuickHint}
  messages={$aiChatHistory}
  {userMessage}
  {isLoading}
  {currentCoins}
  {totalCost}
  {canAttachMore}
  {attachedFiles}
  fileTree={filteredFileTree}
  {showFilePicker}
  onClose={closeFloatingModal}
  onSend={sendMessage}
  onMessageChange={(value) => (userMessage = value)}
  onToggleFilePicker={toggleFilePicker}
  onRemoveFile={removeAttachedFile}
  onKeydown={handleKeydown}
  onAttachFile={attachFile}
  onCloseFilePicker={() => (showFilePicker = false)}
  onQuickHint={requestQuickHint}
/>

<!-- ─── Quick Hint Cloud ───
     Cloud SVG is 460px wide. Positioned so the right thought-trail
     circles sit above the SAZ avatar (fixed bottom-6 right-6 = 24px).
     right: 220px shifts the cloud left so it doesn't overlap the right panel.
     bottom: 148px clears the 112px avatar + 36px gap. -->
{#if showQuickHint && !isBubbleHidden}
  <div
    class="fixed inset-0 z-50"
    style="pointer-events: none;"
  >
    <div
      style="position: fixed; bottom: 160px; right: 75px; pointer-events: auto;"
    >
      <ThoughtBubble
        quickHintMessage={bubbleChatMessage || quickHintMessage}
        quickHintLoading={bubbleChatLoading || quickHintLoading}
        {hintChunks}
        {currentHintChunk}
        {initialCoins}
        {QUICK_HINT_COST}
        showChatButton={useBubbleMode}
        {hintHistory}
        on:hide={hideBubble}
        on:close={requestCloseWithConfirmation}
        on:prev={prevHintChunk}
        on:next={nextHintChunk}
        on:openChat={openChatFromBubble}
      />
    </div>
  </div>
{/if}

<!-- ─── "Show hint" restore button ───
     Replaces "Need Help?" at the exact same position when hint is minimised. -->
{#if showQuickHint && isBubbleHidden}
  <button
    type="button"
    onclick={showBubble}
    onkeydown={(e) => e.key === "Enter" && showBubble()}
    class="fixed z-30 bg-[#0f172a] border-2 border-cyan-400/60 shadow-2xl px-5 py-3 hover:scale-105 transition-transform flex items-center gap-2 animate-pulse"
    style="bottom:160px;right:24px;border-radius:30px;box-shadow:0 0 15px rgba(6,182,212,0.4);"
  >
    <span style="font-size:16px;">💭</span>
    <span class="text-sm text-gray-300 font-medium whitespace-nowrap"
      >Show hint</span
    >
  </button>
{/if}

<!-- ─── Close confirmation modal ─── -->
{#if showCloseConfirmation}
  <div
    class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
    onclick={cancelClose}
    onkeydown={(e) => {
      if (e.key === "Escape") cancelClose();
    }}
    role="button"
    tabindex="0"
  >
    <div
      class="bg-[#1e293b] border border-zinc-700 rounded-xl p-6 max-w-sm w-full shadow-2xl"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <div class="text-center">
        <h3 class="text-lg font-semibold text-gray-200 mb-2">Close Hint?</h3>
        <p class="text-gray-400 text-sm mb-4">
          Are you sure you want to close this hint? You'll lose your current
          progress.
        </p>
        <div class="flex gap-2">
          <button
            onclick={cancelClose}
            class="flex-1 bg-slate-700 hover:bg-slate-600 text-gray-200 px-4 py-2 rounded-lg transition-colors"
            >Cancel</button
          >
          <button
            onclick={confirmClose}
            class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >Close</button
          >
        </div>
      </div>
    </div>
  </div>
{/if}
