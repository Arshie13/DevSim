<script lang="ts">
  import { onDestroy } from "svelte";
  import { CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-svelte";
  import LearningBubble from "$lib/components/workspace/crashcourse/LearningBubble.svelte";

  type LearningTask = {
    id: string;
    taskName: string;
    order: number;
    learningSections: LearningSection[];
  };

  type LearningSection = {
    id: string;
    title: string;
    content: string;
    order: number;
    taskId: string;
  };

  export let open: boolean = false;
  export let tasks: LearningTask[] = [];
  export let isCompleted: boolean = false;
  export let onClose: () => void = () => {};
  export let onComplete: () => void = () => {};

  let taskIndex = 0;
  let sectionIndex = 0;
  let sectionFingerprint = "";

  let typedMessage = "";
  let typingIndex = 0;
  let typingInterval: ReturnType<typeof setInterval> | null = null;
  let completedTypedSections: Set<string> = new Set();

  function getSectionTypingKey(taskId: string, sectionId: string): string {
    return `${taskId}:${sectionId}`;
  }

  function clearTyping() {
    if (!typingInterval) return;
    clearInterval(typingInterval);
    typingInterval = null;
  }

  function startTyping(text: string, sectionKey: string) {
    clearTyping();
    typedMessage = "";
    typingIndex = 0;

    typingInterval = setInterval(() => {
      if (typingIndex >= text.length) {
        completedTypedSections = new Set(completedTypedSections).add(sectionKey);
        clearTyping();
        return;
      }
      typedMessage = text.slice(0, typingIndex + 1);
      typingIndex += 1;
    }, 12);
  }

  $: learningTasks = [...tasks]
    .filter((task) => (task.learningSections?.length ?? 0) > 0)
    .sort((a, b) => a.order - b.order);

  $: {
    const nextFingerprint = learningTasks
      .map((task) => `${task.id}:${task.learningSections.length}`)
      .join("|");
    if (nextFingerprint !== sectionFingerprint) {
      sectionFingerprint = nextFingerprint;
      taskIndex = 0;
      sectionIndex = 0;
      completedTypedSections = new Set();
    }
  }

  $: if (open && taskIndex >= learningTasks.length) {
    taskIndex = 0;
  }

  $: activeTask = learningTasks[taskIndex] ?? null;
  $: activeSections = activeTask?.learningSections ?? [];

  $: if (sectionIndex >= activeSections.length) {
    sectionIndex = 0;
  }

  $: activeSection =
    activeSections[sectionIndex] ??
    {
      id: "fallback",
      title: "Overview",
      content: "No content available.",
      order: 1,
      taskId: activeTask?.id ?? "",
    };

  $: activeSectionTypingKey = getSectionTypingKey(activeSection.taskId, activeSection.id);

  $: if (open) {
    if (isCompleted) {
      clearTyping();
      typedMessage = activeSection.content;
    } else if (completedTypedSections.has(activeSectionTypingKey)) {
      clearTyping();
      typedMessage = activeSection.content;
    } else {
      startTyping(activeSection.content, activeSectionTypingKey);
    }
  } else {
    clearTyping();
    typedMessage = "";
  }

  onDestroy(() => {
    clearTyping();
  });

  function goNextSection() {
    if (sectionIndex < activeSections.length - 1) {
      sectionIndex += 1;
      return;
    }

    if (taskIndex < learningTasks.length - 1) {
      taskIndex += 1;
      sectionIndex = 0;
      return;
    }

    if (isCompleted) {
      onComplete();
      return;
    }

    onComplete();
  }

  function goBackSection() {
    if (sectionIndex > 0) {
      sectionIndex -= 1;
      return;
    }

    if (taskIndex > 0) {
      taskIndex -= 1;
      const previousTask = learningTasks[taskIndex];
      const previousSections = previousTask?.learningSections ?? [];
      sectionIndex = Math.max(previousSections.length - 1, 0);
    }
  }

  function closeCourse() {
    onClose();
  }
</script>

{#if open && learningTasks.length > 0}
  <div
    class="crashcourse-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Crash course"
  >
    <div class="course-shell">
      <LearningBubble
        eyebrow={`Crash Course • Task ${activeTask?.order ?? taskIndex + 1}`}
        title={`${activeSection.title}`}
        body={typedMessage}
      />

      <div class="saz-avatar-wrap" aria-hidden="true">
        <img src="/images/saz-full.png" alt="Saz mentor" class="saz-avatar" />
      </div>

      <div class="course-controls">
        <p class="meta">
          Task {taskIndex + 1} • Section {sectionIndex + 1}/{activeSections.length}
        </p>

        <div class="actions">
          <button
            type="button"
            class="nav-btn"
            on:click={goBackSection}
            disabled={taskIndex === 0 && sectionIndex === 0}
          >
            <ChevronLeft size={14} strokeWidth={2.1} aria-hidden="true" />
            <span>Back</span>
          </button>
          <button type="button" class="nav-btn" on:click={closeCourse}>
            <X size={14} strokeWidth={2.1} aria-hidden="true" />
            <span>Close</span>
          </button>
          <button type="button" class="nav-btn primary" on:click={goNextSection}>
            {#if taskIndex === learningTasks.length - 1 && sectionIndex === activeSections.length - 1}
              <CheckCircle2 size={14} strokeWidth={2.1} aria-hidden="true" />
              <span>{isCompleted ? "Close Finished Crash Course" : "Mark Crash Course Done"}</span>
            {:else}
              <ChevronRight size={14} strokeWidth={2.1} aria-hidden="true" />
              <span>Next</span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .crashcourse-overlay {
    position: fixed;
    inset: 0;
    z-index: 10044;
    display: grid;
    place-items: center;
    background: rgba(3, 8, 18, 0.56);
    backdrop-filter: blur(7px);
    -webkit-backdrop-filter: blur(7px);
  }

  .course-shell {
    position: relative;
    width: min(980px, 96vw);
    min-height: auto;
    display: grid;
    justify-items: center;
    gap: 0.1rem;
  }

  .course-controls {
    width: min(860px, 96vw);
    border: 1px solid rgba(7, 165, 201, 0.24);
    background: rgba(10, 14, 26, 0.94);
    padding: 0.62rem 0.88rem 0.72rem;
  }

  .saz-avatar-wrap {
    position: absolute;
    right: 110px;
    top: 400px;
    z-index: 2;
    background: transparent;
    border: 0;
    box-shadow: none;
    display: block;
    pointer-events: none;
  }

  .saz-avatar {
    width: 150px;
    height: auto;
    object-fit: contain;
    display: block;
  }

  .meta {
    margin: 0 0 0.6rem;
    color: #8892a0;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
  }

  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr 1.4fr;
    gap: 0.5rem;
  }

  .actions .nav-btn {
    border: 1px solid rgba(136, 146, 160, 0.35);
    background: rgba(255, 255, 255, 0.02);
    color: #b7c4d1;
    padding: 0.42rem 0.56rem;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.67rem;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.34rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .actions .nav-btn:hover:not(:disabled) {
    border-color: rgba(7, 165, 201, 0.45);
    color: #d6f6ff;
    background: rgba(7, 165, 201, 0.12);
  }

  .actions .nav-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .actions .nav-btn.primary {
    border-color: rgba(7, 165, 201, 0.5);
    color: #dff8ff;
    background: rgba(7, 165, 201, 0.16);
  }

  .actions .nav-btn span {
    line-height: 1;
  }

  @media (max-width: 900px) {
    .course-shell {
      min-height: auto;
      width: min(700px, 96vw);
    }

    .course-controls {
      width: min(700px, 96vw);
    }

    .saz-avatar-wrap {
      right: 0;
      top: auto;
      bottom: 72px;
      opacity: 0.92;
    }

    .saz-avatar {
      width: 154px;
    }
  }

  @media (max-width: 700px) {
    .course-controls {
      width: min(540px, 94vw);
    }

    .saz-avatar-wrap {
      display: none;
    }
  }
</style>
