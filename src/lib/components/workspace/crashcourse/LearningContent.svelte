<script lang="ts">
  import { onDestroy, tick } from "svelte";
  import { browser } from "$app/environment";
  import { CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-svelte";
  import LearningBubble from "$lib/components/workspace/crashcourse/LearningBubble.svelte";
  import InteractiveLabModal from "$lib/components/workspace/crashcourse/lab/InteractiveLabModal.svelte";
  import TerminalLab from "$lib/components/workspace/crashcourse/lab/TerminalLab.svelte";
  import CodeLab from "$lib/components/workspace/crashcourse/lab/CodeLab.svelte";
  import LabCongratsModal from "$lib/components/workspace/crashcourse/lab/LabCongratsModal.svelte";
  import {
    evaluateEditableRegionsLab,
    evaluateFunctionLab,
    resolvePath,
    simulateTerminalNavigation,
  } from "$lib/components/workspace/crashcourse/lab/labValidation";
  import type { ILearningSection, ILearningTask } from "$lib/types";

  const LAB_PROGRESS_STORAGE_KEY = "devsim-crashcourse-lab-progress-v1";

  export let open: boolean = false;
  export let tasks: ILearningTask[] = [];
  export let isCompleted: boolean = false;
  export let onClose: () => void = () => {};
  export let onComplete: () => void = () => {};

  let taskIndex = 0;
  let sectionIndex = 0;
  let sectionFingerprint = "";

  let typedMessage = "";
  let typingIndex = 0;
  let typingInterval: ReturnType<typeof setInterval> | null = null;
  let completedTypedSections: Set<string> = new Set();
  let interactiveFingerprint = "";

  let cdCurrentPath = "/";
  let cdInput = "";
  let cdHistory: string[] = [];
  let terminalCommands: string[] = [];
  let terminalFeedback = "";
  let terminalPracticePassed = false;

  let interactiveCode = "";
  let codeFeedback = "";
  let codePracticePassed = false;
  let isLabModalOpen = false;
  let isLabCongratsOpen = false;
  let labCongratsMessage = "";
  let sectionLockFeedback = "";
  let completedInteractiveSections: Set<string> = new Set();
  let hasLoadedLabProgress = false;

  function getSectionTypingKey(taskId: string, sectionId: string): string {
    return `${taskId}:${sectionId}`;
  }

  function clearTyping() {
    if (!typingInterval) return;
    clearInterval(typingInterval);
    typingInterval = null;
  }

  function startTyping(text: string, sectionKey: string) {
    clearTyping();
    typedMessage = "";
    typingIndex = 0;

    typingInterval = setInterval(() => {
      if (typingIndex >= text.length) {
        completedTypedSections = new Set(completedTypedSections).add(sectionKey);
        clearTyping();
        return;
      }
      typedMessage = text.slice(0, typingIndex + 1);
      typingIndex += 1;
    }, 12);
  }

  $: learningTasks = [...tasks]
    .filter((task) => (task.learningSections?.length ?? 0) > 0)
    .sort((a, b) => a.order - b.order);

  $: {
    const nextFingerprint = learningTasks
      .map((task) => `${task.id}:${task.learningSections.length}`)
      .join("|");
    if (nextFingerprint !== sectionFingerprint) {
      sectionFingerprint = nextFingerprint;
      taskIndex = 0;
      sectionIndex = 0;
      completedTypedSections = new Set();
    }
  }

  $: if (open && taskIndex >= learningTasks.length) {
    taskIndex = 0;
  }

  $: activeTask = learningTasks[taskIndex] ?? null;
  $: activeSections = activeTask?.learningSections ?? [];

  $: if (sectionIndex >= activeSections.length) {
    sectionIndex = 0;
  }

  $: activeSection =
    activeSections[sectionIndex] ??
    {
      id: "fallback",
      title: "Overview",
      content: "No content available.",
      order: 1,
      taskId: activeTask?.id ?? "",
      sectionType: "PLAIN_TEXT",
      interactiveMode: null,
      interactiveConfig: null,
    };

  $: activeSectionTypingKey = getSectionTypingKey(activeSection.taskId, activeSection.id);
  $: isInteractiveSection = activeSection.sectionType === "INTERACTIVE";
  $: activeInteractivePassed = completedInteractiveSections.has(activeSectionTypingKey);

  function loadLabProgress(): Set<string> {
    if (!browser) return new Set();

    try {
      const raw = localStorage.getItem(LAB_PROGRESS_STORAGE_KEY);
      if (!raw) return new Set();

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set();

      return new Set(parsed.filter((item): item is string => typeof item === "string"));
    } catch {
      return new Set();
    }
  }

  function persistLabProgress(progress: Set<string>) {
    if (!browser) return;

    try {
      localStorage.setItem(LAB_PROGRESS_STORAGE_KEY, JSON.stringify([...progress]));
    } catch {
      // Ignore storage write failures so crash course UI remains functional.
    }
  }

  function scheduleTerminalAutoScroll() {
    void tick().then(() => {
      const terminalLog = document.querySelector(".lab-modal .terminal-log") as HTMLElement | null;
      if (terminalLog) {
        terminalLog.scrollTop = terminalLog.scrollHeight;
      }
    });
  }

  function resetInteractiveState(section: ILearningSection) {
    const config = section.interactiveConfig ?? {};
    cdCurrentPath = config.initialDirectory ?? "/workspace";
    cdInput = "";
    cdHistory = ["Type help for available commands."];
    terminalCommands = [];
    terminalFeedback = "";
    terminalPracticePassed = false;

    interactiveCode = config.starterCode ?? "";
    codeFeedback = "";
    codePracticePassed = false;
    sectionLockFeedback = "";
    isLabModalOpen = false;
    isLabCongratsOpen = false;
  }

  function runCdCommand() {
    const raw = cdInput.trim();
    if (!raw) return;

    const config = activeSection.interactiveConfig ?? {};
    const tree = config.directoryTree ?? { "/workspace": ["client", "server", "README.md"] };
    const parts = raw.split(/\s+/);
    const command = parts[0]?.toLowerCase();
    const argument = parts.slice(1).join(" ");

    cdHistory = [...cdHistory, `$ ${raw}`];
    terminalCommands = [...terminalCommands, raw];

    if (command === "clear") {
      cdHistory = [];
      cdInput = "";
      scheduleTerminalAutoScroll();
      return;
    }

    if (command === "help") {
      cdHistory = [
        ...cdHistory,
        "Allowed commands: cd <dir>, cd .., cd /path, ls, pwd, help, clear",
      ];
      cdInput = "";
      scheduleTerminalAutoScroll();
      return;
    }

    if (command === "pwd") {
      cdHistory = [...cdHistory, cdCurrentPath];
      cdInput = "";
      scheduleTerminalAutoScroll();
      return;
    }

    if (command === "ls") {
      const items = tree[cdCurrentPath] ?? [];
      cdHistory = [...cdHistory, items.length > 0 ? items.join("  ") : "(empty)"];
      cdInput = "";
      scheduleTerminalAutoScroll();
      return;
    }

    if (command === "cd") {
      const target = argument || "/";
      const resolved = resolvePath(cdCurrentPath, target);
      if (tree[resolved]) {
        cdCurrentPath = resolved;
      } else {
        cdHistory = [...cdHistory, `cd: no such directory: ${target}`];
      }
      cdInput = "";
      scheduleTerminalAutoScroll();
      return;
    }

    cdHistory = [...cdHistory, "Only controlled learning commands are enabled here."];
    cdInput = "";
    scheduleTerminalAutoScroll();
  }

  function checkTerminalPractice() {
    const config = activeSection.interactiveConfig ?? {};
    const expected = config.expectedCommands ?? [];
    const actual = terminalCommands;
    const wasAlreadyCompleted = completedInteractiveSections.has(activeSectionTypingKey);

    if (expected.length === 0) {
      terminalPracticePassed = true;
      completedInteractiveSections = new Set(completedInteractiveSections).add(activeSectionTypingKey);
      terminalFeedback = "No required command checklist for this practice section.";
      return;
    }

    const expectedState = simulateTerminalNavigation(expected, config);
    const actualState = simulateTerminalNavigation(actual, config);

    const missingVisited = [...expectedState.visited].filter((path) => !actualState.visited.has(path));
    const finalPathMismatch = actualState.finalPath !== expectedState.finalPath;

    if (missingVisited.length > 0 || finalPathMismatch) {
      terminalPracticePassed = false;
      const details: string[] = [];

      if (missingVisited.length > 0) {
        details.push(`You still need to reach: ${missingVisited.join(", ")}.`);
      }

      if (finalPathMismatch) {
        details.push(`You ended at ${actualState.finalPath}, but target end path is ${expectedState.finalPath}.`);
      }

      terminalFeedback = `Output state check failed. ${details.join(" ")}`;
      return;
    }

    terminalPracticePassed = true;
    completedInteractiveSections = new Set(completedInteractiveSections).add(activeSectionTypingKey);
    terminalFeedback = "Great work. Lab passed based on navigation output state (visited paths and final location).";
    sectionLockFeedback = "";
    if (!wasAlreadyCompleted) {
      labCongratsMessage = `You passed \"${activeSection.title}\". Progress saved.`;
      isLabCongratsOpen = true;
    }
  }

  async function evaluateCodePractice() {
    const config = activeSection.interactiveConfig ?? {};
    const entryPoint = config.entryPoint;
    const testCases = config.testCases ?? [];
    const requiredCodeIncludes = config.requiredCodeIncludes ?? [];
    const editableRegions = config.editableRegions ?? [];
    const starterCode = config.starterCode ?? "";
    const wasAlreadyCompleted = completedInteractiveSections.has(activeSectionTypingKey);

    function setCodePracticeResult(passed: boolean, successMessage: string, failureMessage: string) {
      codePracticePassed = passed;

      if (passed) {
        completedInteractiveSections = new Set(completedInteractiveSections).add(activeSectionTypingKey);
        sectionLockFeedback = "";
        codeFeedback = successMessage;
        if (!wasAlreadyCompleted) {
          labCongratsMessage = `You passed \"${activeSection.title}\". Progress saved.`;
          isLabCongratsOpen = true;
        }
        return;
      }

      if (completedInteractiveSections.has(activeSectionTypingKey)) {
        const nextCompleted = new Set(completedInteractiveSections);
        nextCompleted.delete(activeSectionTypingKey);
        completedInteractiveSections = nextCompleted;
      }

      codeFeedback = failureMessage;
    }

    if (requiredCodeIncludes.length > 0) {
      const missingSnippets = requiredCodeIncludes.filter(
        (snippet) => !interactiveCode.includes(snippet),
      );

      if (missingSnippets.length > 0) {
        setCodePracticeResult(
          false,
          "",
          `Refactor not complete yet. Missing required code usage: ${missingSnippets.join(" | ")}`,
        );
        return;
      }
    }

    if (entryPoint && testCases.length > 0) {
      const result = await evaluateFunctionLab(interactiveCode, entryPoint, testCases);
      setCodePracticeResult(result.passed, result.feedback, result.feedback);
      return;
    }

    if (editableRegions.length > 0 && starterCode) {
      const result = evaluateEditableRegionsLab(interactiveCode, starterCode, editableRegions);
      setCodePracticeResult(result.passed, result.feedback, result.feedback);
      return;
    }

    setCodePracticeResult(
      false,
      "",
      "This lab configuration is incomplete. It needs either function test cases or editable regions.",
    );
  }

  $: {
    const nextInteractiveFingerprint = `${activeSection.id}:${activeSection.interactiveMode ?? ""}`;
    if (isInteractiveSection && open && nextInteractiveFingerprint !== interactiveFingerprint) {
      interactiveFingerprint = nextInteractiveFingerprint;
      resetInteractiveState(activeSection);
    }
  }

  $: if (browser && !hasLoadedLabProgress) {
    completedInteractiveSections = loadLabProgress();
    hasLoadedLabProgress = true;
  }

  $: if (browser && hasLoadedLabProgress) {
    persistLabProgress(completedInteractiveSections);
  }

  $: if (open) {
    if (isInteractiveSection) {
      clearTyping();
      typedMessage = activeSection.content;
    } else if (isCompleted) {
      clearTyping();
      typedMessage = activeSection.content;
    } else if (completedTypedSections.has(activeSectionTypingKey)) {
      clearTyping();
      typedMessage = activeSection.content;
    } else {
      startTyping(activeSection.content, activeSectionTypingKey);
    }
  } else {
    clearTyping();
    typedMessage = "";
  }

  onDestroy(() => {
    clearTyping();
  });

  function goNextSection() {
    if (isInteractiveSection && !activeInteractivePassed) {
      sectionLockFeedback = "Finish and check the lab before moving to the next section.";
      isLabModalOpen = true;
      return;
    }

    if (sectionIndex < activeSections.length - 1) {
      sectionIndex += 1;
      return;
    }

    if (taskIndex < learningTasks.length - 1) {
      taskIndex += 1;
      sectionIndex = 0;
      return;
    }

    if (isCompleted) {
      onComplete();
      return;
    }

    onComplete();
  }

  function goBackSection() {
    if (sectionIndex > 0) {
      sectionIndex -= 1;
      return;
    }

    if (taskIndex > 0) {
      taskIndex -= 1;
      const previousTask = learningTasks[taskIndex];
      const previousSections = previousTask?.learningSections ?? [];
      sectionIndex = Math.max(previousSections.length - 1, 0);
    }
  }

  function closeCourse() {
    onClose();
  }

  function openLabModal() {
    isLabModalOpen = true;
    scheduleTerminalAutoScroll();
  }

  function closeLabModal() {
    isLabModalOpen = false;
  }

  function confirmLabCongrats() {
    isLabCongratsOpen = false;
    isLabModalOpen = false;
  }
</script>

{#if open && learningTasks.length > 0}
  <div
    class="crashcourse-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Crash course"
  >
    <div class="course-shell">
      <LearningBubble
        eyebrow={`Crash Course • Task ${activeTask?.order ?? taskIndex + 1}`}
        title={`${activeSection.title}`}
        body={typedMessage}
        showAction={isInteractiveSection}
        actionLabel={activeInteractivePassed ? "Review Lab" : "Start Lab"}
        onAction={openLabModal}
      />

      <div class="saz-avatar-wrap" aria-hidden="true">
        <img src="/images/saz-full.png" alt="Saz mentor" class="saz-avatar" />
      </div>

      <div class="course-controls">
        <p class="meta">
          Task {taskIndex + 1} • Section {sectionIndex + 1}/{activeSections.length}
        </p>
        {#if sectionLockFeedback}
          <p class="section-lock-feedback">{sectionLockFeedback}</p>
        {/if}

        <div class="actions">
          <button
            type="button"
            class="nav-btn"
            on:click={goBackSection}
            disabled={taskIndex === 0 && sectionIndex === 0}
          >
            <ChevronLeft size={14} strokeWidth={2.1} aria-hidden="true" />
            <span>Back</span>
          </button>
          <button type="button" class="nav-btn" on:click={closeCourse}>
            <X size={14} strokeWidth={2.1} aria-hidden="true" />
            <span>Close</span>
          </button>
          <button type="button" class="nav-btn primary" on:click={goNextSection}>
            {#if taskIndex === learningTasks.length - 1 && sectionIndex === activeSections.length - 1}
              <CheckCircle2 size={14} strokeWidth={2.1} aria-hidden="true" />
              <span>{isCompleted ? "Close Finished Crash Course" : "Mark Crash Course Done"}</span>
            {:else}
              <ChevronRight size={14} strokeWidth={2.1} aria-hidden="true" />
              <span>{isInteractiveSection && !activeInteractivePassed ? "Complete Lab First" : "Next"}</span>
            {/if}
          </button>
        </div>
      </div>
    </div>

    {#if isInteractiveSection && isLabModalOpen}
      <InteractiveLabModal
        title="Interactive Lab"
        instructions={activeSection.interactiveConfig?.instructions ?? "Interactive practice mode"}
        isPassed={activeInteractivePassed}
        on:close={closeLabModal}
      >
        {#if activeSection.interactiveMode === "TERMINAL_CD"}
          <TerminalLab
            currentPath={cdCurrentPath}
            history={cdHistory}
            bind:inputValue={cdInput}
            feedback={terminalFeedback}
            isPassed={terminalPracticePassed}
            on:run={runCdCommand}
            on:check={checkTerminalPractice}
          />
        {:else if activeSection.interactiveMode === "CODE_EDITOR"}
          <CodeLab
            bind:code={interactiveCode}
            starterCode={activeSection.interactiveConfig?.starterCode ?? ""}
            editableRegions={activeSection.interactiveConfig?.editableRegions ?? []}
            feedback={codeFeedback}
            isPassed={codePracticePassed}
            on:check={evaluateCodePractice}
          />
        {/if}
      </InteractiveLabModal>
    {/if}

    {#if isLabCongratsOpen}
      <LabCongratsModal
        title="Lab Completed"
        message={labCongratsMessage}
        on:confirm={confirmLabCongrats}
      />
    {/if}
  </div>
{/if}

<style>
  .crashcourse-overlay {
    position: fixed;
    inset: 0;
    z-index: 10044;
    display: grid;
    place-items: center;
    background: rgba(3, 8, 18, 0.56);
    backdrop-filter: blur(7px);
    -webkit-backdrop-filter: blur(7px);
    padding: 0.8rem;
    overflow: auto;
  }

  .course-shell {
    position: relative;
    width: min(980px, calc(100vw - 1.8rem));
    min-height: auto;
    display: grid;
    justify-items: center;
    gap: 0.1rem;
  }

  .course-controls {
    width: min(860px, calc(100vw - 1.8rem));
    border: 1px solid rgba(7, 165, 201, 0.24);
    background: rgba(10, 14, 26, 0.94);
    padding: 0.62rem 0.88rem 0.72rem;
    box-sizing: border-box;
  }

  .section-lock-feedback {
    margin: 0 0 0.5rem;
    color: #ffdca8;
    font-family: "Exo 2", sans-serif;
    font-size: 0.76rem;
    text-align: center;
  }

  .saz-avatar-wrap {
    position: absolute;
    right: 110px;
    top: 400px;
    z-index: 2;
    background: transparent;
    border: 0;
    box-shadow: none;
    display: block;
    pointer-events: none;
  }

  .saz-avatar {
    width: 150px;
    height: auto;
    object-fit: contain;
    display: block;
  }

  .meta {
    margin: 0 0 0.6rem;
    color: #8892a0;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
  }

  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr 1.4fr;
    gap: 0.5rem;
  }

  .actions .nav-btn {
    border: 1px solid rgba(136, 146, 160, 0.35);
    background: rgba(255, 255, 255, 0.02);
    color: #b7c4d1;
    padding: 0.42rem 0.56rem;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.67rem;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.34rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .actions .nav-btn:hover:not(:disabled) {
    border-color: rgba(7, 165, 201, 0.45);
    color: #d6f6ff;
    background: rgba(7, 165, 201, 0.12);
  }

  .actions .nav-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .actions .nav-btn.primary {
    border-color: rgba(7, 165, 201, 0.5);
    color: #dff8ff;
    background: rgba(7, 165, 201, 0.16);
  }

  .actions .nav-btn span {
    line-height: 1;
  }

  @media (max-width: 900px) {
    .course-shell {
      min-height: auto;
      width: min(700px, 96vw);
    }

    .course-controls {
      width: min(700px, calc(100vw - 1.4rem));
    }

    .saz-avatar-wrap {
      right: 0;
      top: auto;
      bottom: 72px;
      opacity: 0.92;
    }

    .saz-avatar {
      width: 154px;
    }
  }

  @media (max-width: 700px) {
    .course-controls {
      width: min(540px, calc(100vw - 1.2rem));
    }

    .saz-avatar-wrap {
      display: none;
    }
  }
</style>
