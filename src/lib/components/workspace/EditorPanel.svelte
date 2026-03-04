<script lang="ts">
  import { Save } from 'lucide-svelte';

  /** Currently selected file path. */
  export let selectedFile: string;
  /** Whether this panel is visible. */
  export let visible: boolean;
  /** Fired when the user clicks Save. */
  export let onSave: () => void;

  /** Bind this to the editor container div from the parent. */
  export let editorRef: HTMLDivElement;

  // Derive file extension for the dot indicator colour
  $: ext = selectedFile?.split('.').pop() ?? '';
  $: dotColor = ['ts', 'tsx'].includes(ext)
    ? '#3b82f6'
    : ['js', 'jsx'].includes(ext)
      ? '#ffb400'
      : ['css', 'scss'].includes(ext)
        ? '#a855f7'
        : ['html', 'svelte'].includes(ext)
          ? '#ff6b35'
          : '#07a5c9';
</script>

<div class:hidden={!visible} class="h-full flex flex-col">
  <!-- File tab bar -->
  <div
    class="bg-[#12192a] px-3 py-1.5 border-b border-[rgba(7,165,201,0.1)] flex items-center justify-between flex-shrink-0"
  >
    <div class="flex items-center gap-2">
      <div
        class="w-2 h-2 rounded-full flex-shrink-0"
        style="background:{dotColor};box-shadow:0 0 6px {dotColor}80;"
      ></div>
      <span class="text-[0.65rem] font-mono text-[#8892a0] tracking-wide truncate max-w-[300px]"
        >{selectedFile}</span
      >
    </div>
    <button
      on:click={onSave}
      class="flex-shrink-0 flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-widest text-[#0a0e1a] bg-[#07a5c9] px-3 py-1 hover:bg-[#00f5ff] transition-all"
      style="clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));font-family:'Orbitron',monospace;"
    >
      <Save class="w-3 h-3" />Save
    </button>
  </div>

  <!-- Editor mount -->
  <div class="flex-1 overflow-hidden">
    <div bind:this={editorRef} class="w-full h-full"></div>
  </div>
</div>
