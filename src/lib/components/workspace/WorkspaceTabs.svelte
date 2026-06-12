<script lang="ts">
  import {
    FileCode,
    Shell,
    Globe,
    LayoutDashboard,
    GraduationCap,
  } from "lucide-svelte";

  /** The currently active tab. */
  export let activeTab: "editor" | "terminal" | "preview" | "board";

  /** Fired when the user selects a tab. */
  export let onTabChange: (
    tab: "editor" | "terminal" | "preview" | "board",
  ) => void;
  export let showCrashCourseButton: boolean = false;
  export let onOpenCrashCourse: () => void = () => {};
  export let crashCourseCompleted: boolean = false;
  /** AI Helper (SAZ) panel toggle. */
  export let onToggleAiHelper: () => void = () => {};
  export let aiHelperActive: boolean = false;

  const LEFT_TABS = [
    { id: "editor" as const, icon: FileCode, label: "Editor" },
    { id: "terminal" as const, icon: Shell, label: "Terminal" },
    { id: "preview" as const, icon: Globe, label: "Preview" },
    { id: "board" as const, icon: LayoutDashboard, label: "Board" },
  ];
</script>

<!-- Per UIUX spec: active tab gets border-top accent + bg var(--bg) -->
<div
  class="tabs-bar bg-[#0a0e1a] border-b border-[rgba(7,165,201,0.1)] flex items-end"
>
  <div class="tabs-scroll flex items-end min-w-0 overflow-x-auto">
    {#each LEFT_TABS as tab}
      <button
        data-tour={tab.id === "preview"
          ? "workspace-tab-preview"
          : tab.id === "editor"
            ? "workspace-tab-editor"
            : tab.id === "terminal"
              ? "workspace-tab-terminal"
              : tab.id === "board"
                ? "workspace-tab-board"
                : undefined}
        on:click={() => onTabChange(tab.id)}
        title={tab.label}
        class="tab-btn relative px-5 py-2.5 flex items-center gap-2 text-[0.75rem] sm:text-[0.85rem] uppercase tracking-wider border-t-2 transition-all whitespace-nowrap flex-shrink-0
          {activeTab === tab.id
          ? 'border-[#07a5c9] text-[#07a5c9] bg-[#12192a]'
          : 'border-transparent text-[#8892a0] hover:text-[#d0d7dd] hover:bg-[rgba(7,165,201,0.04)]'}"
        style="font-family: 'Space Mono', monospace;"
      >
        <svelte:component this={tab.icon} class="w-4 h-4 flex-shrink-0" />
        <span class="hidden sm:inline">{tab.label}</span>
      </button>
    {/each}
  </div>

  <div class="actions ml-auto flex items-center gap-2 px-3 py-1.5 flex-shrink-0">
    {#if showCrashCourseButton}
      <button
        type="button"
        title="Open Crash Course"
        class="action-btn px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.1em] border border-[rgba(7,165,201,0.28)] bg-[rgba(7,165,201,0.08)] text-[#9fe7ff] hover:bg-[rgba(7,165,201,0.16)] transition-colors whitespace-nowrap inline-flex items-center gap-2"
        style="font-family: 'Space Mono', monospace;"
        on:click={onOpenCrashCourse}
      >
        <GraduationCap class="w-4 h-4 flex-shrink-0" />
        Open Crash Course
        {#if crashCourseCompleted}
          <span
            class="text-[0.56rem] px-1.5 py-0.5 rounded border border-[rgba(126,231,135,0.45)] bg-[rgba(126,231,135,0.12)] text-[#93f7a2]"
          >
            Done
          </span>
        {/if}
      </button>
    {/if}

    <!-- AI Helper (SAZ) toggle -->
    <button
      data-tour="ai-toggle"
      type="button"
      on:click={onToggleAiHelper}
      title="Open AI Helper (SAZ)"
      class="action-btn px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.1em] border transition-colors whitespace-nowrap inline-flex items-center gap-2
        {aiHelperActive
          ? 'border-[rgba(7,165,201,0.55)] bg-[rgba(7,165,201,0.2)] text-[#caf3ff]'
          : 'border-[rgba(7,165,201,0.28)] bg-[rgba(7,165,201,0.08)] text-[#9fe7ff] hover:bg-[rgba(7,165,201,0.16)]'}"
      style="font-family: 'Space Mono', monospace;"
    >
      <img src="/images/saz.png" alt="" class="w-4 h-4 rounded-full object-cover" />
      AI Helper
    </button>
  </div>
</div>

<style>
  /* Size queries against the tab bar itself, not the viewport, so the bar
     adapts when docked side panels (AI Helper, terminal manager) shrink
     the workspace. */
  .tabs-bar {
    container-type: inline-size;
  }

  .tabs-scroll {
    scrollbar-width: none;
  }
  .tabs-scroll::-webkit-scrollbar {
    display: none;
  }

  /* Compact mode: labels stay visible, padding and font shrink so
     everything still fits on one row. */
  @container (max-width: 900px) {
    .tab-btn {
      padding-left: 0.625rem;
      padding-right: 0.625rem;
      gap: 0.375rem;
      font-size: 0.7rem;
    }
    .actions {
      gap: 0.375rem;
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
    .action-btn {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      font-size: 0.62rem;
    }
  }
</style>
