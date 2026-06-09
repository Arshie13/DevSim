<script lang="ts">
  import {
    aiChatHistory,
    aiCoins,
    aiHelpCredits,
    aiSelectedFile,
    aiFileTree,
    aiFileContents,
  } from "$lib/stores/ai";
  import { getInsufficientCoinsMessage, getErrorMessage } from "$lib/ai";
  import { type ITask } from "$lib/types";
  import FloatingModal from "./FloatingModal.svelte";
  import {
    calculateTotalCost,
    filterSourceFiles,
    attachFileToList,
    removeFileFromList,
    clearAllAttachedFiles,
    getHintMessage,
    createAiMessage,
    createUserMessage,
  } from "$lib/utils/aiHelpHelpers";
  import {
    MAX_ATTACHED_FILES,
    QUICK_HINT_COST,
  } from "$lib/utils/aiHelpConstants";
  import {
    generateContext as generateContextHelper,
    sendChatMessage as apiSendChatMessage,
    requestQuickHintBubble,
  } from "$lib/utils/aiHelpApi";

  // Props
  export let scenario: string = "";
  export let tasks: ITask[] = [];
  export let containerId: string = "";
  export let userId: string = "";
  export let projectName: string = "DevSim Project";
  export let level: number = 1;
  export let mode: "chat" | "quick" = "chat";
  export let initialSelectedFile: string = "";
  export let initialFileTree: string[] = [];
  export let initialFileContents: Record<string, string> = {};
  export let initialCoins: number = 1000;
  // The user's available AI help credits, spent before coins are charged.
  export let initialAiHelps: number = 0;
  export let initialAiModel: string = "nvidia/nemotron-3-nano-30b-a3b:free";
  // Whether the docked chat panel is open (controlled by the workspace tab button).
  export let show: boolean = false;
  export let onClose: () => void = () => {};

  // State
  let attachedFiles: { path: string; name: string }[] = [];
  let showFilePicker = false;
  let userMessage = "";
  let isLoading = false;
  const selectedAiModel = initialAiModel;

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
  $: currentAiHelps = $aiHelpCredits;
  // Help credits are spent before coins — while any remain, hints cost 0 coins.
  $: usesFreeHelp = currentAiHelps > 0;
  $: totalCost = calculateTotalCost(mode, attachedFiles.length);
  // What the user actually pays in coins for the next message (0 while helps remain).
  $: effectiveCost = usesFreeHelp ? 0 : totalCost;
  $: hasAiMessage =
    $aiChatHistory && $aiChatHistory.some((msg) => msg.role === "ai");

  // Initialize stores
  $: if (initialSelectedFile) aiSelectedFile.set(initialSelectedFile);
  $: if (initialFileTree.length > 0) aiFileTree.set(initialFileTree);
  $: if (Object.keys(initialFileContents).length > 0)
    aiFileContents.set(initialFileContents);
  $: if (initialCoins !== 1000) aiCoins.set(initialCoins);
  $: aiHelpCredits.set(initialAiHelps);

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

  // Send a typed chat message — the reply appears inline in the conversation.
  async function sendMessage() {
    const message = userMessage.trim();
    if (!message || isLoading) return;
    userMessage = "";

    const filesToInclude = [...attachedFiles];
    clearAttachedFiles();
    isLoading = true;

    try {
      // apiSendChatMessage pushes the user message, the AI reply (or any
      // warning) into aiChatHistory, and updates the coin/help stores.
      const result = await apiSendChatMessage(
        message,
        containerId,
        userId,
        level,
        mode,
        filesToInclude,
        currentCoins,
        effectiveCost,
        generateContext,
        selectedAiModel,
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
    }
  }

  // Quick hint — also rendered inline as a chat exchange.
  async function requestQuickHint() {
    if (isLoading) return;

    if (!containerId || !userId) {
      aiChatHistory.update((msgs) => [
        ...msgs,
        createAiMessage(
          !containerId
            ? "Container not available. Please start a workspace first."
            : "Please log in to use AI hints.",
          true,
        ),
      ]);
      return;
    }

    // A quick hint always costs QUICK_HINT_COST (it sends no attached files).
    if (!usesFreeHelp && currentCoins < QUICK_HINT_COST) {
      aiChatHistory.update((msgs) => [
        ...msgs,
        createAiMessage(
          getInsufficientCoinsMessage(QUICK_HINT_COST, currentCoins),
          true,
        ),
      ]);
      return;
    }

    aiChatHistory.update((msgs) => [
      ...msgs,
      createUserMessage("💡 Can I get a quick hint?"),
    ]);
    isLoading = true;

    const { message: hintMessage } = getHintMessage(tasks);

    try {
      await requestQuickHintBubble(
        hintMessage,
        containerId,
        userId,
        level,
        generateContext,
        // onSuccess
        (hint: string, coinsRemaining?: number) => {
          aiChatHistory.update((msgs) => [
            ...msgs,
            createAiMessage(
              hint ||
                "No hint available. Please try again or ask a specific question.",
            ),
          ]);
          if (coinsRemaining !== undefined) {
            aiCoins.set(coinsRemaining);
            initialCoins = coinsRemaining;
          }
        },
        // onError
        (error: string) => {
          aiChatHistory.update((msgs) => [
            ...msgs,
            createAiMessage(error, true),
          ]);
        },
        selectedAiModel,
      );
    } finally {
      isLoading = false;
    }
  }

  function attachFile(filePath: string) {
    attachedFiles = attachFileToList(
      attachedFiles,
      filePath,
      MAX_ATTACHED_FILES,
    );
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
      sendMessage();
    }
  }
</script>

<!-- ─── Docked AI Helper panel (toggled from the workspace tab bar) ─── -->
{#if show}
  <aside
    class="w-[380px] max-w-[85vw] flex-shrink-0 border-l border-[rgba(7,165,201,0.18)] flex flex-col overflow-hidden"
  >
    <FloatingModal
      messages={$aiChatHistory}
      {userMessage}
      {isLoading}
      hasHint={hasAiMessage}
      {currentCoins}
      {totalCost}
      aiHelps={currentAiHelps}
      {usesFreeHelp}
      {canAttachMore}
      {attachedFiles}
      fileTree={filteredFileTree}
      {showFilePicker}
      {onClose}
      onSend={sendMessage}
      onMessageChange={(value) => (userMessage = value)}
      onToggleFilePicker={toggleFilePicker}
      onRemoveFile={removeAttachedFile}
      onKeydown={handleKeydown}
      onAttachFile={attachFile}
      onCloseFilePicker={() => (showFilePicker = false)}
      onQuickHint={requestQuickHint}
    />
  </aside>
{/if}
