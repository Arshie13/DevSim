<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount, tick } from "svelte";
  import { browser } from "$app/environment";
  import type { TutorialStep } from "$components/tutorial/tutorialTypes";
  import { isCommandMatch, canonicalizeCommand, sleep, registerWindowListeners } from "$components/tutorial/tutorialUtils";
  import { resolvePlacement, getFallbackPlacement, type PlacementResult, type SpotlightRect } from "$components/tutorial/tutorialPositioning";
  import TutorialWelcomeModal from "$components/tutorial/TutorialWelcomeModal.svelte";
  import TutorialCalloutPanel from "$components/tutorial/TutorialCalloutPanel.svelte";
  import TutorialModals from "$components/tutorial/TutorialModals.svelte";

  export let steps: TutorialStep[];
  export let stack: string = "Tutorial";
  export let title: string = "Guided Tutorial";
  export let scenario: string = "";
  export let level: number = 1;
  export let allowSkip: boolean = true;
  export let onSwitchTab: ((tab: string) => void) | undefined = undefined;
  export let onRunTests: (() => void) | undefined = undefined;
  export let onSubmitSprint: (() => void) | undefined = undefined;
  export let onPrepareStep: ((step: TutorialStep) => Promise<void> | void) | undefined = undefined;
  export let codeEditStepId: string = "task-two-ui-edit";
  export let closeResultModalStepIds: string[] = ["test-task-one-result-continue", "test-task-two-result-continue"];
  export let reflectionStepId: string = "submit-sprint-reflection";
  export let layersStepId: string = "submit-sprint-layers";
  export let layersMinClicks: number = 2;

  const dispatch = createEventDispatcher<{ complete: void; skip: void }>();

  // ── UI state ────────────────────────────────────────────────────────────────
  let currentIdx = 0;
  let visible = false;
  let welcomeModalVisible = true;
  let completionModalVisible = false;
  let showSkipConfirm = false;
  let proceedLoading = false;

  // ── Spotlight / callout position ────────────────────────────────────────────
  let spotlight: SpotlightRect = { top: 0, left: 0, width: 0, height: 0 };
  let calloutTop = 16;
  let calloutLeft = 16;
  let arrowDir: PlacementResult["arrowDir"] = "top";
  let arrowOffset = "24px";
  let pointerReady = false;
  let waitingForTarget = false;
  let activeSpotlightTarget: string | null = null;

  // ── Step state ───────────────────────────────────────────────────────────────
  let clickError = "";
  let stepCodeSaveDone = false;
  let pendingTerminalCommand: string | null = null;
  let terminalOutputPollId: ReturnType<typeof setInterval> | null = null;
  let stepConfirmReady = false;
  let layerClicks: string[] = [];
  let reflectionInteracted = false;

  const TARGET_RETRY_COUNT = 36;
  const TARGET_RETRY_DELAY_MS = 120;

  function getCurrentStep() { return steps[currentIdx]; }

  function applyPlacement(p: PlacementResult) {
    arrowDir = p.arrowDir;
    arrowOffset = p.arrowOffset;
    calloutTop = p.calloutTop;
    calloutLeft = p.calloutLeft;
    spotlight = p.spotlight;
  }

  function applyFallback() {
    const p = getFallbackPlacement();
    arrowDir = p.arrowDir;
    arrowOffset = p.arrowOffset;
    calloutTop = p.calloutTop;
    calloutLeft = p.calloutLeft;
  }

  // ── Positioning ──────────────────────────────────────────────────────────────
  async function positionPointerForStep() {
    const s = getCurrentStep();
    const target = s.spotlightTarget ?? s.target;

    if (target && target === activeSpotlightTarget && pointerReady) {
      const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
      if (el) { applyPlacement(resolvePlacement(el.getBoundingClientRect(), s, codeEditStepId)); return; }
    }

    pointerReady = false;
    waitingForTarget = false;
    activeSpotlightTarget = null;

    if (!target) { applyFallback(); return; }
    waitingForTarget = true;

    for (let i = 0; i < TARGET_RETRY_COUNT; i += 1) {
      await tick();
      await new Promise<void>((res) => requestAnimationFrame(() => requestAnimationFrame(() => res())));
      const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
      if (el) {
        applyPlacement(resolvePlacement(el.getBoundingClientRect(), s, codeEditStepId));
        pointerReady = true;
        activeSpotlightTarget = target;
        waitingForTarget = false;
        return;
      }
      await sleep(TARGET_RETRY_DELAY_MS);
    }

    waitingForTarget = false;
    applyFallback();
  }

  // ── Step flow ────────────────────────────────────────────────────────────────
  async function prepareStep() {
    const s = getCurrentStep();
    clickError = "";
    stepCodeSaveDone = false;
    resetStepState();

    if (onPrepareStep) await onPrepareStep(s);

    if (s.switchTab && onSwitchTab) {
      onSwitchTab(s.switchTab);
      await tick();
      await new Promise<void>((res) => requestAnimationFrame(() => requestAnimationFrame(() => res())));
    }
    if (s.boardSubTab) {
      window.dispatchEvent(new CustomEvent("devsim-tour-board-subtab", { detail: { subTab: s.boardSubTab } }));
    }
    if (s.lockBoardTaskModalToTaskOrder) {
      window.dispatchEvent(new CustomEvent("devsim-tour-open-task-modal", { detail: { order: s.lockBoardTaskModalToTaskOrder } }));
    }

    await positionPointerForStep();
  }

  function advanceStep() {
    stepCodeSaveDone = false;
    const s = getCurrentStep();
    if (browser && closeResultModalStepIds.includes(s.id)) {
      window.dispatchEvent(new CustomEvent("devsim-tour-close-result-modal"));
    }
    if (currentIdx >= steps.length - 1) { openCompletionModal(); return; }
    currentIdx += 1;
    void prepareStep();
  }

  function beginTutorial() { welcomeModalVisible = false; visible = true; void prepareStep(); }

  function openCompletionModal() {
    if (!browser) return;
    window.dispatchEvent(new CustomEvent("devsim-tour-close-task-modal"));
    visible = false;
    completionModalVisible = true;
  }

  function completeTutorial() {
    if (browser) window.dispatchEvent(new CustomEvent("devsim-tour-close-task-modal"));
    proceedLoading = true;
    setTimeout(() => dispatch("complete"), 180);
  }

  function replayTutorial() {
    pendingTerminalCommand = null;
    clickError = "";
    completionModalVisible = false;
    currentIdx = 0;
    visible = true;
    void prepareStep();
  }

  function skipTutorial() { if (allowSkip) showSkipConfirm = true; }
  function confirmSkip() { showSkipConfirm = false; dispatch("skip"); }

  function resetStepState() {
    stopTerminalOutputPoll();
    stepConfirmReady = false;
    layerClicks = [];
    reflectionInteracted = false;
  }

  // ── Interaction locking ──────────────────────────────────────────────────────
  function collectTourTargets(path: EventTarget[]) {
    return path
      .filter((e): e is HTMLElement => e instanceof HTMLElement)
      .map((e) => e.getAttribute("data-tour"))
      .filter((v): v is string => Boolean(v));
  }

  function pathHasTourTarget(path: EventTarget[], id: string) {
    return path.some((e) => e instanceof HTMLElement && Boolean(e.closest(`[data-tour="${id}"]`)));
  }

  function isInteractionAllowed(path: EventTarget[], s: TutorialStep) {
    if (s.id === "search-type-query") {
      return pathHasTourTarget(path, "tutorial-search-panel") ||
        pathHasTourTarget(path, "tutorial-search-input") ||
        pathHasTourTarget(path, "tutorial-search-result-item");
    }
    const allowed = [s.target, ...(s.targets ?? [])].filter(Boolean) as string[];
    const clicked = collectTourTargets(path);
    if (!clicked.length) return false;
    if (s.requireCommand) return clicked.includes("terminal-panel");
    return clicked.some((v) => allowed.includes(v));
  }

  function blockIfLocked(event: MouseEvent | PointerEvent) {
    if (!visible) return false;
    const path = event.composedPath?.() ?? [];
    const inPanel = path.some((e) => e instanceof HTMLElement && Boolean(e.closest(".pt-panel") || e.closest(".pt-modal-box")));
    if (inPanel) return false;
    if (isInteractionAllowed(path, getCurrentStep())) return false;
    event.preventDefault();
    event.stopPropagation();
    clickError = "Only the required highlighted action is enabled for this step.";
    return true;
  }

  function handleInteractiveClick(event: MouseEvent) {
    if (!visible) return;
    if (blockIfLocked(event)) return;
    const path = event.composedPath?.() ?? [];
    const s = getCurrentStep();
    if (s.id === "search-type-query") {
      if (pathHasTourTarget(path, "tutorial-search-result-item")) clickError = "Opening selected search result...";
      return;
    }
    const targets = [s.target, ...(s.targets ?? [])].filter(Boolean) as string[];
    const clicked = collectTourTargets(path);
    const hitTarget = clicked.some((v) => targets.includes(v));
    const needsClick = s.requireTargetClick ?? Boolean(s.target && !s.requireCommand && !s.action && !s.confirmLabel);
    if (!s.target || s.requireCommand || s.action || !needsClick || !stepConfirmReady) return;
    if (hitTarget) { clickError = ""; advanceStep(); return; }
    clickError = pointerReady ? "Click the highlighted target to continue this step." : "Waiting for target to finish rendering. Click the required target once visible.";
  }

  function handleInteractivePointerDown(event: PointerEvent) {
    if (visible) void blockIfLocked(event);
  }

  // ── Terminal polling ─────────────────────────────────────────────────────────
  function stopTerminalOutputPoll() {
    if (terminalOutputPollId !== null) { clearInterval(terminalOutputPollId); terminalOutputPollId = null; }
  }

  function startTerminalOutputPoll(patterns: string[]) {
    stopTerminalOutputPoll();
    terminalOutputPollId = setInterval(() => {
      const rows = document.querySelector('[data-tour="terminal-panel"] .xterm-rows');
      const text = rows?.textContent ?? document.querySelector('[data-tour="terminal-panel"]')?.textContent ?? "";
      if (patterns.every((p) => text.includes(p))) { stopTerminalOutputPoll(); pendingTerminalCommand = null; clickError = ""; advanceStep(); }
    }, 1000);
  }

  // ── Event handlers ───────────────────────────────────────────────────────────
  function handleTerminalCommand(event: Event) {
    const s = getCurrentStep();
    if (!s.requireCommand || !s.command) return;
    const executed = (event as CustomEvent<{ command?: string }>).detail?.command ?? "";
    if (isCommandMatch(executed, s.command)) {
      if (s.waitForCompletion === false) { pendingTerminalCommand = null; clickError = ""; advanceStep(); return; }
      pendingTerminalCommand = canonicalizeCommand(executed);
      if (s.waitForTerminalOutput?.length) {
        clickError = "Command accepted. Waiting for client and server to start...";
        startTerminalOutputPoll(s.waitForTerminalOutput);
        return;
      }
      clickError = "Command accepted. Waiting for terminal to finish...";
      return;
    }
    if (pendingTerminalCommand) return;
    pendingTerminalCommand = null;
    clickError = `Expected terminal command: ${s.command}`;
  }

  function handleTerminalCommandComplete(event: Event) {
    const s = getCurrentStep();
    if (!s.requireCommand || !s.command || !pendingTerminalCommand) return;
    const raw = (event as CustomEvent<{ command?: string }>).detail?.command ?? "";
    if (canonicalizeCommand(raw) !== pendingTerminalCommand) return;
    if (!isCommandMatch(raw, s.command)) return;
    pendingTerminalCommand = null; clickError = ""; advanceStep();
  }

  function handleTutorialFileSaved(event: Event) {
    const s = getCurrentStep();
    if (s.id !== codeEditStepId) return;
    const file = (event as CustomEvent<{ file?: string }>).detail?.file ?? "current file";
    stepCodeSaveDone = true;
    clickError = `Saved ${file}. You can continue this step.`;
  }

  function handleTutorialFileOpened(event: Event) {
    const s = getCurrentStep();
    if (s.id === "search-type-query") { clickError = ""; advanceStep(); return; }
    if (!s.requiredFileContains) return;
    const opened = (event as CustomEvent<{ file?: string }>).detail?.file?.toLowerCase() ?? "";
    if (opened.includes(s.requiredFileContains.toLowerCase())) { clickError = ""; advanceStep(); }
  }

  function handleTestsComplete(event: Event) {
    if (getCurrentStep().action !== "runTests") return;
    const ok = (event as CustomEvent<{ success?: boolean }>).detail?.success;
    if (ok) { clickError = ""; advanceStep(); }
    else clickError = "Tests did not pass yet. Fix issues and run tests again.";
  }

  function handleImpactedLayerChange(e: Event) {
    const id = (e.target as HTMLElement).getAttribute("data-tour");
    if (id?.startsWith("impacted-layer-") && !layerClicks.includes(id)) layerClicks = [...layerClicks, id];
  }

  function handleWindowResize() { if (browser && pointerReady) void positionPointerForStep(); }

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  let removeListeners: () => void;

  onMount(() => {
    applyFallback();
    removeListeners = registerWindowListeners([
      ["pointerdown", handleInteractivePointerDown as EventListener, true],
      ["click", handleInteractiveClick as EventListener, true],
      ["contextmenu", handleInteractiveClick as EventListener, true],
      ["dblclick", handleInteractiveClick as EventListener, true],
      ["devsim-tutorial-file-opened", handleTutorialFileOpened as EventListener],
      ["devsim-tutorial-file-saved", handleTutorialFileSaved as EventListener],
      ["devsim-terminal-command", handleTerminalCommand as EventListener],
      ["devsim-terminal-command-complete", handleTerminalCommandComplete as EventListener],
      ["devsim-tests-complete", handleTestsComplete as EventListener],
      ["devsim-sprint-submitted", () => openCompletionModal()],
      ["devsim-tutorial-proceed-failed", () => { proceedLoading = false; }],
    ]);
    window.addEventListener("change", handleImpactedLayerChange, true);
  });

  onDestroy(() => {
    if (!browser) return;
    removeListeners?.();
    window.removeEventListener("change", handleImpactedLayerChange, true);
    stopTerminalOutputPoll();
    window.dispatchEvent(new CustomEvent("devsim-tour-close-task-modal"));
  });

  // ── Reactives ────────────────────────────────────────────────────────────────
  $: step = steps[currentIdx] ?? steps[0];
  $: isCommandStep = Boolean(step.requireCommand && step.command);
  $: isManualConfirmStep = Boolean(step.confirmLabel && !isCommandStep && step.action !== "runTests" && step.action !== "submitSprint");
  $: manualConfirmDisabled = step.id === codeEditStepId && !stepCodeSaveDone;
  $: progress = `${currentIdx + 1}/${steps.length}`;

  $: if (step.id === reflectionStepId) {
    stepConfirmReady = reflectionInteracted;
  } else if (step.id === layersStepId) {
    stepConfirmReady = layerClicks.length >= layersMinClicks;
  } else {
    stepConfirmReady = true;
  }
</script>

<svelte:window on:resize={handleWindowResize} />

{#if welcomeModalVisible}
  <TutorialWelcomeModal
    {stack} {title} {scenario} {level} {allowSkip}
    on:begin={beginTutorial}
    on:skip={skipTutorial}
  />
{/if}

{#if visible}
  {#if pointerReady}
    <div
      class="pt-spotlight"
      style="top:{spotlight.top}px; left:{spotlight.left}px; width:{spotlight.width}px; height:{spotlight.height}px;"
      aria-hidden="true"
    ></div>
  {/if}

  <TutorialCalloutPanel
    {step} {stack} {progress} {isCommandStep} {isManualConfirmStep}
    {manualConfirmDisabled} {pointerReady} {waitingForTarget} {clickError}
    {allowSkip} {arrowDir} {arrowOffset} {calloutTop} {calloutLeft}
    on:skip={skipTutorial}
    on:advance={advanceStep}
    on:runTests={() => { if (onRunTests) onRunTests(); clickError = "Waiting for test results..."; }}
    on:submitSprint={() => { if (onSubmitSprint) onSubmitSprint(); }}
  />
{/if}

<TutorialModals
  {showSkipConfirm} {completionModalVisible} {proceedLoading}
  on:skipConfirm={confirmSkip}
  on:skipCancel={() => { showSkipConfirm = false; }}
  on:replay={replayTutorial}
  on:proceed={completeTutorial}
/>

<style>
  .pt-spotlight {
    position: fixed;
    z-index: 10042;
    pointer-events: none;
    border: 2px solid rgba(0, 194, 255, 0.95);
    border-radius: 6px;
    box-shadow:
      0 0 0 9999px rgba(0, 0, 12, 0.82),
      0 0 16px rgba(0, 194, 255, 0.6),
      inset 0 0 0 1px rgba(0, 194, 255, 0.5);
    transition: top 0.28s ease, left 0.28s ease, width 0.28s ease, height 0.28s ease;
  }
</style>
