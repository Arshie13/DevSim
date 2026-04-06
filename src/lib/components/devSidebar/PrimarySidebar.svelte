<script lang="ts" context="module">
  import { writable, derived } from 'svelte/store';
  import type { Writable } from 'svelte/store';

  export type SidebarPanel = "files" | "search";

  // Chat message type
  export type ChatMessage = { role: "user" | "ai"; content: string; isWarning?: boolean; attachedFiles?: { path: string; name: string }[] };

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
    Search as SearchIcon,
  } from "lucide-svelte";
  import type { ITask } from "$lib/types";
  import Scrollbar from "$lib/components/ui/Scrollbar.svelte";

  import Explorer from "./Explorer.svelte";
  import Search from "./Search.svelte";

  // Props
  export let fileTree: string[] = [];
  export let directories: string[] = [];
  export let selectedFile: string = "";
  export let projectName: string = "project";
  export let tasks: ITask[] = [];
  export let containerId: string = "";
  export const currentLevel: number = 1;
  export const levelTitle: string = "";
  export let onSelectFile: (file: string, lineNumber?: number, searchTerm?: string) => void = () => {};
  export let onCreateFile: (parentPath: string, isDirectory: boolean) => void = () => {};
  export let onDeleteFile: (filePath: string) => void = () => {};
  export let onRenameFile: (oldPath: string, newPath: string) => void = () => {};
  export let onRefreshFiles: () => void = () => {};

  // VS Code-style: clicking the active panel icon closes the sidebar;
  // clicking any panel when closed opens it and switches to that panel.
  let activeSidebarPanel: SidebarPanel = "files";
  let isOpen: boolean = true;

  // Compute remaining tasks for badge
  $: completedTasks = tasks.filter((t) => t.isCompleted).length;
  $: remainingTasks = tasks.length - completedTasks;

  // Panel label map
  const panelLabels: Record<SidebarPanel, string> = {
    files: "Explorer",
    search: "Search",
  };

  // Activity bar items
  type ActivityItem = {
    panel: SidebarPanel;
    icon: typeof FolderOpen;
    title: string;
    badge?: number;
  };

  // Activity bar items - with badge for remaining tasks
  $: activityItems = [
    { panel: "files", icon: FolderOpen, title: "Explorer" },
    { panel: "search", icon: SearchIcon, title: "Search" },
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

<div class="flex h-full flex-shrink-0" data-tour="sidebar">
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
        class="px-4 py-2.5 border-b border-[rgba(7,165,201,0.1)] flex-shrink-0 flex items-center justify-between"
      >
        <span
          class="text-[0.85rem] font-semibold uppercase tracking-widest text-[#8892a0]"
          style="font-family:'Share Tech Mono',monospace;"
          >{panelLabels[activeSidebarPanel]}</span
        >
        {#if activeSidebarPanel === 'files'}
          <button
            on:click={onRefreshFiles}
            class="p-1 text-[#8892a0] hover:text-white hover:bg-[rgba(7,165,201,0.1)] rounded transition-colors"
            title="Refresh files"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        {/if}
      </div>

    <Scrollbar className="flex-1">
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
      {/if}
    </Scrollbar>
  </aside>
  {/if}
</div>
