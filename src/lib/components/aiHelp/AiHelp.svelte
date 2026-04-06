<script lang="ts">
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
  } from "$lib/ai";
  import { type ITask } from "$lib/types";
  import ThoughtBubble from "./ThoughtBubble.svelte";
  import FloatingModal from "./FloatingModal.svelte";
  // Helpers from aiHelpHelpers
  import {
    chunkHintMessage,
    calculateTotalCost,
    areAllTasksCompleted,
    filterSourceFiles,
    createBubbleHistoryItem,
    attachFileToList,
    removeFileFromList,
    clearAllAttachedFiles,
    isUserScrolling,
    getHintMessage,
    navigateHintChunk,
    showBubbleFromHistory,
    resetBubbleState,
    shouldAutoClose,
    addToHintsShown,
    createAiMessage,
    createUserMessage,
    type BubbleHistoryItem,
    type BubbleState,
  } from "$lib/utils/aiHelpHelpers";
  // Constants from aiHelpConstants
  import {
    MAX_ATTACHED_FILES,
    QUICK_HINT_COST,
  } from "$lib/utils/aiHelpConstants";
  // API functions from aiHelpApi
  import {
    generateContext as generateContextHelper,
    validateMessage,
    sendChatMessage as apiSendChatMessage,
    requestQuickHintBubble,
    sendBubbleChatMessage,
  } from "$lib/utils/aiHelpApi";

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
  export let initialAiModel: string = "meta-llama/llama-3.1-8b-instruct";

  // State
  let showFloatingModal = false;
  let attachedFiles: { path: string; name: string }[] = [];
  let showFilePicker = false;
  let userMessage = "";
  let isLoading = false;
  let chatContainer: HTMLDivElement | undefined;
  let previousMessageCount = 0;
  let userScrolling = false;
  let selectedAiModel = initialAiModel;

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

  // Track bubble history for session persistence (new)
  let bubbleHistory: BubbleHistoryItem[] = [];

  const AI_MODELS = [
    { label: "Llama 3.1 8B", value: "meta-llama/llama-3.1-8b-instruct" },
    { label: "Gemma 2 9B", value: "google/gemma-2-9b-it" },
    { label: "Mistral 7B", value: "mistralai/mistral-7b-instruct-v0.2" },
  ];

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
  $: hasChatAiMessage = $aiChatHistory && $aiChatHistory.some((msg: any) => msg.role === 'ai');

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
      showFloatingModal = false;
    }, 2000);
  }
  $: if (hintsShown.length >= 5 && showQuickHint) {
    setTimeout(() => {
      showQuickHint = false;
      isBubbleHidden = false;
      showFloatingModal = false;
    }, 3000);
  }
  
  // Ensure FloatingModal is disabled when ThoughtBubble is active
  $: if (showQuickHint && !isBubbleHidden) {
    showFloatingModal = false;
  }

  // Handlers
  function toggleFloatingModal() {
    if (showQuickHint) {
      // When thought bubble is active, toggle its visibility
      isBubbleHidden = !isBubbleHidden;
    } else {
      // When thought bubble is not active, toggle floating modal
      showFloatingModal = !showFloatingModal;
    }
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
    // Use API function for validation
    const validation = validateMessage(userMessage, isLoading, currentCoins, totalCost);
    if (!validation.valid) return;
    
    const message = userMessage.trim();
    userMessage = "";

    console.log("[AI Help] sendMessage called with:", message);
    console.log("[AI Help] Current mode:", mode);
    console.log("[AI Help] Current coins:", currentCoins, "Total cost:", totalCost);

    const filesToInclude = [...attachedFiles];
    aiChatHistory.update((msgs) => [
      ...msgs,
      createUserMessage(message, filesToInclude.length > 0 ? filesToInclude : undefined),
    ]);
    clearAttachedFiles();
    isLoading = true;

    try {
      // Use the modular API function
      const result = await apiSendChatMessage(
        message,
        containerId,
        userId,
        level,
        mode,
        filesToInclude,
        currentCoins,
        totalCost,
        generateContext,
        selectedAiModel
      );
      
      if (result.success && result.coinsRemaining !== undefined) {
        initialCoins = result.coinsRemaining;
      }
    } catch (error) {
      console.error("[AI Help] Error:", error);
      aiChatHistory.update((msgs) => [
        ...msgs,
        createAiMessage(getErrorMessage()),
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

    // Use helper to build hint message based on tasks
    const { message: hintMessage } = getHintMessage(tasks);

    // Use the modular API function
    const result = await requestQuickHintBubble(
      hintMessage,
      containerId,
      userId,
      level,
      generateContext,
      // onSuccess
      (hint: string, coinsRemaining?: number) => {
        quickHintMessage = hint;
        hintHistory = [...hintHistory, hint];
        const historyItem = createBubbleHistoryItem(hint, false);
        bubbleHistory = [...bubbleHistory, historyItem];
        hintChunks = chunkHintMessage(hint);
        currentHintChunk = 0;
        if (coinsRemaining !== undefined) {
          aiCoins.set(coinsRemaining);
          initialCoins = coinsRemaining;
        }
      },
      // onError
      (error: string) => {
        quickHintMessage = error;
        hintHistory = [...hintHistory, error];
        hintChunks = chunkHintMessage(error);
        currentHintChunk = 0;
      },
      selectedAiModel
    );

    quickHintLoading = false;
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

    // Use the modular API function
    const result = await sendBubbleChatMessage(
      message,
      containerId,
      userId,
      level,
      mode,
      attachedFiles,
      currentCoins,
      totalCost,
      generateContext,
      // onSuccess
      (hint: string, coinsRemaining?: number) => {
        bubbleChatMessage = hint;
        hintHistory = [...hintHistory, hint];
        const historyItem = createBubbleHistoryItem(hint, true);
        bubbleHistory = [...bubbleHistory, historyItem];
        hintChunks = chunkHintMessage(hint);
        currentHintChunk = 0;
        if (coinsRemaining !== undefined) {
          aiCoins.set(coinsRemaining);
          initialCoins = coinsRemaining;
        }
      },
      // onError
      (error: string) => {
        bubbleChatMessage = error;
        hintHistory = [...hintHistory, error];
        const errorItem = createBubbleHistoryItem(error, true);
        bubbleHistory = [...bubbleHistory, errorItem];
        hintChunks = chunkHintMessage(error);
        currentHintChunk = 0;
      },
      selectedAiModel
    );

    bubbleChatLoading = false;
  }

  function attachFile(filePath: string) {
    attachedFiles = attachFileToList(attachedFiles, filePath, MAX_ATTACHED_FILES);
    showFilePicker = false;
  }

  function removeAttachedFile(filePath: string) {
    attachedFiles = removeFileFromList(attachedFiles, filePath);
  }
  function clearAttachedFiles() {
    attachedFiles = clearAllAttachedFiles();
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
    currentHintChunk = navigateHintChunk('prev', currentHintChunk, hintChunks);
  }
  function nextHintChunk() {
    currentHintChunk = navigateHintChunk('next', currentHintChunk, hintChunks);
  }

  function openChatFromBubble() {
    // Close the bubble and open the floating modal for more questions
    showQuickHint = false;
    isBubbleHidden = false;
    showFloatingModal = true;
    useBubbleMode = false;
    bubbleChatMessage = "";
    bubbleChatLoading = false;
  }

  // Handle selecting a history item from the floating modal
  function handleSelectHistoryItem(item: BubbleHistoryItem) {
    // Use helper to show bubble from history
    const bubbleState = showBubbleFromHistory(item);
    bubbleChatMessage = bubbleState.bubbleChatMessage || "";
    useBubbleMode = bubbleState.useBubbleMode || false;
    showQuickHint = true;
    isBubbleHidden = false;
    showFloatingModal = false;
    hintChunks = bubbleState.hintChunks || [];
    currentHintChunk = 0;
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
    // Use helper to add message to hints shown
    hintsShown = addToHintsShown(hintsShown, quickHintMessage);
    
    // Use helper to check if should auto-close
    if (shouldAutoClose(allTasksCompleted, hintsShown)) {
      // Use helper to reset bubble state
      const resetState = resetBubbleState();
      showQuickHint = resetState.showQuickHint || false;
      quickHintMessage = "";
      hintChunks = resetState.hintChunks || [];
      currentHintChunk = 0;
      hintsShown = [];
      isBubbleHidden = false;
      // Also reset chat bubble state from helper
      useBubbleMode = resetState.useBubbleMode || false;
      bubbleChatMessage = resetState.bubbleChatMessage || "";
      return;
    }
    
    // Use helper to reset bubble state
    const resetState = resetBubbleState();
    showQuickHint = resetState.showQuickHint || false;
    quickHintMessage = "";
    hintChunks = resetState.hintChunks || [];
    currentHintChunk = 0;
    isBubbleHidden = false;
    // Also reset chat bubble state from helper
    useBubbleMode = resetState.useBubbleMode || false;
    bubbleChatMessage = resetState.bubbleChatMessage || "";
  }

  function handleScroll() {
    if (!chatContainer) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainer;
    userScrolling = isUserScrolling(scrollTop, scrollHeight, clientHeight, 50);
  }

  function handleAiModelChange(value: string) {
    selectedAiModel = value;
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
  {#if quickHintLoading || bubbleChatLoading}
    <img
      src="/images/saz_thinking.png"
      alt="SAZ Thinking"
      class="w-full h-full object-cover animate-pulse"
    />
  {:else if (showQuickHint && quickHintMessage) || (useBubbleMode && bubbleChatMessage)}
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
  history={bubbleHistory}
  {userMessage}
  {isLoading}
  hasHint={!!(bubbleChatMessage || quickHintMessage || hasChatAiMessage)}
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
  onSelectHistory={handleSelectHistoryItem}
  aiModels={AI_MODELS}
  aiModel={selectedAiModel}
  onAiModelChange={handleAiModelChange}
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
