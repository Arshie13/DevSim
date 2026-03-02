<script lang="ts">
  import { FilePlus, FolderPlus } from "lucide-svelte";

  export let onCreateFile: () => void = () => {};
  export let onCreateFolder: () => void = () => {};
</script>

<div class="flex items-center gap-1 px-2 py-1.5 border-b border-[#27272a]">
  <button
    on:click={onCreateFile}
    class="flex items-center gap-1.5 px-2 py-1 text-xs text-[#d0d7dd]/70 hover:text-[#d0d7dd] hover:bg-[#2d3446]/60 rounded transition-colors"
    title="New File"
  >
    <FilePlus class="w-3.5 h-3.5" />
    <span>New File</span>
  </button>
  <button
    on:click={onCreateFolder}
    class="flex items-center gap-1.5 px-2 py-1 text-xs text-[#d0d7dd]/70 hover:text-[#d0d7dd] hover:bg-[#2d3446]/60 rounded transition-colors"
    title="New Folder"
  >
    <FolderPlus class="w-3.5 h-3.5" />
    <span>New Folder</span>
  </button>
</div>
