<script lang="ts">
  import { onMount } from "svelte";
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

  import OnboardingController from "$lib/components/onboarding/OnboardingController.svelte";
  import SazOnboardingCoach from "$lib/components/onboarding/SazOnboardingCoach.svelte";
  import LevelIntroCard from "$lib/components/workspace/LevelIntroCard.svelte";
  import TriviaModal from "$lib/components/ui/TriviaModal.svelte";
  import type { TestableTask, TestRunResult } from "$lib/types/test";
  import type { IHints, ITask } from "$lib/types";
  import { LEVEL_CONFIG } from "$lib/mockdata/mocklevel";
  import { getLevelConfig } from "$lib/tests/levels";
  import type { FileListResponse } from "$lib/interface/Files";
  import type { FileTab } from "$lib/components/workspace/FileTabBar.svelte";
  import { toast } from "$lib/stores/toast";
  import type { UserData, IContainer, IScenario, ILevel } from "$lib/types";
  import { TerminalInitializer } from "$client/TerminalInitializer";

  const SazOnboardingCoachComponent: any = SazOnboardingCoach;


  interface WorkspaceProps {
    user: UserData;
    userId: string;
    userCoins: number;
    dockerContainerId: string;
    level: number;
    completedTasks: string[];
    container: IContainer;
    hints: IHints[];
    levelDescription: string;
    scenarioTitle: string;
    stacks: string[];
  }

  export let data: WorkspaceProps;

  $: userId = data.userId || "";
  $: userCoins = data.userCoins || 0;

  let currentLevel = data.level || 1;

  function getLevelByOrder(
    scenario: IScenario | null | undefined,
    order: number,
  ): ILevel | null {
    if (!scenario?.levels?.length) return null;
    return (
      scenario.levels.find((lvl: ILevel) => lvl.order === order) ??
      scenario.levels[order - 1] ??
      null
    );
  }

  $: workspaceScenario = data.container?.scenario ?? null;
  $: stackNames = data.container?.containerStacks?.map((entry) => entry.stackName).filter(Boolean) ?? [];
  $: currentLevelRecord = getLevelByOrder(workspaceScenario, currentLevel);
  $: title = currentLevelRecord?.title ?? LEVEL_CONFIG.title;
  $: stack = stackNames.length > 0 ? stackNames.join(" + ") : (workspaceScenario?.name ?? LEVEL_CONFIG.stack);
  $: difficulty = workspaceScenario?.difficulty ?? LEVEL_CONFIG.difficulty;
  $: level = currentLevel;

  console.log("current level record: ", currentLevelRecord);

  // State
  let activeTab: "editor" | "terminal" | "preview" | "board" = "editor";
  let selectedFile: string = "app/page.tsx";
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

  let openTabs: FileTab[] = [];
  let activeTabId: string = "";
  type BoardTaskStatus = "backlog" | "in-progress" | "in-review" | "done";
  type WorkspaceTask = TestableTask & { boardStatus?: BoardTaskStatus };
  let tasks: WorkspaceTask[] = [];
  let timeRemaining: number = 4 * 60 * 60;
  let isRunning: boolean = false;
  let monacoEditor: MonacoInitializer | null = null;
  let previewUrl: string = "";
  let editorValue: string = "";
  let fileTree: string[] = [];
  let directories: string[] = [];
  

  interface TermSession {
    id: string;
    label: string;
    instance: TerminalInitializer | null;
  }
  let terminalSessions: TermSession[] = [];
  let activeTerminalId: string = "";
  let terminalCounter = 0;
  const pendingTerminalInits = new Map<string, (el: HTMLDivElement) => void>();
  $: activeTerminalSession =
    terminalSessions.find((s) => s.id === activeTerminalId) ?? null;

  $: {
    const levelTasks = currentLevelRecord?.tasks || [];
    const persisted = loadTaskProgress(currentLevel);

    tasks = levelTasks.map((task: ITask, index: number) => {
      const taskNumber = getTaskNumber(task, index);
      const config = getLevelConfig(currentLevel);
      const hasMappedTest = Boolean(
        config?.tasks.find(
          (testTask) => Number(testTask.taskId) === taskNumber,
        ),
      );
      const persistedState = persisted[task.id];

      const boardStatus =
        persistedState?.boardStatus ?? (task.isCompleted ? "done" : "backlog");
      const isCompleted = persistedState?.isCompleted ?? task.isCompleted;
      const testStatus =
        persistedState?.testStatus ?? (isCompleted ? "passed" : "pending");
      const taskType = task.testType ?? "none";

      return {
        ...task,
        isCompleted,
        boardStatus,
        testStatus,
        hasClientTest: taskType === "client" || taskType === "both",
        hasServerTest: taskType === "server" || taskType === "both",
      };
    });
  }

  $: levelHints =
    currentLevelRecord?.tasks?.flatMap(
      (task: ITask) => task.hints ?? [],
    ) || [];
  $: levelTestConfig = getLevelConfig(currentLevel);

  $: actualLevelConfig = levelTestConfig
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
    : LEVEL_CONFIG;

  $: operatorAlias = data.user?.username || data.user?.name || "Operator";
  $: workspaceProjectName = workspaceScenario?.name || title || "DevSim Workspace";

  // Track onboarding state - initialize from URL
  let isInOnboarding = page.url.searchParams.get("onboarding") === "1";

  // Track if we've ever been in onboarding this session
  let hasEverBeenInOnboarding = isInOnboarding;

  // Update hasEverBeenInOnboarding when we detect onboarding in URL
  $: {
    if (page.url.searchParams.get("onboarding") === "1") {
      hasEverBeenInOnboarding = true;
    }
  }

  // Function to call when onboarding completes (called from OnboardingController)
  function handleOnboardingComplete() {
    onboardingTourCompleted = true;
    // Show level intro card after onboarding completes (only if not already shown)
    if (tasks.length > 0 && !levelIntroCardShown) {
      levelIntroCardOpen = true;
      levelIntroCardShown = true;
    }
  }

  function handleLevelIntroClose() {
    levelIntroCardOpen = false;
    activeTab = 'board';

    const shouldShowSazOnboarding =
      !sazOnboardingShown &&
      onboardingTourCompleted &&
      currentLevel === 1;

    if (shouldShowSazOnboarding) {
      sazOnboardingOpen = true;
      sazOnboardingShown = true;
    }
  }

  // Show level intro card after tasks load
  // Only show when NOT in onboarding (onboarding is done or user skipped it)
  $: if (tasks.length > 0 && !levelIntroCardShown && !isInOnboarding) {
    // Show level intro card after tasks load (for all users - both those who did onboarding and those who didn't)
    setTimeout(() => {
      if (!levelIntroCardShown) {
        levelIntroCardOpen = true;
        levelIntroCardShown = true;
      }
    }, 1000);
  }


  $: if (actualLevelConfig) {
    timeRemaining = actualLevelConfig.deadline || 4 * 60 * 60;
  }


  let aiPanelOpen: boolean = false;
  let aiPanelMode: "chat" | "quick" = "chat";
  let isDownloading: boolean = false;

  let backModalOpen: boolean = false;

  let taskIntroCardOpen: boolean = false;
  let levelIntroCardOpen: boolean = false;
  let levelIntroCardShown: boolean = false;
  let onboardingTourCompleted: boolean = false;
  let sazOnboardingOpen: boolean = false;
  let sazOnboardingShown: boolean = false;

  // Trivia modal state
  let triviaModalOpen: boolean = false;
  let triviaCorrectCount: number = 0;
  let triviaTotalCount: number = 0;
  let triviaShownThisSession: boolean = false;

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
    triviaModalOpen = true;
    triviaShownThisSession = true;
  }

  // Call this after tasks are loaded
  $: if (tasks.length > 0 && !isInOnboarding) {
    // Small delay to let user settle in
    setTimeout(maybeShowTrivia, 3000);
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



  let hints: Array<{
    id: string;
    title: string;
    content: string;
    category: 'concept' | 'best-practice' | 'tip' | 'warning';
    priority: 'low' | 'medium' | 'high';
    relatedTask?: string;
  }> = [
    {
      id: '1',
      title: 'Clean Code Principles',
      content: 'Use meaningful variable names and keep functions small. This makes your code more readable and maintainable.',
      category: 'best-practice',
      priority: 'medium'
    },
    {
      id: '2',
      title: 'Error Handling',
      content: 'Always handle potential errors gracefully. Use try-catch blocks and provide meaningful error messages to users.',
      category: 'concept',
      priority: 'high'
    },
    {
      id: '3',
      title: 'Test Your Code',
      content: 'Write tests for your functions. This ensures they work correctly and prevents regressions when you make changes.',
      category: 'tip',
      priority: 'medium'
    }
  ];

  let testRegressionModalOpen: boolean = false;
  let regressionTaskName: string = "";
  let regressionTaskId: string = "";
  let pendingRegressionUpdates: Array<{
    taskId: string;
    taskName: string;
    previousStatus: BoardTaskStatus;
  }> = [];

  function toggleAiPanel() {
    aiPanelOpen = !aiPanelOpen;
  }

  let isBooting = true;
  let bootStep = 0;
  let bootError = "";
  let bootStepStartedAt = 0;

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
  let testCaseComponent: TestCase;
  let editorRef: HTMLDivElement;
  let iframeRef: HTMLIFrameElement;

  $: containerId = data.dockerContainerId ?? "";
  $: projectName = "workspace";

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

  $: isSelectedFileReadOnly = isFrontendReadOnlyFile(selectedFile);
  $: monacoEditor?.setReadOnly(isSelectedFileReadOnly);

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
      console.log("starting container: ", startData.previewUrl);
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
        testStatus: nextTestStatus,
      };
    });

    persistTaskProgress();
  }

  function handleTestsComplete(
    event: CustomEvent<{ success: boolean; result: TestRunResult }>,
  ) {
    const { result } = event.detail;
    if (!result || !result.taskResults) return;

    const byTaskId = new Map(
      result.taskResults.map((taskResult) => [taskResult.taskId, taskResult]),
    );

    const regressions: Array<{
      taskId: string;
      taskName: string;
      previousStatus: BoardTaskStatus;
    }> = [];

    tasks = tasks.map((task, index) => {
      const directResult = byTaskId.get(task.id);
      const fallbackResult = byTaskId.get(String(getTaskNumber(task, index)));
      const taskResult = directResult ?? fallbackResult;
      const canManuallyMoveToDone = (task.testType ?? "none").toLowerCase() === "none";

      if (!taskResult) return task;

      if (taskResult.passed) {
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
        return { ...task, testStatus: "failed" };
      }

      return {
        ...task,
        boardStatus:
          task.boardStatus === "done"
            ? "in-review"
            : (task.boardStatus ?? "in-review"),
        isCompleted: false,
        testStatus: "failed",
      };
    });

    persistTaskProgress();

    if (regressions.length > 0) {
      pendingRegressionUpdates = regressions;
      showNextRegressionModal();
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

  function confirmBack() {
    backModalOpen = false;
    // Fire and forget - let container stop in background
    fetch(`/api/docker/container/${containerId}/stop`, {
      method: "POST"
    });
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

      localStorage.setItem('showTaskIntroCard', 'true');
      
      await goto(`?reload=${Date.now()}`, {
        invalidateAll: true,
        replaceState: true,
        noScroll: true,
      });

      // Keep local level in sync even if navigation data resolves slightly later.
      currentLevel = (data.level || targetLevel);
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
        <WorkspaceTabs {activeTab} onTabChange={handleTabChange} />
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
    on:submitted={handleSubmitted}
  />

  <!-- Back confirmation modal -->
  <ConfirmationModal
    bind:open={backModalOpen}
    icon="🚪"
    iconVariant="warning"
    title="Leave Workspace?"
    subtitle="Are you sure you want to leave? Your current progress will be lost."
    description="Any changes not saved in the sprint will be discarded. You can always come back to this level later. The container will stop in the background."
    confirmLabel="Leave"
    cancelLabel="Stay"
    variant="warning"
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


<!-- Floating AI Help -->
<div class="fixed inset-0 z-50 pointer-events-none">
  <div class="pointer-events-auto">
    <AiHelp
      containerId={data.dockerContainerId}
      userId={data.userId}
      scenario={actualLevelConfig.scenario}
      {tasks}
      initialFileTree={fileTree}
      initialFileContents={fileContents}
      {projectName}
      level={currentLevel}
      initialCoins={userCoins}
      bind:mode={aiPanelMode}
    />
  </div>
</div>

<!-- Onboarding -->
{#if !isBooting && isInOnboarding}
  <OnboardingController
    {stack}
    {title}
    scenario={actualLevelConfig.scenario}
    {level}
    onSwitchTab={(tab) =>
      handleTabChange(tab as "editor" | "terminal" | "preview" | "board")}
    onComplete={handleOnboardingComplete}
  />
{/if}

<!-- Level Intro Card -->
<LevelIntroCard
  levelTitle={title}
  levelNumber={currentLevel}
  isOpen={levelIntroCardOpen}
  levelDescription={actualLevelConfig?.scenario ?? ''}
  tasks={tasks.map(t => ({ id: t.id, text: t.taskName, completed: t.isCompleted }))}
  levelConfig={{
    isFirstProjectCreation: hasEverBeenInOnboarding,
    operatorAlias,
    projectName: workspaceProjectName
  }}
  onClose={handleLevelIntroClose}
/>

<svelte:component
  this={SazOnboardingCoachComponent}
  open={sazOnboardingOpen}
  accentColor="#07a5c9"
  stackName={stack}
  onClose={() => {
    sazOnboardingOpen = false;
  }}
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