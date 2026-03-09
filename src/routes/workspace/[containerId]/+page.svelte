<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { MonacoInitializer } from "$client/MonacoInitializer";
  import { TerminalInitializer } from "$client/TerminalInitializer";

  // Components
  import PrimarySidebar from "$lib/components/devSidebar/PrimarySidebar.svelte";
  import WorkspaceHeader from "$lib/components/workspace/WorkspaceHeader.svelte";
  import WorkspaceTabs from "$lib/components/workspace/WorkspaceTabs.svelte";
  import EditorPanel from "$lib/components/workspace/EditorPanel.svelte";
  import TerminalPanel from "$lib/components/workspace/TerminalPanel.svelte";
  import PreviewPanel from "$lib/components/workspace/PreviewPanel.svelte";
  import SubmitSprintModal from "$lib/components/workspace/SubmitSprintModal.svelte";
  import WorkspaceBootScreen from "$lib/components/workspace/WorkspaceBootScreen.svelte";
  import TerminalManagerPanel from "$lib/components/workspace/TerminalManagerPanel.svelte";
  import AiHintsPanel from "$lib/components/workspace/AiHintsPanel.svelte";

  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import type { Task } from "$lib/interface/LevelConfig";
  import { LEVEL_CONFIG } from "$lib/mockdata/mocklevel";
  import type { FileListResponse } from "$lib/interface/Files";
  import type { FileTab } from "$lib/components/workspace/FileTabBar.svelte";
  import { toast } from "$lib/stores/toast";

  import type { Session } from "@auth/core/types";
  //   dockerContainerId — the real Docker container ID (for Docker API calls)
  //   page.params.containerId — the Prisma DB id (for submit/archive API calls)
  //   userId — the user's ID for AI hints
  //   userCoins — the user's coin balance for AI hints
  export let data: {
    user: Session["user"];
    dockerContainerId: string | null;
    userId: string;
    userCoins: number;
    scenarioTitle: string | null;
    stacks: string[];
    level: number;
  };

  // Get user data from page data
  $: userId = data.userId || "";
  $: userCoins = data.userCoins || 0;

  // Dynamic header values from DB (fall back to LEVEL_CONFIG for dev/mock)
  $: title = data.scenarioTitle || LEVEL_CONFIG.title;
  $: stack = data.stacks?.join(" · ") || LEVEL_CONFIG.stack;
  $: level = data.level ?? LEVEL_CONFIG.level;

  // State
  let activeTab: "editor" | "terminal" | "preview" = "editor";
  let selectedFile: string = "app/page.tsx";
  let fileContents: Record<string, string> = {};

  // ── Multi-tab state ──────────────────────────────────────────────────────
  let openTabs: FileTab[] = [];
  let activeTabId: string = "";
  let tasks: Task[] = LEVEL_CONFIG.tasks;
  let timeRemaining: number = LEVEL_CONFIG.deadline;
  let isRunning: boolean = false;
  let monacoEditor: MonacoInitializer | null = null;
  let previewUrl: string = "";
  let editorValue: string = "";
  let fileTree: string[] = [];
  let directories: string[] = [];

  // ── Multi-terminal state ─────────────────────────────────────────────────
  interface TermSession { id: string; label: string; instance: TerminalInitializer | null; }
  let terminalSessions: TermSession[] = [];
  let activeTerminalId: string = "";
  let terminalCounter = 0;
  const pendingTerminalInits = new Map<string, (el: HTMLDivElement) => void>();
  $: activeTerminalSession = terminalSessions.find((s) => s.id === activeTerminalId) ?? null;

  // ── Panel toggle state ───────────────────────────────────────────────────
  let aiPanelOpen: boolean = false;

  // ── Back confirmation modal state ────────────────────────────────────────
  let backModalOpen: boolean = false;
  let backModalLoading: boolean = false;

  function toggleAiPanel() { aiPanelOpen = !aiPanelOpen; }

  // ── Boot loading state ───────────────────────────────────────────────────
  let isBooting = true;
  let bootStep = 0;
  let bootError = "";

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
    initWorkspace();
  }

  // Component refs
  let submitSprintModal: SubmitSprintModal;
  let editorRef: HTMLDivElement;
  let iframeRef: HTMLIFrameElement;

  // The Docker container ID (from server) — used for all /api/docker/container/{id}/... calls
  $: containerId = data.dockerContainerId ?? "";

  // Derived
  $: projectName = LEVEL_CONFIG.title.split(" ")[0] || "project";

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
      bootStep = 0;
      const response = await fetch(
        `/api/docker/container/${containerId}/start`,
        {
          method: "POST",
        },
      );
      const startData = await response.json();
      if (!startData.success) throw new Error(startData.error);
      previewUrl = startData.previewUrl;

      // Step 1 — fetch file list
      bootStep = 1;
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
      bootStep = 2;
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
      bootStep = 3;
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
      bootStep = 4;
      await addTerminalSession("Terminal");

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
      t.id === fileId ? { ...t, isDirty: dirty } : t
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
    terminalSessions = [...terminalSessions, { id, label: sessionLabel, instance: null }];
    activeTerminalId = id;
    activeTab = "terminal";

    return new Promise<void>((resolve) => {
      pendingTerminalInits.set(id, async (el: HTMLDivElement) => {
        try {
          const inst = new TerminalInitializer();
          await inst.initializeDockerTerminal(el, containerId);
          terminalSessions = terminalSessions.map((s) =>
            s.id === id ? { ...s, instance: inst } : s
          );
        } catch (err) {
          console.error("Terminal init error:", err);
        }
        pendingTerminalInits.delete(id);
        resolve();
      });
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

  function toggleTask(taskId: number) {
    tasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );
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
        requestAnimationFrame(() => monacoEditor?.revealLine(lineNumber, searchTerm));
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
    await fetch(`/api/docker/container/${containerId}/stop`, { method: "POST" });
    goto("/dashboard");
  }

  function handleSubmitSprint() {
    submitSprintModal.open();
  }

  function refreshPreview() {
    // Fetch live ports from Docker
    fetch(`/api/docker/container/${containerId}/ports`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.previewUrl) {
          previewUrl = data.previewUrl;
          if (iframeRef) {
            iframeRef.src = previewUrl + '?t=' + Date.now();
          }
        } else {
          // Fallback to existing previewUrl with cache-bust
          if (previewUrl) {
            try {
              const currentUrl = new URL(previewUrl);
              currentUrl.searchParams.set('t', Date.now().toString());
              previewUrl = currentUrl.toString();
              if (iframeRef) iframeRef.src = previewUrl;
            } catch (error) {
              console.error('Error refreshing preview:', error);
            }
          }
        }
      })
      .catch(err => {
        console.error('Error fetching ports:', err);
        if (previewUrl) {
          try {
            const currentUrl = new URL(previewUrl);
            currentUrl.searchParams.set('t', Date.now().toString());
            previewUrl = currentUrl.toString();
            if (iframeRef) iframeRef.src = previewUrl;
          } catch (error) {
            console.error('Error refreshing preview:', error);
          }
        }
      });
  }

  function handleTabChange(tab: "editor" | "terminal" | "preview") {
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
        toast.success(`${isDirectory ? 'Folder' : 'File'} created`);
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
      toast.error(`Failed to create ${isDirectory ? 'folder' : 'file'}`);
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
  <title>Level {LEVEL_CONFIG.level}: {LEVEL_CONFIG.title} - DevSim</title>
</svelte:head>

<!-- ── Boot / Loading screen ──────────────────────────────────────────────── -->
{#if isBooting}
  <WorkspaceBootScreen
    step={bootStep}
    steps={BOOT_STEPS}
    error={bootError}
    levelLabel="Level {LEVEL_CONFIG.level} · {LEVEL_CONFIG.title}"
    on:retry={handleBootRetry}
  />
{/if}

<div
  class="h-screen flex flex-col bg-[#0a0e1a] text-[#d0d7dd]"
  class:invisible={isBooting}
>
  <!-- Header -->
  <WorkspaceHeader
    level={level}
    title={title}
    stack={stack}
    difficulty={LEVEL_CONFIG.difficulty}
    {timeRemaining}
    {isRunning}
    {aiPanelOpen}
    onBack={handleBack}
    onRun={runDevServer}
    onStop={stopDevServer}
    onSubmit={handleSubmitSprint}
    onToggleAi={toggleAiPanel}
  />

  <div class="flex flex-1 overflow-hidden">
    <!-- Left Sidebar (VS Code-style toggle) -->
    <PrimarySidebar
      {fileTree}
      {directories}
      {selectedFile}
      {projectName}
      {containerId}
      scenario={LEVEL_CONFIG.scenario}
      {tasks}
      {userId}
      {userCoins}
      {fileContents}
      onSelectFile={selectFile}
      onToggleTask={toggleTask}
      onCreateFile={handleCreateFile}
      onDeleteFile={handleDeleteFile}
      onRenameFile={handleRenameFile}
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Tab Bar -->
      <WorkspaceTabs {activeTab} onTabChange={handleTabChange} />

      <!-- Content Area -->
      <div class="flex-1 relative overflow-hidden">
        <EditorPanel
          visible={activeTab === "editor"}
          openTabs={openTabs}
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
        />

        <PreviewPanel
          visible={activeTab === "preview"}
          {previewUrl}
          onRefresh={refreshPreview}
          bind:iframeRef
        />
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

    <!-- Right AI Hints Panel (toggleable) -->
    {#if aiPanelOpen}
      <AiHintsPanel hints={LEVEL_CONFIG.hints} onClose={toggleAiPanel} />
    {/if}
  </div>

  <!-- Submit Sprint modal -->
  <SubmitSprintModal
    bind:this={submitSprintModal}
    dbContainerId={page.params.containerId}
    {tasks}
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
    on:cancel={() => { backModalOpen = false; }}
  />
</div>

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
