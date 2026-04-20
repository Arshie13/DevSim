<script lang="ts">
  interface Props {
    level: number;
    title: string;
    stack: string;
    difficulty: string;
    timeRemaining: number;
    isRunning: boolean;
    isDownloading: boolean;
    onBack: () => void;
    onRun: () => void;
    onStop: () => void;
    onDemo: () => void;
    onSubmit: () => void;
    onDownload: () => void;
  }

  import {
    Play,
    Square,
    Clock,
    ChevronLeft,
    Zap,
    Download,
    Globe,
  } from "lucide-svelte";

  export let data: Props;
  let level: number;
  let title: string;
  let stack: string;
  let difficulty: string;
  let timeRemaining: number;
  let isRunning: boolean;
  let isDownloading: boolean;
  let onBack: () => void;
  let onRun: () => void;
  let onStop: () => void;
  let onDemo: () => void;
  let onSubmit: () => void;
  let onDownload: () => void;

  $: ({
    level,
    title,
    stack,
    difficulty,
    timeRemaining,
    isRunning,
    isDownloading,
    onBack,
    onRun,
    onStop,
    onDemo,
    onSubmit,
    onDownload,
  } = data);

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  $: timeColor =
    timeRemaining < 3600
      ? "#ff3860"
      : timeRemaining < 7200
        ? "#ffb400"
        : "#07a5c9";
  $: difficultyStyle =
    difficulty === "Hard"
      ? "color:#ff3860;border-color:rgba(255,56,96,0.3);background:rgba(255,56,96,0.06);"
      : difficulty === "Medium"
        ? "color:#ffb400;border-color:rgba(255,180,0,0.3);background:rgba(255,180,0,0.06);"
        : "color:#00e5a0;border-color:rgba(0,229,160,0.3);background:rgba(0,229,160,0.06);";
</script>

<header
  class="relative bg-[#0a0e1a] border-b border-[rgba(7,165,201,0.15)] px-3 py-2 flex items-center justify-between z-10"
  style="box-shadow: 0 1px 20px rgba(7,165,201,0.06);"
>
  <!-- Left section -->
  <div class="flex items-center gap-2">
    <!-- Back -->
    <button
      on:click={onBack}
      class="w-8 h-8 flex items-center justify-center text-[#8892a0] hover:text-[#07a5c9] hover:bg-[rgba(7,165,201,0.08)] border border-transparent hover:border-[rgba(7,165,201,0.2)] transition-all"
      style="clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));"
      title="Back to Dashboard"
    >
      <ChevronLeft class="w-4 h-4" />
    </button>

    <div class="w-px h-5 bg-[rgba(7,165,201,0.12)] mx-1"></div>

    <!-- Level info -->
    <div>
      <div class="flex items-center gap-2">
        <span
          class="text-[0.8rem] font-mono text-[#07a5c9] tracking-widest uppercase"
          >LVL {level.toString().padStart(2, "0")}</span
        >
        <span
          class="text-base font-bold text-[#d0d7dd] tracking-wide"
          style="font-family:'Orbitron',monospace;">{title}</span
        >
        <span
          class="text-[0.65rem] px-1.5 py-0.5 ml-2 border font-mono uppercase tracking-wide"
          style="border-radius:2px;{difficultyStyle}">{difficulty}</span
        >
      </div>
      <div class="flex items-center gap-2 mt-0.5">
        <span
          class="text-[0.78rem] font-mono text-[#8892a0] uppercase tracking-wider"
          >{stack}</span
        >
        <span class="text-[#27272a]">&middot;</span>
      </div>
    </div>
  </div>

  <!-- Centre: countdown -->
  <div
    class="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-[#12192a] border border-[rgba(7,165,201,0.15)]"
    style="clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));box-shadow:0 0 12px rgba(7,165,201,0.06);"
  >
    <Clock class="w-4 h-4 flex-shrink-0" style="color:{timeColor};" />
    <span
      class="text-base font-bold tracking-widest"
      style="color:{timeColor};font-family:'Share Tech Mono',monospace;"
      >{formatTime(timeRemaining)}</span
    >
  </div>

  <!-- Right section -->
  <div class="flex items-center gap-2">
    <div class="flex items-center gap-2" data-tour="workspace-action-buttons">
      <!-- Run / Stop -->
      {#if !isRunning}
        <button
          data-tour="run-button"
          on:click={onRun}
          class="px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-widest text-[#00e5a0] border border-[rgba(0,229,160,0.4)] bg-transparent hover:bg-[rgba(0,229,160,0.08)] flex items-center gap-1.5 transition-all"
          style="clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));font-family:'Orbitron',monospace;"
        >
          <Play class="w-3.5 h-3.5" />Run
        </button>
      {:else}
        <button
          data-tour="run-button"
          on:click={onStop}
          class="px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-widest text-[#ff3860] border border-[rgba(255,56,96,0.4)] bg-transparent hover:bg-[rgba(255,56,96,0.08)] flex items-center gap-1.5 transition-all"
          style="clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));font-family:'Orbitron',monospace;"
        >
          <Square class="w-3.5 h-3.5" />Stop
        </button>
      {/if}

      <button
        data-tour="demo-button"
        on:click={onDemo}
        class="px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-widest text-[#07a5c9] border border-[rgba(7,165,201,0.35)] bg-transparent hover:bg-[rgba(7,165,201,0.08)] flex items-center gap-1.5 transition-all"
        style="clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));font-family:'Orbitron',monospace;"
      >
        <Globe class="w-3.5 h-3.5" />Demo
      </button>

      <!-- Test Button Slot -->
      <slot name="test-button" />

      <!-- Debug Button Slot -->
      <slot name="debug-button" />
    </div>

    <!-- Download Project -->
    <button
      on:click={onDownload}
      disabled={isDownloading}
      class="px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed {isDownloading
        ? 'text-[#07a5c9] border border-[rgba(7,165,201,0.4)] bg-[rgba(7,165,201,0.08)]'
        : 'text-[#8892a0] border border-[rgba(136,146,160,0.4)] bg-transparent hover:bg-[rgba(136,146,160,0.08)]'}"
      style="clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));font-family:'Orbitron',monospace;"
      title="Download project to upload to GitHub"
    >
      {#if isDownloading}
        <span
          class="animate-spin w-3.5 h-3.5 border-2 border-[#07a5c9] border-t-transparent rounded-full"
        ></span>
        Downloading...
      {:else}
        <Download class="w-3.5 h-3.5" />Download
      {/if}
    </button>

    <div class="w-px h-5 bg-[rgba(7,165,201,0.12)] mx-1"></div>
        <!-- Submit Sprint -->
    <button
      on:click={onSubmit}
      class="px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-widest text-[#0a0e1a] bg-[#07a5c9] border border-[#07a5c9] hover:bg-[#00f5ff] hover:border-[#00f5ff] flex items-center gap-1.5 transition-all"
      style="clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));font-family:'Orbitron',monospace;box-shadow:0 0 14px rgba(7,165,201,0.35);"
    >
      <Zap class="w-3.5 h-3.5" />Submit Sprint
    </button>
  </div>
</header>
