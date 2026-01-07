<!-- src/routes/coding/[stackId]/[levelId]/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import loader from "@monaco-editor/loader";
  import type * as Monaco from "monaco-editor";
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

  // Types
  interface Task {
    id: number;
    text: string;
    completed: boolean;
  }

  interface LevelConfig {
    level: number;
    title: string;
    stack: string;
    difficulty: string;
    deadline: number;
    tasks: Task[];
    scenario: string;
    hints: string[];
  }

  // Get route params
  $: stackId = $page.params.stackId;
  $: levelId = parseInt($page.params.levelId!);

  // Level 1 Configuration
  const LEVEL_CONFIG: LevelConfig = {
    level: 1,
    title: "Setup & First API Route",
    stack: "Next.js + Prisma",
    difficulty: "Beginner",
    deadline: 4 * 60 * 60,
    tasks: [
      {
        id: 1,
        text: "Set up Next.js 14 project with TypeScript",
        completed: false,
      },
      { id: 2, text: "Configure Prisma with PostgreSQL", completed: false },
      { id: 3, text: "Create a simple User model", completed: false },
      { id: 4, text: "Build GET /api/users endpoint", completed: false },
    ],
    scenario: `You've just joined StudentHub as a backend developer! Your first sprint task is to set up the foundation for our course registration system. The team needs you to create the initial Next.js project with Prisma ORM and build your first API endpoint to fetch users.`,
    hints: [
      'Run "npm install" in the terminal to install dependencies',
      'Use "npm run dev" to start the development server',
      'Install Prisma with "npm install prisma @prisma/client"',
      'Initialize Prisma with "npx prisma init"',
      "Create your User model in prisma/schema.prisma",
    ],
  };

  // State
  let activeTab: "editor" | "terminal" | "preview" = "terminal";
  let selectedFile: string = "app/page.tsx";
  let fileContents: Record<string, string> = {};
  let tasks: Task[] = LEVEL_CONFIG.tasks;
  let timeRemaining: number = LEVEL_CONFIG.deadline;
  let isRunning: boolean = false;
  let showHints: boolean = false;
  let containerId: string = "";
  let terminalSocket: WebSocket | null = null;
  let previewUrl: string = "";
  let editorValue: string = "";
  let editorInstance: Monaco.editor.IStandaloneCodeEditor | null = null;
  let fileTree: string[] = [];
  let isInitializing: boolean = true;

  // Refs
  let terminalRef: HTMLDivElement;
  let editorRef: HTMLDivElement;
  let iframeRef: HTMLIFrameElement;

  // Initialize environment
  onMount(async () => {
    if (!browser) return;

    const mount = async () => {
      await tick();

      try {
        // Check for existing container in sessionStorage
        const sessionKey = `container_${stackId}_${levelId}`;
        let existingContainerId = sessionStorage.getItem(sessionKey);

        if (existingContainerId) {
          console.log("Found existing container ID:", existingContainerId);

          // Check if container is still running
          try {
            const statusRes = await fetch(
              `/api/container/${existingContainerId}/status`,
            );
            const statusData = await statusRes.json();

            if (statusData.success && statusData.running) {
              console.log("Reusing existing container:", existingContainerId);
              containerId = existingContainerId;

              // Get preview URL (you might need to reconstruct this)
              previewUrl = `http://localhost:${3000 + (parseInt(existingContainerId.substring(0, 4), 16) % 1000)}`;

              // Skip container creation
            } else {
              console.log("Container not running, creating new one");
              existingContainerId = null;
              sessionStorage.removeItem(sessionKey);
            }
          } catch (error) {
            console.log("Container not found, creating new one");
            existingContainerId = null;
            sessionStorage.removeItem(sessionKey);
          }
        }

        // Create new container if none exists
        if (!existingContainerId) {
          const res = await fetch("/api/container/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stackId, levelId }),
          });

          const data = await res.json();
          if (!data.success) {
            throw new Error(data.error || "Failed to create container");
          }

          containerId = data.containerId;
          previewUrl = data.previewUrl;

          // Store in sessionStorage
          sessionStorage.setItem(sessionKey, containerId);

          console.log("Container created:", containerId);

          // Wait for container to fully start (only for new containers)
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        // Get file list
        await refreshFileList();

        // Set isInitializing to false FIRST
        isInitializing = false;

        // Wait for DOM to update so editorRef exists
        await tick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Initialize Monaco Editor
        if (editorRef) {
          console.log("Editor ref found, initializing Monaco...");
          const monaco = await loader.init();
          editorInstance = monaco.editor.create(editorRef, {
            value: "",
            language: "typescript",
            theme: "vs-dark",
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          });

          editorInstance!.onDidChangeModelContent(() => {
            const value = editorInstance?.getValue() || "";
            fileContents[selectedFile] = value;
          });

          editorInstance!.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            () => {
              saveFile();
            },
          );

          // Load initial file AFTER editor is created
          if (fileTree.length > 0) {
            await selectFile(fileTree[0]);
          }
        } else {
          console.error("Editor ref still not available after waiting");
        }

        // Initialize Terminal WebSocket
        await initializeTerminal();
      } catch (error) {
        console.error("Failed to initialize environment:", error);
        alert(
          "Failed to initialize coding environment. Please refresh the page.",
        );
        isInitializing = false;
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
        cleanup();
      };
    };

    await mount();
  });

  onDestroy(() => {
    cleanup();
  });

  async function cleanup() {
    if (terminalSocket) {
      terminalSocket.close();
    }
    if (editorInstance) {
      editorInstance.dispose();
    }
    if (containerId) {
      try {
        await fetch(`/api/container/${containerId}/destroy`, {
          method: "DELETE",
        });
        console.log("Container cleaned up:", containerId);

        // Remove from sessionStorage
        const sessionKey = `container_${stackId}_${levelId}`;
        sessionStorage.removeItem(sessionKey);
      } catch (error) {
        console.error("Error cleaning up container:", error);
      }
    }
  }

  async function initializeTerminal() {
    // Wait for DOM and make sure we have both refs
    await tick();
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!terminalRef) {
      console.error("Terminal ref not available");
      return;
    }

    if (!containerId) {
      console.error("Container ID not available");
      return;
    }

    console.log("Initializing terminal with container:", containerId);

    try {
      const { Terminal } = await import("@xterm/xterm");
      const { FitAddon } = await import("@xterm/addon-fit");
      const { WebLinksAddon } = await import("@xterm/addon-web-links");
      await import("@xterm/xterm/css/xterm.css");

      const terminal = new Terminal({
        convertEol: true,
        theme: {
          background: "#1e1e1e",
          foreground: "#d4d4d4",
        },
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      });

      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.loadAddon(new WebLinksAddon());

      terminal.open(terminalRef);
      fitAddon.fit();

      // Show connecting message
      terminal.writeln("\x1b[1;33mConnecting to container...\x1b[0m");

      // Connect to WebSocket
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/terminal?containerId=${containerId}`;

      console.log("Connecting to:", wsUrl);

      terminalSocket = new WebSocket(wsUrl);

      terminalSocket.onopen = () => {
        console.log("Terminal WebSocket connected");
        terminal.clear();
        terminal.writeln(
          "\x1b[1;32m╔════════════════════════════════════════════╗\x1b[0m",
        );
        terminal.writeln(
          "\x1b[1;32m║     Welcome to DevSim Terminal! 🚀        ║\x1b[0m",
        );
        terminal.writeln(
          "\x1b[1;32m╚════════════════════════════════════════════╝\x1b[0m",
        );
        terminal.writeln("");
        terminal.writeln("\x1b[1;36mLevel 1: Setup & First API Route\x1b[0m");
        terminal.writeln(
          '\x1b[33mTip: Run "npm install" to install dependencies\x1b[0m',
        );
        terminal.writeln("");
      };

      terminalSocket.onmessage = (event) => {
        if (event.data instanceof Blob) {
          event.data.text().then((text) => terminal.write(text));
        } else {
          terminal.write(event.data);
        }
      };

      terminalSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        terminal.writeln(
          "\r\n\x1b[1;31mWebSocket connection error. Please refresh the page.\x1b[0m",
        );
      };

      terminalSocket.onclose = () => {
        console.log("Terminal WebSocket closed");
        terminal.writeln("\r\n\x1b[1;31mConnection closed.\x1b[0m");
      };

      // Send terminal input to WebSocket
      terminal.onData((data) => {
        if (terminalSocket?.readyState === WebSocket.OPEN) {
          terminalSocket.send(data);
        }
      });

      // Resize handler
      const resizeHandler = () => fitAddon.fit();
      window.addEventListener("resize", resizeHandler);

      // Store cleanup function
      return () => {
        window.removeEventListener("resize", resizeHandler);
      };
    } catch (error) {
      console.error("Failed to initialize terminal:", error);
    }
  }

  async function refreshFileList() {
    if (!containerId) {
      console.warn("No container ID available");
      return;
    }

    try {
      const res = await fetch(`/api/container/${containerId}/files/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/workspace" }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.success) {
        fileTree = data.files;
        console.log("Files loaded:", data.files.length);
      } else {
        console.error("Failed to list files:", data.error);
      }
    } catch (error) {
      console.error("Error listing files:", error);
    }
  }

  async function selectFile(file: string) {
    selectedFile = file;

    try {
      const res = await fetch(`/api/container/${containerId}/files/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          charset: "utf-8",
        },
        body: JSON.stringify({ path: `/workspace/${file}` }),
      });
      const data = await res.json();

      if (data.success) {
        // Remove BOM if present
        let content = data.content;
        console.log("Raw content:", content);
        if (content.charCodeAt(0) === 0xfeff) {
          content = content.substring(1);
        }
        const str = content.replace(/^[\uFFFD\s]+/, "");
        console.log("Processed content:", str);
        fileContents[file] = content;

        if (editorInstance) {
          const extension = file.split(".").pop() || "typescript";
          const languageMap: Record<string, string> = {
            ts: "typescript",
            tsx: "typescript",
            js: "javascript",
            jsx: "javascript",
            json: "json",
            css: "css",
            html: "html",
            md: "markdown",
          };
          const language = languageMap[extension] || "typescript";

          const monaco = await loader.init();
          const model = monaco.editor.createModel(content, language);
          editorInstance.setModel(model);
        }
      }
    } catch (error) {
      console.error("Error reading file:", error);
    }
  }

  async function saveFile() {
    if (!containerId || !selectedFile) return;

    try {
      await fetch(`/api/container/${containerId}/files/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: `/workspace/${selectedFile}`,
          content: fileContents[selectedFile] || "",
        }),
      });
      console.log("File saved:", selectedFile);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  }

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function toggleTask(taskId: number) {
    tasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );
  }

  function handleBack() {
    goto("/");
  }

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

      <button
        on:click={refreshFileList}
        class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-semibold transition-all"
      >
        Refresh Files
      </button>

      <button
        class="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-semibold transition-all"
      >
        Submit Sprint
      </button>
    </div>
  </header>

  {#if isInitializing}
    <div class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"
        ></div>
        <p class="text-lg">Initializing Docker environment...</p>
        <p class="text-sm text-gray-400 mt-2">This may take a few seconds</p>
      </div>
    </div>
  {:else}
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
              />
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
          <!-- Editor -->
          <div
            class="h-full flex flex-col"
            class:hidden={activeTab !== "editor"}
          >
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
              <div bind:this={editorRef} class="w-full h-full" />
            </div>
          </div>

          <!-- Terminal -->
          <div
            class="h-full bg-[#1e1e1e] p-2"
            class:hidden={activeTab !== "terminal"}
          >
            <div bind:this={terminalRef} class="h-full" />
          </div>

          <!-- Preview -->
          <div
            class="h-full flex flex-col bg-white"
            class:hidden={activeTab !== "preview"}
          >
            {#if previewUrl}
              <div class="bg-slate-800 px-4 py-2 flex items-center gap-2">
                <Globe class="w-4 h-4 text-gray-400" />
                <span class="text-sm text-gray-400">{previewUrl}</span>
              </div>
              <iframe
                bind:this={iframeRef}
                src={previewUrl}
                class="flex-1 w-full border-0"
                title="Preview"
              />
            {:else}
              <div
                class="flex-1 flex items-center justify-center text-slate-600"
              >
                <div class="text-center">
                  <Globe class="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p class="text-lg font-semibold">No Preview Available</p>
                  <p class="text-sm mt-2">
                    Run "npm run dev" in the terminal to start the server
                  </p>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
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

  .hidden {
    display: none !important;
  }
</style>
