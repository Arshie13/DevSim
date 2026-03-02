<script lang="ts" context="module">
  export type SidebarPanel = "files" | "search" | "scenario" | "tasks" | "hints";
</script>

<script lang="ts">
  import {
    FolderOpen,
    BookOpen,
    Target,
    Bot,
    Search as SearchIcon,
  } from "lucide-svelte";
  import type { Task } from "$lib/interface/LevelConfig";

  import Explorer from "./Explorer.svelte";
  import Scenario from "./Scenario.svelte";
  import SprintTask from "./SprintTask.svelte";
  import AiHelp from "./AiHelp.svelte";
  import Search from "./Search.svelte";

  // Props
  export let fileTree: string[] = [];
  export let selectedFile: string = "";
  export let projectName: string = "project";
  export let scenario: string = "";
  export let tasks: Task[] = [];
  export let hints: string[] = [];
  export let containerId: string = "";
  export let userId: string = "";
  export let userCoins: number = 0;
  export let onSelectFile: (file: string, lineNumber?: number, searchTerm?: string) => void = () => {};
  export let onToggleTask: (taskId: number) => void = () => {};

  let activeSidebarPanel: SidebarPanel = "files";

  // Compute remaining tasks for badge
  $: completedTasks = tasks.filter((t) => t.completed).length;
  $: remainingTasks = tasks.length - completedTasks;

  // Panel label map
  const panelLabels: Record<SidebarPanel, string> = {
    files: "Explorer",
    search: "Search",
    scenario: "Scenario",
    tasks: "Sprint Tasks",
    hints: "AI Hints",
  };

  // Activity bar items
  type ActivityItem = {
    panel: SidebarPanel;
    icon: typeof FolderOpen;
    title: string;
    badge?: number;
  };

  $: activityItems = [
    { panel: "files", icon: FolderOpen, title: "Explorer" },
    { panel: "search", icon: SearchIcon, title: "Search" },
    { panel: "scenario", icon: BookOpen, title: "Scenario" },
    { panel: "tasks", icon: Target, title: "Sprint Tasks", badge: remainingTasks > 0 ? remainingTasks : undefined },
    { panel: "hints", icon: Bot, title: "AI Hints" },
  ] satisfies ActivityItem[];

  function setPanel(panel: SidebarPanel) {
    activeSidebarPanel = panel;
  }
</script>

<div class="flex h-full">
  <!-- Activity Bar -->
  <div class="w-12 bg-[#0a0e1a] border-r border-[#27272a] flex flex-col items-center py-2 gap-1">
    {#each activityItems as item}
      <button
        on:click={() => setPanel(item.panel)}
        class="relative w-10 h-10 flex items-center justify-center rounded-lg transition-all {activeSidebarPanel === item.panel
          ? 'text-[#07a5c9] bg-[#2d3446] border-l-2 border-[#07a5c9]'
          : 'text-[#d0d7dd]/40 hover:text-[#d0d7dd] hover:bg-[#12192a]'}"
        title={item.title}
      >
        <svelte:component this={item.icon} class="w-5 h-5" />
        {#if item.badge}
          <span class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#07a5c9] text-[10px] font-bold rounded-full flex items-center justify-center">
            {item.badge}
          </span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Sidebar Content Panel -->
  <aside class="w-72 bg-[#12192a] border-r border-[#27272a] flex flex-col">
    <!-- Panel Header -->
    <div class="px-4 py-3 border-b border-[#27272a] text-xs font-semibold uppercase tracking-wider text-[#d0d7dd]/50">
      {panelLabels[activeSidebarPanel]}
    </div>

    <div class="flex-1 overflow-y-auto">
      {#if activeSidebarPanel === "files"}
        <Explorer
          {fileTree}
          {selectedFile}
          {projectName}
          {onSelectFile}
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
        <SprintTask {tasks} {onToggleTask} />
      {:else if activeSidebarPanel === "hints"}
        <AiHelp {hints} {scenario} {tasks} {containerId} {userId} {userCoins} />
      {/if}
    </div>
  </aside>
</div>
