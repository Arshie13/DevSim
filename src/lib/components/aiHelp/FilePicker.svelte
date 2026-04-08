<script lang="ts">
  import { X, FileText, Search, FileCode } from "lucide-svelte";
  import Scrollbar from "$lib/components/ui/Scrollbar.svelte";
  import { filterSourceFiles } from "$lib/utils/aiHelpHelpers";

  export let show: boolean = false;
  export let files: string[] = [];
  export let attachedFiles: { path: string; name: string }[] = [];
  export let onAttach: (path: string) => void = () => {};
  export let onClose: () => void = () => {};
  export let anchorX: number | null = null;
  export let anchorY: number | null = null;

  let searchQuery: string = "";

  $: filteredFiles = filterSourceFiles(files, attachedFiles);
  $: normalizedQuery = searchQuery.trim().toLowerCase();
  $: searchableFiles = normalizedQuery
    ? filteredFiles.filter((filePath) => filePath.toLowerCase().includes(normalizedQuery))
    : filteredFiles;

  function getFileName(path: string): string {
    return path.split("/").pop() || path;
  }

  function getFileDirectory(path: string): string {
    const segments = path.split("/");
    segments.pop();
    return segments.join("/") || "root";
  }

  function getFileIconColor(path: string): string {
    const extension = getFileName(path).split(".").pop()?.toLowerCase() || "";
    const colorByExtension: Record<string, string> = {
      ts: "text-blue-400",
      svelte: "text-orange-400",
      js: "text-yellow-400",
      json: "text-amber-400",
      css: "text-purple-400",
      md: "text-cyan-400",
      yml: "text-red-400",
      yaml: "text-red-400",
      prisma: "text-teal-400"
    };

    return colorByExtension[extension] || "text-cyan-400";
  }
</script>

{#if show}
  <div 
    class="fixed inset-0 z-[60]" 
    onclick={onClose}
    onkeydown={(e) => { if (e.key === 'Escape') onClose(); }}
    role="button"
    tabindex="0"
  >
    <div
      class="absolute"
      style="left: clamp(12px, {anchorX ?? 24}px, calc(100vw - 356px)); top: {anchorY ?? 360}px; transform: translateY(calc(-100% - 10px));"
    >
      <div 
        class="file-picker-pop w-[344px] max-h-[420px] flex flex-col bg-[#0f172a] border-2 border-cyan-400/40 rounded-2xl overflow-hidden shadow-2xl"
        style="box-shadow: 0 0 26px rgba(6, 182, 212, 0.2);"
        onclick={(e) => { e.stopPropagation(); }}
        role="presentation"
      >
        <div class="relative bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-cyan-500/25 px-3 py-2.5">
          <div class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"></div>
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-cyan-500/15 border border-cyan-400/35 flex items-center justify-center">
              <FileText class="w-3.5 h-3.5 text-cyan-300" />
            </div>
            <div>
              <h3 class="text-xs font-bold text-gray-100">Attach Files</h3>
              <p class="text-[10px] text-cyan-300/90">Select files for SAZ context</p>
            </div>
          </div>
          <button
            type="button"
            onclick={onClose}
            onkeydown={(e) => e.key === 'Enter' && onClose()}
            class="text-gray-400 hover:text-gray-200 p-1 rounded-lg hover:bg-slate-800 transition-colors absolute right-3 top-2"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-3 border-b border-cyan-500/20 bg-slate-900/50">
          <div class="relative">
            <Search class="w-4 h-4 text-cyan-400/75 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search files..."
              class="w-full bg-slate-950/70 border border-cyan-500/30 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-500/40"
            />
          </div>
          <div class="mt-2 text-[10px] text-gray-400">
            Showing <span class="text-cyan-300">{searchableFiles.length}</span> of <span class="text-gray-300">{filteredFiles.length}</span> files
          </div>
        </div>

        <Scrollbar className="h-[250px] px-3 pb-3">
          {#if filteredFiles.length === 0}
            <p class="text-gray-400 text-center py-4">No source files available</p>
          {:else if searchableFiles.length === 0}
            <p class="text-gray-400 text-center py-4">No files match your search</p>
          {:else}
            <div class="space-y-1.5 pt-2">
              {#each searchableFiles as filePath}
                <button
                  type="button"
                  onclick={() => onAttach(filePath)}
                  onkeydown={(e) => e.key === 'Enter' && onAttach(filePath)}
                  class="w-full text-left px-2.5 py-2 rounded-lg border border-cyan-500/15 bg-slate-900/30 hover:bg-cyan-500/10 hover:border-cyan-400/45 transition-all group"
                >
                  <div class="flex items-start gap-2 min-w-0">
                    <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-cyan-500/25 bg-slate-950/70">
                      <FileCode class="w-3.5 h-3.5 {getFileIconColor(filePath)}" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="text-xs text-gray-100 truncate group-hover:text-white">{getFileName(filePath)}</div>
                      <div class="text-[10px] text-gray-400 truncate">{getFileDirectory(filePath)}</div>
                    </div>
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        </Scrollbar>

        <div class="pointer-events-none absolute -bottom-1.5 left-4 h-3 w-3 rotate-45 bg-[#0f172a] border-r border-b border-cyan-400/40"></div>
      </div>
    </div>
  </div>
{/if}

<style>
  .file-picker-pop {
    transform-origin: bottom left;
    animation: filePickerPop 220ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes filePickerPop {
    0% {
      opacity: 0;
      transform: translateY(14px) scale(0.9);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
