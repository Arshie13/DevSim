<script lang="ts">
  import { FileText, LayoutDashboard, GripVertical } from 'lucide-svelte';
  import type { Task } from '$lib/interface/LevelConfig';

  export let scenario: string = '';
  export let tasks: Task[] = [];
  export let onToggleTask: (taskId: number) => void = () => {};

  // ── Sub-tab state ────────────────────────────────────────────────────────
  let activeSubTab: 'scenario' | 'board' = 'scenario';

  // ── Kanban state ─────────────────────────────────────────────────────────
  type KanbanStatus = 'backlog' | 'in-progress' | 'done';

  interface KanbanTask {
    id: number;
    text: string;
    status: KanbanStatus;
  }

  let kanbanTasks: KanbanTask[] = [];
  let initialized = false;

  // Initialize once from the tasks prop
  $: if (!initialized && tasks.length > 0) {
    kanbanTasks = tasks.map((t) => ({
      id: t.id,
      text: t.text,
      status: t.completed ? 'done' : 'backlog',
    }));
    initialized = true;
  }

  const COLUMNS: { id: KanbanStatus; label: string; color: string; bg: string }[] = [
    { id: 'backlog',     label: 'Backlog',     color: '#8892a0', bg: 'rgba(136,146,160,0.06)' },
    { id: 'in-progress', label: 'In Progress', color: '#FFB400', bg: 'rgba(255,180,0,0.06)'   },
    { id: 'done',        label: 'Done',        color: '#00E5A0', bg: 'rgba(0,229,160,0.06)'   },
  ];

  // ── Drag-and-drop state ──────────────────────────────────────────────────
  let draggingId: number | null = null;
  let dragOverColumn: KanbanStatus | null = null;

  function handleDragStart(e: DragEvent, taskId: number) {
    draggingId = taskId;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(taskId));
    }
  }

  function handleDragOver(e: DragEvent, column: KanbanStatus) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    dragOverColumn = column;
  }

  function handleDragLeave(e: DragEvent, column: KanbanStatus) {
    // Only clear if we're actually leaving the column (not entering a child)
    const related = e.relatedTarget as Node | null;
    const target = e.currentTarget as HTMLElement;
    if (!target.contains(related)) {
      if (dragOverColumn === column) dragOverColumn = null;
    }
  }

  function handleDrop(column: KanbanStatus) {
    if (draggingId === null) return;

    const task = kanbanTasks.find((t) => t.id === draggingId);
    if (!task || task.status === column) {
      draggingId = null;
      dragOverColumn = null;
      return;
    }

    const prevStatus = task.status;
    kanbanTasks = kanbanTasks.map((t) =>
      t.id === draggingId ? { ...t, status: column } : t,
    );

    // Sync completion state to parent
    const wasCompleted = prevStatus === 'done';
    const isNowCompleted = column === 'done';
    if (wasCompleted !== isNowCompleted) {
      onToggleTask(draggingId);
    }

    draggingId = null;
    dragOverColumn = null;
  }

  function handleDragEnd() {
    draggingId = null;
    dragOverColumn = null;
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  $: doneCount = kanbanTasks.filter((t) => t.status === 'done').length;
  $: progress = kanbanTasks.length > 0 ? (doneCount / kanbanTasks.length) * 100 : 0;
</script>

<div class="flex flex-col h-full bg-[#0a0e1a] overflow-hidden">
  <!-- ── View-mode toolbar ─────────────────────────────────────────────── -->
  <div
    class="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(7,165,201,0.1)] bg-[#0a0e1a] flex-shrink-0"
  >
    <!-- Left: section label -->
    <span
      class="text-[0.6rem] uppercase tracking-[0.18em] text-[#8892a0] select-none"
      style="font-family: 'Space Mono', monospace;"
    >
      Project&nbsp;Management
    </span>

    <!-- Centre: pill toggle -->
    <div
      class="relative flex items-center rounded-sm overflow-hidden"
      style="background: #12192a; border: 1px solid rgba(7,165,201,0.18); padding: 3px;"
    >
      <!-- Sliding highlight -->
      <div
        class="absolute top-[3px] bottom-[3px] rounded-sm transition-all duration-200 pointer-events-none"
        style="
          width: calc(50% - 3px);
          left: {activeSubTab === 'scenario' ? '3px' : 'calc(50%)'};
          background: rgba(7,165,201,0.15);
          border: 1px solid rgba(7,165,201,0.35);
          box-shadow: 0 0 8px rgba(7,165,201,0.2);
        "
      ></div>

      <!-- Scenario button -->
      <button
        on:click={() => (activeSubTab = 'scenario')}
        class="relative z-10 flex items-center gap-1.5 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.1em] transition-colors duration-150 rounded-sm"
        style="font-family: 'Space Mono', monospace; color: {activeSubTab === 'scenario' ? '#07a5c9' : '#8892a0'};"
      >
        <FileText class="w-3 h-3 flex-shrink-0" />
        Scenario
      </button>

      <!-- Kanban button -->
      <button
        on:click={() => (activeSubTab = 'board')}
        class="relative z-10 flex items-center gap-1.5 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.1em] transition-colors duration-150 rounded-sm"
        style="font-family: 'Space Mono', monospace; color: {activeSubTab === 'board' ? '#07a5c9' : '#8892a0'};"
      >
        <LayoutDashboard class="w-3 h-3 flex-shrink-0" />
        Kanban
      </button>
    </div>

    <!-- Right: progress pill -->
    <div class="flex items-center gap-2.5">
      <div class="w-16 h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-700"
          style="width: {progress}%; background: linear-gradient(90deg, #07a5c9, #00F5FF); box-shadow: 0 0 8px rgba(7,165,201,0.4);"
        ></div>
      </div>
      <span
        class="text-[0.6rem] text-[#8892a0] tabular-nums"
        style="font-family: 'Space Mono', monospace;"
      >
        {doneCount}/{kanbanTasks.length}
      </span>
    </div>
  </div>

  <!-- ── Content ────────────────────────────────────────────────────────── -->
  <div class="flex-1 overflow-auto">
    <!-- SCENARIO PANEL -------------------------------------------------- -->
    {#if activeSubTab === 'scenario'}
      <div class="p-6 max-w-3xl mx-auto">
        <!-- Label -->
        <p
          class="text-[0.65rem] uppercase tracking-widest text-[#8892a0] mb-4"
          style="font-family: 'Space Mono', monospace;"
        >
          // Sprint Brief
        </p>

        <!-- Scenario text card -->
        <div
          class="rounded border border-[rgba(7,165,201,0.15)] bg-[#12192a] p-5 relative overflow-hidden"
        >
          <!-- Top shimmer line -->
          <div
            class="absolute inset-x-0 top-0 h-px"
            style="background: linear-gradient(90deg, transparent, rgba(7,165,201,0.4), transparent);"
          ></div>

          <p
            class="text-[0.9rem] text-[#d0d7dd]/80 leading-relaxed"
            style="font-family: 'Exo 2', sans-serif;"
          >
            {scenario || 'No scenario description available.'}
          </p>
        </div>

        <!-- Task summary below scenario -->
        {#if kanbanTasks.length > 0}
          <div class="mt-6">
            <p
              class="text-[0.65rem] uppercase tracking-widest text-[#8892a0] mb-3"
              style="font-family: 'Space Mono', monospace;"
            >
              // Sprint Tasks
            </p>

            <div class="space-y-2">
              {#each kanbanTasks as t}
                <div
                  class="flex items-center gap-3 px-4 py-2.5 rounded border transition-colors
                    {t.status === 'done'
                      ? 'border-[rgba(0,229,160,0.2)] bg-[rgba(0,229,160,0.04)]'
                      : t.status === 'in-progress'
                        ? 'border-[rgba(255,180,0,0.2)] bg-[rgba(255,180,0,0.04)]'
                        : 'border-[rgba(7,165,201,0.1)] bg-[#12192a]'}"
                >
                  <!-- Status dot -->
                  <div
                    class="w-2 h-2 rounded-full flex-shrink-0"
                    style="background: {t.status === 'done' ? '#00E5A0' : t.status === 'in-progress' ? '#FFB400' : '#2d3446'}; border: 1px solid {t.status === 'done' ? '#00E5A0' : t.status === 'in-progress' ? '#FFB400' : '#8892a0'};"
                  ></div>
                  <span
                    class="text-[0.82rem] flex-1"
                    style="font-family: 'Exo 2', sans-serif; color: {t.status === 'done' ? '#8892a0' : '#d0d7dd'}; {t.status === 'done' ? 'text-decoration: line-through;' : ''}"
                  >
                    {t.text}
                  </span>
                  <!-- Status label -->
                  <span
                    class="text-[0.6rem] uppercase tracking-wider px-2 py-0.5 rounded"
                    style="font-family: 'Space Mono', monospace; color: {t.status === 'done' ? '#00E5A0' : t.status === 'in-progress' ? '#FFB400' : '#8892a0'}; background: {t.status === 'done' ? 'rgba(0,229,160,0.08)' : t.status === 'in-progress' ? 'rgba(255,180,0,0.08)' : 'rgba(136,146,160,0.08)'};"
                  >
                    {t.status === 'in-progress' ? 'In Progress' : t.status === 'done' ? 'Done' : 'Backlog'}
                  </span>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

    <!-- KANBAN PANEL ----------------------------------------------------- -->
    {:else}
      <div class="p-4 flex gap-3 h-full min-h-0">
        {#each COLUMNS as col}
          <!-- Kanban column -->
          <div
            class="flex-1 min-w-0 flex flex-col rounded border transition-all duration-200"
            style="border-color: {dragOverColumn === col.id ? col.color + '66' : 'rgba(7,165,201,0.12)'}; background: {dragOverColumn === col.id ? col.bg : '#12192a'};"
            on:dragover={(e) => handleDragOver(e, col.id)}
            on:dragleave={(e) => handleDragLeave(e, col.id)}
            on:drop={() => handleDrop(col.id)}
            role="list"
            aria-label="{col.label} column"
          >
            <!-- Column header -->
            <div
              class="px-3 py-2.5 border-b flex items-center gap-2 flex-shrink-0"
              style="border-color: rgba(7,165,201,0.08);"
            >
              <div
                class="w-2 h-2 rounded-full flex-shrink-0"
                style="background: {col.color}; box-shadow: 0 0 6px {col.color}66;"
              ></div>
              <span
                class="text-[0.65rem] uppercase tracking-widest font-semibold"
                style="font-family: 'Space Mono', monospace; color: {col.color};"
              >
                {col.label}
              </span>
              <span
                class="ml-auto text-[0.6rem] px-2 py-0.5 rounded"
                style="font-family: 'Space Mono', monospace; color: {col.color}; background: {col.bg};"
              >
                {kanbanTasks.filter((t) => t.status === col.id).length}
              </span>
            </div>

            <!-- Task cards -->
            <div class="flex-1 p-2 space-y-2 overflow-y-auto">
              {#each kanbanTasks.filter((t) => t.status === col.id) as task (task.id)}
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y-no-static-element-interactions -->
                <div
                  draggable="true"
                  on:dragstart={(e) => handleDragStart(e, task.id)}
                  on:dragend={handleDragEnd}
                  on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault(); }}
                  class="group p-3 rounded border transition-all duration-150 select-none"
                  style="cursor: grab; border-color: {draggingId === task.id ? col.color + '66' : 'rgba(7,165,201,0.15)'}; background: {draggingId === task.id ? 'rgba(7,165,201,0.06)' : '#0a0e1a'}; opacity: {draggingId === task.id ? 0.45 : 1};"
                  role="button"
                  tabindex="0"
                  aria-label="Drag task: {task.text}"
                >
                  <div class="flex items-start gap-2">
                    <!-- Drag handle -->
                    <GripVertical
                      class="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-20 group-hover:opacity-60 transition-opacity"
                      style="color: {col.color};"
                    />
                    <!-- Checkbox indicator -->
                    <div
                      class="mt-0.5 w-3 h-3 flex-shrink-0 rounded-sm border transition-all"
                      style="border-color: {col.color}; background: {task.status === 'done' ? col.color : 'transparent'};"
                    ></div>
                    <!-- Task text -->
                    <span
                      class="text-[0.8rem] leading-snug"
                      style="font-family: 'Exo 2', sans-serif; color: {task.status === 'done' ? '#8892a0' : '#d0d7dd'}; {task.status === 'done' ? 'text-decoration: line-through;' : ''}"
                    >
                      {task.text}
                    </span>
                  </div>
                </div>
              {/each}

              <!-- Empty column placeholder -->
              {#if kanbanTasks.filter((t) => t.status === col.id).length === 0}
                <div
                  class="flex items-center justify-center h-16 border border-dashed rounded text-[0.65rem] transition-colors"
                  style="border-color: {dragOverColumn === col.id ? col.color + '66' : 'rgba(7,165,201,0.1)'}; color: {dragOverColumn === col.id ? col.color : '#8892a0'}; font-family: 'Space Mono', monospace;"
                >
                  {dragOverColumn === col.id ? '↓ Drop here' : 'Empty'}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
