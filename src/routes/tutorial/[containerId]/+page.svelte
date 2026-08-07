<script lang="ts">
  import { onMount } from "svelte";
  import { startPresenceHeartbeat } from "$lib/client/presenceHeartbeat";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { MonacoInitializer } from "$client/MonacoInitializer";
  import { TerminalInitializer } from "$client/TerminalInitializer";

  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import WorkspaceSetupOverlay from "$lib/components/ui/WorkspaceSetupOverlay.svelte";
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
  import { getTutorialWorkspaceData as getPernTutorialData } from "$lib/components/tutorial/PERN/PERNTutorialData";
  import { NESTJS_POSTGRES_PRISMA_TUTORIAL_DATA } from "$lib/components/tutorial/NESTJS_POSTGRES_PRISMA/NestjsPostgresPrismaTutorialData";
  import { NEXTJS_SHADCN_TUTORIAL_DATA } from "$lib/components/tutorial/NEXTJS_SHADCN/NextjsShadcnTutorialData";
  import { getTutorialWorkspaceData as getMernTutorialData } from "$lib/components/tutorial/MERN/MERNTutorialData";
  import { getTutorialWorkspaceData as getNextjsPostgresPrismaTutorialData } from "$lib/components/tutorial/NEXTJS_POSTGRES_PRISMA/NextjsPostgresPrismaTutorialData";

  import { toast } from "$lib/stores/toast";
  import type { FileListResponse } from "$lib/interface/Files";
  import type { FileTab } from "$lib/components/workspace/FileTabBar.svelte";
  import type { ITask } from "$lib/types";
  import type { TestableTask, TestRunResult } from "$lib/types/test";
  import type { PageData } from "./$types";

  export let data: PageData;

  const tutorialLaunchContext = {
    stackName:
      page.url.searchParams.get("stackName") ||
      data.container?.stackName ||
      "",
    scenarioId: page.url.searchParams.get("scenarioId"),
    projectFolder: page.url.searchParams.get("projectFolder"),
    scenarioTitle: page.url.searchParams.get("scenarioTitle"),
    selectionRaw: page.url.searchParams.get("selection"),
    tutorialRequired: page.url.searchParams.get("tutorialRequired") === "1",
  };

  const stack =
    data.container?.stackName?.split('-').join(' + ') || "PERN";
  const normalizedTutorialStack = stack.toLowerCase();
  const tutorialData = normalizedTutorialStack.includes("nest")
    ? NESTJS_POSTGRES_PRISMA_TUTORIAL_DATA
    : normalizedTutorialStack.includes("shadcn")
      ? NEXTJS_SHADCN_TUTORIAL_DATA
      : /mern|mongo|react-express-mongodb/.test(normalizedTutorialStack)
        ? getMernTutorialData(stack)
        : /nextjs.*postgres.*prisma/.test(normalizedTutorialStack)
          ? getNextjsPostgresPrismaTutorialData(stack)
          : getPernTutorialData(stack);
  const title = tutorialData.scenarioTitle;
  const scenario = tutorialData.scenarioDescription;
  const tutorialStackType: "pern" | "nestjs" | "shadcn" | "mern" | "nextjs-postgres-prisma" | "none" =
    normalizedTutorialStack.includes("nest")
      ? "nestjs"
      : normalizedTutorialStack.includes("shadcn")
        ? "shadcn"
        : /mern|mongo|react-express-mongodb/.test(normalizedTutorialStack)
          ? "mern"
          : /nextjs.*postgres.*prisma/.test(normalizedTutorialStack)
            ? "nextjs-postgres-prisma"
            : /pern|react|express|postgres|prisma/.test(normalizedTutorialStack)
              ? "pern"
              : "none";

  let activeTab: "editor" | "terminal" | "preview" | "board" = "editor";
  let isDownloading = false;
  let isBooting = true;
  let bootStep = 0;
  let bootError = "";
  let tutorialCleanupLoading = false;
  let backModalOpen = false;
  let backModalLoading = false;

  let selectedFile = "README.md";
  let fileTree: string[] = [];
  let directories: string[] = [];
  let fileContents: Record<string, string> = {};
  let openTabs: FileTab[] = [];
  let activeTabId = "";
  let editorValue = "";
  let previewUrl = "";
  let monacoEditor: MonacoInitializer | null = null;

  interface TermSession {
    id: string;
    label: string;
    instance: TerminalInitializer | null;
  }

  let terminalSessions: TermSession[] = [];
  let activeTerminalId = "";
  let terminalCounter = 0;
  const pendingTerminalInits = new Map<string, (el: HTMLDivElement) => void>();
  $: activeTerminalSession = terminalSessions.find((s) => s.id === activeTerminalId) ?? null;

  let submitSprintModal: SubmitSprintModal;
  let testCaseComponent: TestCase;
  let editorRef: HTMLDivElement;
  let iframeRef: HTMLIFrameElement;

  const dbContainerId = data.container.id;
  const dockerContainerId = data.container.containerId;
  const projectName = "tutorial-workspace";
  const tutorialLevel = 1;
  const tutorialDifficulty = "Tutorial";
  let aiPanelMode: "chat" | "quick" = "chat";
  // Docked AI Helper (SAZ) panel, toggled from the workspace tab bar.
  let showAiHelper: boolean = false;

  type BoardTaskStatus = "backlog" | "in-progress" | "in-review" | "done";
  type WorkspaceTask = TestableTask & { boardStatus?: BoardTaskStatus };

  let tasks: WorkspaceTask[] = tutorialData.tasks.map((task) => ({
    ...task,
    testStatus: "pending",
    boardStatus: task.isCompleted ? "done" : "backlog",
    hasClientTest: task.testType === "client" || task.testType === "both",
    hasServerTest: task.testType === "server" || task.testType === "both",
  }));

  const BOOT_STEPS = [
    { icon: "🐳", label: "Booting tutorial container…", detail: "Preparing isolated runtime" },
    { icon: "📂", label: "Loading project files…", detail: "Reading tutorial workspace tree" },
    { icon: "⚡", label: "Starting editor & terminal…", detail: "Connecting interactive tools" },
  ];

  function parseSelection() {
    const raw = tutorialLaunchContext.selectionRaw;
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      return {
        frontend: parsed?.frontend ?? null,
        backend: parsed?.backend ?? null,
        database: parsed?.database ?? null,
        services: parsed?.services ?? null,
      };
    } catch {
      return null;
    }
  }

  let previewPollInterval: ReturnType<typeof setInterval> | null = null;

  function stopPreviewPoll() {
    if (previewPollInterval !== null) {
      clearInterval(previewPollInterval);
      previewPollInterval = null;
    }
  }

  function startPreviewPoll() {
    stopPreviewPoll();
    let attempts = 0;
    previewPollInterval = setInterval(() => {
      if (previewUrl || ++attempts >= 10) {
        stopPreviewPoll();
        return;
      }
      refreshPreview();
    }, 3000);
  }

  function handleTabChange(tab: "editor" | "terminal" | "preview" | "board") {
    activeTab = tab;
    if (tab === "preview") {
      refreshPreview();
      if (!previewUrl) startPreviewPoll();
    } else {
      stopPreviewPoll();
    }
  }

  function markTabDirty(fileId: string, dirty: boolean) {
    openTabs = openTabs.map((t) => (t.id === fileId ? { ...t, isDirty: dirty } : t));
  }

  function openFileAsTab(file: string, content: string) {
    const filename = file.split("/").pop() ?? file;
    if (!openTabs.find((t) => t.id === file)) {
      openTabs = [...openTabs, { id: file, filename, isDirty: false }];
    }
    activeTabId = file;
    selectedFile = file;
    fileContents[file] = content;
  }

  function switchToTab(fileId: string) {
    activeTabId = fileId;
    selectedFile = fileId;
    monacoEditor?.setValue(fileContents[fileId] ?? "");
    monacoEditor?.setLanguageFromFilename(fileId);
  }

  function closeTab(fileId: string) {
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

  async function addTerminalSession(label?: string): Promise<void> {
    if (terminalSessions.length >= 3) return;

    terminalCounter += 1;
    const id = `term-${terminalCounter}`;
    const sessionLabel = label ?? "Terminal";

    return new Promise<void>((resolve) => {
      pendingTerminalInits.set(id, async (el: HTMLDivElement) => {
        try {
          const inst = new TerminalInitializer();
          await inst.initializeDockerTerminal(el, dockerContainerId, id);
          terminalSessions = terminalSessions.map((s) => (s.id === id ? { ...s, instance: inst } : s));
        } catch (err) {
          console.error("Terminal init error:", err);
        }

        pendingTerminalInits.delete(id);
        resolve();
      });

      terminalSessions = [...terminalSessions, { id, label: sessionLabel, instance: null }];
      activeTerminalId = id;
      activeTab = "terminal";
    });
  }

  function handleTerminalElementReady(id: string, el: HTMLDivElement) {
    const cb = pendingTerminalInits.get(id);
    if (cb) cb(el);
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

  async function refreshFiles() {
    try {
      const listRes = await fetch(`/api/docker/container/${dockerContainerId}/files/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const listData = (await listRes.json()) as FileListResponse;

      if (listData.success) {
        fileTree = listData.files;
        directories = listData.directories || [];
      }
    } catch (error) {
      console.error("Error refreshing tutorial files:", error);
      toast.error("Failed to refresh tutorial files.");
    }
  }

  async function selectFile(file: string, lineNumber?: number, searchTerm?: string) {
    activeTab = "editor";

    if (openTabs.find((t) => t.id === file)) {
      switchToTab(file);
      if (lineNumber) {
        requestAnimationFrame(() => monacoEditor?.revealLine(lineNumber, searchTerm));
      }
      if (browser) {
        window.dispatchEvent(
          new CustomEvent("devsim-tutorial-file-opened", {
            detail: { file, lineNumber, searchTerm },
          }),
        );
      }
      return;
    }

    try {
      const res = await fetch(`/api/docker/container/${dockerContainerId}/files/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: `/workspace/${file}` }),
      });
      const result = await res.json();

      if (result.success) {
        openFileAsTab(file, result.content);
        editorValue = result.content;
        monacoEditor?.setValue(result.content);
        monacoEditor?.setLanguageFromFilename(file);
        if (lineNumber) {
          requestAnimationFrame(() => monacoEditor?.revealLine(lineNumber, searchTerm));
        }

        if (browser) {
          window.dispatchEvent(
            new CustomEvent("devsim-tutorial-file-opened", {
              detail: { file, lineNumber, searchTerm },
            }),
          );
        }
      }
    } catch (error) {
      console.error("Error reading tutorial file:", error);
    }
  }

  async function saveFile() {
    if (!selectedFile) return;

    const content = fileContents[selectedFile] ?? editorValue;
    try {
      const response = await fetch(`/api/docker/container/${dockerContainerId}/files/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: `/workspace/${selectedFile}`,
          content,
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("File saved");
        markTabDirty(selectedFile, false);
        if (browser) {
          window.dispatchEvent(
            new CustomEvent("devsim-tutorial-file-saved", {
              detail: { file: selectedFile },
            }),
          );
        }
      }
    } catch (error) {
      console.error("Error saving tutorial file:", error);
      toast.error("Failed to save file");
    }
  }

  function refreshPreview() {
    if (!dockerContainerId?.trim()) return;

    fetch(`/api/docker/container/${dockerContainerId}/ports`)
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

  function handleDownload() {
    toast.info("Download is disabled in tutorial mode.");
  }

  function handleTaskStatusChange(taskId: string, status: BoardTaskStatus) {
    tasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            boardStatus: status,
            isCompleted: status === "done",
            testStatus: status === "done" ? "passed" : "pending",
          }
        : task,
    );
  }

  async function initTutorialWorkspace() {
    try {
      isBooting = true;
      bootStep = 0;

      const startRes = await fetch(`/api/docker/container/${dockerContainerId}/start`, { method: "POST" });
      const startPayload = await startRes.json();

      if (!startPayload.success) {
        throw new Error(startPayload.error || "Unable to start tutorial container.");
      }

      previewUrl = startPayload.previewUrl;
      bootStep = 1;

      await refreshFiles();
      const initialFile = fileTree[0] || selectedFile;
      selectedFile = initialFile;

      const readRes = await fetch(`/api/docker/container/${dockerContainerId}/files/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: `/workspace/${initialFile}` }),
      });
      const readPayload = await readRes.json();
      if (readPayload.success) {
        editorValue = readPayload.content;
        openFileAsTab(initialFile, readPayload.content);
      }

      bootStep = 2;

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
            if (prev !== undefined && value !== prev) {
              markTabDirty(selectedFile, true);
            }
          },
        );
        monacoEditor.setLanguageFromFilename(selectedFile);
      }

      await addTerminalSession("Tutorial Terminal");

      isBooting = false;
    } catch (error) {
      console.error("Failed to initialize tutorial workspace:", error);
      const message = error instanceof Error ? error.message : String(error);
      const missingContainer = /no such container/i.test(message);

      if (missingContainer) {
        toast.error("This tutorial container no longer exists. Please relaunch the tutorial from scenario selection.");
        await goto("/scenario");
        return;
      }

      bootError = message;
      isBooting = true;
    }
  }

  function handleBootRetry() {
    bootError = "";
    initTutorialWorkspace();
  }

  function handleBack() {
    backModalOpen = true;
  }

  async function confirmBack() {
    if (backModalLoading) return;

    backModalLoading = true;
    await fetch(`/api/docker/container/${dockerContainerId}/stop`, { method: "POST" });
    goto("/scenario");
  }

  async function handleTutorialCompleted() {
    if (tutorialCleanupLoading) return;

    tutorialCleanupLoading = true;

    try {
      const cleanupRes = await fetch(`/api/docker/container/${data.container.id}/destroy`, {
        method: "DELETE",
      });

      const cleanupPayload = await cleanupRes.json().catch(() => null);
      if (!cleanupRes.ok || !cleanupPayload?.success) {
        toast.error(
          cleanupPayload?.error ||
            "Tutorial finished, but we could not clean up the tutorial container. Please retry.",
        );
        if (browser) window.dispatchEvent(new CustomEvent("devsim-tutorial-proceed-failed"));
        return;
      }

      await proceedToWorkspace();
    } catch (error) {
      console.error("Tutorial cleanup failed:", error);
      toast.error("Tutorial cleanup failed. Please try again.");
      if (browser) window.dispatchEvent(new CustomEvent("devsim-tutorial-proceed-failed"));
    } finally {
      tutorialCleanupLoading = false;
    }
  }

  async function proceedToWorkspace() {
    const selection = parseSelection();

    if (!tutorialLaunchContext.stackName || !selection) {
      toast.error("Missing stack context. Return to scenarios and launch again.");
      if (browser) window.dispatchEvent(new CustomEvent("devsim-tutorial-proceed-failed"));
      return;
    }

    try {
      const createRes = await fetch("/api/docker/container/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stackName: tutorialLaunchContext.stackName,
          level: 1,
          mode: "workspace",
          stacks: selection,
          scenarioId: tutorialLaunchContext.scenarioId ?? undefined,
          projectFolder: tutorialLaunchContext.projectFolder ?? undefined,
          scenarioTitle: tutorialLaunchContext.scenarioTitle ?? undefined,
        }),
      });

      const createPayload = await createRes.json();
      if (!createPayload.success || !createPayload.dbContainerId) {
        toast.error(createPayload.error || "Could not create workspace container.");
        if (browser) window.dispatchEvent(new CustomEvent("devsim-tutorial-proceed-failed"));
        return;
      }

      try {
        localStorage.setItem(`tutorial-prompt:v1:${data.userId}:${tutorialLaunchContext.stackName}`, "1");
      } catch {
        // Ignore localStorage failures.
      }

      toast.success("Opening your real workspace...");
      await goto(`/workspace/${createPayload.dbContainerId}?fromTutorial=1`);
    } catch (error) {
      console.error("Failed to create workspace after tutorial:", error);
      toast.error("Workspace creation failed. Please try again.");
      if (browser) window.dispatchEvent(new CustomEvent("devsim-tutorial-proceed-failed"));
    }
  }

  function handleTestsComplete(event: CustomEvent<{ success: boolean; result: TestRunResult }>) {
    const { success, result } = event.detail;

    if (result?.taskResults) {
      const byTaskId = new Map(result.taskResults.map((r) => [r.taskId, r]));
      tasks = tasks.map((task, idx) => {
        const directResult = byTaskId.get(task.id);
        const fallbackResult = byTaskId.get(String(task.order ?? idx + 1));
        const taskResult = directResult ?? fallbackResult;
        if (!taskResult) return task;
        if (taskResult.passed) {
          return { ...task, boardStatus: "done", isCompleted: true, testStatus: "passed" };
        }
        return {
          ...task,
          boardStatus: task.boardStatus === "done" ? "in-review" : (task.boardStatus ?? "in-review"),
          isCompleted: false,
          testStatus: "failed",
        };
      });
    }

    if (success) {
      toast.success("Tutorial tests passed.");
    } else {
      toast.warn("Some tutorial tests failed. Continue following the guide.");
    }
    if (browser) {
      window.dispatchEvent(new CustomEvent("devsim-tests-complete", { detail: event.detail }));
    }
  }

  function handleTestResultModalClosed() {
    // No-op hook for parity with workspace test flow.
  }

  function runTests() {
    testCaseComponent?.openTestModal();
  }

  function submitSprint() {
    submitSprintModal?.open();
  }

  function handleSubmitted() {
    if (browser) {
      window.dispatchEvent(new CustomEvent("devsim-sprint-submitted"));
    }
  }

  function handleCreateFile() {
    toast.info("File creation is disabled for guided tutorial mode.");
  }

  function handleDeleteFile() {
    toast.info("File deletion is disabled for guided tutorial mode.");
  }

  function handleRenameFile() {
    toast.info("File rename is disabled for guided tutorial mode.");
  }

  function handleTourOpenFile(event: Event) {
    const customEvent = event as CustomEvent<{ file?: string; lineNumber?: number; searchTerm?: string }>;
    const file = customEvent.detail?.file;
    if (!file) return;
    void selectFile(file, customEvent.detail?.lineNumber, customEvent.detail?.searchTerm);
  }

  onMount(() => {
    const stopHeartbeat = startPresenceHeartbeat();
    initTutorialWorkspace();
    window.addEventListener("devsim-tour-open-file", handleTourOpenFile as EventListener);

    function handleCloseResultModal() {
      testCaseComponent?.closeResults();
    }
    window.addEventListener("devsim-tour-close-result-modal", handleCloseResultModal);

    return () => {
      stopHeartbeat();
      stopPreviewPoll();
      window.removeEventListener("devsim-tour-open-file", handleTourOpenFile as EventListener);
      window.removeEventListener("devsim-tour-close-result-modal", handleCloseResultModal);
      terminalSessions.forEach((s) => s.instance?.dispose());
      monacoEditor?.dispose();
    };
  });
</script>

<svelte:head>
  <title>Tutorial: {title} - DevSim</title>
</svelte:head>

{#if isBooting}
  <WorkspaceBootScreen
    step={bootStep}
    steps={BOOT_STEPS}
    error={bootError}
    levelLabel="Tutorial · {title}"
    on:retry={handleBootRetry}
  />
{/if}

<div class="h-screen flex flex-col bg-[#0a0e1a] text-[#d0d7dd]" class:invisible={isBooting}>
  <WorkspaceHeader
    data={{
      level: tutorialLevel,
      title,
      stack,
      difficulty: tutorialDifficulty,
      isDownloading,
      onBack: handleBack,
      onSubmit: submitSprint,
      onDownload: handleDownload,
    }}
  >
    <svelte:fragment slot="test-button">
      <TestCase
        bind:this={testCaseComponent}
        containerId={dockerContainerId}
        level={tutorialLevel}
        tasks={tasks as TestableTask[]}
        disabled={isBooting}
        on:testsComplete={handleTestsComplete}
        on:resultModalClosed={handleTestResultModalClosed}
      />
    </svelte:fragment>
  </WorkspaceHeader>

  <div class="flex flex-1 overflow-hidden">
    <PrimarySidebar
      {fileTree}
      {directories}
      {selectedFile}
      {projectName}
      containerId={dockerContainerId}
      {tasks}
      currentLevel={tutorialLevel}
      levelTitle={title}
      onSelectFile={selectFile}
      onCreateFile={handleCreateFile}
      onDeleteFile={handleDeleteFile}
      onRenameFile={handleRenameFile}
      onRefreshFiles={refreshFiles}
    />

    <div class="flex-1 flex flex-col min-w-0" data-tour="editor-workspace">
      <div data-tour="workspace-tabs">
        <WorkspaceTabs
          {activeTab}
          onTabChange={handleTabChange}
          aiHelperActive={showAiHelper}
          onToggleAiHelper={() => (showAiHelper = !showAiHelper)}
        />
      </div>

      <div class="flex-1 relative overflow-hidden">
        <EditorPanel
          visible={activeTab === "editor"}
          {openTabs}
          {activeTabId}
          isReadOnly={false}
          readOnlyMessage="Tutorial mode"
          onFileTabClick={switchToTab}
          onFileTabClose={closeTab}
          onSave={saveFile}
          bind:editorRef
        />

        <div data-tour="terminal-panel" class="absolute inset-0" class:hidden={activeTab !== "terminal"}>
          <TerminalPanel
            visible={activeTab === "terminal"}
            sessions={terminalSessions}
            {activeTerminalId}
            onElementReady={handleTerminalElementReady}
            onRefresh={refreshTerminal}
          />
        </div>

        <PreviewPanel
          visible={activeTab === "preview"}
          {previewUrl}
          onRefresh={refreshPreview}
          bind:iframeRef
        />

        {#if activeTab === "board"}
          <div class="absolute inset-0 overflow-hidden">
            <BoardPanel scenario={scenario} {tasks} onTaskStatusChange={handleTaskStatusChange} />
          </div>
        {/if}
      </div>
    </div>

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
      containerId={dockerContainerId}
      userId={data.userId}
      scenario={scenario}
      {tasks}
      initialFileTree={fileTree}
      initialFileContents={fileContents}
      {projectName}
      level={tutorialLevel}
      initialCoins={data.userCoins}
      initialAiHelps={data.userAiHelps}
      bind:mode={aiPanelMode}
    />
  </div>

  <SubmitSprintModal
    bind:this={submitSprintModal}
    {dbContainerId}
    containerId={dockerContainerId}
    {tasks}
    level={tutorialLevel}
    levelXpReward={0}
    levelCoinReward={0}
    {fileContents}
    existingFiles={fileTree}
    tutorialMode={true}
    on:submitted={handleSubmitted}
  />

  <OnboardingController
    stack={stack}
    {title}
    {scenario}
    level={1}
    stackTutorialType={tutorialStackType}
    allowSkip={!tutorialLaunchContext.tutorialRequired}
    onSwitchTab={(tab) => {
      handleTabChange(tab as "editor" | "terminal" | "preview" | "board");
    }}
    onRunTests={runTests}
    onSubmitSprint={submitSprint}
    onComplete={handleTutorialCompleted}
  />

  <ConfirmationModal
    bind:open={backModalOpen}
    icon="🚪"
    iconVariant="warning"
    title="Leave Tutorial?"
    subtitle="Your tutorial session will be closed."
    description="You can launch the tutorial again from the scenario page."
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
  </div>

<WorkspaceSetupOverlay visible={tutorialCleanupLoading} />


<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, sans-serif;
  }

</style>
