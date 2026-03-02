<script lang="ts">
  import { Play, Square, Clock, ChevronLeft } from 'lucide-svelte';

  /** Level number displayed in the header. */
  export let level: number;
  /** Level title displayed in the header. */
  export let title: string;
  /** Tech stack label. */
  export let stack: string;
  /** Difficulty label. */
  export let difficulty: string;
  /** Remaining time in seconds. */
  export let timeRemaining: number;
  /** Whether the dev server is currently running. */
  export let isRunning: boolean;

  /** Fired when the user clicks the back button. */
  export let onBack: () => void;
  /** Fired when the user clicks Run. */
  export let onRun: () => void;
  /** Fired when the user clicks Stop. */
  export let onStop: () => void;
  /** Fired when the user clicks Submit Sprint. */
  export let onSubmit: () => void;

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
</script>

<header class="bg-[#12192a] border-b border-[#27272a] px-4 py-3 flex items-center justify-between">
  <div class="flex items-center gap-4">
    <button on:click={onBack} class="hover:bg-[#2d3446] p-2 rounded-lg transition-all">
      <ChevronLeft class="w-5 h-5" />
    </button>
    <div>
      <h1 class="font-bold text-lg">Level {level}: {title}</h1>
      <p class="text-xs text-[#d0d7dd]/50">{stack} • {difficulty}</p>
    </div>
  </div>

  <div class="flex items-center gap-4">
    <div class="flex items-center gap-2 bg-[#2d3446] px-4 py-2 rounded-lg">
      <Clock class="w-4 h-4 text-yellow-400" />
      <span class="font-mono {timeRemaining < 3600 ? 'text-red-400' : 'text-white'}">
        {formatTime(timeRemaining)}
      </span>
    </div>

    <div class="flex items-center gap-2">
      {#if !isRunning}
        <button
          on:click={onRun}
          class="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
        >
          <Play class="w-4 h-4" />
          Run
        </button>
      {:else}
        <button
          on:click={onStop}
          class="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
        >
          <Square class="w-4 h-4" />
          Stop
        </button>
      {/if}

      <button
        on:click={onSubmit}
        class="bg-[#07a5c9] hover:bg-[#07a5c9]/80 px-4 py-2 rounded-lg font-semibold transition-all"
      >
        Submit Sprint
      </button>
    </div>
  </div>
</header>
