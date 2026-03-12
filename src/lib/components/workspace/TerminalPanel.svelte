<script lang="ts">
  /** Whether this panel is visible. */
  export let visible: boolean;
  /** Terminal sessions to render. */
  export let sessions: { id: string }[] = [];
  /** The currently active terminal session id. */
  export let activeTerminalId: string = "";
  /**
   * Called once per session when its container div first mounts.
   * The parent should initialize xterm into the element.
   */
  export let onElementReady: (
    id: string,
    el: HTMLDivElement,
  ) => void = () => {};

  function mount(node: HTMLDivElement, sessionId: string) {
    onElementReady(sessionId, node);
    return { destroy() {} };
  }

  /** Callback to refresh the terminal */
  export let onRefresh: (() => void) | null = null;
</script>

<div class:hidden={!visible} class="h-full flex flex-col">
  <div class="flex-1 bg-[#1e1e1e] relative min-h-0">
    {#each sessions as session (session.id)}
      <!-- Each terminal occupies the full area; only the active one is shown -->
      <div
        class="absolute inset-0 p-2"
        class:hidden={session.id !== activeTerminalId}
      >
        <div use:mount={session.id} class="w-full h-full"></div>
      </div>
    {/each}
    <button
      on:click={onRefresh}
      class="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-[#2d2d2d] rounded transition-colors flex items-center gap-1"
      title="Refresh terminal"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      Refresh
    </button>
    {#if sessions.length === 0}
      <div
        class="h-full flex items-center justify-center text-[#8892a0] text-xs font-mono opacity-50"
      >
        No terminal open
      </div>
    {/if}
  </div>
</div>
