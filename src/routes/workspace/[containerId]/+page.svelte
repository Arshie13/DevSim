<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { MonacoInitializer } from "$client/MonacoInitializer";
  import { TerminalInitializer } from "$client/TerminalInitializer";

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
  import AiHelp from "$lib/components/devSidebar/AiHelp.svelte";

  import type { IHints, ITask } from "$lib/types";
  import { LEVEL_CONFIG } from "$lib/mockdata/mocklevel";
  import { getLevelConfig, hasTestsForLevel } from "$lib/tests/levels";
  import type { FileListResponse } from "$lib/interface/Files";

  import { toast } from "$lib/stores/toast";
  import type { UserData, IContainer } from "$lib/types"

  interface WorkspaceProps {
    user: UserData;
    userId: string;
    userCoins: number;
    dockerContainerId: string;
    level: number;
    completedTasks: string[];
    container: IContainer;
    hints: IHints[];
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

  // State
  let activeTab: "editor" | "terminal" | "preview" = "editor";
  let selectedFile: string = "app/page.tsx";
  let fileContents: Record<string, string> = {};
  let tasks: ITask[] = []; // Will be populated from server data
  let timeRemaining: number = 4 * 60 * 60; // Default to 4 hours
  let isRunning: boolean = false;
  let terminal: TerminalInitializer | null = null;
  let monacoEditor: MonacoInitializer | null = null;
  let previewUrl: string = "";
  let editorValue: string = "";
  let fileTree: string[] = [];
  let directories: string[] = [];

  // Initialize tasks from server data
  $: {
    const levelTasks = data.container.scenario.levels[data.level].tasks || [];
    tasks = levelTasks;
  }

  // Get level-specific config from server data
  $: currentLevel = data.level || 1;
  $: levelHints = data.hints || [];
  $: levelTestConfig = getLevelConfig(currentLevel);
  
  // Merge test config with mockdata for UI fields (test config has tasks, mockdata has UI fields)
  $: actualLevelConfig = levelTestConfig ? {
    ...LEVEL_CONFIG,
    ...levelTestConfig,
    level: currentLevel,
    // Keep UI fields from LEVEL_CONFIG
    stack: LEVEL_CONFIG.stack,
    difficulty: LEVEL_CONFIG.difficulty,
    deadline: LEVEL_CONFIG.deadline,
    scenario: data.container.scenario.description,
    hints: levelHints.length > 0 ? levelHints : LEVEL_CONFIG.hints,
    starterFiles: LEVEL_CONFIG.starterFiles,
    // Use tasks from server data
    tasks: tasks
  } : LEVEL_CONFIG;

  // Update timeRemaining when level config changes
  $: if (actualLevelConfig) {
    timeRemaining = actualLevelConfig.deadline || (4 * 60 * 60);
  }

  // ── Panel toggle state ───────────────────────────────────────────────────
  let aiPanelOpen: boolean = false;
  let isDownloading: boolean = false;

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
  let terminalRef: HTMLDivElement;
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
      terminal?.dispose();
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
            fileContents[selectedFile] = value;
            editorValue = value;
          },
        );
        monacoEditor.setLanguageFromFilename(selectedFile);
      }

      // Step 4 — initialize Terminal
      bootStep = 4;
      terminal = new TerminalInitializer();
      await terminal.initializeDockerTerminal(terminalRef, containerId);

      // Done — hide the boot screen
      isBooting = false;
    } catch (error) {
      console.error("Failed to initialize environment:", error);
      bootError = error instanceof Error ? error.message : String(error);
    }
  }

  // ── Reactive statements ──────────────────────────────────────────────────

  // Sync editor content when switching files
  $: if (
    monacoEditor &&
    selectedFile &&
    fileContents[selectedFile] !== undefined
  ) {
    monacoEditor.setValue(fileContents[selectedFile]);
  }

  // Lazy-init terminal when tab is first shown
  $: if (activeTab === "terminal" && !terminal && containerId && terminalRef) {
    terminal = new TerminalInitializer();
    terminal.initializeDockerTerminal(terminalRef, containerId);
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  async function saveFile() {
    if (!containerId || !selectedFile) return;

    const content = fileContents[selectedFile] || [editorValue];
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
      if (result.success) toast.success("File saved");
    } catch (error) {
      console.error("Error saving file:", error);
      toast.error("Failed to save file");
    }
  }

  function runDevServer() {
    if (!containerId || isRunning) return;
    isRunning = true;
    activeTab = "terminal";
    terminal?.write("npm install && npm run dev\r");
  }

  function stopDevServer() {
    terminal?.write("\x03");
    isRunning = false;
  }

  function toggleTask(taskId: string) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !containerId) return;

    const taskText = task.taskName;
    const isCompleting = !task.isCompleted; // Check if we're completing or un-completing
    
    // If un-completing a task, just update local state without calling API
    if (!isCompleting) {
      tasks = tasks.map((t) =>
        t.id === taskId ? { ...t, completed: false } : t
      );
      return;
    }
    
    // Call submit API to mark task as complete
    fetch(`/api/docker/container/${containerId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: taskText })
    })
    .then(res => res.json())
    .then(data => {
      // Only show success toast if task wasn't already completed
      // (i.e., this is a fresh completion, not a re-submission)
      if (data.success && data.nextLevel !== null) {
        // Update local task state
        tasks = tasks.map((t) =>
          t.id === taskId ? { ...t, completed: true } : t,
        );
        
        // Show feedback only when level advances or first-time completion
        if (data.levelComplete && data.nextLevel) {
          toast.success(`Level ${data.nextLevel} unlocked! 🎉`);
        } else if (data.rewards?.xp > 0) {
          toast.success(`+${data.rewards.xp} XP earned!`);
        }
      } else if (data.success) {
        // Task was already completed - just update UI without toast
        tasks = tasks.map((t) =>
          t.id === taskId ? { ...t, completed: true } : t,
        );
      }
    })
    .catch(err => {
      console.error('Failed to submit task:', err);
      toast.error('Failed to submit task');
    });
  }

  async function selectFile(
    file: string,
    lineNumber?: number,
    searchTerm?: string,
  ) {
    selectedFile = file;
    activeTab = "editor";

    if (containerId) {
      try {
        const res = await fetch(
          `/api/docker/container/${containerId}/files/read`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: `/workspace/${selectedFile}` }),
          },
        );
        const result = await res.json();
        if (result.success) {
          fileContents[file] = result.content;
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

  // ── Download project ─────────────────────────────────────────────────────
  async function handleDownload() {
    isDownloading = true;
    try {
      const dbContainerId = page.params.containerId;
      const response = await fetch(`/api/docker/container/${dbContainerId}/download`);
      
      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to download project');
        return;
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from content-disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
      a.download = filenameMatch ? filenameMatch[1] : `project-${dbContainerId}.tar`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Project downloaded successfully!');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download project');
    } finally {
      isDownloading = false;
    }
  }

  async function handleSubmitted(event: CustomEvent) {
    const { advanceToNextLevel } = event.detail;
    
    if (advanceToNextLevel) {
      // Reload the page data to get new level tasks by navigating to same URL with invalidate
      goto(`?reload=${Date.now()}`, { invalidateAll: true, replaceState: true, noScroll: true });
    }
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

  function refreshTerminal() {
    terminal?.reconnect();
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
    data={{
      level: data.level,
      title: actualLevelConfig.title,
      stack: actualLevelConfig.stack,
      difficulty: actualLevelConfig.difficulty,
      timeRemaining,
      isRunning,
      aiPanelOpen,
      isDownloading,
      onBack: handleBack,
      onRun: runDevServer,
      onStop: stopDevServer,
      onSubmit: handleSubmitSprint,
      onToggleAi: toggleAiPanel,
      onDownload: handleDownload
    }}
  />

  <div class="flex flex-1 overflow-hidden">
    <!-- Left Sidebar (VS Code-style toggle) -->
    <PrimarySidebar
      {fileTree}
      {directories}
      {selectedFile}
      {projectName}
      {containerId}
      scenario={actualLevelConfig.scenario}
      {tasks}
      {userId}
      {userCoins}
      {fileContents}
      currentLevel={data.level}
      onSelectFile={selectFile}
      onToggleTask={toggleTask}
      onCreateFile={handleCreateFile}
      onDeleteFile={handleDeleteFile}
      onRenameFile={handleRenameFile}
      onRefreshFiles={refreshFiles}
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Tab Bar -->
      <WorkspaceTabs {activeTab} onTabChange={handleTabChange} />

      <!-- Content Area -->
      <div class="flex-1 relative overflow-hidden">
        <EditorPanel
          visible={activeTab === "editor"}
          {selectedFile}
          onSave={saveFile}
          bind:editorRef
        />

        <TerminalPanel visible={activeTab === "terminal"} bind:terminalRef onRefresh={refreshTerminal} />

        <PreviewPanel
          visible={activeTab === "preview"}
          {previewUrl}
          onRefresh={refreshPreview}
          bind:iframeRef
        />
      </div>
    </div>

    <!-- Right AI Hints Panel (toggleable) -->
    {#if aiPanelOpen}
      <AiHelp containerId={page.params.containerId} userId={data.userId} />
    {/if}
  </div>

  <!-- Submit Sprint modal -->
  <SubmitSprintModal
    bind:this={submitSprintModal}
    dbContainerId={containerId}
    {containerId}
    {tasks}
    level={currentLevel}
    fileContents={fileContents}
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
