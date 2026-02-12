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
    CheckCircle,
    Clock,
    Target,
    ChevronLeft,
    AlertCircle,
    Lightbulb,
    BookOpen,
  } from "lucide-svelte";
  import { TerminalInitializer } from "$client/TerminalInitializer";

  import type { Task } from "$lib/interface/LevelConfig";
  import { LEVEL_CONFIG } from "$lib/mockdata/mocklevel";
  import type { FileListResponse } from "$lib/interface/Files";

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
  let showHints: boolean = false;
  let containerId: string = "";
  let terminal: TerminalInitializer | null = null;
  let monacoEditor: MonacoInitializer | null = null;
  let previewUrl: string = "";
  let editorValue: string = "";
  let fileTree: string[] = [];

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
        `/api/container/${containerId}/files/write`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: `/workspace/${selectedFile}`,
            content: fileContents[selectedFile] || "",
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

  // Select file
  async function selectFile(file: string) {
    selectedFile = file;

    if (containerId) {
      try {
        const res = await fetch(`/api/container/${containerId}/files/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `/workspace/${file}` }),
        });
        const data = await res.json();
        if (data.success) {
          fileContents[file] = data.content;
          monacoEditor?.setValue(data.content);
          monacoEditor?.setLanguageFromFilename(file);
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

  async function refreshPreview() {
    try {
      const response = await fetch("/api/container/create", {
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

  // Calculate progress
  $: completedTasks = tasks.filter((t) => t.completed).length;
  $: progress = (completedTasks / tasks.length) * 100;
</script>

<svelte:head>
  <title>Level {LEVEL_CONFIG.level}: {LEVEL_CONFIG.title} - DevSim</title>
</svelte:head>

<div class="h-screen flex flex-col bg-slate-900 text-white">
  <!-- Header -->
  <header
    class="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between"
  >
    <div class="flex items-center gap-4">
      <button
        on:click={handleBack}
        class="hover:bg-slate-700 p-2 rounded-lg transition-all"
      >
        <ChevronLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="font-bold text-lg">
          Level {LEVEL_CONFIG.level}: {LEVEL_CONFIG.title}
        </h1>
        <p class="text-xs text-gray-400">
          {LEVEL_CONFIG.stack} • {LEVEL_CONFIG.difficulty}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-lg">
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
          class="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-semibold transition-all"
        >
          Submit Sprint
        </button>
      </div>
    </div>
  </header>

  <div class="flex flex-1 overflow-hidden">
    <!-- Left Sidebar -->
    <aside class="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div class="flex-1 overflow-y-auto">
        <!-- Scenario -->
        <div class="p-4 border-b border-slate-700">
          <div class="flex items-center gap-2 mb-2">
            <BookOpen class="w-4 h-4 text-blue-400" />
            <h3 class="font-semibold">Scenario</h3>
          </div>
          <p class="text-sm text-gray-400 leading-relaxed">
            {LEVEL_CONFIG.scenario}
          </p>
        </div>

        <!-- Tasks -->
        <div class="p-4 border-b border-slate-700">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Target class="w-4 h-4 text-purple-400" />
              <h3 class="font-semibold">Sprint Tasks</h3>
            </div>
            <span class="text-xs text-gray-400"
              >{completedTasks}/{tasks.length}</span
            >
          </div>

          <div class="w-full bg-slate-700 rounded-full h-2 mb-4">
            <div
              class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style="width: {progress}%"
            ></div>
          </div>

          <div class="space-y-2">
            {#each tasks as task}
              <button
                on:click={() => toggleTask(task.id)}
                class="w-full flex items-start gap-2 p-2 rounded hover:bg-slate-700 cursor-pointer transition-all text-left"
              >
                <div
                  class="mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all {task.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-slate-600 hover:border-slate-500'}"
                >
                  {#if task.completed}
                    <CheckCircle class="w-4 h-4 text-white" />
                  {/if}
                </div>
                <span
                  class="text-sm {task.completed
                    ? 'line-through text-gray-500'
                    : 'text-gray-300'}"
                >
                  {task.text}
                </span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Hints -->
        <div class="p-4">
          <button
            on:click={() => (showHints = !showHints)}
            class="w-full flex items-center justify-between p-2 hover:bg-slate-700 rounded transition-all"
          >
            <div class="flex items-center gap-2">
              <Lightbulb class="w-4 h-4 text-yellow-400" />
              <h3 class="font-semibold">Hints</h3>
            </div>
            <span class="text-xs text-gray-400"
              >{LEVEL_CONFIG.hints.length}</span
            >
          </button>

          {#if showHints}
            <div class="mt-2 space-y-2">
              {#each LEVEL_CONFIG.hints as hint}
                <div
                  class="flex items-start gap-2 p-2 bg-yellow-900/20 rounded border border-yellow-700/30"
                >
                  <AlertCircle
                    class="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5"
                  />
                  <p class="text-xs text-gray-300">{hint}</p>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- File Explorer -->
        <div class="p-4 border-t border-slate-700">
          <div class="flex items-center gap-2 mb-3">
            <FileCode class="w-4 h-4 text-blue-400" />
            <h3 class="font-semibold">Files</h3>
          </div>
          <div class="space-y-1">
            {#each fileTree as file}
              <button
                on:click={() => selectFile(file)}
                class="w-full text-left px-3 py-2 rounded text-sm transition-all {selectedFile ===
                file
                  ? 'bg-purple-600 text-white'
                  : 'hover:bg-slate-700 text-gray-300'}"
              >
                {file}
              </button>
            {/each}
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Tab Bar -->
      <div class="bg-slate-800 border-b border-slate-700 flex">
        <button
          on:click={() => (activeTab = "editor")}
          class="px-4 py-2 flex items-center gap-2 border-b-2 transition-all {activeTab ===
          'editor'
            ? 'border-purple-500 text-white bg-slate-700'
            : 'border-transparent text-gray-400 hover:text-white'}"
        >
          <FileCode class="w-4 h-4" />
          Editor
        </button>
        <button
          on:click={() => (activeTab = "terminal")}
          class="px-4 py-2 flex items-center gap-2 border-b-2 transition-all {activeTab ===
          'terminal'
            ? 'border-purple-500 text-white bg-slate-700'
            : 'border-transparent text-gray-400 hover:text-white'}"
        >
          <Shell class="w-4 h-4" />
          Terminal
        </button>
        <button
          on:click={() => (activeTab = "preview")}
          class="px-4 py-2 flex items-center gap-2 border-b-2 transition-all {activeTab ===
          'preview'
            ? 'border-purple-500 text-white bg-slate-700'
            : 'border-transparent text-gray-400 hover:text-white'}"
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
              class="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between"
            >
              <span class="text-sm text-gray-400">{selectedFile}</span>
              <button
                on:click={saveFile}
                class="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded transition-all"
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
              class="bg-slate-800 px-4 py-2 flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <Globe class="w-4 h-4 text-gray-400" />
                <span class="text-sm text-gray-400"
                  >{previewUrl || "Waiting for server..."}</span
                >
              </div>
              <button
                on:click={refreshPreview}
                class="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded transition-all flex items-center gap-1"
                disabled={!previewUrl}
              >
                <Clock class="w-3 h-3" />
                Refresh
              </button>
            </div>

            {#if !previewUrl}
              <div
                class="flex-1 flex items-center justify-center text-slate-600"
              >
                <div class="text-center">
                  <Globe class="w-16 h-16 mx-auto mb-4 opacity-50" />
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
</style>
