<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount, tick } from "svelte";
  import { browser } from "$app/environment";
  import {
    STEPS,
    type InteractiveStep,
  } from "$components/tutorial/PERN/PERNTutorialData";

  export let stack: string = "PERN";
  export let title: string = "Guided Tutorial";
  export let scenario: string = "";
  export let level: number = 1;
  export let allowSkip: boolean = true;
  export let onSwitchTab: ((tab: string) => void) | undefined = undefined;
  export let onRunTests: (() => void) | undefined = undefined;
  export let onSubmitSprint: (() => void) | undefined = undefined;

  const dispatch = createEventDispatcher<{ complete: void }>();

  let currentIdx = 0;
  let visible = false;
  let welcomeModalVisible = true;
  let completionModalVisible = false;
  let spotlight = { top: 0, left: 0, width: 0, height: 0 };
  let calloutTop = 16;
  let calloutLeft = 16;
  let arrowDir: "top" | "bottom" | "left" | "right" = "top";
  let arrowOffset = "24px";
  let pointerReady = false;
  let clickError = "";
  let waitingForTarget = false;
  let stepCodeSaveDone = false;
  let pendingTerminalCommand: string | null = null;
  let terminalOutputPollId: ReturnType<typeof setInterval> | null = null;
  let activeSpotlightTarget: string | null = null;
  let step: InteractiveStep = STEPS[0];
  let isCommandStep = false;
  let isManualConfirmStep = false;
  let progress = "1/1";
  let manualConfirmDisabled = false;

  const CALLOUT_W = 440;
  const CALLOUT_H = 360;
  const SPOT_PAD = 8;
  const GAP = 14;
  const EDGE_MARGIN = 12;
  const TARGET_RETRY_COUNT = 36;
  const TARGET_RETRY_DELAY_MS = 120;
  const MODAL_SPOTLIGHT_TARGETS = new Set([
    'submit-sprint-modal',
    'test-selection-modal',
    'test-result-modal',
  ]);

  function getCurrentStep() {
    return STEPS[currentIdx];
  }

  function normalizeCommand(value: string) {
    return value
      .replace(/\x1b\[[0-9;]*[A-Za-z]/g, "")  // ANSI escape sequences (cursor movement, colors)
      .replace(/\x1b./g, "")                    // remaining ESC + single char sequences
      .replace(/\[(?:200|201)~/g, "")           // bracket paste mode markers
      .replace(/[\x00-\x08\x0b-\x1f\x7f]/g, "") // non-printable control characters
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function canonicalizeCommand(value: string) {
    const normalized = normalizeCommand(value);
    if (normalized === "npm i") return "npm install";

    if (normalized.startsWith("cd ")) {
      const rawPath = normalized.slice(3).trim();
      if (rawPath === "/") return "cd /";
      const cleanedPath = rawPath
        .replace(/\/+$/, "")   // strip trailing slashes (tab-completion adds these)
        .replace(/^\.\//, ""); // strip leading ./ (tab-completion may prefix with ./)
      return `cd ${cleanedPath || rawPath}`;
    }

    return normalized;
  }

  function isCommandMatch(executed: string, expected: string) {
    return canonicalizeCommand(executed) === canonicalizeCommand(expected);
  }

  function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  function setCalloutFallbackPosition() {
    arrowDir = "left";
    arrowOffset = "24px";
    calloutTop = EDGE_MARGIN;
    calloutLeft = Math.max(
      EDGE_MARGIN,
      window.innerWidth - CALLOUT_W - EDGE_MARGIN,
    );
  }

  const CLOSE_RESULT_MODAL_STEPS = new Set([
    'test-task-one-result-continue',
    'test-task-two-result-continue',
  ]);

  function advanceStep() {
    stepCodeSaveDone = false;

    const currentStep = getCurrentStep();
    if (browser && CLOSE_RESULT_MODAL_STEPS.has(currentStep.id)) {
      window.dispatchEvent(new CustomEvent('devsim-tour-close-result-modal'));
    }

    if (currentIdx >= STEPS.length - 1) {
      openCompletionModal();
      return;
    }

    currentIdx += 1;
    void prepareStep();
  }

  function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(max, val));
  }

  function resolvePlacement(
    r: DOMRect,
    preferSide: InteractiveStep["preferSide"],
  ) {
    const spaceBelow = window.innerHeight - r.bottom - SPOT_PAD;
    const spaceAbove = r.top - SPOT_PAD;
    const spaceRight = window.innerWidth - r.right - SPOT_PAD;
    const spaceLeft = r.left - SPOT_PAD;

    const spotL = r.left - SPOT_PAD;
    const spotT = r.top - SPOT_PAD;
    const spotW = r.width + SPOT_PAD * 2;
    const spotH = r.height + SPOT_PAD * 2;
    const spotCX = spotL + spotW / 2;
    const spotCY = spotT + spotH / 2;

    spotlight = { top: spotT, left: spotL, width: spotW, height: spotH };

    // For README review, Search Works confirmation, and terminal command steps,
    // pin the panel to the right blank area to keep core content unobstructed.
    // This keeps important editor/terminal content unobstructed.
    if (
      step.id === "read-readme" ||
      step.id === "search-works-confirm" ||
      step.id === "task-two-ui-edit" ||
      step.requireCommand ||
      (step.spotlightTarget != null && MODAL_SPOTLIGHT_TARGETS.has(step.spotlightTarget))
    ) {
      arrowDir = "left";
      calloutLeft = Math.max(
        EDGE_MARGIN,
        window.innerWidth - CALLOUT_W - EDGE_MARGIN,
      );
      calloutTop = clamp(
        spotCY - CALLOUT_H / 2,
        EDGE_MARGIN,
        window.innerHeight - CALLOUT_H - EDGE_MARGIN,
      );
      arrowOffset = `${clamp(spotCY - calloutTop, 20, CALLOUT_H - 20)}px`;
      return;
    }

    // Force screen-right positioning for preferSide === 'right' when sufficient space on right
    if (preferSide === "right" && spaceRight >= CALLOUT_W + GAP) {
      arrowDir = "left";
      calloutLeft = window.innerWidth - CALLOUT_W - EDGE_MARGIN;
      calloutTop = clamp(
        spotCY - CALLOUT_H / 2,
        EDGE_MARGIN,
        window.innerHeight - CALLOUT_H - EDGE_MARGIN,
      );
      arrowOffset = `${clamp(spotCY - calloutTop, 20, CALLOUT_H - 20)}px`;
      return;
    }

    function placeBelow() {
      arrowDir = "top";
      calloutTop = clamp(
        spotT + spotH + GAP,
        EDGE_MARGIN,
        window.innerHeight - CALLOUT_H - EDGE_MARGIN,
      );
      calloutLeft = clamp(
        spotCX - CALLOUT_W / 2,
        EDGE_MARGIN,
        window.innerWidth - CALLOUT_W - EDGE_MARGIN,
      );
      arrowOffset = `${clamp(spotCX - calloutLeft, 20, CALLOUT_W - 20)}px`;
    }

    function placeAbove() {
      arrowDir = "bottom";
      calloutTop = clamp(
        spotT - CALLOUT_H - GAP,
        EDGE_MARGIN,
        window.innerHeight - CALLOUT_H - EDGE_MARGIN,
      );
      calloutLeft = clamp(
        spotCX - CALLOUT_W / 2,
        EDGE_MARGIN,
        window.innerWidth - CALLOUT_W - EDGE_MARGIN,
      );
      arrowOffset = `${clamp(spotCX - calloutLeft, 20, CALLOUT_W - 20)}px`;
    }

    function placeRight() {
      arrowDir = "left";
      calloutLeft = clamp(
        spotL + spotW + GAP,
        EDGE_MARGIN,
        window.innerWidth - CALLOUT_W - EDGE_MARGIN,
      );
      calloutTop = clamp(
        spotCY - CALLOUT_H / 2,
        EDGE_MARGIN,
        window.innerHeight - CALLOUT_H - EDGE_MARGIN,
      );
      arrowOffset = `${clamp(spotCY - calloutTop, 20, CALLOUT_H - 20)}px`;
    }

    function placeLeft() {
      arrowDir = "right";
      calloutLeft = clamp(
        spotL - CALLOUT_W - GAP,
        EDGE_MARGIN,
        window.innerWidth - CALLOUT_W - EDGE_MARGIN,
      );
      calloutTop = clamp(
        spotCY - CALLOUT_H / 2,
        EDGE_MARGIN,
        window.innerHeight - CALLOUT_H - EDGE_MARGIN,
      );
      arrowOffset = `${clamp(spotCY - calloutTop, 20, CALLOUT_H - 20)}px`;
    }

    if (preferSide === "top" && spaceBelow >= CALLOUT_H + GAP) {
      placeBelow();
      return;
    }
    if (preferSide === "bottom" && spaceAbove >= CALLOUT_H + GAP) {
      placeAbove();
      return;
    }
    if (preferSide === "left" && spaceRight >= CALLOUT_W + GAP) {
      placeRight();
      return;
    }
    if (preferSide === "right" && spaceLeft >= CALLOUT_W + GAP) {
      placeLeft();
      return;
    }

    const scores: Array<[number, () => void]> = [
      [spaceBelow, placeBelow],
      [spaceAbove, placeAbove],
      [spaceRight, placeRight],
      [spaceLeft, placeLeft],
    ];
    scores.sort((a, b) => b[0] - a[0]);
    scores[0][1]();
  }

  async function positionPointerForStep() {
    const step = getCurrentStep();
    const spotlightTarget = step.spotlightTarget ?? step.target;

    // If the next step targets the same element, skip the reset to avoid spotlight flash.
    if (spotlightTarget && spotlightTarget === activeSpotlightTarget && pointerReady) {
      const el = document.querySelector<HTMLElement>(`[data-tour="${spotlightTarget}"]`);
      if (el) {
        resolvePlacement(el.getBoundingClientRect(), step.preferSide ?? "auto");
        return;
      }
    }

    pointerReady = false;
    waitingForTarget = false;
    activeSpotlightTarget = null;

    if (!spotlightTarget) {
      setCalloutFallbackPosition();
      return;
    }

    waitingForTarget = true;

    for (let attempt = 0; attempt < TARGET_RETRY_COUNT; attempt += 1) {
      await tick();
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );

      const el = document.querySelector<HTMLElement>(
        `[data-tour="${spotlightTarget}"]`,
      );
      if (el) {
        const rect = el.getBoundingClientRect();
        resolvePlacement(rect, step.preferSide ?? "auto");
        pointerReady = true;
        activeSpotlightTarget = spotlightTarget;
        waitingForTarget = false;
        return;
      }

      await sleep(TARGET_RETRY_DELAY_MS);
    }

    waitingForTarget = false;
    setCalloutFallbackPosition();
  }

  async function prepareStep() {
    const step = getCurrentStep();
    clickError = "";
    stepCodeSaveDone = false;
    resetStepState();

    if (step.id === "open-explorer") {
      window.dispatchEvent(new CustomEvent("devsim-tour-open-explorer-panel"));
      window.dispatchEvent(new CustomEvent("devsim-tour-collapse-root-folder"));
    }

    if (step.id === "readme-open") {
      window.dispatchEvent(new CustomEvent("devsim-tour-open-explorer-panel"));
    }

    if (step.id === "task-two-ui-edit") {
      window.dispatchEvent(
        new CustomEvent("devsim-tour-open-file", {
          detail: {
            file: "client/src/pages/TodoPage.tsx",
            lineNumber: 71,
            searchTerm: "To-Do List Tutorial",
          },
        }),
      );
    }

    if (step.id === 'submit-sprint-reflection') {
      // Trigger auto-fill
      const event = new CustomEvent('focus', { bubbles: true });
      const target = document.querySelector('[data-tour="mastery-reflection-input"]') as HTMLElement;
      target?.dispatchEvent(event);
    }

    if (step.switchTab && onSwitchTab) {
      onSwitchTab(step.switchTab);
      await tick();
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    }

    if (step.boardSubTab) {
      window.dispatchEvent(
        new CustomEvent("devsim-tour-board-subtab", {
          detail: { subTab: step.boardSubTab },
        }),
      );
    }

    if (step.lockBoardTaskModalToTaskOrder) {
      window.dispatchEvent(
        new CustomEvent("devsim-tour-open-task-modal", {
          detail: { order: step.lockBoardTaskModalToTaskOrder },
        }),
      );
    }

    await positionPointerForStep();
  }


  function beginTutorial() {
    welcomeModalVisible = false;
    visible = true;
    void prepareStep();
  }

  function openCompletionModal() {
    if (!browser) return;
    window.dispatchEvent(new CustomEvent("devsim-tour-close-task-modal"));
    visible = false;
    completionModalVisible = true;
  }

  function showCompletionModal() {
    if (!browser) return;
    window.dispatchEvent(new CustomEvent("devsim-tour-close-task-modal"));
    completionModalVisible = true;
    // Keep visible = true so the proceed-to-real-workspace step still guides the user
  }

  let copySuccess = false;

  async function copyStepText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copySuccess = true;
      setTimeout(() => { copySuccess = false; }, 2000);
    } catch {
      copySuccess = false;
    }
  }

  function handleSprintSubmitted() {
    const current = getCurrentStep();
    if (current.id === 'finish-tutorial-open-modal') {
      currentIdx += 1;
      void prepareStep();
    }
    showCompletionModal();
  }

  function completeTutorial() {
    if (browser) {
      window.dispatchEvent(new CustomEvent("devsim-tour-close-task-modal"));
    }
    completionModalVisible = false;
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

  function skipTutorial() {
    if (!allowSkip) return;
    completeTutorial();
  }

  function handleRunTests() {
    if (onRunTests) {
      onRunTests();
    }
    clickError = "Waiting for test results...";
  }

  function handleSubmitSprint() {
    if (onSubmitSprint) {
      onSubmitSprint();
    }
  }

  function collectClickedTourTargets(path: EventTarget[]) {
    return path
      .filter((entry): entry is HTMLElement => entry instanceof HTMLElement)
      .map((entry) => entry.getAttribute("data-tour"))
      .filter((val): val is string => Boolean(val));
  }

  function pathContainsTourTarget(path: EventTarget[], tourTarget: string) {
    return path.some((entry) => {
      if (!(entry instanceof HTMLElement)) return false;
      return Boolean(entry.closest(`[data-tour="${tourTarget}"]`));
    });
  }

  function isInteractionAllowed(path: EventTarget[], step: InteractiveStep) {
    const currentTargets = [step.target, ...(step.targets ?? [])].filter(
      Boolean,
    ) as string[];
    const clickedTargets = collectClickedTourTargets(path);

    if (step.id === "search-type-query") {
      return (
        pathContainsTourTarget(path, "tutorial-search-panel") ||
        pathContainsTourTarget(path, "tutorial-search-input") ||
        pathContainsTourTarget(path, "tutorial-search-result-item")
      );
    }

    if (clickedTargets.length === 0) {
      return false;
    }

    if (step.requireCommand) {
      return clickedTargets.includes("terminal-panel");
    }
    return clickedTargets.some((val) => currentTargets.includes(val));
  }

  function blockIfLocked(event: MouseEvent | PointerEvent) {
    if (!visible) return false;

    const path = event.composedPath?.() ?? [];
    const fromTutorialPanel = path.some((entry) => {
      if (!(entry instanceof HTMLElement)) return false;
      return Boolean(
        entry.closest(".pt-panel") || entry.closest(".pt-modal-box"),
      );
    });
    if (fromTutorialPanel) return false;

    const step = getCurrentStep();
    const allowed = isInteractionAllowed(path, step);
    if (allowed) return false;

    event.preventDefault();
    event.stopPropagation();
    clickError =
      "Only the required highlighted action is enabled for this step.";
    return true;
  }

function handleInteractiveClick(event: MouseEvent) {
    if (!visible) return;
    if (blockIfLocked(event)) return;

    const path = event.composedPath?.() ?? [];
    const step = getCurrentStep();

    if (step.id === "search-type-query") {
      if (pathContainsTourTarget(path, "tutorial-search-result-item")) {
        clickError = "Opening selected search result...";
      }
      return;
    }

    const currentTargets = [step.target, ...(step.targets ?? [])].filter(
      Boolean,
    ) as string[];
    const clickedTargets = collectClickedTourTargets(path);

    const clickedCurrentTarget = clickedTargets.some((val) =>
      currentTargets.includes(val),
    );

    const requiresTargetClick =
      step.requireTargetClick ?? 
      Boolean(
        step.target &&
          !step.requireCommand &&
          !step.action &&
          !step.confirmLabel,
      );
    if (
      !step.target ||
      step.requireCommand ||
      step.action ||
      !requiresTargetClick ||
      !stepConfirmReady
    )
      return;

    if (clickedCurrentTarget) {
      clickError = "";
      advanceStep();
      return;
    }

    clickError = pointerReady
      ? "Click the highlighted target to continue this step."
      : "Waiting for target to finish rendering. Click the required target once visible.";
  }


  function handleInteractivePointerDown(event: PointerEvent) {
    if (!visible) return;
    void blockIfLocked(event);
  }

  function stopTerminalOutputPoll() {
    if (terminalOutputPollId !== null) {
      clearInterval(terminalOutputPollId);
      terminalOutputPollId = null;
    }
  }

  function startTerminalOutputPoll(patterns: string[]) {
    stopTerminalOutputPoll();
    terminalOutputPollId = setInterval(() => {
      const rows = document.querySelector('[data-tour="terminal-panel"] .xterm-rows');
      const text = rows?.textContent ?? document.querySelector('[data-tour="terminal-panel"]')?.textContent ?? '';
      if (patterns.every((p) => text.includes(p))) {
        stopTerminalOutputPoll();
        pendingTerminalCommand = null;
        clickError = '';
        advanceStep();
      }
    }, 1000);
  }

  function handleTerminalCommand(event: Event) {
    const step = getCurrentStep();
    if (!step.requireCommand || !step.command) return;

    const customEvent = event as CustomEvent<{ command?: string }>;
    const executed = customEvent.detail?.command ?? "";
    const expected = step.command;

    if (isCommandMatch(executed, expected)) {
      if (step.waitForCompletion === false) {
        pendingTerminalCommand = null;
        clickError = "";
        advanceStep();
        return;
      }

      pendingTerminalCommand = canonicalizeCommand(executed);

      if (step.waitForTerminalOutput && step.waitForTerminalOutput.length > 0) {
        clickError = "Command accepted. Waiting for client and server to start...";
        startTerminalOutputPoll(step.waitForTerminalOutput);
        return;
      }

      clickError = "Command accepted. Waiting for terminal to finish...";
      return;
    }

    // Ignore follow-up interactive input while an accepted command is still running.
    // Example: prisma migrate dev asking for migration name.
    if (pendingTerminalCommand) {
      return;
    }

    pendingTerminalCommand = null;
    clickError = `Expected terminal command: ${step.command}`;
  }

  function handleTerminalCommandComplete(event: Event) {
    const step = getCurrentStep();
    if (!step.requireCommand || !step.command || !pendingTerminalCommand)
      return;

    const customEvent = event as CustomEvent<{ command?: string }>;
    const completedRaw = customEvent.detail?.command ?? "";
    const completed = canonicalizeCommand(completedRaw);

    if (completed !== pendingTerminalCommand) return;
    if (!isCommandMatch(completedRaw, step.command)) return;

    pendingTerminalCommand = null;
    clickError = "";
    advanceStep();
  }

  function handleTutorialFileSaved(event: Event) {
    const step = getCurrentStep();
    if (step.id !== "task-two-ui-edit") return;

    const customEvent = event as CustomEvent<{ file?: string }>;
    const file = customEvent.detail?.file ?? "current file";
    stepCodeSaveDone = true;
    clickError = `Saved ${file}. You can continue this step.`;
  }

  function handleTutorialFileOpened(event: Event) {
    const step = getCurrentStep();

    if (step.id === "search-type-query") {
      clickError = "";
      advanceStep();
      return;
    }

    if (!step.requiredFileContains) return;

    const customEvent = event as CustomEvent<{ file?: string }>;
    const openedFile = customEvent.detail?.file?.toLowerCase() ?? "";
    if (openedFile.includes(step.requiredFileContains.toLowerCase())) {
      clickError = "";
      advanceStep();
    }
  }

  function handleTestsComplete(event: Event) {
    const step = getCurrentStep();
    if (step.action === "runTests") {
      const customEvent = event as CustomEvent<{ success?: boolean }>;
      if (customEvent.detail?.success) {
        clickError = "";
        advanceStep();
      } else {
        clickError = "Tests did not pass yet. Fix issues and run tests again.";
      }
    }
  }

  onMount(async () => {
    setCalloutFallbackPosition();
    window.addEventListener("pointerdown", handleInteractivePointerDown, true);
    window.addEventListener("click", handleInteractiveClick, true);
    window.addEventListener(
      "contextmenu",
      handleInteractiveClick as EventListener,
      true,
    );
    window.addEventListener("dblclick", handleInteractiveClick, true);
    window.addEventListener(
      "devsim-tutorial-file-opened",
      handleTutorialFileOpened as EventListener,
    );
    window.addEventListener(
      "devsim-tutorial-file-saved",
      handleTutorialFileSaved as EventListener,
    );
    window.addEventListener(
      "devsim-terminal-command",
      handleTerminalCommand as EventListener,
    );
    window.addEventListener(
      "devsim-terminal-command-complete",
      handleTerminalCommandComplete as EventListener,
    );
    window.addEventListener(
      "devsim-tests-complete",
      handleTestsComplete as EventListener,
    );
    window.addEventListener(
      "devsim-sprint-submitted",
      handleSprintSubmitted as EventListener,
    );
    window.addEventListener(
      "change",
      (e: Event) => {
        const target = (e.target as HTMLElement);
        const layerId = target.getAttribute('data-tour');
        if (layerId && layerId.startsWith('impacted-layer-')) {
          if (!layerClicks.includes(layerId)) {
            layerClicks = [...layerClicks, layerId];
          }
        }
      },
      true
    );
  });

  onDestroy(() => {
    if (!browser) return;
    window.removeEventListener(
      "pointerdown",
      handleInteractivePointerDown,
      true,
    );
    window.removeEventListener("click", handleInteractiveClick, true);
    window.removeEventListener(
      "contextmenu",
      handleInteractiveClick as EventListener,
      true,
    );
    window.removeEventListener("dblclick", handleInteractiveClick, true);
    window.removeEventListener(
      "devsim-tutorial-file-opened",
      handleTutorialFileOpened as EventListener,
    );
    window.removeEventListener(
      "devsim-tutorial-file-saved",
      handleTutorialFileSaved as EventListener,
    );
    window.removeEventListener(
      "devsim-terminal-command",
      handleTerminalCommand as EventListener,
    );
    window.removeEventListener(
      "devsim-terminal-command-complete",
      handleTerminalCommandComplete as EventListener,
    );
    window.removeEventListener(
      "devsim-tests-complete",
      handleTestsComplete as EventListener,
    );
    window.removeEventListener(
      "devsim-sprint-submitted",
      handleSprintSubmitted as EventListener,
    );
    stopTerminalOutputPoll();
    window.dispatchEvent(new CustomEvent("devsim-tour-close-task-modal"));
  });

  function handleWindowResize() {
    if (!browser) return;
    if (pointerReady) void positionPointerForStep();
  }

  $: step = STEPS[currentIdx] ?? STEPS[0];
  $: isCommandStep = Boolean(step.requireCommand && step.command);
  $: isManualConfirmStep = Boolean(
    step.confirmLabel &&
      !isCommandStep &&
      step.action !== "runTests" &&
      step.action !== "submitSprint",
  );
$: manualConfirmDisabled =
    step.id === "task-two-ui-edit" && !stepCodeSaveDone;
  $: progress = `${currentIdx + 1}/${STEPS.length}`;

  let stepConfirmReady = false;
  let layerClicks: string[] = [];
  let reflectionInteracted = false;

  function resetStepState() {
    stopTerminalOutputPoll();
    stepConfirmReady = false;
    layerClicks = [];
    reflectionInteracted = false;
  }

  $: if (step.id === 'submit-sprint-reflection') {
    stepConfirmReady = reflectionInteracted;
  } else if (step.id === 'submit-sprint-layers') {
    stepConfirmReady = layerClicks.length >= 2;
  } else {
    stepConfirmReady = true;
  }
</script>

<svelte:window on:resize={handleWindowResize} />

{#if welcomeModalVisible}
  <div class="pt-modal-backdrop" role="presentation">
    <div
      class="pt-modal-box"
      role="dialog"
      aria-modal="true"
      aria-label="Tutorial introduction"
    >
      <div class="pt-modal-accent"></div>
      <p class="pt-eyebrow">Welcome</p>
      <h2 class="pt-modal-title">Guided Sprint Tutorial</h2>
      <p class="pt-modal-meta">
        Level {String(level).padStart(2, "0")} · {stack} · {title}
      </p>
      <p class="pt-modal-body">
        You will complete Task 1 and Task 2 in order: board workflow, README
        setup, terminal commands, preview checks, and testing. Follow each
        highlighted action to proceed.
      </p>
      {#if scenario}
        <p class="pt-modal-scenario">{scenario}</p>
      {/if}
      <div class="pt-modal-actions">
        {#if allowSkip}
          <button class="pt-btn pt-btn-ghost" on:click={skipTutorial}
            >Skip Tutorial</button
          >
        {/if}
        <button class="pt-btn pt-btn-primary" on:click={beginTutorial}
          >Begin Tutorial</button
        >
      </div>
    </div>
  </div>
{/if}

{#if visible}
  {#if pointerReady}
    <div
      class="pt-spotlight"
      style="
        top: {spotlight.top}px;
        left: {spotlight.left}px;
        width: {spotlight.width}px;
        height: {spotlight.height}px;
      "
      aria-hidden="true"
    ></div>
  {/if}

  <div class="pt-overlay" aria-live="polite">
    <div
      class="pt-panel"
      class:pt-panel--locating={waitingForTarget && !pointerReady}
      role="dialog"
      aria-modal="false"
      aria-label="Interactive tutorial"
      style="top:{calloutTop}px; left:{calloutLeft}px;"
    >
      {#if pointerReady}
        <div
          class="pt-arrow pt-arrow-{arrowDir}"
          style={arrowDir === "top" || arrowDir === "bottom"
            ? `left:${arrowOffset};`
            : `top:${arrowOffset};`}
          aria-hidden="true"
        >
          →
        </div>
      {/if}

      <header class="pt-header">
        <p class="pt-eyebrow">{stack} Interactive Tutorial</p>
        <h3>{step.title}</h3>
        <span class="pt-progress">Step {progress}</span>
      </header>

      <div class="pt-body">
        <p class="pt-instruction">{step.instruction}</p>
        <p class="pt-hint">{step.hint}</p>
        {#if step.copyText}
          <button
            class="pt-btn pt-btn-secondary pt-copy-btn"
            on:click={() => copyStepText(step.copyText ?? '')}
          >{copySuccess ? '✓ Copied!' : 'Copy Example'}</button>
        {/if}
      </div>
    {#if waitingForTarget && !pointerReady}
        <p class="pt-muted">Locating target in the workspace...</p>
      {/if}  
      {#if clickError}
        <p class="pt-error">{clickError}</p>
      {/if}

      {#if isCommandStep}
        <code class="pt-command">Run in terminal: {step.command}</code>
      {:else if isManualConfirmStep}
        <button
          class="pt-btn pt-btn-primary"
          on:click={advanceStep}
          disabled={manualConfirmDisabled}
        >
          {manualConfirmDisabled
            ? "Save your UI change first"
            : step.confirmLabel}
        </button>
      {:else if step.action === "runTests"}
        <button class="pt-btn pt-btn-primary" on:click={handleRunTests}
          >Run Tests</button
        >
      {/if}

      <footer class="pt-footer">
        {#if allowSkip}
          <button class="pt-btn pt-btn-ghost" on:click={skipTutorial}
            >Skip Tutorial</button
          >
        {/if}
      </footer>
    </div>
  </div>
{/if}

{#if completionModalVisible}
  <div class="pt-modal-backdrop" role="presentation">
    <div
      class="pt-modal-box"
      role="dialog"
      aria-modal="true"
      aria-label="Tutorial completed"
    >
      <div class="pt-modal-accent"></div>
      <p class="pt-eyebrow">Tutorial Complete</p>
      <h2 class="pt-modal-title">You completed the guided tutorial.</h2>
      <p class="pt-modal-body">
        Task 1 and Task 2 flow is now finished. Proceed to your workspace
        project to continue building.
      </p>
      <div class="pt-modal-actions">
        <button class="pt-btn pt-btn-ghost" on:click={replayTutorial}
          >Replay Tutorial</button
        >
        <button
          class="pt-btn pt-btn-primary"
          data-tour="tutorial-proceed-button"
          on:click={completeTutorial}
          >Proceed To Workspace</button
        >
      </div>
    </div>
  </div>
{/if}

<style>
  .pt-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10060;
    background: rgba(0, 0, 10, 0.88);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .pt-modal-box {
    width: min(520px, 90vw);
    height: auto;
    max-height: min(92vh, 820px);
    overflow-y: auto;
    border-radius: 6px;
    border: 1px solid rgba(0, 194, 255, 0.35);
    background: #0d1425;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    padding: 1.35rem 1.2rem 1.15rem;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .pt-modal-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #00c2ff;
  }

  .pt-modal-title {
    margin: 0.45rem 0 0.8rem;
    font-family: "Orbitron", sans-serif;
    color: #d0d7dd;
    font-size: 1.08rem;
  }

  .pt-modal-body {
    margin: 0;
    color: rgba(208, 215, 221, 0.84);
    line-height: 1.5;
    font-size: 0.92rem;
  }

  .pt-modal-meta {
    margin: 0 0 0.45rem;
    color: #00c2ff;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-family: "Share Tech Mono", monospace;
  }

  .pt-modal-scenario {
    margin: 0.75rem 0 0;
    color: rgba(208, 215, 221, 0.75);
    font-size: 0.82rem;
    line-height: 1.45;
    border-left: 2px solid rgba(0, 194, 255, 0.35);
    padding-left: 0.6rem;
  }

  .pt-modal-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.45rem;
  }

  .pt-overlay {
    position: fixed;
    inset: 0;
    z-index: 10045;
    pointer-events: none;
  }

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
    transition:
      top 0.28s ease,
      left 0.28s ease,
      width 0.28s ease,
      height 0.28s ease;
  }

  .pt-panel {
    position: fixed;
    z-index: 10046;
    width: min(440px, calc(90vw - 2rem));
    min-height: 320px;
    max-height: min(75vh, 520px);
    overflow: hidden;
    background: #0d1425;
    border: 1px solid rgba(0, 194, 255, 0.45);
    border-radius: 6px;
    box-shadow: 0 12px 50px rgba(0, 0, 0, 0.55);
    padding: 0.85rem;
    pointer-events: auto;
    color: #d0d7dd;
    font-family: "Rajdhani", sans-serif;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .pt-panel--locating {
    visibility: hidden;
    pointer-events: none;
  }

  .pt-arrow {
    position: absolute;
    color: #00c2ff;
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1;
    text-shadow: 0 0 8px rgba(0, 194, 255, 0.8);
  }

  .pt-arrow-top {
    bottom: calc(100% + 4px);
    transform: translateX(-50%) rotate(-90deg);
  }

  .pt-arrow-bottom {
    top: calc(100% + 4px);
    transform: translateX(-50%) rotate(90deg);
  }

  .pt-arrow-left {
    right: calc(100% + 4px);
    transform: translateY(-50%) rotate(180deg);
  }

  .pt-arrow-right {
    left: calc(100% + 4px);
    transform: translateY(-50%);
  }

  .pt-header {
    border-bottom: 1px solid rgba(0, 194, 255, 0.2);
    padding-bottom: 0.55rem;
    margin-bottom: 0.55rem;
  }

  .pt-eyebrow {
    margin: 0;
    color: #00c2ff;
    font-family: "Share Tech Mono", monospace;
    text-transform: uppercase;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
  }

  h3 {
    margin: 0.35rem 0;
    font-family: "Orbitron", sans-serif;
    font-size: 1.1rem;
  }

  .pt-progress {
    font-family: "Share Tech Mono", monospace;
    font-size: 0.78rem;
    color: rgba(208, 215, 221, 0.72);
  }

  .pt-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    padding-right: 0.25rem;
    box-sizing: border-box;
  }

  .pt-instruction {
    margin: 0;
    line-height: 1.45;
    word-break: break-word;
    overflow-wrap: anywhere;
    hyphens: auto;
  }

  .pt-hint {
    margin: 0;
    color: rgba(208, 215, 221, 0.72);
    font-size: 0.88rem;
    line-height: 1.4;
    word-break: break-word;
    overflow-wrap: anywhere;
    hyphens: auto;
  }

  .pt-command {
    display: block;
    margin: 0.2rem 0 0.55rem;
    color: #00e5a0;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.74rem;
    white-space: pre-wrap;
    word-break: break-all;
    overflow-wrap: break-word;
    overflow: hidden;
  }

  .pt-error {
    margin: 0 0 0.55rem;
    color: #ff6b6b;
    font-size: 0.84rem;
  }

  .pt-muted {
    margin: 0 0 0.55rem;
    color: rgba(208, 215, 221, 0.72);
    font-size: 0.82rem;
  }

  .pt-footer {
    margin-top: 0.85rem;
    padding-top: 0.85rem;
    border-top: 1px solid rgba(0, 194, 255, 0.15);
    display: flex;
    justify-content: flex-end;
  }

  @media (max-height: 700px), (max-width: 500px) {
    .pt-modal-box, .pt-panel {
      padding: 1rem 0.9rem !important;
      margin: 0.5rem;
    }
    .pt-panel {
      min-height: 280px;
      max-height: 70vh;
    }
    .pt-instruction, .pt-hint {
      font-size: 0.86rem;
      line-height: 1.35;
    }
  }

  .pt-btn {
    border-radius: 4px;
    border: 1px solid transparent;
    padding: 0.42rem 0.62rem;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.72rem;
    cursor: pointer;
  }

  .pt-copy-btn {
    align-self: flex-start;
    margin-top: 0.2rem;
  }

  .pt-btn-primary {
    background: #00c2ff;
    color: #0a0e1a;
    border-color: #00c2ff;
  }

  .pt-btn-secondary {
    background: transparent;
    color: #00c2ff;
    border-color: rgba(0, 194, 255, 0.5);
  }

  .pt-btn-ghost {
    background: transparent;
    color: rgba(208, 215, 221, 0.85);
    border-color: rgba(208, 215, 221, 0.25);
  }
</style>
