<!-- src/routes/coding/[stackId]/[levelId]/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import loader from "@monaco-editor/loader";
  import type * as Monaco from "monaco-editor";
  import { WebContainer } from "@webcontainer/api";
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
    starterFiles: Record<string, any>;
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
    deadline: 4 * 60 * 60, // 4 hours in seconds
    tasks: [
      {
        id: 1,
        text: "Set up Next.js 15 project with TypeScript",
        completed: false,
      },
      { id: 2, text: "Configure Prisma with PostgreSQL", completed: false },
      { id: 3, text: "Create a simple User model", completed: false },
      { id: 4, text: "Build GET /api/users endpoint", completed: false },
    ],
    scenario: `You've just joined StudentHub as a backend developer! Your first sprint task is to set up the foundation for our course registration system. The team needs you to create the initial Next.js project with Prisma ORM and build your first API endpoint to fetch users.`,
    hints: [
      'Use "npx create-next-app@latest" to initialize the project',
      'Install Prisma with "npm install prisma @prisma/client"',
      'Initialize Prisma with "npx prisma init"',
      "Create your User model in schema.prisma",
      'Generate Prisma Client with "npx prisma generate"',
    ],
    starterFiles: {
      "package.json": {
        file: {
          contents: JSON.stringify(
            {
              name: "studenthub-api",
              version: "0.1.0",
              private: true,
              scripts: {
                dev: "next dev",
                build: "next build",
                start: "next start",
              },
              dependencies: {
                next: "~14.2.5",
                react: "~18.3.0",
                "react-dom": "~18.3.0",
                "@prisma/client": "^5.0.0",
              },
              devDependencies: {
                "@types/node": "^20.0.0",
                "@types/react": "~18.3.0",
                typescript: "^5.0.0",
                prisma: "^5.0.0",
              },
            },
            null,
            2,
          ),
        },
      },
      app: {
        directory: {
          "page.tsx": {
            file: {
              contents: `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">StudentHub API</h1>
      <p className="mt-4 text-lg">Your Next.js + Prisma backend is ready!</p>
    </main>
  );
}
`,
            },
          },
          "layout.tsx": {
            file: {
              contents: `export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`,
            },
          },
        },
      },
      "tsconfig.json": {
        file: {
          contents: JSON.stringify(
            {
              compilerOptions: {
                target: "ES2017",
                lib: ["dom", "dom.iterable", "esnext"],
                allowJs: true,
                skipLibCheck: true,
                strict: true,
                forceConsistentCasingInFileNames: true,
                noEmit: true,
                esModuleInterop: true,
                module: "esnext",
                moduleResolution: "bundler",
                resolveJsonModule: true,
                isolatedModules: true,
                jsx: "preserve",
                incremental: true,
                paths: {
                  "@/*": ["./*"],
                },
              },
              include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
              exclude: ["node_modules"],
            },
            null,
            2,
          ),
        },
      },
      "next.config.js": {
        file: {
          contents: `/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig
`,
        },
      },
    },
  };

  // State
  let activeTab: "editor" | "terminal" | "preview" = "editor";
  let selectedFile: string = "app/page.tsx";
  let fileContents: Record<string, string> = {};
  let tasks: Task[] = LEVEL_CONFIG.tasks;
  let timeRemaining: number = LEVEL_CONFIG.deadline;
  let isRunning: boolean = false;
  let showHints: boolean = false;
  let webcontainerInstance: WebContainer | null = null;
  let terminalInstance: any = null;
  let previewUrl: string = "";
  let editorValue: string = "";
  let editorInstance: Monaco.editor.IStandaloneCodeEditor | null = null;

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

  // Initialize WebContainer and Terminal
  onMount(async () => {
    const mount = async () => {
      try {
        // Boot WebContainer
        const webcontainer = await WebContainer.boot();
        webcontainerInstance = webcontainer;

        // Mount starter files
        await webcontainer.mount(LEVEL_CONFIG.starterFiles);

        // Read initial file content from WebContainer
        try {
          const content = await webcontainer.fs.readFile(selectedFile, "utf-8");
          fileContents[selectedFile] = content;
          editorValue = content;
        } catch (error) {
          console.error("Error reading initial file:", error);
          editorValue = "";
        }

        // Initialize Monaco Editor
        if (editorRef) {
          const monaco = await loader.init();
          editorInstance = monaco.editor.create(editorRef, {
            value: editorValue,
            language: "typescript",
            theme: "vs-dark",
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          });

          // Listen for editor changes
          editorInstance?.onDidChangeModelContent(() => {
            const value = editorInstance?.getValue() || "";
            fileContents[selectedFile] = value;
            editorValue = value;
          });

          // Add save keyboard shortcut
          editorInstance?.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            () => {
              saveFile();
            },
          );
        }

        webcontainer.on('server-ready', (port, url) => {
          previewUrl = url;
          isRunning = true;
          console.log('Server ready at:', url);
        });

        // Initialize Terminal (only if terminal tab is active or will be accessed)
        await initializeTerminal(webcontainer);
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
        terminalInstance?.dispose();
        editorInstance?.dispose();
      };
    };

    await mount();
  });

  // Separate terminal initialization function
  async function initializeTerminal(webcontainer: WebContainer) {
    // Wait a bit more for terminal ref to be available
    await tick();

    if (!terminalRef) {
      console.warn("Terminal ref not available yet");
      return;
    }

    try {
      // Dynamic imports for XTerm
      const { Terminal } = await import("@xterm/xterm");
      const { FitAddon } = await import("@xterm/addon-fit");
      const { WebLinksAddon } = await import("@xterm/addon-web-links");

      // Import XTerm CSS dynamically
      await import("@xterm/xterm/css/xterm.css");

      const terminal = new Terminal({
        convertEol: true,
        theme: {
          background: "#1e1e1e",
          foreground: "#d4d4d4",
        },
      });

      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.loadAddon(new WebLinksAddon());

      terminal.open(terminalRef);
      fitAddon.fit();

      // Connect terminal to WebContainer shell
      const shellProcess = await webcontainer.spawn("jsh", {
        terminal: {
          cols: terminal.cols,
          rows: terminal.rows,
        },
      });

      shellProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            terminal.write(data);
          },
        }),
      );

      const input = shellProcess.input.getWriter();
      terminal.onData((data) => {
        input.write(data);
      });

      terminalInstance = terminal;

      // Welcome message
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
        '\x1b[33mTip: Start by installing dependencies with "npm install"\x1b[0m',
      );
      terminal.writeln("");
    } catch (error) {
      console.error("Failed to initialize terminal:", error);
    }
  }

  // Update editor value when file changes
  $: if (
    editorInstance &&
    selectedFile &&
    fileContents[selectedFile] !== undefined
  ) {
    const currentValue = editorInstance.getValue();
    const newValue = fileContents[selectedFile];
    if (currentValue !== newValue) {
      editorInstance.setValue(newValue);
    }
  }

  // Watch for tab changes and initialize terminal if needed
  $: if (
    activeTab === "terminal" &&
    !terminalInstance &&
    webcontainerInstance &&
    terminalRef
  ) {
    initializeTerminal(webcontainerInstance);
  }

  // Format time
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Handle editor change
  // function handleEditorChange(value: string | undefined) {
  //   if (value !== undefined) {
  //     fileContents[selectedFile] = value;
  //     editorValue = value;
  //   }
  // }
  // Save file
  async function saveFile() {
    if (!webcontainerInstance || !selectedFile) return;

    try {
      await webcontainerInstance.fs.writeFile(
        selectedFile,
        fileContents[selectedFile] || "",
      );
      console.log("File saved:", selectedFile);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  }

  // Run dev server
  async function runDevServer() {
    if (!webcontainerInstance || isRunning) return;

    isRunning = true;

    try {
      // Install dependencies
      const installProcess = await webcontainerInstance.spawn("npm", [
        "install",
      ]);
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            terminalInstance?.write(data);
          },
        }),
      );

      const installExitCode = await installProcess.exit;
      if (installExitCode !== 0) {
        throw new Error("Installation failed");
      }

      // Start dev server
      await webcontainerInstance.spawn("npm", ["run", "dev"]);

      // Wait for server
      webcontainerInstance.on("server-ready", (port, url) => {
        previewUrl = url;
      });
    } catch (error) {
      console.error("Error running dev server:", error);
      isRunning = false;
    }
  }

  // Stop dev server
  function stopDevServer() {
    isRunning = false;
    previewUrl = "";
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

    // Read file content from WebContainer
    if (webcontainerInstance) {
      try {
        const content = await webcontainerInstance.fs.readFile(file, "utf-8");
        fileContents[file] = content;

        // Update editor
        if (editorInstance) {
          editorInstance.setValue(content);
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

  // Calculate progress
  $: completedTasks = tasks.filter((t) => t.completed).length;
  $: progress = (completedTasks / tasks.length) * 100;
  $: fileTree = flattenFiles(LEVEL_CONFIG.starterFiles);
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
              ></iframe>
            {:else}
              <div
                class="flex-1 flex items-center justify-center text-slate-600"
              >
                <div class="text-center">
                  <Globe class="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p class="text-lg font-semibold">No Preview Available</p>
                  <p class="text-sm mt-2">
                    Click "Run" to start the dev server
                  </p>
                </div>
              </div>
            {/if}
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
