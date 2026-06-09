<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { type PageData } from "./$types";
  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { MonacoInitializer } from "$client/MonacoInitializer";
  // Components
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import PrimarySidebar from "$lib/components/devSidebar/PrimarySidebar.svelte";
  import WorkspaceHeader from "$lib/components/workspace/WorkspaceHeader.svelte";
  import WorkspaceTabs from "$lib/components/workspace/WorkspaceTabs.svelte";
  import EditorPanel from "$lib/components/workspace/EditorPanel.svelte";
  import TerminalPanel from "$lib/components/workspace/TerminalPanel.svelte";
  import PreviewPanel from "$lib/components/workspace/PreviewPanel.svelte";
  import SubmitSprintModal from "$lib/components/workspace/SubmitSprintModal.svelte";
  import WorkspaceBootScreen from "$lib/components/workspace/WorkspaceBootScreen.svelte";
  import TerminalManagerPanel from "$lib/components/workspace/TerminalManagerPanel.svelte";
  import AiHelp from "$lib/components/aiHelp/AiHelp.svelte";
  import BoardPanel from "$lib/components/workspace/BoardPanel.svelte";
  import TestCase from "$lib/components/workspace/TestCase.svelte";
  import SazOnboardingCoach from "$lib/components/onboarding/SazOnboardingCoach.svelte";
  import LevelIntroCard from "$lib/components/workspace/LevelIntroCard.svelte";
  import LearningContent from "$lib/components/workspace/crashcourse/LearningContent.svelte";
  import TriviaModal from "$lib/components/ui/TriviaModal.svelte";
  import type { TestableTask, TestRunResult } from "$lib/types/test";
  import type { IHints, ITask } from "$lib/types";
  import { LEVEL_CONFIG } from "$lib/mockdata/mocklevel";
  import { getLevelConfig } from "$lib/tests/levels";
  import type { FileListResponse } from "$lib/interface/Files";
  import type { FileTab } from "$lib/components/workspace/FileTabBar.svelte";
  import { toast } from "$lib/stores/toast";
  import type { ILevel, ILearningSection } from "$lib/types";
  import { TerminalInitializer } from "$client/TerminalInitializer";
    import type { IInteractiveConfig } from "$lib/types/IContainer";

  let { data}: { data: PageData } = $props();

  let userCoins = $derived(data.userCoins ?? 0);
  let userAiHelps = $derived(data.userAiHelps ?? 0);

  let currentLevel = $derived(data.level || 1);

  function getLevelByOrder(
    levels: ILevel[] | null | undefined,
    order: number,
  ): ILevel | null {
    if (!levels?.length) return null;
    return (
      levels.find((lvl: ILevel) => lvl.order === order) ??
      levels[order - 1] ??
      null
    );
  }

  let workspaceScenario = $derived(data.scenario ?? null);
  let stackNames = $derived([...new Set(data.workspaceStacks?.map((entry) => entry.stackName).filter(Boolean) ?? [])]);
  let currentLevelRecord = $derived(getLevelByOrder(data.currentLevel.map((level) => ({
    id: level.id,
    title: level.title,
    order: level.order,
    deadline: level.deadline,
    levelDescription: level.level_description,
    xpReward: level.xp_reward,
    coinReward: level.coin_reward,
    keyTakeaways: level.key_takeaways,
    tasks: level.tasks.map((task) => ({
      id: task.id,
      levelId: task.level_id,
      taskName: task.task_name,
      userStory: task.user_story,
      order: task.order,
      isCompleted: task.is_complete,
      testType: task.test_type,
      hints: task.hints.map((hint) => ({
        id: hint.id,
        taskId: hint.task_id,
        content: hint.description,
        order: hint.order
      })),
      learningSections: task.learning_sections.map((section) => ({
        id: section.id,
        title: section.title,
        content: section.content,
        order: section.order,
        taskId: section.task_id,
        sectionType: section.section_type,
        interactiveMode: section.interactive_mode,
        interactiveConfig: section.interactive_config as IInteractiveConfig | null,
      })),
      acceptanceCriteria: task.acceptance_criteria.map((criteria) => ({
        id: criteria.id,
        taskId: criteria.task_id,
        description: criteria.description,
        order: criteria.order,
        isRequired: criteria.is_required
      }))
    }))
  })), currentLevel));
  let title = $derived(currentLevelRecord?.title ?? LEVEL_CONFIG.title);
  let stack = $derived(stackNames.length > 0 ? stackNames.join(" + ") : (workspaceScenario?.name ?? LEVEL_CONFIG.stack));
  let difficulty = $derived(workspaceScenario?.difficulty ?? LEVEL_CONFIG.difficulty);
  let level = $derived(currentLevel);

  // State
  let activeTab: "editor" | "terminal" | "preview" | "board" = $state("editor");
  let selectedFile: string = $state("app/page.tsx");
  let fileContents: Record<string, string> = {};
  const protectedPackageFiles = new Set([
    "package.json",
    "package-lock.json",
    "package.lock.json",
  ]);
  const protectedRootFiles = new Set([
    "README",
    "README.md",
    "README.txt",
    "readme",
    "readme.md",
    "readme.txt",
  ]);

  let openTabs: FileTab[] = $state([]);
  let activeTabId: string = $state("");
  type BoardTaskStatus = "backlog" | "in-progress" | "in-review" | "done";
  type WorkspaceTask = TestableTask & {
    boardStatus?: BoardTaskStatus;
    learningSections?: ILearningSection[];
    userStory?: string;
  };
  let timeRemaining: number = $derived(4 * 60 * 60);
  let isRunning: boolean = $state(false);
  let monacoEditor: MonacoInitializer | null = null;
  let previewUrl: string = $state("");
  let editorValue: string = "";
  let fileTree: string[] = $state([]);
  let directories: string[] = $state([]);

  interface TermSession {
    id: string;
    label: string;
    instance: TerminalInitializer | null;
  }
  let terminalSessions: TermSession[] = $state([]);
  let activeTerminalId: string = $state("");
  let terminalCounter = 0;
  const pendingTerminalInits = new Map<string, (el: HTMLDivElement) => void>();

  let activeTerminalSession = $derived(terminalSessions.find((s) => s.id === activeTerminalId) ?? null);

  function computeTasks() {
  const levelTasks = currentLevelRecord?.tasks || [];
  const persisted = loadTaskProgress(currentLevel);

  return levelTasks.map((task) => {
    const persistedState = persisted[task.id];

    const boardStatus =
      persistedState?.boardStatus ?? (task.isCompleted ? "done" : "backlog");
    const dbCompleted = data.completedTasks?.includes(task.taskName) ?? false;
    const isCompleted = persistedState?.isCompleted ?? dbCompleted ?? task.isCompleted;
    const testStatus =
      persistedState?.testStatus ?? (isCompleted ? "passed" : "pending");
    const taskType = task.testType ?? "none";

    return {
      ...task,
      hints: task.hints,
      learningSections: task.learningSections,
      isCompleted,
      boardStatus,
      testStatus,
      hasClientTest: taskType === "client" || taskType === "both",
      hasServerTest: taskType === "server" || taskType === "both",
    };
  });
}

  let tasks = $derived(computeTasks());

  let levelHints = $derived(
    currentLevelRecord?.tasks?.flatMap(
      (task: ITask) => task.hints ?? [],
    ) || []);
  let levelTestConfig = $derived(getLevelConfig(currentLevel));

  let actualLevelConfig = $derived(levelTestConfig
    ? {
        ...LEVEL_CONFIG,
        ...levelTestConfig,
        level: currentLevel,
        title,
        stack: stack,
        difficulty,
        deadline: LEVEL_CONFIG.deadline,
        scenario: currentLevelRecord?.levelDescription ?? workspaceScenario?.description ?? LEVEL_CONFIG.scenario,
        hints: levelHints.length > 0 ? levelHints : LEVEL_CONFIG.hints,
        starterFiles: LEVEL_CONFIG.starterFiles,
      }
    : LEVEL_CONFIG
  );

  let operatorAlias = $derived(data.user?.name || data.user?.name || "Operator");
  let workspaceProjectName = $derived(workspaceScenario?.name || title || "DevSim Workspace");
  let cameFromTutorial = $derived(page.url.searchParams.get("fromTutorial") === "1");

  // Track if this workspace came from first-project guided flow.
  let hasEverBeenInTutorial = false;

  function handleLevelIntroClose() {
    levelIntroCardOpen = false;
    activeTab = 'board';
    levelIntroDismissed = true;
    pendingPostTestIntro = false;
  }

  // Once boot completes, open queued Saz before anything else.
  $effect(() => {
  if (!isBooting && pendingSazOpen) {
    pendingSazOpen = false;
    sazOnboardingOpen = true;
  }
});

  // Show level intro card after boot completes and Saz (if any) is dismissed.
  $effect(() => {
  if (
    tasks.length > 0 &&
    !levelIntroCardShown &&
    !isBooting &&
    !sazOnboardingOpen &&
    !pendingSazOpen
  ) {
    const timer = setTimeout(() => {
      if (!levelIntroCardShown && !sazOnboardingOpen && !pendingSazOpen) {
        levelIntroCardOpen = true;
        levelIntroCardShown = true;
      }
    }, 1000);

    return () => clearTimeout(timer);
  }
});

  $effect(() => {
    if (actualLevelConfig) {
      timeRemaining = actualLevelConfig.deadline || 4 * 60 * 60;
    }
  })

  let aiPanelOpen: boolean = false;
  let aiPanelMode: "chat" | "quick" = $state("chat");
  // Docked AI Helper (SAZ) panel, toggled from the workspace tab bar.
  let showAiHelper: boolean = $state(false);
  let isDownloading: boolean = $state(false);

  let backModalOpen: boolean = $state(false);
  let isLeavingWorkspace: boolean = $state(false);

  let taskIntroCardOpen: boolean = false;
  let levelIntroCardOpen: boolean = $state(false);
  let levelIntroCardShown: boolean = false;
  let sazOnboardingOpen: boolean = false;
  let sazOnboardingShown: boolean = false;
  let pendingSazOpen: boolean = false;
  let crashCourseOpen: boolean = $state(false);
  let levelIntroDismissed: boolean = $state(false);
  let activeCrashCourseTaskId: string = $state("");
  let crashCourseSeenByTask: Record<string, boolean> = {};
  let crashCourseCompletedByTask: Record<string, boolean> = $state({});
  let crashCourseCompletePromptOpen: boolean = $state(false);
  let crashCourseClosePromptOpen: boolean = $state(false);
  let crashCourseCloseDonePromptOpen: boolean = $state(false);
  let crashCoursePromptTaskNumber: number = $state(1);
  let crashCoursePromptTaskId: string = "";
  let crashCourseStorageLoadedKey: string = "";

  // Trivia modal state
  let triviaModalOpen: boolean = $state(false);
  let triviaCorrectCount: number = 0;
  let triviaTotalCount: number = 0;
  let triviaShownThisSession: boolean = false;
  // Fixed per session so randomness doesn't re-roll on re-renders
  const triviaSessionChance: number = Math.random();
  let triviaTimeoutId: ReturnType<typeof setTimeout> | null = null;
  // Set when crash course completes for the first time this session, so trivia
  // fires after the user dismisses the completion prompt.
  let pendingTriviaAfterCrashCourse: boolean = false;

  // Load trivia stats from localStorage
  function loadTriviaStats() {
    if (!browser) return;
    try {
      const stored = localStorage.getItem('trivia-stats');
      if (stored) {
        const stats = JSON.parse(stored);
        triviaCorrectCount = stats.correct || 0;
        triviaTotalCount = stats.total || 0;
      }
    } catch (e) {
      // Ignore
    }
  }

  // Save trivia stats to localStorage
  function saveTriviaStats() {
    if (!browser) return;
    localStorage.setItem('trivia-stats', JSON.stringify({
      correct: triviaCorrectCount,
      total: triviaTotalCount
    }));
  }

  // Show trivia modal once per workspace session (after 3 second delay)
  function maybeShowTrivia() {
    if (triviaShownThisSession) return;
    if (!levelIntroDismissed || levelIntroCardOpen) return;
    triviaModalOpen = true;
    triviaShownThisSession = true;
  }

  const TRIVIA_COIN_REWARD = 5;

  async function handleTriviaAnswer(event: CustomEvent<{ correct: boolean }>) {
    triviaTotalCount += 1;
    if (event.detail.correct) {
      triviaCorrectCount += 1;
      userCoins += TRIVIA_COIN_REWARD;
      toast.success(`+${TRIVIA_COIN_REWARD} coins!`);
      
      // Persist coins to database
      try {
        await fetch(`/api/user/coins/add?amount=${TRIVIA_COIN_REWARD}`, {
          method: 'POST'
        });
      } catch (err) {
        console.error('Failed to save coins:', err);
      }
    }
    saveTriviaStats();
  }

  let testRegressionModalOpen: boolean = $state(false);
  let testResultModalOpen: boolean = false;
  let pendingPostTestIntro: boolean = false;
  let postTestCompletedTaskOrder: number | null = null;
  let postTestNextTaskOrder: number | null = null;
  let regressionTaskName: string = $state("");
  let regressionTaskId: string = "";
  let pendingRegressionUpdates: Array<{
    taskId: string;
    taskName: string;
    previousStatus: BoardTaskStatus;
  }> = [];

  let isBooting = $state(true);
  let bootStep = $state(0);
  let bootError = $state("");
  let bootStepStartedAt = $state(0);

  const DEFAULT_BOOT_STEP_VISIBLE_MS = 1200;
  const BOOT_STEP_VISIBLE_MS: Record<number, number> = {
    1: 15000,
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  function setBootStep(step: number) {
    bootStep = Math.max(0, Math.min(step, BOOT_STEPS.length - 1));
    bootStepStartedAt = Date.now();
  }

  async function ensureBootStepIsVisible(stepIndex: number) {
    const minVisibleMs = BOOT_STEP_VISIBLE_MS[stepIndex] ?? DEFAULT_BOOT_STEP_VISIBLE_MS;
    const elapsedMs = Date.now() - bootStepStartedAt;
    const remainingMs = minVisibleMs - elapsedMs;
    if (remainingMs > 0) {
      await sleep(remainingMs);
    }
  }

  async function advanceBootStep(nextStep: number) {
    await ensureBootStepIsVisible(bootStep);
    setBootStep(nextStep);
  }

  const BOOT_STEPS = [
    {
      icon: "🐳",
      label: "Booting container engine…",
      detail: "Allocating compute resources",
    },
    {
      icon: "📂",
      label: "Indexing project files…",
      detail: "Scanning workspace directory",
      detailSequence: [
        "Scanning workspace directory",
        "This is the longest step and may take a while depending on project size",
        "Still indexing files and folders for your workspace tree",
        "Almost there, finalizing indexed file map",
      ],
      detailSequenceIntervalMs: 5000,
    },
    {
      icon: "📄",
      label: "Loading source code…",
      detail: "Reading initial file content",
    },
    {
      icon: "⚡",
      label: "Igniting Monaco editor…",
      detail: "Mounting language server",
    },
    {
      icon: "💻",
      label: "Connecting terminal…",
      detail: "Opening interactive shell",
    },
  ];

  function handleBootRetry() {
    bootError = "";
    isBooting = true;
    setBootStep(0);
    initWorkspace();
  }

  let submitSprintModal: SubmitSprintModal;
  let editorRef = $state<HTMLDivElement | null>(null);
  let iframeRef = $state<HTMLIFrameElement | null>(null);
  
  let testCaseComponent: TestCase;

  let containerId = $derived(data.dockerContainerId ?? "");
  let projectName = $derived("workspace");

  function normalizeWorkspaceRelativePath(inputPath: string): string {
    return inputPath
      .replace(/\\/g, "/")
      .replace(/^\/workspace\/?/, "")
      .replace(/^\.\//, "")
      .trim();
  }

  function isFrontendReadOnlyFile(path: string): boolean {
    const normalized = normalizeWorkspaceRelativePath(path);
    if (!normalized) return false;
    const fileName = normalized.split("/").pop() ?? "";
    if (protectedPackageFiles.has(fileName)) return true;
    return !normalized.includes("/") && protectedRootFiles.has(normalized);
  }

  let isSelectedFileReadOnly = $derived(isFrontendReadOnlyFile(selectedFile));

  $effect(() => {
    monacoEditor?.setReadOnly(isSelectedFileReadOnly);
  });

  function flattenFiles(structure: any, prefix = ""): string[] {
    const files: string[] = [];
    for (const [key, value] of Object.entries(structure)) {
      const path = prefix ? `${prefix}/${key}` : key;
      if (value && typeof value === "object") {
        if ("file" in value) {
          files.push(path);
        } else if ("directory" in value) {
          files.push(...flattenFiles(value.directory, path));
        }
      }
    }
    return files;
  }

  type PersistedTaskState = {
    boardStatus: BoardTaskStatus;
    testStatus: TestableTask["testStatus"];
    isCompleted: boolean;
  };

  function getStableProgressContainerId(): string {
    return page.params.containerId || containerId;
  }

  function getTaskProgressStorageKey(levelNumber: number): string {
    return `workspace-task-progress:${getStableProgressContainerId()}:l${levelNumber}`;
  }

  function getCrashCourseStorageKey(levelNumber: number): string {
    return `workspace-crashcourse-seen:${getStableProgressContainerId()}:l${levelNumber}`;
  }

  function getCrashCourseCompletedStorageKey(levelNumber: number): string {
    return `workspace-crashcourse-completed:${getStableProgressContainerId()}:l${levelNumber}`;
  }

  function loadTaskProgress(
    levelNumber: number,
  ): Record<string, PersistedTaskState> {
    if (!browser || !getStableProgressContainerId()) return {};

    try {
      const raw = localStorage.getItem(getTaskProgressStorageKey(levelNumber));
      return raw ? (JSON.parse(raw) as Record<string, PersistedTaskState>) : {};
    } catch (error) {
      console.warn("Failed to load persisted task progress:", error);
      return {};
    }
  }

  function persistTaskProgress() {
    if (!browser || !getStableProgressContainerId() || !tasks.length) return;

    const state = tasks.reduce<Record<string, PersistedTaskState>>(
      (acc, task) => {
        acc[task.id] = {
          boardStatus:
            task.boardStatus ?? (task.isCompleted ? "done" : "backlog"),
          testStatus:
            task.testStatus ?? (task.isCompleted ? "passed" : "pending"),
          isCompleted: task.isCompleted,
        };
        return acc;
      },
      {},
    );

    localStorage.setItem(
      getTaskProgressStorageKey(currentLevel),
      JSON.stringify(state),
    );
  }

  function loadCrashCourseSeenState(levelNumber: number): Record<string, boolean> {
    if (!browser || !getStableProgressContainerId()) return {};
    try {
      const raw = localStorage.getItem(getCrashCourseStorageKey(levelNumber));
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch (error) {
      console.warn("Failed to load crash course state:", error);
      return {};
    }
  }

  function persistCrashCourseSeenState(levelNumber: number) {
    if (!browser || !getStableProgressContainerId()) return;
    localStorage.setItem(
      getCrashCourseStorageKey(levelNumber),
      JSON.stringify(crashCourseSeenByTask),
    );
  }

  function loadCrashCourseCompletedState(levelNumber: number): Record<string, boolean> {
    if (!browser || !getStableProgressContainerId()) return {};
    try {
      const raw = localStorage.getItem(getCrashCourseCompletedStorageKey(levelNumber));
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch (error) {
      console.warn("Failed to load crash course completion state:", error);
      return {};
    }
  }

  function persistCrashCourseCompletedState(levelNumber: number) {
    if (!browser || !getStableProgressContainerId()) return;
    localStorage.setItem(
      getCrashCourseCompletedStorageKey(levelNumber),
      JSON.stringify(crashCourseCompletedByTask),
    );
  }

  function getNextCrashCourseTask() {
    return [...tasks]
      .sort((a, b) => a.order - b.order)
      .find(
        (task) =>
          (task.learningSections?.length ?? 0) > 0 &&
          task.boardStatus !== "done",
      );
  }

  function getManualCrashCourseTask() {
    const crashCourseTasks = [...tasks]
      .sort((a, b) => a.order - b.order)
      .filter((task) => (task.learningSections?.length ?? 0) > 0);

    // Manual open should allow reviewing finished crash courses first.
    const completedTask = [...crashCourseTasks]
      .reverse()
      .find((task) => crashCourseCompletedByTask[task.id]);
    if (completedTask) return completedTask;

    const nextTask = getNextCrashCourseTask();
    if (nextTask) return nextTask;

    return crashCourseTasks[0];
  }

  function openCrashCourseForTask(taskId: string) {
    activeCrashCourseTaskId = taskId;
    crashCourseOpen = true;
  }

  function markCrashCourseSeen(taskId: string) {
    if (!taskId) return;
    crashCourseSeenByTask = {
      ...crashCourseSeenByTask,
      [taskId]: true,
    };
    persistCrashCourseSeenState(currentLevel);
  }

  function showCrashCourseMoveTaskMessage(taskId: string, mode: "completed" | "closed" | "closed-done") {
    const task = tasks.find((candidate) => candidate.id === taskId);
    crashCoursePromptTaskNumber = task?.order ?? 1;
    crashCoursePromptTaskId = taskId;
    crashCourseCompletePromptOpen = mode === "completed";
    crashCourseClosePromptOpen = mode === "closed";
    crashCourseCloseDonePromptOpen = mode === "closed-done";
  }

  function handleCrashCoursePromptConfirm() {
    const wasCompletionPrompt = crashCourseCompletePromptOpen;
    crashCourseCompletePromptOpen = false;
    crashCourseClosePromptOpen = false;
    crashCourseCloseDonePromptOpen = false;
    crashCoursePromptTaskId = "";

    if (wasCompletionPrompt && pendingTriviaAfterCrashCourse && !triviaShownThisSession) {
      pendingTriviaAfterCrashCourse = false;
      setTimeout(maybeShowTrivia, 1500);
    }
  }

  function handleCrashCoursePromptBack() {
    if (!crashCoursePromptTaskId) {
      crashCourseCompletePromptOpen = false;
      crashCourseClosePromptOpen = false;
      crashCourseCloseDonePromptOpen = false;
      return;
    }

    activeCrashCourseTaskId = crashCoursePromptTaskId;
    crashCourseOpen = true;
    crashCourseCompletePromptOpen = false;
    crashCourseClosePromptOpen = false;
    crashCourseCloseDonePromptOpen = false;
  }

  let hasCompletedCrashCourse = $derived(Object.values(crashCourseCompletedByTask).some(Boolean));

  let effectiveLevelIntroDescription = $derived(pendingPostTestIntro && postTestCompletedTaskOrder && postTestNextTaskOrder
    ? `Task ${postTestCompletedTaskOrder} is now completed. You can now proceed to Task ${postTestNextTaskOrder}. Review the updated objectives, then continue implementation.`
    : (actualLevelConfig?.scenario ?? ''));

  $effect(() => {
  const stableContainerId = getStableProgressContainerId();
  if (browser && stableContainerId) {
    const key = getCrashCourseStorageKey(currentLevel);
    if (key !== crashCourseStorageLoadedKey) {
      untrack(() => {
        crashCourseStorageLoadedKey = key;
        crashCourseSeenByTask = loadCrashCourseSeenState(currentLevel);
        crashCourseCompletedByTask = loadCrashCourseCompletedState(currentLevel);
        crashCourseOpen = false;
        activeCrashCourseTaskId = "";
        levelIntroDismissed = false;
        pendingPostTestIntro = false;
        postTestCompletedTaskOrder = null;
        postTestNextTaskOrder = null;
      })
    }
  }
});

$effect(() => {
  if (
    levelIntroDismissed &&
    !crashCourseOpen &&
    !levelIntroCardOpen &&
    tasks.length > 0 &&
    !testResultModalOpen &&
    !testRegressionModalOpen &&
    !pendingPostTestIntro &&
    !crashCourseCompletePromptOpen &&
    !crashCourseClosePromptOpen &&
    !crashCourseCloseDonePromptOpen
  ) {
    const nextTask = getNextCrashCourseTask();
    if (nextTask && !crashCourseCompletedByTask[nextTask.id]) {
      openCrashCourseForTask(nextTask.id);
    }
  }
});

// Show trivia after tasks load, but only after the level intro card is dismissed
// and the crash course has been completed (if applicable).
$effect(() => {
  if (tasks.length === 0) return;
  if (!levelIntroDismissed) return;
  const tasksHaveCrashCourse = tasks.some(t => (t.learningSections?.length ?? 0) > 0);
  if (tasksHaveCrashCourse && !hasCompletedCrashCourse) return;

  if (triviaTimeoutId) clearTimeout(triviaTimeoutId);
  // ~70 % of sessions for workspaces where crash course is already done.
  // First-time completion is handled via pendingTriviaAfterCrashCourse.
  if (triviaSessionChance < 0.7) {
    triviaTimeoutId = setTimeout(maybeShowTrivia, 5000 + Math.random() * 10000);
  }

  return () => {
    if (triviaTimeoutId) clearTimeout(triviaTimeoutId);
  };
});

  function getTaskNumber(task: ITask, index: number): number {
    if (typeof task.order === "number" && task.order > 0) return task.order;

    const idMatch = task.id.match(/\d+/);
    if (idMatch) return parseInt(idMatch[0], 10);

    return index + 1;
  }

  onMount(() => {
    const timer = setInterval(() => {
      timeRemaining = timeRemaining > 0 ? timeRemaining - 1 : 0;
      if (timeRemaining === 0) clearInterval(timer);
    }, 1000);

    initWorkspace();
    loadTriviaStats();

    // Queue Saz to show once boot finishes (tutorial or first workspace creation).
    if (browser && cameFromTutorial) {
      const sazKey = `workspace-saz-shown:${containerId}`;
      const hasShownSaz = localStorage.getItem(sazKey) === "1";
      if (!hasShownSaz) {
        pendingSazOpen = true;
        sazOnboardingShown = true;
        localStorage.setItem(sazKey, "1");
      }
    }

    return () => {
      clearInterval(timer);
      terminalSessions.forEach((s) => s.instance?.dispose());
      monacoEditor?.dispose();
    };
  });

  async function initWorkspace() {
    try {
      if (!containerId?.trim()) {
        throw new Error(
          "No Docker workspace is linked to this session. Return to the dashboard and launch a stack again.",
        );
      }
      setBootStep(0);
      const response = await fetch(
        `/api/docker/container/${containerId}/start`,
        { method: "POST" },
      );
      const startData = await response.json();
      if (!startData.success) throw new Error(startData.error);
      previewUrl = startData.previewUrl;

      await advanceBootStep(1);
      try {
        const listRes = await fetch(
          `/api/docker/container/${containerId}/files/list`,
          { method: "POST", headers: { "Content-Type": "application/json" } },
        );
        const listData = (await listRes.json()) as FileListResponse;
        if (listData.success) {
          fileTree = listData.files;
          directories = listData.directories || [];
          if (fileTree.length > 0 && !fileTree.includes(selectedFile)) {
            selectedFile = fileTree[0];
          }
        }
      } catch (error) {
        console.error("Error listing files:", error);
        fileTree = flattenFiles(LEVEL_CONFIG.starterFiles);
      }

      await advanceBootStep(2);
      try {
        const res = await fetch(
          `/api/docker/container/${containerId}/files/read`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: `/workspace/${selectedFile}` }),
          },
        );
        const fileData = await res.json();
        if (fileData.success) {
          fileContents[selectedFile] = fileData.content;
          editorValue = fileData.content;
        }
      } catch (error) {
        console.error("Error reading initial file:", error);
        editorValue = "";
      }

      await advanceBootStep(3);
      if (editorRef) {
        monacoEditor = new MonacoInitializer();
        await monacoEditor.initialize(
          editorRef,
          editorValue,
          () => saveFile(),
          (value) => {
            if (isFrontendReadOnlyFile(selectedFile)) {
              const lockedValue = fileContents[selectedFile] ?? editorValue ?? "";
              if (value !== lockedValue) {
                monacoEditor?.setValue(lockedValue);
              }
              editorValue = lockedValue;
              return;
            }

            const prev = fileContents[selectedFile];
            fileContents[selectedFile] = value;
            editorValue = value;
            if (prev !== undefined && value !== prev) {
              markTabDirty(selectedFile, true);
            }
          },
        );
        monacoEditor.setLanguageFromFilename(selectedFile);
        monacoEditor.setReadOnly(isFrontendReadOnlyFile(selectedFile));
      }

      openFileAsTab(selectedFile, editorValue);

      await advanceBootStep(4);
      await addTerminalSession("Terminal");
      await ensureBootStepIsVisible(4);

      isBooting = false;
    } catch (error) {
      console.error("Failed to initialize environment:", error);
      bootError = error instanceof Error ? error.message : String(error);
    }
  }

  async function saveFile() {
    if (!containerId || !selectedFile) return;

    if (isSelectedFileReadOnly) {
      toast.error("This file is read-only and cannot be edited.");
      return;
    }

    const content = fileContents[selectedFile] ?? editorValue;
    try {
      const response = await fetch(
        `/api/docker/container/${containerId}/files/write`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: `/workspace/${selectedFile}`,
            content: content,
          }),
        },
      );
      const result = await response.json();
      if (result.success) {
        toast.success("File saved");
        markTabDirty(selectedFile, false);
      }
    } catch (error) {
      console.error("Error saving file:", error);
      toast.error("Failed to save file");
    }
  }

  function markTabDirty(fileId: string, dirty: boolean) {
    openTabs = openTabs.map((t) =>
      t.id === fileId ? { ...t, isDirty: dirty } : t,
    );
  }

  function switchToTab(fileId: string) {
    activeTabId = fileId;
    selectedFile = fileId;
    monacoEditor?.setValue(fileContents[fileId] ?? "");
    monacoEditor?.setLanguageFromFilename(fileId);
    monacoEditor?.setReadOnly(isFrontendReadOnlyFile(fileId));
  }

  function closeTab(fileId: string) {
    const tab = openTabs.find((t) => t.id === fileId);
    if (
      tab?.isDirty &&
      !confirm(`"${tab.filename}" has unsaved changes. Close anyway?`)
    ) {
      return;
    }

    const idx = openTabs.findIndex((t) => t.id === fileId);
    openTabs = openTabs.filter((t) => t.id !== fileId);

    if (activeTabId === fileId) {
      const next = openTabs[idx - 1] ?? openTabs[0] ?? null;
      if (next) {
        switchToTab(next.id);
      } else {
        activeTabId = "";
        selectedFile = "";
        monacoEditor?.setValue("");
      }
    }
  }

  function openFileAsTab(file: string, content: string) {
    const filename = file.split("/").pop() ?? file;
    if (!openTabs.find((t) => t.id === file)) {
      openTabs = [...openTabs, { id: file, filename, isDirty: false }];
    }
    activeTabId = file;
    selectedFile = file;
  }

  function handleTerminalElementReady(id: string, el: HTMLDivElement) {
    const cb = pendingTerminalInits.get(id);
    if (cb) cb(el);
  }

  async function addTerminalSession(label?: string): Promise<void> {
    if (terminalSessions.length >= 3) return;
    terminalCounter += 1;
    const id = `term-${terminalCounter}`;
    const sessionLabel = label ?? "Terminal";

    return new Promise<void>((resolve) => {
      pendingTerminalInits.set(id, async (el: HTMLDivElement) => {
        try {
          const inst = new TerminalInitializer();
          await inst.initializeDockerTerminal(el, containerId);
          terminalSessions = terminalSessions.map((s) =>
            s.id === id ? { ...s, instance: inst } : s,
          );
        } catch (err) {
          console.error("Terminal init error:", err);
        }
        pendingTerminalInits.delete(id);
        resolve();
      });

      terminalSessions = [
        ...terminalSessions,
        { id, label: sessionLabel, instance: null },
      ];
      activeTerminalId = id;
      activeTab = "terminal";
    });
  }

  function switchTerminalSession(id: string) {
    activeTerminalId = id;
    activeTab = "terminal";
    requestAnimationFrame(() => {
      terminalSessions.find((s) => s.id === id)?.instance?.fit();
    });
  }

  function closeTerminalSession(id: string) {
    const idx = terminalSessions.findIndex((s) => s.id === id);
    terminalSessions[idx]?.instance?.dispose();
    terminalSessions = terminalSessions.filter((s) => s.id !== id);
    if (activeTerminalId === id) {
      const next = terminalSessions[idx - 1] ?? terminalSessions[0] ?? null;
      if (next) switchTerminalSession(next.id);
      else activeTerminalId = "";
    }
  }

  function runDevServer() {
    if (!containerId || isRunning) return;
    isRunning = true;
    activeTab = "terminal";
    activeTerminalSession?.instance?.write("npm install && npm run dev\r");
  }

  function stopDevServer() {
    activeTerminalSession?.instance?.write("\x03");
    isRunning = false;
  }

  function handleTaskStatusChange(taskId: string, status: BoardTaskStatus) {
    if (status === "in-progress" || status === "in-review" || status === "done") {
      const orderedTasks = [...tasks].sort((a, b) => a.order - b.order);
      const targetIndex = orderedTasks.findIndex((task) => task.id === taskId);

      if (targetIndex > 0) {
        const blockingTask = orderedTasks
          .slice(0, targetIndex)
          .find((task) => task.boardStatus !== "done");

        if (blockingTask) {
          toast.warn(`Finish Task ${blockingTask.order} first before moving to the next task.`);
          return;
        }
      }
    }

    tasks = tasks.map((task) => {
      if (task.id !== taskId) return task;

       const nextIsCompleted = status === "done";
       const nextTestStatus =
         status === "done"
           ? "passed"
           : status === "in-review"
             ? task.testStatus === "passed"
               ? "pending"
               : (task.testStatus ?? "pending")
             : "pending";

       return {
         ...task,
         boardStatus: status,
         isCompleted: nextIsCompleted,
         is_complete: nextIsCompleted,
         testStatus: nextTestStatus,
       };
     });

    persistTaskProgress();
  }

  function openBoardKanbanView() {
    activeTab = "board";
    if (!browser) return;

    requestAnimationFrame(() => {
      window.dispatchEvent(
        new CustomEvent("devsim-tour-board-subtab", { detail: { subTab: "board" } }),
      );
    });
  }

  function handleCrashCourseClose() {
    const closedTaskId = activeCrashCourseTaskId;
    markCrashCourseSeen(closedTaskId);
    crashCourseOpen = false;
    activeCrashCourseTaskId = "";
    openBoardKanbanView();
    if (closedTaskId && crashCourseCompletedByTask[closedTaskId]) {
      showCrashCourseMoveTaskMessage(closedTaskId, "closed-done");
      return;
    }

    showCrashCourseMoveTaskMessage(closedTaskId, "closed");
  }

  function handleCrashCourseComplete() {
    const completedTaskId = activeCrashCourseTaskId;

    if (completedTaskId && crashCourseCompletedByTask[completedTaskId]) {
      crashCourseOpen = false;
      activeCrashCourseTaskId = "";
      openBoardKanbanView();
      return;
    }

    markCrashCourseSeen(completedTaskId);
    if (completedTaskId) {
      crashCourseCompletedByTask = {
        ...crashCourseCompletedByTask,
        [completedTaskId]: true,
      };
      persistCrashCourseCompletedState(currentLevel);
    }
    crashCourseOpen = false;
    activeCrashCourseTaskId = "";
    openBoardKanbanView();
    showCrashCourseMoveTaskMessage(completedTaskId, "completed");
    // Guarantee trivia shows after the user confirms the completion prompt.
    pendingTriviaAfterCrashCourse = true;
  }

  function handleTestsComplete(
    event: CustomEvent<{ success: boolean; result: TestRunResult }>,
  ) {
    testResultModalOpen = true;
    const previousTasks = tasks.map((task) => ({
      id: task.id,
      order: task.order,
      isCompleted: task.isCompleted,
    }));

    const { result } = event.detail;
    if (!result || !result.taskResults) return;

    const orderLockedTaskIds = new Set<string>();
    const orderedSnapshot = [...tasks].sort((a, b) => a.order - b.order);
    for (let i = 0; i < orderedSnapshot.length; i += 1) {
      const hasIncompletePrevious = orderedSnapshot
        .slice(0, i)
        .some((task) => task.boardStatus !== "done");
      if (hasIncompletePrevious) {
        orderLockedTaskIds.add(orderedSnapshot[i].id);
      }
    }

    const byTaskId = new Map(
      result.taskResults.map((taskResult) => [taskResult.taskId, taskResult]),
    );

    const regressions: Array<{
      taskId: string;
      taskName: string;
      previousStatus: BoardTaskStatus;
    }> = [];
    const skippedByOrder: string[] = [];

     tasks = tasks.map((task, index) => {
       const directResult = byTaskId.get(task.id);
       const fallbackResult = byTaskId.get(String(getTaskNumber(task, index)));
       const taskResult = directResult ?? fallbackResult;
       const canManuallyMoveToDone = (task.testType ?? "none").toLowerCase() === "none";

       if (!taskResult) return task;

      if (taskResult.passed) {
        if (orderLockedTaskIds.has(task.id)) {
          skippedByOrder.push(task.taskName);
          return {
            ...task,
            boardStatus: task.boardStatus ?? "backlog",
            isCompleted: false,
            testStatus: "pending",
          };
        }

        return {
          ...task,
          boardStatus: "done",
          isCompleted: true,
          testStatus: "passed",
        };
      }

       if (task.boardStatus === "done" && !canManuallyMoveToDone) {
         regressions.push({
           taskId: task.id,
           taskName: task.taskName,
           previousStatus: task.boardStatus,
         });
         return { ...task, testStatus: "failed", is_complete: false };
       }

       return {
         ...task,
         boardStatus:
           task.boardStatus === "done"
             ? "in-review"
             : (task.boardStatus ?? "in-review"),
         isCompleted: false,
         is_complete: false,
         testStatus: "failed",
       };
     });

    persistTaskProgress();

    if (skippedByOrder.length > 0) {
      toast.warn("Complete earlier tasks first before marking later tasks as done.");
    }

    if (regressions.length > 0) {
      pendingRegressionUpdates = regressions;
      showNextRegressionModal();
    }

    const newlyCompletedOrders = tasks
      .filter((task) => {
        const prev = previousTasks.find((entry) => entry.id === task.id);
        return task.isCompleted && !prev?.isCompleted;
      })
      .map((task) => task.order)
      .sort((a, b) => a - b);

    const nextTask = getNextCrashCourseTask();
    if (newlyCompletedOrders.length > 0 && nextTask) {
      pendingPostTestIntro = true;
      postTestCompletedTaskOrder = newlyCompletedOrders[newlyCompletedOrders.length - 1];
      postTestNextTaskOrder = nextTask.order;
      levelIntroDismissed = false;
    }
  }

  function handleTestResultModalClosed() {
    testResultModalOpen = false;

    if (pendingPostTestIntro) {
      levelIntroCardOpen = true;
      levelIntroCardShown = true;
      activeTab = 'board';
    }
  }

  function showNextRegressionModal() {
    if (pendingRegressionUpdates.length === 0) {
      regressionTaskId = "";
      regressionTaskName = "";
      return;
    }
    const next = pendingRegressionUpdates[0];
    regressionTaskId = next.taskId;
    regressionTaskName = next.taskName;
    testRegressionModalOpen = true;
  }

   function handleRegressionConfirm() {
     tasks = tasks.map((task) => {
       if (task.id === regressionTaskId) {
         return {
           ...task,
           boardStatus: "in-review",
           isCompleted: false,
           is_complete: false,
           testStatus: "failed",
         };
       }
       return task;
     });
     persistTaskProgress();
     testRegressionModalOpen = false;

     pendingRegressionUpdates = pendingRegressionUpdates.slice(1);
     setTimeout(() => showNextRegressionModal(), 300);
   }

  function handleRegressionDismiss() {
    testRegressionModalOpen = false;

    pendingRegressionUpdates = pendingRegressionUpdates.slice(1);
    setTimeout(() => showNextRegressionModal(), 300);
  }

  async function selectFile(
    file: string,
    lineNumber?: number,
    searchTerm?: string,
  ) {
    activeTab = "editor";

    if (openTabs.find((t) => t.id === file)) {
      switchToTab(file);
      if (lineNumber) {
        requestAnimationFrame(() =>
          monacoEditor?.revealLine(lineNumber, searchTerm),
        );
      }
      return;
    }

    if (containerId) {
      try {
        const res = await fetch(
          `/api/docker/container/${containerId}/files/read`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: `/workspace/${file}` }),
          },
        );
        const result = await res.json();
        if (result.success) {
          fileContents[file] = result.content;
          editorValue = result.content;
          openFileAsTab(file, result.content);
          monacoEditor?.setValue(result.content);
          monacoEditor?.setLanguageFromFilename(file);
          monacoEditor?.setReadOnly(isFrontendReadOnlyFile(file));
          if (lineNumber) {
            requestAnimationFrame(() =>
              monacoEditor?.revealLine(lineNumber, searchTerm),
            );
          }
        }
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }
  }

  function handleBack() {
    backModalOpen = true;
  }

  async function confirmBack() {
    isLeavingWorkspace = true;
    try {
      await fetch(`/api/docker/container/${containerId}/stop`, {
        method: "POST"
      });
    } catch (err) {
      console.error("Failed to stop container:", err);
    }
    goto("/dashboard");
  }

  async function handleSubmitSprint() {
    submitSprintModal.open();
  }

  async function handleDownload() {
    isDownloading = true;
    try {
      const dbContainerId = page.params.containerId;
      const response = await fetch(
        `/api/docker/container/${dbContainerId}/download`,
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Failed to download project");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
      a.download = filenameMatch
        ? filenameMatch[1]
        : `project-${dbContainerId}.tar`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Project downloaded successfully!");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download project");
    } finally {
      isDownloading = false;
    }
  }

  async function handleSubmitted(
    event: CustomEvent<{ advanceToNextLevel: boolean; nextLevel?: number | null }>,
  ) {
    const { advanceToNextLevel, nextLevel } = event.detail;

    if (advanceToNextLevel) {
      const targetLevel =
        typeof nextLevel === "number" && nextLevel > 0
          ? nextLevel
          : currentLevel + 1;

      // Immediately switch local UI state to the next level.
      currentLevel = targetLevel;
      levelIntroCardOpen = false;
      levelIntroCardShown = false;
      levelIntroDismissed = false;

      localStorage.setItem('showTaskIntroCard', 'true');
      
      await goto(`?reload=${Date.now()}`, {
        invalidateAll: true,
        replaceState: true,
        noScroll: true,
      });
    }
  }

  function refreshPreview() {
    if (!containerId?.trim()) return;
    fetch(`/api/docker/container/${containerId}/ports`)
      .then((res) => res.json())
      .then((data: { success?: boolean; previewUrl?: string; error?: string }) => {
        if (data.success && data.previewUrl) {
          let finalUrl = data.previewUrl;
          if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
            finalUrl = "https://" + finalUrl;
          }
          try {
            const u = new URL(finalUrl);
            u.searchParams.set("t", Date.now().toString());
            previewUrl = u.toString();
            if (iframeRef) iframeRef.src = previewUrl;
          } catch (error) {
            console.error("Error refreshing preview:", error);
          }
        } else {
          if (data.error) toast.error(data.error);
          if (previewUrl) {
            try {
              const currentUrl = new URL(previewUrl);
              currentUrl.searchParams.set("t", Date.now().toString());
              previewUrl = currentUrl.toString();
              if (iframeRef) iframeRef.src = previewUrl;
            } catch (error) {
              console.error("Error refreshing preview:", error);
            }
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching ports:", err);
        toast.error("Could not refresh preview");
        if (previewUrl) {
          try {
            const currentUrl = new URL(previewUrl);
            currentUrl.searchParams.set("t", Date.now().toString());
            previewUrl = currentUrl.toString();
            if (iframeRef) iframeRef.src = previewUrl;
          } catch (error) {
            console.error("Error refreshing preview:", error);
          }
        }
      });
  }

  function refreshTerminal() {
    activeTerminalSession?.instance?.reconnect();
  }

  async function refreshFiles() {
    if (!containerId) return;
    try {
      const listRes = await fetch(
        `/api/docker/container/${containerId}/files/list`,
        { method: "POST", headers: { "Content-Type": "application/json" } },
      );
      const listData = (await listRes.json()) as FileListResponse;
      if (listData.success) {
        fileTree = listData.files;
        directories = listData.directories || [];
        toast.success("Files refreshed");
      }
    } catch (error) {
      console.error("Error refreshing files:", error);
      toast.error("Failed to refresh files");
    }
  }

  function handleTabChange(tab: "editor" | "terminal" | "preview" | "board") {
    activeTab = tab;
    if (tab === "preview") {
      refreshPreview();
    }
  }

  async function handleCreateFile(fullPath: string, isDirectory: boolean) {
    if (!containerId || !fullPath) return;

    try {
      const response = await fetch(
        `/api/docker/container/${containerId}/files/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `/workspace/${fullPath}`, isDirectory }),
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success(`${isDirectory ? "Folder" : "File"} created`);
        const listRes = await fetch(
          `/api/docker/container/${containerId}/files/list`,
          { method: "POST", headers: { "Content-Type": "application/json" } },
        );
        const listData = await listRes.json();
        if (listData.success) {
          fileTree = listData.files;
          directories = listData.directories || [];
        }
      }
    } catch (error) {
      console.error("Error creating file:", error);
      toast.error(`Failed to create ${isDirectory ? "folder" : "file"}`);
    }
  }

  async function handleDeleteFile(filePath: string) {
    if (!containerId || !filePath) return;

    try {
      const response = await fetch(
        `/api/docker/container/${containerId}/files/delete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `/workspace/${filePath}` }),
        },
      );
      const data = await response.json();
      if (data.success) {
        const wasActiveTabDeleted = activeTabId === filePath;

        if (selectedFile === filePath) {
          activeTabId = "";
          selectedFile = "";
          monacoEditor?.setValue("");
        }

        openTabs = openTabs.filter(t => t.id !== filePath);

        if (wasActiveTabDeleted) {
          if (openTabs.length > 0) {
            switchToTab(openTabs[0].id);
          }
        }

        delete fileContents[filePath];

        const listRes = await fetch(
          `/api/docker/container/${containerId}/files/list`,
          { method: "POST", headers: { "Content-Type": "application/json" } },
        );
        const listData = await listRes.json();
        if (listData.success) {
          fileTree = listData.files;
          directories = listData.directories || [];
          if (!fileTree.includes(selectedFile) && fileTree.length > 0) {
            selectedFile = fileTree[0];
          }
        }
      } else {
        console.error("Delete failed:", data.error);
        toast.error(`Delete failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete");
    }
  }

  async function handleRenameFile(oldPath: string, newPath: string) {
    if (!containerId || !oldPath || !newPath) return;

    try {
      const response = await fetch(
        `/api/docker/container/${containerId}/files/rename`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            oldPath: `/workspace/${oldPath}`,
            newPath: `/workspace/${newPath}`,
          }),
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Renamed successfully");
        const listRes = await fetch(
          `/api/docker/container/${containerId}/files/list`,
          { method: "POST", headers: { "Content-Type": "application/json" } },
        );
        const listData = await listRes.json();
        if (listData.success) {
          fileTree = listData.files;
          directories = listData.directories || [];
        }
      }
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error("Failed to rename");
    }
  }
</script>

<svelte:head>
  <title>Level {currentLevel}: {title} - DevSim</title>
</svelte:head>

<!-- Boot / Loading screen -->
{#if isBooting}
  <WorkspaceBootScreen
    step={bootStep}
    steps={BOOT_STEPS}
    error={bootError}
    levelLabel="Level {currentLevel} · {title}"
    on:retry={handleBootRetry}
  />
{/if}

<div
  class="h-screen flex flex-col bg-[#0a0e1a] text-[#d0d7dd]"
  class:invisible={isBooting}
>
  <!-- Header -->
  <WorkspaceHeader
    data={{
      level: currentLevel,
      title: actualLevelConfig.title,
      stack: actualLevelConfig.stack,
      difficulty,
      timeRemaining,
      isRunning,
      isDownloading,
      onBack: handleBack,
      onRun: runDevServer,
      onStop: stopDevServer,
      onDemo: () => handleTabChange("preview"),
      onSubmit: handleSubmitSprint,
      onDownload: handleDownload,
    }}
  >
    <svelte:fragment slot="test-button">
      <TestCase
        bind:this={testCaseComponent}
        {containerId}
        {level}
        tasks={tasks as TestableTask[]}
        disabled={isBooting}
        on:testsComplete={handleTestsComplete}
        on:resultModalClosed={handleTestResultModalClosed}
      />
    </svelte:fragment>
  </WorkspaceHeader>

  <div class="flex flex-1 overflow-hidden">
    <!-- Left Sidebar -->
    <PrimarySidebar
      {fileTree}
      {directories}
      {selectedFile}
      {projectName}
      {containerId}
      {tasks}
      currentLevel={currentLevel}
      levelTitle={title}
      onSelectFile={selectFile}
      onCreateFile={handleCreateFile}
      onDeleteFile={handleDeleteFile}
      onRenameFile={handleRenameFile}
      onRefreshFiles={refreshFiles}
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0" data-tour="editor-workspace">
      <!-- Tab Bar -->
      <div data-tour="workspace-tabs">
        <WorkspaceTabs
          {activeTab}
          onTabChange={handleTabChange}
          showCrashCourseButton={tasks.some((task) => (task.learningSections?.length ?? 0) > 0)}
          crashCourseCompleted={hasCompletedCrashCourse}
          onOpenCrashCourse={() => {
            const manualTask = getManualCrashCourseTask();
            if (!manualTask) return;
            openCrashCourseForTask(manualTask.id);
          }}
          aiHelperActive={showAiHelper}
          onToggleAiHelper={() => (showAiHelper = !showAiHelper)}
        />
      </div>

      <!-- Content Area -->
      <div class="flex-1 relative overflow-hidden">
        <EditorPanel
          visible={activeTab === "editor"}
          {openTabs}
          {activeTabId}
          isReadOnly={isSelectedFileReadOnly}
          readOnlyMessage="Protected file"
          onFileTabClick={switchToTab}
          onFileTabClose={closeTab}
          onSave={saveFile}
          bind:editorRef
        />



        <TerminalPanel
          visible={activeTab === "terminal"}
          sessions={terminalSessions}
          {activeTerminalId}
          onElementReady={handleTerminalElementReady}
          onRefresh={refreshTerminal}
        />

        <PreviewPanel
          visible={activeTab === "preview"}
          {previewUrl}
          onRefresh={refreshPreview}
          bind:iframeRef
        />

        {#if activeTab === "board"}
          <div class="absolute inset-0 overflow-hidden">
            <BoardPanel
              scenario={actualLevelConfig.scenario}
              {tasks}
              onTaskStatusChange={handleTaskStatusChange}
            />
          </div>
        {/if}

      </div>
    </div>

    <!-- Right: Terminal Manager -->
    {#if activeTab === "terminal"}
      <TerminalManagerPanel
        sessions={terminalSessions}
        activeId={activeTerminalId}
        onSwitch={switchTerminalSession}
        onAdd={() => addTerminalSession()}
        onClose={closeTerminalSession}
      />
    {/if}

    <!-- Right: AI Helper (SAZ) docked panel -->
    <AiHelp
      show={showAiHelper}
      onClose={() => (showAiHelper = false)}
      containerId={data.dockerContainerId!}
      userId={data.userId}
      scenario={actualLevelConfig.scenario}
      {tasks}
      initialFileTree={fileTree}
      initialFileContents={fileContents}
      {projectName}
      level={currentLevel}
      initialCoins={userCoins}
      initialAiHelps={userAiHelps}
      bind:mode={aiPanelMode}
    />
  </div>

   <!-- Submit Sprint modal -->
   <SubmitSprintModal
     bind:this={submitSprintModal}
     dbContainerId={containerId}
     {containerId}
     {tasks}
     level={currentLevel}
     levelXpReward={currentLevelRecord?.xpReward ?? 0}
     levelCoinReward={currentLevelRecord?.coinReward ?? 0}
     {fileContents}
     existingFiles={fileTree}
     masteryCheckpointEnabled={data.masteryCheckpointEnabled}
     on:submitted={handleSubmitted}
   />

  <!-- Back confirmation modal -->
  <ConfirmationModal
    bind:open={backModalOpen}
    icon="🚪"
    iconVariant="warning"
    title="Leave Workspace?"
    subtitle="Are you sure you want to leave? Your current progress will be lost."
    description="Any changes not saved in the sprint will be discarded. You can always come back to this level later."
    confirmLabel="Leave"
    cancelLabel="Stay"
    variant="warning"
    isLoading={isLeavingWorkspace}
    loadingLabel="Stopping…"
    closeOnBackdropClick={!isLeavingWorkspace}
    on:confirm={confirmBack}
    on:cancel={() => { backModalOpen = false; }}
  />

</div>


<!-- Test Regression modal -->
<ConfirmationModal
  bind:open={testRegressionModalOpen}
  icon="⚠️"
  iconVariant="warning"
  title="Test Failed After Completion"
  subtitle={`"${regressionTaskName}" was marked as Done but now fails`}
  description="Your recent changes have caused this task's tests to fail. Would you like to move this task back to 'In Review' so you can fix the issues?"
  confirmLabel="Move to In Review"
  cancelLabel="Keep in Done"
  variant="warning"
  on:confirm={handleRegressionConfirm}
  on:cancel={handleRegressionDismiss}
/>

<!-- Trivia Modal -->
<TriviaModal
  bind:open={triviaModalOpen}
  on:answered={handleTriviaAnswer}
/>

<ConfirmationModal
  bind:open={crashCourseCompletePromptOpen}
  icon="🎯"
  iconVariant="accent"
  title="Crash Course Complete"
  subtitle={`Task ${crashCoursePromptTaskNumber} is ready`}
  description={`You finished the crash course for Task ${crashCoursePromptTaskNumber}. Move this ticket to in progress when you're ready.`}
  confirmLabel="Got it"
  cancelLabel="Back"
  variant="primary"
  on:confirm={handleCrashCoursePromptConfirm}
  on:cancel={handleCrashCoursePromptBack}
/>

<ConfirmationModal
  bind:open={crashCourseClosePromptOpen}
  icon="🛑"
  iconVariant="warning"
  title="Crash Course Closed"
  subtitle={`Task ${crashCoursePromptTaskNumber} crash course was closed`}
  description={`You closed the crash course before marking it as finished. You can return now or open it again later from the tab button.`}
  confirmLabel="Got it"
  cancelLabel="Back to Crash Course"
  variant="warning"
  on:confirm={handleCrashCoursePromptConfirm}
  on:cancel={handleCrashCoursePromptBack}
/>

<ConfirmationModal
  bind:open={crashCourseCloseDonePromptOpen}
  icon="✅"
  iconVariant="success"
  title="Crash Course Already Completed"
  subtitle={`Task ${crashCoursePromptTaskNumber} crash course is already marked done`}
  description={`You have already finished this crash course. You can continue to the task board or go back to review the crash course again.`}
  confirmLabel="Got it"
  cancelLabel="Back to Crash Course"
  variant="primary"
  on:confirm={handleCrashCoursePromptConfirm}
  on:cancel={handleCrashCoursePromptBack}
/>



<!-- Level Intro Card -->
<LevelIntroCard
  levelTitle={title}
  levelNumber={currentLevel}
  isOpen={levelIntroCardOpen}
  levelDescription={effectiveLevelIntroDescription}
  tasks={tasks.map(t => ({ id: t.id, text: t.taskName, completed: t.isCompleted }))}
  levelConfig={{
    isFirstProjectCreation: hasEverBeenInTutorial,
    operatorAlias,
    projectName: workspaceProjectName
  }}
  onClose={handleLevelIntroClose}
/>

<LearningContent
  open={crashCourseOpen}
  isCompleted={Boolean(activeCrashCourseTaskId && crashCourseCompletedByTask[activeCrashCourseTaskId])}
  {containerId}
  tasks={tasks
    .filter((task) => task.id === activeCrashCourseTaskId)
    .map((task) => ({
      id: task.id,
      taskName: task.taskName,
      order: task.order,
      learningSections: task.learningSections ?? [],
    }))}
  onClose={handleCrashCourseClose}
  onComplete={handleCrashCourseComplete}
/>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, sans-serif;
  }

  :global(.search-highlight-match) {
    background-color: rgba(7, 165, 201, 0.25) !important;
    border: 1px solid rgba(7, 165, 201, 0.6);
    border-radius: 2px;
  }

  :global(.search-highlight-match-inline) {
    color: #fff !important;
    font-weight: 600;
  }
</style>