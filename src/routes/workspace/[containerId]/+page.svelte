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
  import type { TestableTask, TestRunResult } from "$lib/types/test";
  import type { IHints, ITask } from "$lib/types";
  import { LEVEL_CONFIG } from "$lib/mockdata/mocklevel";
  import { getLevelConfig } from "$lib/tests/levels";
  import type { FileListResponse } from "$lib/interface/Files";
  import type { FileTab } from "$lib/components/workspace/FileTabBar.svelte";
  import { toast } from "$lib/stores/toast";
  import type { UserData, IContainer, IScenario, ILevel } from "$lib/types";
  import { TerminalInitializer } from "$client/TerminalInitializer";

  interface WorkspaceProps {
    user: UserData;
    userId: string;
    userCoins: number;
    dockerContainerId: string;
    level: number;
    completedTasks: string[];
    container: IContainer;
    hints: IHints[];
    levelDescription: string; // Scenario/sprint brief text for the board panel
    scenarioTitle: string; // For header display
    stacks: string[]; // For header display
  }

  // Server-loaded data:
  //   dockerContainerId — the real Docker container ID (for Docker API calls)
  //   page.params.containerId — the Prisma DB id (for submit/archive API calls)
  //   userId — the user's ID for AI hints
  //   userCoins — the user's coin balance for AI hints
  export let data: WorkspaceProps;

  // Get user data from page data
  $: userId = data.userId || "";
  $: userCoins = data.userCoins || 0;

  // Workspace level/title state from DB (with mock fallback)
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

  // State
  let activeTab: "editor" | "terminal" | "preview" | "board" = "editor";
  let selectedFile: string = "app/page.tsx";
  let fileContents: Record<string, string> = {};

  // ── Multi-tab state ──────────────────────────────────────────────────────
  let openTabs: FileTab[] = [];
  let activeTabId: string = "";
  type BoardTaskStatus = "backlog" | "in-progress" | "in-review" | "done";
  type WorkspaceTask = TestableTask & { boardStatus?: BoardTaskStatus };
  let tasks: WorkspaceTask[] = []; // Will be populated from server data
  let timeRemaining: number = 4 * 60 * 60; // Default to 4 hours
  let isRunning: boolean = false;
  let monacoEditor: MonacoInitializer | null = null;
  let previewUrl: string = "";
  let editorValue: string = "";
  let fileTree: string[] = [];
  let directories: string[] = [];

  // ── Multi-terminal state ─────────────────────────────────────────────────
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

  // Initialize tasks from server data + persisted board/test state
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

  // Get level-specific config from server data
  $: levelHints =
    currentLevelRecord?.tasks?.flatMap(
      (task: ITask) => task.hints ?? [],
    ) || [];
  $: levelTestConfig = getLevelConfig(currentLevel);

  // Merge test config with mockdata for UI fields (test config has tasks, mockdata has UI fields)
  $: actualLevelConfig = levelTestConfig
    ? {
        ...LEVEL_CONFIG,
        ...levelTestConfig,
        level: currentLevel,
        title,
        stack: stack,
        difficulty,
        deadline: LEVEL_CONFIG.deadline,
        scenario: workspaceScenario?.description ?? LEVEL_CONFIG.scenario,
        hints: levelHints.length > 0 ? levelHints : LEVEL_CONFIG.hints,
        starterFiles: LEVEL_CONFIG.starterFiles,
        // Use tasks from server data
        tasks: tasks,
      }
    : LEVEL_CONFIG;

  // Update timeRemaining when level config changes
  $: if (actualLevelConfig) {
    timeRemaining = actualLevelConfig.deadline || 4 * 60 * 60;
  }

  // ── Panel toggle state ───────────────────────────────────────────────────
  let aiPanelOpen: boolean = false;
  let aiPanelMode: "chat" | "quick" = "chat";
  let isDownloading: boolean = false;

  // ── Back confirmation modal state ────────────────────────────────────────
  let backModalOpen: boolean = false;
  let backModalLoading: boolean = false;

  // ── Test regression modal state ──────────────────────────────────────────
  // Tracks tasks that were "done" but now failed again
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

  // ── Boot loading state ───────────────────────────────────────────────────
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

  // Component refs
  let submitSprintModal: SubmitSprintModal;
  let testCaseComponent: TestCase;
  let editorRef: HTMLDivElement;
  let iframeRef: HTMLIFrameElement;

  // The Docker container ID (from server) — used for all /api/docker/container/{id}/... calls
  $: containerId = data.dockerContainerId ?? "";

  // Derived
  $: projectName = title.split(" ")[0] || "project";

  // ── Helpers ──────────────────────────────────────────────────────────────

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

  // ── Lifecycle ────────────────────────────────────────────────────────────

  onMount(() => {
    // Countdown timer (sync — sets up cleanup return)
    const timer = setInterval(() => {
      timeRemaining = timeRemaining > 0 ? timeRemaining - 1 : 0;
      if (timeRemaining === 0) clearInterval(timer);
    }, 1000);

    // Kick off async initialisation (no return value needed)
    initWorkspace();

    return () => {
      clearInterval(timer);
      terminalSessions.forEach((s) => s.instance?.dispose());
      monacoEditor?.dispose();
    };
  });

  async function initWorkspace() {
    try {
      // Step 0 — start the container
      setBootStep(0);
      const response = await fetch(
        `/api/docker/container/${containerId}/start`,
        {
          method: "POST",
        },
      );
      const startData = await response.json();
      console.log("starting container: ", startData.previewUrl);
      if (!startData.success) throw new Error(startData.error);
      previewUrl = startData.previewUrl;

      // Step 1 — fetch file list
      await advanceBootStep(1);
      try {
        const listRes = await fetch(
          `/api/docker/container/${containerId}/files/list`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          },
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

      // Step 2 — read initial file content
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

      // Step 3 — initialize Monaco Editor
      await advanceBootStep(3);
      if (editorRef) {
        monacoEditor = new MonacoInitializer();
        await monacoEditor.initialize(
          editorRef,
          editorValue,
          () => saveFile(),
          (value) => {
            const prev = fileContents[selectedFile];
            fileContents[selectedFile] = value;
            editorValue = value;
            // Mark tab dirty on any content change
            if (prev !== undefined && value !== prev) {
              markTabDirty(selectedFile, true);
            }
          },
        );
        monacoEditor.setLanguageFromFilename(selectedFile);
      }

      // Open the initial file as the first tab
      openFileAsTab(selectedFile, editorValue);

      // Step 4 — initialize first terminal session
      await advanceBootStep(4);
      await addTerminalSession("Terminal");
      await ensureBootStepIsVisible(4);

      // Done — hide the boot screen
      isBooting = false;
    } catch (error) {
      console.error("Failed to initialize environment:", error);
      bootError = error instanceof Error ? error.message : String(error);
    }
  }

  // ── Reactive statements ──────────────────────────────────────────────────

  // ── Actions ──────────────────────────────────────────────────────────────

  async function saveFile() {
    if (!containerId || !selectedFile) return;

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

  // ── Tab helpers ──────────────────────────────────────────────────────────────────

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
      // Prefer left neighbor, fallback to first remaining tab
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

  // ── Terminal session helpers ──────────────────────────────────────────────

  function handleTerminalElementReady(id: string, el: HTMLDivElement) {
    const cb = pendingTerminalInits.get(id);
    if (cb) cb(el);
  }

  async function addTerminalSession(label?: string): Promise<void> {
    if (terminalSessions.length >= 3) return;
    terminalCounter += 1;
    const id = `term-${terminalCounter}`;
    const sessionLabel = label ?? "Terminal";

    // Register the callback BEFORE updating state so that the `use:mount`
    // action in TerminalPanel always finds the entry in the map, even if
    // Svelte 5 flushes effects synchronously on the state assignment below.
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

      // Trigger the DOM update after the callback is registered.
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
    // Re-fit after the div becomes visible
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

    // Collect tasks that regressed (were done but now failed)
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

      // Task failed - check if it was previously done
      if (task.boardStatus === "done" && !canManuallyMoveToDone) {
        // This is a regression - task was done but now fails
        regressions.push({
          taskId: task.id,
          taskName: task.taskName,
          previousStatus: task.boardStatus,
        });
        // Still update the test status to failed, but keep board status for now
        return {
          ...task,
          testStatus: "failed",
        };
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

    // If there are regressions, show the modal for the first one
    // (or we could batch them - for now, handle one at a time)
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
    // User wants to move the task back to in-review
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
    
    // Remove the handled regression and show next if any
    pendingRegressionUpdates = pendingRegressionUpdates.slice(1);
    setTimeout(() => showNextRegressionModal(), 300);
  }

  function handleRegressionDismiss() {
    // User wants to keep the task in done, but test status stays failed
    // The test status is already updated to failed in handleTestsComplete
    testRegressionModalOpen = false;
    
    // Remove the handled regression and show next if any
    pendingRegressionUpdates = pendingRegressionUpdates.slice(1);
    setTimeout(() => showNextRegressionModal(), 300);
  }

  async function selectFile(
    file: string,
    lineNumber?: number,
    searchTerm?: string,
  ) {
    activeTab = "editor";

    // If already open, just switch to that tab (preserve in-memory content)
    if (openTabs.find((t) => t.id === file)) {
      switchToTab(file);
      if (lineNumber) {
        requestAnimationFrame(() =>
          monacoEditor?.revealLine(lineNumber, searchTerm),
        );
      }
      return;
    }

    // Fetch content and open as new tab
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
    backModalLoading = true;
    await fetch(`/api/docker/container/${containerId}/stop`, {
      method: "POST",
    });
    goto("/dashboard");
  }

  async function handleSubmitSprint() {
    // Open the submit sprint modal - it will handle testing internally
    submitSprintModal.open();
  }

  // ── Download project ─────────────────────────────────────────────────────
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

      // Get filename from content-disposition header
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
      if (typeof nextLevel === "number") {
        // Optimistically move the workspace UI to the next level immediately.
        currentLevel = nextLevel;
      }

      // Reload the page data to get new level tasks by navigating to same URL with invalidate
      await goto(`?reload=${Date.now()}`, {
        invalidateAll: true,
        replaceState: true,
        noScroll: true,
      });
    }
  }

  function refreshPreview() {
    // Fetch live ports from Docker
    fetch(`/api/docker/container/${containerId}/ports`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.previewUrl) {
          // Ensure URL has proper protocol
          let finalUrl = data.previewUrl;
          if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
          }
          previewUrl = finalUrl;
          if (iframeRef) {
            iframeRef.src = finalUrl + "?t=" + Date.now();
          }
        } else {
          // Fallback to existing previewUrl with cache-bust
          if (previewUrl) {
            try {
              const currentUrl = new URL(previewUrl);
              currentUrl.searchParams.set("t", Date.now().toString());
              currentUrl.searchParams.set("t", Date.now().toString());
              previewUrl = currentUrl.toString();
              if (iframeRef) iframeRef.src = previewUrl;
            } catch (error) {
              console.error("Error refreshing preview:", error);
              console.error("Error refreshing preview:", error);
            }
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching ports:", err);
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
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
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
    // Auto-refresh preview when switching to preview tab
    if (tab === "preview") {
      refreshPreview();
    }
  }
  // Create file or folder
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
        // Refresh file list
        const listRes = await fetch(
          `/api/docker/container/${containerId}/files/list`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          },
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

  // Delete file or folder
  async function handleDeleteFile(filePath: string) {
    if (!containerId || !filePath) {
      return;
    }

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
        // Refresh file list
        const listRes = await fetch(
          `/api/docker/container/${containerId}/files/list`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          },
        );
        const listData = await listRes.json();
        if (listData.success) {
          fileTree = listData.files;
          directories = listData.directories || [];
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

  // Rename file or folder
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
        // Refresh file list
        const listRes = await fetch(
          `/api/docker/container/${containerId}/files/list`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          },
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

<!-- ── Boot / Loading screen ──────────────────────────────────────────────── -->
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
    <!-- Left Sidebar (VS Code-style toggle) -->
    <PrimarySidebar
      {fileTree}
      {directories}
      {selectedFile}
      {projectName}
      {containerId}
      {tasks}
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

    <!-- Right: Terminal Manager (shown when on terminal tab) -->
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
    description="Any changes not saved in the sprint will be discarded. You can always come back to this level later."
    confirmLabel="Leave"
    cancelLabel="Stay"
    variant="warning"
    isLoading={backModalLoading}
    loadingLabel="Stopping…"
    on:confirm={confirmBack}
    on:cancel={() => {
      backModalOpen = false;
    }}
  />

  <!-- Test Regression modal - shown when a previously passed test fails again -->
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

  <!-- Floating AI Help (always visible, bottom-right) -->
  <AiHelp
    containerId={page.params.containerId}
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

<!-- ── Onboarding (shown once the boot screen has cleared, only when opted in) ── -->
{#if !isBooting && page.url.searchParams.get("onboarding") === "1"}
  <OnboardingController
    {stack}
    {title}
    scenario={actualLevelConfig.scenario}
    {level}
    onSwitchTab={(tab) =>
      handleTabChange(tab as "editor" | "terminal" | "preview" | "board")}
  />
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
  }

  /* Search result highlight in Monaco editor */
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
