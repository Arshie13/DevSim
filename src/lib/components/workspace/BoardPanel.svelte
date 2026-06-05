<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { FileText, LayoutDashboard, GripVertical, Lightbulb, LightbulbOff, Lock } from 'lucide-svelte';
  import TaskModal from '$lib/components/workspace/TaskModal.svelte';
  import { type ITask, type IHints } from '$lib/types';
  import { toast } from '$lib/stores/toast';

  export let scenario: string = '';
  type KanbanStatus = 'backlog' | 'in-progress' | 'in-review' | 'done';
  type BoardTask = ITask & { boardStatus?: KanbanStatus };

  export let tasks: BoardTask[] = [];
  export let onTaskStatusChange: (taskId: string, status: KanbanStatus) => void = () => {};
  export let crashCourseLockedTasks: Record<string, boolean> = {};
  export let onTaskClickBlocked: (taskId: string) => void = () => {};

  // ── Hints toggle state ─────────────────────────────────────────────────────
  let showHints = false;
  let activeSubTab: 'scenario' | 'board' = 'scenario';

  // ── Kanban state ─────────────────────────────────────────────────────────
  interface KanbanTask {
    id: string;
    text: string;
    order: number;
    status: KanbanStatus;
    taskType: string;
    userStory: string;
    acceptanceCriteria: string[];
    hints: { id: string; content: string; order: number }[];
  }

  let kanbanTasks: KanbanTask[] = [];
  let taskFingerprint = '';

  // Re-initialize whenever the set of tasks changes (e.g. advancing to a new level).
  // The fingerprint is based on task id+text so that toggling `completed` in the
  // parent (via onTaskStatusChange) does NOT trigger a spurious board reset.
  function getInitialStatus(task: BoardTask): KanbanStatus {
    if (task.boardStatus) return task.boardStatus;
    return task.isCompleted ? 'done' : 'backlog';
  }

  function refreshTasks(incoming: BoardTask[]) {
    kanbanTasks = incoming.map((t) => ({
      id: t.id,
      text: t.taskName,
      order: t.order,
      status: getInitialStatus(t),
      taskType: t.testType,
      userStory: ((t as ITask & { userStory?: string }).userStory ?? '').trim(),
      acceptanceCriteria: (t.acceptanceCriteria ?? [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((criteria) => criteria.description)
        .filter(Boolean),
      hints: (t.hints ?? [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((h) => ({ id: h.id, content: (h as any).description ?? h.content, order: h.order }))
        .filter(Boolean),
    }));
  }

  function getBlockingTask(targetTask: KanbanTask): KanbanTask | null {
    const ordered = [...kanbanTasks].sort((a, b) => a.order - b.order);
    const targetIndex = ordered.findIndex((task) => task.id === targetTask.id);
    if (targetIndex <= 0) return null;

    for (let i = 0; i < targetIndex; i += 1) {
      if (ordered[i].status !== 'done') {
        return ordered[i];
      }
    }

    return null;
  }

  $: {
    const newFingerprint = tasks
      .map((t) => `${t.id}:${t.taskName}:${getInitialStatus(t)}`)
      .join('|');
    if (newFingerprint !== taskFingerprint && tasks.length > 0) {
      taskFingerprint = newFingerprint;
      refreshTasks(tasks);
    }
  }

  const COLUMNS: { id: KanbanStatus; label: string; color: string; bg: string }[] = [
    { id: 'backlog',     label: 'Backlog',     color: '#8892a0', bg: 'rgba(136,146,160,0.06)' },
    { id: 'in-progress', label: 'In Progress', color: '#FFB400', bg: 'rgba(255,180,0,0.06)'   },
    { id: 'in-review',   label: 'In Review',   color: '#07A5C9', bg: 'rgba(7,165,201,0.08)'    },
    { id: 'done',        label: 'Done',        color: '#00E5A0', bg: 'rgba(0,229,160,0.06)'   },
  ];

  // ── Drag-and-drop state ──────────────────────────────────────────────────
  let draggingId: string | null = null;
  let dragOverColumn: KanbanStatus | null = null;
  let taskModalOpen = false;
  let selectedTask: KanbanTask | null = null;

  function openTaskDetails(taskId: string) {
    const task = kanbanTasks.find((t) => t.id === taskId);
    if (!task) return;
    
    if (crashCourseLockedTasks[taskId]) {
      onTaskClickBlocked(taskId);
      return;
    }
    
    selectedTask = task;
    taskModalOpen = true;
  }

  function closeTaskDetails() {
    taskModalOpen = false;
  }

  function handleTourBoardSubTab(event: Event) {
    const customEvent = event as CustomEvent<{ subTab?: 'scenario' | 'board' }>;
    const subTab = customEvent.detail?.subTab;
    if (subTab === 'scenario' || subTab === 'board') {
      activeSubTab = subTab;
    }
  }

  function handleTourOpenTaskModal() {
    if (kanbanTasks.length === 0) return;
    openTaskDetails(kanbanTasks[0].id);
  }

  function handleTourCloseTaskModal() {
    closeTaskDetails();
  }

  onMount(() => {
    window.addEventListener('devsim-tour-board-subtab', handleTourBoardSubTab as EventListener);
    window.addEventListener('devsim-tour-open-task-modal', handleTourOpenTaskModal);
    window.addEventListener('devsim-tour-close-task-modal', handleTourCloseTaskModal);
  });

  onDestroy(() => {
    window.removeEventListener('devsim-tour-board-subtab', handleTourBoardSubTab as EventListener);
    window.removeEventListener('devsim-tour-open-task-modal', handleTourOpenTaskModal);
    window.removeEventListener('devsim-tour-close-task-modal', handleTourCloseTaskModal);
  });

  function handleDragStart(e: DragEvent, taskId: string) {
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

    if (crashCourseLockedTasks[draggingId] && column !== 'backlog') {
      toast.warn('Complete the crash course for this task before moving it forward.');
      draggingId = null;
      dragOverColumn = null;
      return;
    }

    const canManuallyMoveToDone = task.taskType.toLowerCase() === 'none';
    const requiresOrderGate = column === 'in-progress' || column === 'in-review' || column === 'done';

    if (requiresOrderGate) {
      const blockingTask = getBlockingTask(task);
      if (blockingTask) {
        toast.warn(
          `Finish Task ${blockingTask.order} first before moving Task ${task.order} to ${column.replace('-', ' ')}.`,
        );
        draggingId = null;
        dragOverColumn = null;
        return;
      }
    }

    if (task.status === 'done' && !canManuallyMoveToDone && column !== 'done') {
      toast.info('This task is locked in Done because its tests have already passed.');
      draggingId = null;
      dragOverColumn = null;
      return;
    }

    if (column === 'done' && !canManuallyMoveToDone) {
      toast.warn(
        'This task includes test cases. Pass its tests first, and it will be moved to Done automatically.',
      );
      draggingId = null;
      dragOverColumn = null;
      return;
    }

    kanbanTasks = kanbanTasks.map((t) =>
      t.id === draggingId ? { ...t, status: column } : t,
    );

    onTaskStatusChange(draggingId, column);

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

<div class="flex flex-col h-full bg-[#0a0e1a] overflow-hidden" data-tour="board-panel">
  <!-- ── View-mode toolbar ─────────────────────────────────────────────── -->
  <div
    class="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(7,165,201,0.1)] bg-[#0a0e1a] flex-shrink-0"
  >
    <!-- Left: section label -->
    <span
      class="text-[1rem] uppercase tracking-[0.18em] text-[#8892a0] select-none"
      style="font-family: 'Space Mono', monospace;"
    >
      A B I D E
    </span>

    <!-- Centre: pill toggle -->
    <div
      data-tour="board-subtab-toggle"
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
        data-tour="board-subtab-scenario"
        on:click={() => (activeSubTab = 'scenario')}
        class="relative flex items-center gap-1.5 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.1em] transition-colors duration-150 rounded-sm"
        style="font-family: 'Space Mono', monospace; color: {activeSubTab === 'scenario' ? '#07a5c9' : '#8892a0'};"
      >
        <FileText class="w-3 h-3 flex-shrink-0" />
        Scenario
      </button>

      <!-- Kanban button -->
      <button
        data-tour="board-subtab-kanban"
        on:click={() => (activeSubTab = 'board')}
        class="relative flex items-center gap-1.5 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.1em] transition-colors duration-150 rounded-sm"
        style="font-family: 'Space Mono', monospace; color: {activeSubTab === 'board' ? '#07a5c9' : '#8892a0'};"
      >
        <LayoutDashboard class="w-3 h-3 flex-shrink-0" />
        Kanban
      </button>
    </div>

    <!-- Right: progress pill + hints toggle -->
    <div class="flex items-center gap-2.5">
      <div class="w-20 h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-700"
          style="width: {progress}%; background: linear-gradient(90deg, #07a5c9, #00F5FF); box-shadow: 0 0 8px rgba(7,165,201,0.4);"
        ></div>
      </div>
      <span
        class="text-[0.8rem] text-[#8892a0] tabular-nums"
        style="font-family: 'Space Mono', monospace;"
      >
        {doneCount}/{kanbanTasks.length}
      </span>
      <!-- Hints toggle button -->
      <button
        on:click={() => (showHints = !showHints)}
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors duration-150"
        style="font-family: 'Space Mono', monospace; color: {showHints ? '#FFB400' : '#8892a0'}; background: {showHints ? 'rgba(255,180,0,0.12)' : 'transparent'}; border: 1px solid {showHints ? 'rgba(255,180,0,0.35)' : 'rgba(7,165,201,0.18)'};"
        title={showHints ? 'Hide task hints' : 'Show task hints'}
      >
        {#if showHints}
          <Lightbulb class="w-3.5 h-3.5" />
        {:else}
          <LightbulbOff class="w-3.5 h-3.5" />
        {/if}
        <span class="text-[0.6rem] uppercase tracking-wider">Hints</span>
      </button>
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
                      : t.status === 'in-review'
                        ? 'border-[rgba(7,165,201,0.3)] bg-[rgba(7,165,201,0.08)]'
                      : t.status === 'in-progress'
                        ? 'border-[rgba(255,180,0,0.2)] bg-[rgba(255,180,0,0.04)]'
                        : 'border-[rgba(7,165,201,0.1)] bg-[#12192a]'}
                    {crashCourseLockedTasks[t.id] ? 'opacity-60 cursor-not-allowed border-[rgba(255,180,0,0.3)] bg-[rgba(255,180,0,0.04)]' : ''}"
                  role="button"
                  tabindex="0"
                  on:click={() => openTaskDetails(t.id)}
                  on:keydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openTaskDetails(t.id);
                    }
                  }}
                >
                  <!-- Status dot -->
                  <div
                    class="w-2 h-2 rounded-full flex-shrink-0"
                    style="background: {t.status === 'done' ? '#00E5A0' : t.status === 'in-review' ? '#07A5C9' : t.status === 'in-progress' ? '#FFB400' : '#2d3446'}; border: 1px solid {t.status === 'done' ? '#00E5A0' : t.status === 'in-review' ? '#07A5C9' : t.status === 'in-progress' ? '#FFB400' : '#8892a0'};"
                  ></div>
                  <span
                    class="text-[0.82rem] flex-1"
                    style="font-family: 'Exo 2', sans-serif; color: {t.status === 'done' ? '#8892a0' : '#d0d7dd'}; {t.status === 'done' ? 'text-decoration: line-through;' : ''}"
                  >
                    {t.text}
                  </span>
                  {#if crashCourseLockedTasks[t.id]}
                    <Lock class="w-3.5 h-3.5 text-[#FFB400] flex-shrink-0" />
                  {/if}
                  <!-- Status label -->
                  <span
                    class="text-[0.6rem] uppercase tracking-wider px-2 py-0.5 rounded"
                    style="font-family: 'Space Mono', monospace; color: {t.status === 'done' ? '#00E5A0' : t.status === 'in-review' ? '#07A5C9' : t.status === 'in-progress' ? '#FFB400' : '#8892a0'}; background: {t.status === 'done' ? 'rgba(0,229,160,0.08)' : t.status === 'in-review' ? 'rgba(7,165,201,0.12)' : t.status === 'in-progress' ? 'rgba(255,180,0,0.08)' : 'rgba(136,146,160,0.08)'};"
                  >
                    {t.status === 'in-progress' ? 'In Progress' : t.status === 'in-review' ? 'In Review' : t.status === 'done' ? 'Done' : 'Backlog'}
                  </span>
                  <!-- Hints display (when enabled) -->
                  {#if showHints && t.hints && t.hints.length > 0}
                    <div class="mt-2 w-full">
                      <p
                        class="text-[0.55rem] uppercase tracking-wider text-[#FFB400] mb-1"
                        style="font-family: 'Space Mono', monospace;"
                      >
                        Hints:
                      </p>
                      <div class="space-y-1">
                        {#each t.hints as hint, idx}
                          <div
                            class="text-[0.75rem] text-[#d0d7dd]/70 px-2 py-1 rounded bg-[rgba(255,180,0,0.06)] border border-[rgba(255,180,0,0.15)]"
                            style="font-family: 'Exo 2', sans-serif;"
                          >
                            {idx + 1}. {hint.content}
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

    <!-- KANBAN PANEL ----------------------------------------------------- -->
    {:else}
      <div class="p-4 flex gap-3 h-full min-h-0" data-tour="board-kanban-lanes">
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
              {#each kanbanTasks.filter((t) => t.status === col.id) as task, taskIndex (task.id)}
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y-no-static-element-interactions -->
                <div
                  data-tour={task.order === 1 ? 'board-task-ticket' : task.order === 2 ? 'board-task-ticket-2' : undefined}
                  draggable={!(task.status === 'done' && task.taskType.toLowerCase() !== 'none')}
                  on:dragstart={(e) => handleDragStart(e, task.id)}
                  on:dragend={handleDragEnd}
                  on:click={() => openTaskDetails(task.id)}
                  on:keydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openTaskDetails(task.id);
                    }
                  }}
                  class="group p-3 rounded border transition-all duration-150 select-none"
                  style="cursor: {task.status === 'done' && task.taskType.toLowerCase() !== 'none' ? 'default' : crashCourseLockedTasks[task.id] ? 'not-allowed' : 'grab'}; border-color: {draggingId === task.id ? col.color + '66' : crashCourseLockedTasks[task.id] ? 'rgba(255,180,0,0.3)' : 'rgba(7,165,201,0.15)'}; background: {draggingId === task.id ? 'rgba(7,165,201,0.06)' : crashCourseLockedTasks[task.id] ? 'rgba(255,180,0,0.04)' : '#0a0e1a'}; opacity: {draggingId === task.id ? 0.45 : crashCourseLockedTasks[task.id] ? 0.7 : 1};"
                  role="button"
                  tabindex="0"
                  aria-label="Drag Task {task.order}: {task.text}"
                >
                  <div class="mb-2 flex justify-start">
                    <span
                      class="text-[0.58rem] uppercase tracking-wider px-1 py-0.5 rounded"
                      style="font-family: 'Space Mono', monospace; color: {col.color}; background: {col.bg}; border: 1px solid {col.color}44;"
                    >
                      Task {task.order}
                    </span>
                  </div>
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
                      class="text-[0.8rem] leading-snug flex-1"
                      style="font-family: 'Exo 2', sans-serif; color: {task.status === 'done' ? '#8892a0' : '#d0d7dd'}; {task.status === 'done' ? 'text-decoration: line-through;' : ''}"
                    >
                      {task.text}
                    </span>
                    {#if crashCourseLockedTasks[task.id]}
                      <Lock class="w-3.5 h-3.5 text-[#FFB400] flex-shrink-0 mt-0.5" />
                    {/if}
                  </div>
                </div>
              {/each}

              <!-- Empty column placeholder -->
              {#if kanbanTasks.filter((t) => t.status === col.id).length === 0}
                <div
                  class="flex items-center justify-center h-16 border border-dashed rounded text-[0.65rem] transition-colors"
                  style="border-color: {dragOverColumn === col.id ? col.color + '66' : 'rgba(7,165,201,0.1)'}; color: {dragOverColumn === col.id ? col.color : '#8892a0'}; font-family: 'Space Mono', monospace;"
                >
                  {#if col.id === 'done'}
                    Pass tests to auto-complete
                  {:else}
                    {dragOverColumn === col.id ? '↓ Drop here' : 'Empty'}
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <TaskModal
    open={taskModalOpen}
    title={selectedTask?.text ?? ''}
    userStory={selectedTask?.userStory ?? ''}
    acceptanceCriteria={selectedTask?.acceptanceCriteria ?? []}
    hints={selectedTask?.hints ?? []}
    status={selectedTask?.status ?? 'backlog'}
    onClose={closeTaskDetails}
    isLocked={crashCourseLockedTasks[selectedTask?.id] ?? false}
  />
</div>
