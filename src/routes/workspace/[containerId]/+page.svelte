<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { MonacoInitializer } from "$client/MonacoInitializer";
  import {
    Play,
    Square,
    FileCode,
    Shell,
    Globe,
    Clock,
    ChevronLeft,
  } from "lucide-svelte";
  import { TerminalInitializer } from "$client/TerminalInitializer";
  import PrimarySidebar from "$lib/components/devSidebar/PrimarySidebar.svelte";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";

  import type { Task } from "$lib/interface/LevelConfig";
  import { LEVEL_CONFIG } from "$lib/mockdata/mocklevel";
  import type { FileListResponse } from "$lib/interface/Files";

  // Server-loaded data (dbContainerId needed for submit + archive API calls)
  export let data: { user: any; dbContainerId: string | null };

  // Get route params
  $: stackId = page.params.techstackid;
  $: levelId = parseInt(page.params.levelId!);

  // State
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

  // --- Submit Sprint modal state ---
  let showSubmitModal = false;    // controls visibility of the confirmation modal
  let isSubmitting = false;       // true while submit + archive requests are in flight
  let submitError = '';           // error message to show inside the modal
  let submitSuccess = false;      // true after archive completes successfully
  let submitRewards = { xp: 0, coins: 0 }; // rewards returned by the submit endpoint

  // Derive project name from level config
  $: projectName = LEVEL_CONFIG.title.split(" ")[0] || "project";

  // Refs
  let terminalRef: HTMLDivElement;
  let editorRef: HTMLDivElement;
  let iframeRef: HTMLIFrameElement;

  // Helper function to flatten file structure for display
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

  // Get containerId from route params
  $: containerId = page.params.containerId;

  // Initialize Docker Container and Terminal
  onMount(async () => {

    const mount = async () => {
      try {
        // Start the existing container
        const response = await fetch(`/api/docker/container/${containerId}/start`, {
          method: "POST",
        });
        const data = await response.json();

        if (!data.success) throw new Error(data.error);
        console.log(data.previewUrl);
        previewUrl = data.previewUrl;

        // Fetch file list from Docker
        try {
          const listRes = await fetch(`/api/docker/container/${containerId}/files/list`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const listData = await listRes.json() as FileListResponse;
          if (listData.success) {
            fileTree = listData.files;
            // If we have files, select the first one
            if (fileTree.length > 0 && !fileTree.includes(selectedFile)) {
              selectedFile = fileTree[0];
            }
          }
        } catch (error) {
          console.error("Error listing files:", error);
          // Fallback to mock files if container list fails
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

      // Countdown timer
      const timer = setInterval(() => {
        timeRemaining = timeRemaining > 0 ? timeRemaining - 1 : 0;
        if (timeRemaining === 0) {
          clearInterval(timer);
        }
      }, 1000);
      return () => {
        clearInterval(timer);
        terminal?.dispose();
        monacoEditor?.dispose();
      };
    };

    await mount();
  });

  // Update editor value when file changes
  $: if (
    monacoEditor &&
    selectedFile &&
    fileContents[selectedFile] !== undefined
  ) {
    monacoEditor.setValue(fileContents[selectedFile]);
  }

  $: if (activeTab === "terminal" && !terminal && containerId && terminalRef) {
    terminal = new TerminalInitializer();
    terminal.initializeDockerTerminal(terminalRef, containerId);
  }

  // Format time
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Save file
  async function saveFile() {
    if (!containerId || !selectedFile) return;

    try {
      const response = await fetch(
        `/api/docker/container/${containerId}/files/write`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: `/workspace/${selectedFile}`
          }),
        },
      );
      const data = await response.json();
      if (data.success) {
        console.log("File saved successfully");
      }
    } catch (error) {
      console.error("Error saving file:", error);
    }
  }

  // Run dev server
  async function runDevServer() {
    if (!containerId || isRunning) return;
    isRunning = true;
    activeTab = "terminal";
    terminal?.write("npm install && npm run dev\r");
  }

  // Stop dev server
  function stopDevServer() {
    terminal?.write("\x03");
    isRunning = false;
  }

  // Toggle task
  function toggleTask(taskId: number) {
    tasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );
  }

  // Select file (with optional line number and search term to highlight)
  async function selectFile(file: string, lineNumber?: number, searchTerm?: string) {
    selectedFile = file;
    activeTab = "editor";

    console.log("selected file: ", selectedFile);

    if (containerId) {
      try {
        const res = await fetch(`/api/docker/container/${containerId}/files/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `/workspace/${selectedFile}` }),
        });
        const data = await res.json();
        if (data.success) {
          fileContents[file] = data.content;
          monacoEditor?.setValue(data.content);
          monacoEditor?.setLanguageFromFilename(file);
          if (lineNumber) {
            // Small delay to let Monaco render the new content
            requestAnimationFrame(() => monacoEditor?.revealLine(lineNumber, searchTerm));
          }
        }
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }
  }

  // Navigate back
  function handleBack() {
    goto("/");
  }

  function handleSuccessConfirm() {
    goto("/dashboard");
  }

  /**
   * Opens the Submit Sprint confirmation modal.
   * The actual submission is deferred until the user clicks "Confirm".
   */
  function handleSubmitSprint() {
    submitError = '';
    submitSuccess = false;
    showSubmitModal = true;
  }

  /**
   * Called when the user confirms in the modal.
   * Step 1 — submit: marks the container as completed + awards XP/coins.
   * Step 2 — archive: copies /workspace to a Docker volume and removes the container.
   * On success the user is redirected to the dashboard.
   */
  async function handleConfirmSubmit() {
    if (!data.dbContainerId) {
      console.error('[handleConfirmSubmit] dbContainerId is null — URL containerId:', containerId);
      submitError = 'Could not resolve container record. Please refresh and try again.';
      return;
    }

    console.log('[handleConfirmSubmit] dbContainerId:', data.dbContainerId);
    isSubmitting = true;
    submitError = '';

    try {
      // --- Step 1: Mark container as completed ---
      console.log('[handleConfirmSubmit] Calling submit endpoint...');
      const submitRes = await fetch(
        `/api/docker/container/${data.dbContainerId}/submit`,
        { method: 'POST' }
      );
      const submitData = await submitRes.json();
      console.log('[handleConfirmSubmit] Submit response:', submitRes.status, submitData);

      if (!submitRes.ok) {
        throw new Error(submitData.message ?? 'Failed to submit sprint.');
      }

      submitRewards = submitData.rewards;

      // --- Step 2: Archive workspace to Docker volume + remove container ---
      console.log('[handleConfirmSubmit] Calling archive endpoint...');
      const archiveRes = await fetch(
        `/api/docker/container/${data.dbContainerId}/archive`,
        { method: 'POST' }
      );
      const archiveData = await archiveRes.json();
      console.log('[handleConfirmSubmit] Archive response:', archiveRes.status, archiveData);

      if (!archiveRes.ok) {
        throw new Error(archiveData.message ?? 'Failed to archive container.');
      }

      // Both calls succeeded — show the success state briefly then redirect
      submitSuccess = true;
      setTimeout(() => goto('/dashboard'), 2000);
    } catch (err) {
      console.error('[handleConfirmSubmit] Error:', err);
      submitError = err instanceof Error ? err.message : String(err);
    } finally {
      isSubmitting = false;
    }
  }

  async function refreshPreview() {
    try {
      const response = await fetch("/api/docker/container/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stackId, levelId }),
      });
      const data = await response.json();
      if (data.success) {
        const currentUrl = new URL(data.previewUrl);
        currentUrl.searchParams.set("t", Date.now().toString());
        previewUrl = currentUrl.toString();

        // Explicitly reload the iframe if it's already mounted
        if (iframeRef) {
          iframeRef.src = previewUrl;
        }
      }
    } catch (error) {
      console.error("Error refreshing preview:", error);
    }
  }

</script>

<svelte:head>
  <title>Level {LEVEL_CONFIG.level}: {LEVEL_CONFIG.title} - DevSim</title>
</svelte:head>

<div class="h-screen flex flex-col bg-[#0a0e1a] text-[#d0d7dd]">
  <!-- Header -->
  <header
    class="bg-[#12192a] border-b border-[#27272a] px-4 py-3 flex items-center justify-between"
  >
    <div class="flex items-center gap-4">
      <button
        on:click={handleBack}
        class="hover:bg-[#2d3446] p-2 rounded-lg transition-all"
      >
        <ChevronLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="font-bold text-lg">
          Level {LEVEL_CONFIG.level}: {LEVEL_CONFIG.title}
        </h1>
        <p class="text-xs text-[#d0d7dd]/50">
          {LEVEL_CONFIG.stack} • {LEVEL_CONFIG.difficulty}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2 bg-[#2d3446] px-4 py-2 rounded-lg">
        <Clock class="w-4 h-4 text-yellow-400" />
        <span
          class="font-mono {timeRemaining < 3600
            ? 'text-red-400'
            : 'text-white'}"
        >
          {formatTime(timeRemaining)}
        </span>
      </div>

      <div class="flex items-center gap-2">
        {#if !isRunning}
          <button
            on:click={runDevServer}
            class="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
          >
            <Play class="w-4 h-4" />
            Run
          </button>
        {:else}
          <button
            on:click={stopDevServer}
            class="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
          >
            <Square class="w-4 h-4" />
            Stop
          </button>
        {/if}

        <button
          on:click={handleSubmitSprint}
          class="bg-[#07a5c9] hover:bg-[#07a5c9]/80 px-4 py-2 rounded-lg font-semibold transition-all"
        >
          Submit Sprint
        </button>
      </div>
    </div>
  </header>

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
      <div class="bg-[#12192a] border-b border-[#27272a] flex">
        <button
          on:click={() => (activeTab = "editor")}
          class="px-4 py-2 flex items-center gap-2 border-b-2 transition-all {activeTab ===
          'editor'
            ? 'border-[#07a5c9] text-[#d0d7dd] bg-[#2d3446]'
            : 'border-transparent text-[#d0d7dd]/40 hover:text-[#d0d7dd]'}"
        >
          <FileCode class="w-4 h-4" />
          Editor
        </button>
        <button
          on:click={() => (activeTab = "terminal")}
          class="px-4 py-2 flex items-center gap-2 border-b-2 transition-all {activeTab ===
          'terminal'
            ? 'border-[#07a5c9] text-[#d0d7dd] bg-[#2d3446]'
            : 'border-transparent text-[#d0d7dd]/40 hover:text-[#d0d7dd]'}"
        >
          <Shell class="w-4 h-4" />
          Terminal
        </button>
        <button
          on:click={() => (activeTab = "preview")}
          class="px-4 py-2 flex items-center gap-2 border-b-2 transition-all {activeTab ===
          'preview'
            ? 'border-[#07a5c9] text-[#d0d7dd] bg-[#2d3446]'
            : 'border-transparent text-[#d0d7dd]/40 hover:text-[#d0d7dd]'}"
        >
          <Globe class="w-4 h-4" />
          Preview
        </button>
      </div>

      <!-- Content Area -->
      <div class="flex-1 relative">
        <div class:hidden={activeTab !== "editor"} class="h-full">
          <div class="h-full flex flex-col">
            <div
              class="bg-[#12192a] px-4 py-2 border-b border-[#27272a] flex items-center justify-between"
            >
              <span class="text-sm text-[#d0d7dd]/50">{selectedFile}</span>
              <button
                on:click={saveFile}
                class="text-xs bg-[#07a5c9] hover:bg-[#07a5c9]/80 px-3 py-1 rounded transition-all"
              >
                Save (Ctrl+S)
              </button>
            </div>
            <div class="flex-1">
              <div bind:this={editorRef} class="w-full h-full"></div>
            </div>
          </div>
        </div>

        <div class:hidden={activeTab !== "terminal"} class="h-full">
          <div class="h-full bg-[#1e1e1e] p-2">
            <div bind:this={terminalRef} class="h-full"></div>
          </div>
        </div>

        <div class:hidden={activeTab !== "preview"} class="h-full">
          <div class="h-full flex flex-col bg-white">
            <div
              class="bg-[#12192a] px-4 py-2 flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <Globe class="w-4 h-4 text-[#d0d7dd]/40" />
                <span class="text-sm text-[#d0d7dd]/40"
                  >{previewUrl || "Waiting for server..."}</span
                >
              </div>
              <button
                on:click={refreshPreview}
                class="text-xs bg-[#2d3446] hover:bg-[#2d3446]/80 px-3 py-1 rounded transition-all flex items-center gap-1"
                disabled={!previewUrl}
              >
                <Clock class="w-3 h-3" />
                Refresh
              </button>
            </div>

            {#if !previewUrl}
              <div
                class="flex-1 flex items-center justify-center text-[#d0d7dd]/30"
              >
                <div class="text-center">
                  <Globe class="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p class="text-lg font-semibold">Preparing Preview...</p>
                  <p class="text-sm mt-2">Starting dev server...</p>
                </div>
              </div>
            {/if}

            <div class="flex-1 w-full relative" class:hidden={!previewUrl}>
              {#key previewUrl}
                <iframe
                  bind:this={iframeRef}
                  src={previewUrl}
                  class="absolute inset-0 w-full h-full border-0 bg-white"
                  title="Preview"
                ></iframe>
              {/key}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Submit Sprint modal — uses the generic ConfirmModal component -->
  <ConfirmModal
    bind:open={showSubmitModal}
    title="Submit Sprint?"
    description="This will mark your sprint as <strong class='text-white'>complete</strong>, save your workspace to a Docker volume, and remove the running container. You can restore it later from the dashboard."
    confirmLabel="Confirm & Archive"
    loadingLabel="Archiving…"
    variant="primary"
    isLoading={isSubmitting}
    error={submitError}
    showSuccess={submitSuccess}
    on:confirm={handleConfirmSubmit}
  >
    <!-- Body: task completion summary -->
    <div class="bg-[#0a0e1a] rounded-lg p-3 mt-4 text-sm">
      <p class="text-[#d0d7dd]/50 mb-2">Tasks completed</p>
      <ul class="space-y-1">
        {#each tasks as task}
          <li class="flex items-center gap-2">
            <span class={task.completed ? 'text-green-400' : 'text-[#d0d7dd]/30'}>
              {task.completed ? '✓' : '○'}
            </span>
            <span class={task.completed ? 'text-[#d0d7dd]' : 'text-[#d0d7dd]/40 line-through'}>
              {task.text}
            </span>
          </li>
        {/each}
      </ul>
      <p class="text-xs text-[#d0d7dd]/40 mt-2">
        {tasks.filter(t => t.completed).length} / {tasks.length} tasks done
      </p>
    </div>

    <!-- Success state shown after archive completes -->
<!-- Success state shown after archive completes -->
<svelte:fragment slot="success">
  <div class="text-center py-4">
    <p class="text-4xl mb-3">🎉</p>
    <h2 class="text-xl font-bold text-white mb-1">Sprint Submitted!</h2>
    <p class="text-sm text-[#d0d7dd]/60 mb-4">
      Your workspace has been archived successfully.
    </p>

    <div class="flex justify-center gap-6 text-sm mb-6">
      <span class="text-yellow-400 font-semibold">
        +{submitRewards.xp} XP ⚡
      </span>
      <span class="text-yellow-300 font-semibold">
        +{submitRewards.coins} Coins 🪙
      </span>
    </div>

    <button
      on:click={handleSuccessConfirm}
      class="px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg transition"
    >
      OK
    </button>
  </div>
</svelte:fragment>
  </ConfirmModal>
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
