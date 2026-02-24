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

  import type { Task } from "$lib/interface/LevelConfig";
  import { LEVEL_CONFIG } from "$lib/mockdata/mocklevel";
  import type { FileListResponse } from "$lib/interface/Files";

  // Server-loaded data (dbContainerId needed for submit + archive API calls)
  export let data: { user: any; dbContainerId: string | null };

  // Get route params
  $: stackId = page.params.techstackid;
  $: levelId = parseInt(page.params.levelId!);

  // ── State ────────────────────────────────────────────────────────────────
  let activeTab: "editor" | "terminal" | "preview" = "editor";
  let selectedFile: string = "app/page.tsx";
  let fileContents: Record<string, string> = {};
  let tasks: Task[] = LEVEL_CONFIG.tasks;
  let timeRemaining: number = LEVEL_CONFIG.deadline;
  let isRunning: boolean = false;
  let containerId: string = "";
  let terminal: TerminalInitializer | null = null;
  let monacoEditor: MonacoInitializer | null = null;
  let previewUrl: string = "";
  let editorValue: string = "";
  let fileTree: string[] = [];

  // Component refs
  let submitSprintModal: SubmitSprintModal;
  let terminalRef: HTMLDivElement;
  let editorRef: HTMLDivElement;
  let iframeRef: HTMLIFrameElement;

  // Derived
  $: projectName = LEVEL_CONFIG.title.split(" ")[0] || "project";
  $: containerId = page.params.containerId;

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
      // Start the existing container
      const response = await fetch(`/api/docker/container/${containerId}/start`, {
        method: "POST",
      });
      const startData = await response.json();

      if (!startData.success) throw new Error(startData.error);
      previewUrl = startData.previewUrl;

      // Fetch file list from Docker
      try {
        const listRes = await fetch(`/api/docker/container/${containerId}/files/list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const listData = await listRes.json() as FileListResponse;
        if (listData.success) {
          fileTree = listData.files;
          if (fileTree.length > 0 && !fileTree.includes(selectedFile)) {
            selectedFile = fileTree[0];
          }
        }
      } catch (error) {
        console.error("Error listing files:", error);
        fileTree = flattenFiles(LEVEL_CONFIG.starterFiles);
      }

      // Read initial file content from Docker
      try {
        const res = await fetch(`/api/docker/container/${containerId}/files/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `/workspace/${selectedFile}` }),
        });
        const fileData = await res.json();
        if (fileData.success) {
          fileContents[selectedFile] = fileData.content;
          editorValue = fileData.content;
        }
      } catch (error) {
        console.error("Error reading initial file:", error);
        editorValue = "";
      }

      // Initialize Monaco Editor
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

      // Initialize Terminal
      terminal = new TerminalInitializer();
      await terminal.initializeDockerTerminal(terminalRef, containerId);
    } catch (error) {
      console.error("Failed to initialize environment:", error);
    }
  }

  // ── Reactive statements ──────────────────────────────────────────────────

  // Sync editor content when switching files
  $: if (monacoEditor && selectedFile && fileContents[selectedFile] !== undefined) {
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
    try {
      const response = await fetch(
        `/api/docker/container/${containerId}/files/write`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `/workspace/${selectedFile}` }),
        },
      );
      const result = await response.json();
      if (result.success) console.log("File saved successfully");
    } catch (error) {
      console.error("Error saving file:", error);
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

  function toggleTask(taskId: number) {
    tasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );
  }

  async function selectFile(file: string, lineNumber?: number, searchTerm?: string) {
    selectedFile = file;
    activeTab = "editor";

    if (containerId) {
      try {
        const res = await fetch(`/api/docker/container/${containerId}/files/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `/workspace/${selectedFile}` }),
        });
        const result = await res.json();
        if (result.success) {
          fileContents[file] = result.content;
          monacoEditor?.setValue(result.content);
          monacoEditor?.setLanguageFromFilename(file);
          if (lineNumber) {
            requestAnimationFrame(() => monacoEditor?.revealLine(lineNumber, searchTerm));
          }
        }
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }
  }

  function handleBack() {
    goto("/");
  }

  function handleSubmitSprint() {
    submitSprintModal.open();
  }

  async function refreshPreview() {
    try {
      const response = await fetch("/api/docker/container/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stackId, levelId }),
      });
      const result = await response.json();
      if (result.success) {
        const currentUrl = new URL(result.previewUrl);
        currentUrl.searchParams.set("t", Date.now().toString());
        previewUrl = currentUrl.toString();
        if (iframeRef) iframeRef.src = previewUrl;
      }
    } catch (error) {
      console.error("Error refreshing preview:", error);
    }
  }

  function handleTabChange(tab: "editor" | "terminal" | "preview") {
    activeTab = tab;
  }
</script>

<svelte:head>
  <title>Level {LEVEL_CONFIG.level}: {LEVEL_CONFIG.title} - DevSim</title>
</svelte:head>

<div class="h-screen flex flex-col bg-[#0a0e1a] text-[#d0d7dd]">
  <!-- Header -->
  <WorkspaceHeader
    level={LEVEL_CONFIG.level}
    title={LEVEL_CONFIG.title}
    stack={LEVEL_CONFIG.stack}
    difficulty={LEVEL_CONFIG.difficulty}
    {timeRemaining}
    {isRunning}
    onBack={handleBack}
    onRun={runDevServer}
    onStop={stopDevServer}
    onSubmit={handleSubmitSprint}
  />

  <div class="flex flex-1 overflow-hidden">
    <!-- Left Sidebar -->
    <PrimarySidebar
      {fileTree}
      {selectedFile}
      {projectName}
      {containerId}
      scenario={LEVEL_CONFIG.scenario}
      {tasks}
      hints={LEVEL_CONFIG.hints}
      onSelectFile={selectFile}
      onToggleTask={toggleTask}
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Tab Bar -->
      <WorkspaceTabs {activeTab} onTabChange={handleTabChange} />

      <!-- Content Area -->
      <div class="flex-1 relative">
        <EditorPanel
          visible={activeTab === "editor"}
          {selectedFile}
          onSave={saveFile}
          bind:editorRef
        />

        <TerminalPanel
          visible={activeTab === "terminal"}
          bind:terminalRef
        />

        <PreviewPanel
          visible={activeTab === "preview"}
          {previewUrl}
          onRefresh={refreshPreview}
          bind:iframeRef
        />
      </div>
    </div>
  </div>

  <!-- Submit Sprint modal -->
  <SubmitSprintModal
    bind:this={submitSprintModal}
    {containerId}
    dbContainerId={data.dbContainerId}
    {tasks}
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
