<script lang="ts">
  import { Save } from 'lucide-svelte';
  import FileTabBar from './FileTabBar.svelte';
  import type { FileTab } from './FileTabBar.svelte';

  /** Whether this panel is visible. */
  export let visible: boolean;
  /** Fired when the user clicks Save (or presses Ctrl+S). */
  export let onSave: () => void;
  /** Bind this to the editor container div from the parent. */
  export let editorRef: HTMLDivElement;

  // ── File tab bar props ───────────────────────────────────────────────────
  export let openTabs: FileTab[] = [];
  export let activeTabId: string = '';
  export let onFileTabClick: (id: string) => void = () => {};
  export let onFileTabClose: (id: string) => void = () => {};
</script>

<div class:hidden={!visible} class="h-full flex flex-col">
  <!-- Multi-file tab bar + Save button -->
  <div class="flex items-stretch bg-[#0d1321] border-b border-[rgba(7,165,201,0.1)] flex-shrink-0">
    <!-- Scrollable file tabs -->
    <div class="flex-1 min-w-0">
      <FileTabBar
        tabs={openTabs}
        {activeTabId}
        onTabClick={onFileTabClick}
        onTabClose={onFileTabClose}
      />
    </div>

    <!-- Save button — pinned to the right -->
    <div class="flex-shrink-0 flex items-center px-2 border-l border-[rgba(7,165,201,0.1)]">
      <button
        on:click={onSave}
        class="flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-widest
               text-[#0a0e1a] bg-[#07a5c9] px-3 py-1 hover:bg-[#00f5ff] transition-all"
        style="clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));font-family:'Orbitron',monospace;"
      >
        <Save class="w-3 h-3" />Save
      </button>
    </div>
  </div>

  <!-- Editor mount -->
  <div class="flex-1 overflow-hidden">
    <div bind:this={editorRef} class="w-full h-full"></div>
  </div>
</div>
