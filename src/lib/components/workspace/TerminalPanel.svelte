<script lang="ts">
  /** Whether this panel is visible. */
  export let visible: boolean;

  /** Bind this to the terminal container div from the parent. */
  export let terminalRef: HTMLDivElement;
</script>

<div class:hidden={!visible} class="h-full">
  <div class="h-full bg-[#1e1e1e] p-2">
    <div bind:this={terminalRef} class="h-full"></div>
  </div>
</div>
