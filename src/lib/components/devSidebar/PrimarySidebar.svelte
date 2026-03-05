<script lang="ts" context="module">
  import { writable, derived } from 'svelte/store';
  import type { Writable } from 'svelte/store';

  export type SidebarPanel = "files" | "search" | "scenario" | "tasks" | "hints";

  // Chat message type
  export type ChatMessage = { role: "user" | "ai"; content: string; isWarning?: boolean };

  // Store for AI chat history - persists across tab switches
  export const aiChatHistory: Writable<ChatMessage[]> = writable([]);

  // Store for coin count - persists across tab switches
  export const aiCoins: Writable<number> = writable(1000);

  // Store for selected file - persists across tab switches
  export const aiSelectedFile: Writable<string> = writable("");

  // Store for file tree - persists across tab switches
  export const aiFileTree: Writable<string[]> = writable([]);

  // Store for file contents - persists across tab switches
  export const aiFileContents: Writable<Record<string, string>> = writable({});
</script>

<script lang="ts">
  import {
    FolderOpen,
    BookOpen,
    Target,
    Search as SearchIcon,
  } from "lucide-svelte";
  import type { Task } from "$lib/interface/LevelConfig";

  import Explorer from "./Explorer.svelte";
  import Scenario from "./Scenario.svelte";
  import SprintTask from "./SprintTask.svelte";
  import Search from "./Search.svelte";
  import AiHelp from './AiHelp.svelte';

  // Props
  export let fileTree: string[] = [];
  export let directories: string[] = [];
  export let selectedFile: string = "";
  export let projectName: string = "project";
  export let scenario: string = "";
  export let tasks: Task[] = [];
  export let containerId: string = "";
  export let userId: string = "";
  export let userCoins: number = 0;
  export let fileContents: Record<string, string> = {};
  export let onSelectFile: (file: string, lineNumber?: number, searchTerm?: string) => void = () => {};
  export let onToggleTask: (taskId: number) => void = () => {};
  export let onCreateFile: (parentPath: string, isDirectory: boolean) => void = () => {};
  export let onDeleteFile: (filePath: string) => void = () => {};
  export let onRenameFile: (oldPath: string, newPath: string) => void = () => {};

  // VS Code-style: clicking the active panel icon closes the sidebar;
  // clicking any panel when closed opens it and switches to that panel.
  let activeSidebarPanel: SidebarPanel = "files";
  let isOpen: boolean = true;

  // Current level for display in tasks panel
  export let currentLevel: number = 1;

  // Compute remaining tasks for badge
  $: completedTasks = tasks.filter((t) => t.completed).length;
  $: remainingTasks = tasks.length - completedTasks;

  // Panel label map
  const panelLabels: Record<SidebarPanel, string> = {
    files: "Explorer",
    search: "Search",
    scenario: "Scenario",
    tasks: "Sprint Tasks",
    hints: ''
  };

  // Activity bar items
  type ActivityItem = {
    panel: SidebarPanel;
    icon: typeof FolderOpen;
    title: string;
    badge?: number;
  };

  $: activityItems = [
    { panel: "files",    icon: FolderOpen,  title: "Explorer" },
    { panel: "search",   icon: SearchIcon,  title: "Search" },
    { panel: "scenario", icon: BookOpen,    title: "Scenario" },
    { panel: "tasks",    icon: Target,      title: "Sprint Tasks", badge: remainingTasks > 0 ? remainingTasks : undefined },
  ] satisfies ActivityItem[];

  function setPanel(panel: SidebarPanel) {
    if (panel === activeSidebarPanel && isOpen) {
      // VS Code behaviour: click active icon again → collapse sidebar
      isOpen = false;
    } else {
      activeSidebarPanel = panel;
      isOpen = true;
    }
  }
</script>

<div class="flex h-full flex-shrink-0">
  <!-- Activity Bar -->
  <div
    class="w-12 bg-[#0a0e1a] border-r border-[rgba(7,165,201,0.1)] flex flex-col items-center py-2 gap-1 flex-shrink-0"
  >
    {#each activityItems as item}
      <button
        on:click={() => setPanel(item.panel)}
        title="{item.title}{activeSidebarPanel === item.panel && isOpen ? ' (click to close)' : ''}"
        class="relative w-10 h-10 flex items-center justify-center transition-all
          {activeSidebarPanel === item.panel && isOpen
            ? 'text-[#07a5c9] bg-[rgba(7,165,201,0.08)] border-l-2 border-[#07a5c9]'
            : 'text-[#8892a0]/60 border-l-2 border-transparent hover:text-[#d0d7dd] hover:bg-[rgba(7,165,201,0.04)]'}"
      >
        <svelte:component this={item.icon} class="w-5 h-5" />
        {#if item.badge}
          <span
            class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#07a5c9] text-[9px] font-bold flex items-center justify-center rounded-full"
            style="font-family:'Share Tech Mono',monospace;box-shadow:0 0 6px rgba(7,165,201,0.5);"
          >
            {item.badge}
          </span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Sidebar Content Panel — hidden when collapsed -->
  {#if isOpen}
    <aside
      class="w-64 bg-[#12192a] border-r border-[rgba(7,165,201,0.1)] flex flex-col overflow-hidden"
      style="box-shadow:4px 0 20px rgba(7,165,201,0.03);"
    >
      <!-- Panel Header -->
      <div
        class="px-4 py-2.5 border-b border-[rgba(7,165,201,0.1)] flex-shrink-0"
      >
        <span
          class="text-[0.85rem] font-semibold uppercase tracking-widest text-[#8892a0]"
          style="font-family:'Share Tech Mono',monospace;"
          >{panelLabels[activeSidebarPanel]}</span
        >
      </div>

    <div class="flex-1 overflow-y-auto">
      {#if activeSidebarPanel === "files"}
        <Explorer
          {fileTree}
          {directories}
          {selectedFile}
          {projectName}
          {onSelectFile}
          {onCreateFile}
          {onDeleteFile}
          {onRenameFile}
        />
      {:else if activeSidebarPanel === "search"}
        <Search
          {fileTree}
          {containerId}
          {onSelectFile}
        />
      {:else if activeSidebarPanel === "scenario"}
        <Scenario {scenario} />
      {:else if activeSidebarPanel === "tasks"}
        <SprintTask {tasks} {onToggleTask} levelTitle={tasks.length > 0 ? `Level ${currentLevel}` : ""} />
      {:else if activeSidebarPanel === "hints"}
        <AiHelp 
          {scenario} 
          {tasks} 
          {containerId} 
          {userId} 
          initialCoins={userCoins} 
          initialSelectedFile={selectedFile}
          initialFileTree={fileTree}
          initialFileContents={fileContents}
        />
      {/if}
    </div>
  </aside>
  {/if}
</div>
