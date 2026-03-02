<script lang="ts">
  /** Currently selected file path. */
  export let selectedFile: string;
  /** Whether this panel is visible. */
  export let visible: boolean;
  /** Fired when the user clicks Save. */
  export let onSave: () => void;

  /** Bind this to the editor container div from the parent. */
  export let editorRef: HTMLDivElement;
</script>

<div class:hidden={!visible} class="h-full">
  <div class="h-full flex flex-col">
    <div class="bg-[#12192a] px-4 py-2 border-b border-[#27272a] flex items-center justify-between">
      <span class="text-sm text-[#d0d7dd]/50">{selectedFile}</span>
      <button
        on:click={onSave}
        class="text-xs bg-[#07a5c9] hover:bg-[#07a5c9]/80 px-3 py-1 rounded transition-all"
      >
        Save (Ctrl+S)
      </button>
    </div>
    <div class="flex-1">
      <div bind:this={editorRef} class="w-full h-full"></div>
    </div>
  </div>
</div>
