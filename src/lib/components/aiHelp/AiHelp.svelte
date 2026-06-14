<script lang="ts">
  import {
    aiChatHistory,
    aiCoins,
    aiHelpCredits,
    aiSelectedFile,
    aiFileTree,
    aiFileContents,
  } from "$lib/stores/ai";
  import { getInsufficientCreditsMessage, getErrorMessage } from "$lib/ai";
  import { type ITask } from "$lib/types";
  import FloatingModal from "./FloatingModal.svelte";
  import {
    calculateCreditCost,
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
    QUICK_HINT_CREDIT_COST,
    COINS_PER_AI_HELP_CREDIT,
  } from "$lib/utils/aiHelpConstants";
  import {
    generateContext as generateContextHelper,
    sendChatMessage as apiSendChatMessage,
    requestQuickHintBubble,
  } from "$lib/utils/aiHelpApi";
  import { onMount } from "svelte";

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

  // ── Resizable panel width ───────────────────────────────────────────
  // The panel is docked on the right of the workspace; dragging its left
  // edge widens or narrows it. The chosen width is remembered per browser.
  const MIN_PANEL_WIDTH = 320;
  const DEFAULT_PANEL_WIDTH = 380;
  const PANEL_WIDTH_KEY = "aiHelpPanelWidth";
  const RESIZE_STEP = 24;
  let panelWidth = DEFAULT_PANEL_WIDTH;
  let isResizing = false;

  // Hard ceiling so the panel can't take over the screen.
  const MAX_PANEL_WIDTH = 560;
  // Room kept for everything to our left: the file sidebar, the editor/terminal,
  // and (on the terminal tab) the terminal-manager panel docked beside us. This
  // stops the chat from ever being pushed off-screen or crowding those panels.
  const RESERVED_FOR_WORKSPACE = 480;
  let asideEl: HTMLElement | null = null;

  function maxPanelWidth(): number {
    // Measure the row we actually live in when we can; fall back to the
    // viewport before the panel has mounted.
    const available =
      asideEl?.parentElement?.clientWidth ??
      (typeof window === "undefined" ? MAX_PANEL_WIDTH : window.innerWidth);
    const fits = available - RESERVED_FOR_WORKSPACE;
    return Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, fits));
  }

  function clampWidth(width: number): number {
    return Math.min(Math.max(width, MIN_PANEL_WIDTH), maxPanelWidth());
  }

  onMount(() => {
    const saved = Number(localStorage.getItem(PANEL_WIDTH_KEY));
    if (saved && !Number.isNaN(saved)) panelWidth = clampWidth(saved);
  });

  function persistWidth() {
    try {
      localStorage.setItem(PANEL_WIDTH_KEY, String(panelWidth));
    } catch {
      /* storage unavailable — keep the in-memory width */
    }
  }

  function startResize(event: PointerEvent) {
    event.preventDefault();
    isResizing = true;
    const startX = event.clientX;
    const startWidth = panelWidth;

    // Avoid selecting text / flickering cursors while dragging.
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    function onMove(e: PointerEvent) {
      // Dragging left (smaller clientX) widens the panel.
      panelWidth = clampWidth(startWidth + (startX - e.clientX));
    }

    function onUp() {
      isResizing = false;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      persistWidth();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function handleResizeKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") {
      panelWidth = clampWidth(panelWidth + RESIZE_STEP);
    } else if (event.key === "ArrowRight") {
      panelWidth = clampWidth(panelWidth - RESIZE_STEP);
    } else {
      return;
    }
    event.preventDefault();
    persistWidth();
  }

  // Re-clamp if the viewport shrinks below the current panel width.
  function handleWindowResize() {
    const clamped = clampWidth(panelWidth);
    if (clamped !== panelWidth) panelWidth = clamped;
  }

  // When the panel opens, re-clamp once it has mounted so the width respects
  // the room left for the sidebar / terminal-manager panel beside it.
  $: if (show) {
    requestAnimationFrame(() => {
      const clamped = clampWidth(panelWidth);
      if (clamped !== panelWidth) panelWidth = clamped;
    });
  }

  // A hint that costs more credits than the user has, waiting for them to
  // approve the coins → credits exchange in the popup before it is sent.
  let pendingConvert: {
    kind: "chat" | "quick";
    creditsShort: number;
    coinsNeeded: number;
  } | null = null;

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
  // AI help credits are the only currency (1 = quick hint, 2 = chat message).
  // Any credits the user is short get covered by converting coins on the spot.
  $: creditCost = calculateCreditCost(mode);
  $: creditsShort = Math.max(0, creditCost - currentAiHelps);
  $: coinsNeeded = creditsShort * COINS_PER_AI_HELP_CREDIT;
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

    // Out of credits but coins can cover it — ask before converting.
    // (If coins can't cover it either, performSend surfaces the warning.)
    if (creditsShort > 0 && coinsNeeded <= currentCoins) {
      pendingConvert = { kind: "chat", creditsShort, coinsNeeded };
      return;
    }

    await performSend();
  }

  async function performSend() {
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
        currentAiHelps,
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

    // A quick hint always costs 1 AI help credit; missing credits are covered
    // by converting coins (100 coins per credit).
    const quickCreditsShort = Math.max(0, QUICK_HINT_CREDIT_COST - currentAiHelps);
    const quickCoinsNeeded = quickCreditsShort * COINS_PER_AI_HELP_CREDIT;
    if (quickCoinsNeeded > currentCoins) {
      aiChatHistory.update((msgs) => [
        ...msgs,
        createAiMessage(
          getInsufficientCreditsMessage(
            QUICK_HINT_CREDIT_COST,
            currentAiHelps,
            currentCoins,
            COINS_PER_AI_HELP_CREDIT,
          ),
          true,
        ),
      ]);
      return;
    }

    // Out of credits but coins can cover it — ask before converting.
    if (quickCreditsShort > 0) {
      pendingConvert = {
        kind: "quick",
        creditsShort: quickCreditsShort,
        coinsNeeded: quickCoinsNeeded,
      };
      return;
    }

    await performQuickHint();
  }

  async function performQuickHint() {
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

  // User approved the coins → credits exchange — send the staged hint.
  async function confirmConvert() {
    const pending = pendingConvert;
    pendingConvert = null;
    if (!pending || isLoading) return;

    if (pending.kind === "chat") {
      await performSend();
    } else {
      await performQuickHint();
    }
  }

  function cancelConvert() {
    pendingConvert = null;
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

<svelte:window on:resize={handleWindowResize} />

<!-- ─── Docked AI Helper panel (toggled from the workspace tab bar) ─── -->
{#if show}
  <aside
    bind:this={asideEl}
    class="relative flex-shrink-0 border-l border-[rgba(7,165,201,0.18)] flex flex-col overflow-hidden"
    style="width: {panelWidth}px; max-width: min(calc(100vw - {RESERVED_FOR_WORKSPACE}px), {MAX_PANEL_WIDTH}px);"
  >
    <!-- Drag handle: resize the panel by dragging its left edge. -->
    <div
      class="absolute left-0 top-0 z-30 h-full w-1.5 -translate-x-1/2 cursor-col-resize transition-colors hover:bg-cyan-500/40 {isResizing
        ? 'bg-cyan-500/50'
        : ''}"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize AI assistant panel"
      aria-valuenow={panelWidth}
      tabindex="0"
      title="Drag to resize"
      onpointerdown={startResize}
      onkeydown={handleResizeKeydown}
    ></div>

    <FloatingModal
      messages={$aiChatHistory}
      {userMessage}
      {isLoading}
      hasHint={hasAiMessage}
      {creditCost}
      aiHelps={currentAiHelps}
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
      convertPrompt={pendingConvert}
      onConfirmConvert={confirmConvert}
      onCancelConvert={cancelConvert}
    />
  </aside>
{/if}
