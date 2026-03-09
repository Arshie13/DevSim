<script lang="ts">
  /** Whether this panel is visible. */
  export let visible: boolean;
  /** Terminal sessions to render. */
  export let sessions: { id: string }[] = [];
  /** The currently active terminal session id. */
  export let activeTerminalId: string = '';
  /**
   * Called once per session when its container div first mounts.
   * The parent should initialize xterm into the element.
   */
  export let onElementReady: (id: string, el: HTMLDivElement) => void = () => {};

  function mount(node: HTMLDivElement, sessionId: string) {
    onElementReady(sessionId, node);
    return { destroy() {} };
  }
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

    {#if sessions.length === 0}
      <div class="h-full flex items-center justify-center text-[#8892a0] text-xs font-mono opacity-50">
        No terminal open
      </div>
    {/if}
  </div>
</div>
