<script lang="ts" context="module">
  export interface TreeNode {
    name: string;
    path: string;
    isDirectory: boolean;
    children: TreeNode[];
  }
</script>

<script lang="ts">
  import {
    ChevronRight,
    ChevronDown,
    FolderOpen,
    Folder,
    FileCode,
  } from "lucide-svelte";

  export let fileTree: string[] = [];
  export let selectedFile: string = "";
  export let projectName: string = "project";
  export let onSelectFile: (file: string) => void = () => {};

  let expandedFolders: Set<string> = new Set();

  // Build tree from flat file paths
  function buildFileTree(paths: string[]): TreeNode {
    const root: TreeNode = {
      name: projectName,
      path: "",
      isDirectory: true,
      children: [],
    };

    for (const filePath of paths) {
      const parts = filePath.split("/");
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const currentPath = parts.slice(0, i + 1).join("/");
        const isFile = i === parts.length - 1;

        let existing = current.children.find((c) => c.name === part);
        if (!existing) {
          existing = {
            name: part,
            path: currentPath,
            isDirectory: !isFile,
            children: [],
          };
          current.children.push(existing);
        }
        current = existing;
      }
    }

    function sortTree(node: TreeNode) {
      node.children.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      node.children.forEach(sortTree);
    }
    sortTree(root);

    return root;
  }

  // Reactive tree
  $: treeRoot = buildFileTree(fileTree);

  // Expand root by default when tree changes
  $: if (treeRoot && !expandedFolders.has("")) {
    expandedFolders = new Set([""]);
  }

  function toggleFolder(path: string) {
    expandedFolders = new Set(expandedFolders);
    if (expandedFolders.has(path)) {
      expandedFolders.delete(path);
    } else {
      expandedFolders.add(path);
    }
  }

  // Get file icon color based on extension
  function getFileIconColor(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const colorMap: Record<string, string> = {
      ts: "text-blue-400",
      tsx: "text-blue-400",
      js: "text-yellow-400",
      jsx: "text-yellow-400",
      json: "text-yellow-600",
      css: "text-purple-400",
      scss: "text-pink-400",
      html: "text-orange-400",
      md: "text-gray-400",
      prisma: "text-teal-400",
      env: "text-green-400",
      yml: "text-red-400",
      yaml: "text-red-400",
      config: "text-gray-400",
      lock: "text-gray-600",
    };
    return colorMap[ext] || "text-gray-500";
  }

  function handleSelectFile(file: string) {
    onSelectFile(file);
  }
</script>

<div class="py-1">
  {#snippet renderTree(nodes: TreeNode[], depth: number)}
    {#each nodes as node}
      {#if node.isDirectory}
        <button
          on:click={() => toggleFolder(node.path)}
          class="w-full text-left py-1 pr-2 flex items-center gap-1 text-[13px] transition-all hover:bg-[#2d3446]/60 text-[#d0d7dd]"
          style="padding-left: {depth * 12 + 4}px;"
        >
          {#if expandedFolders.has(node.path)}
            <ChevronDown class="w-3.5 h-3.5 flex-shrink-0 text-[#d0d7dd]/50" />
            <FolderOpen class="w-3.5 h-3.5 flex-shrink-0 text-[#07a5c9]/80" />
          {:else}
            <ChevronRight class="w-3.5 h-3.5 flex-shrink-0 text-[#d0d7dd]/50" />
            <Folder class="w-3.5 h-3.5 flex-shrink-0 text-[#07a5c9]/60" />
          {/if}
          <span class="truncate ml-0.5 font-medium">{node.name}</span>
        </button>
        {#if expandedFolders.has(node.path)}
          {@render renderTree(node.children, depth + 1)}
        {/if}
      {:else}
        <button
          on:click={() => handleSelectFile(node.path)}
          class="w-full text-left py-1 pr-2 flex items-center gap-1 text-[13px] transition-all {selectedFile === node.path
            ? 'bg-[#07a5c9]/15 text-white'
            : 'hover:bg-[#2d3446]/40 text-[#d0d7dd]/80'}"
          style="padding-left: {depth * 12 + 22}px;"
        >
          <FileCode class="w-3.5 h-3.5 flex-shrink-0 {getFileIconColor(node.name)}" />
          <span class="truncate ml-0.5">{node.name}</span>
        </button>
      {/if}
    {/each}
  {/snippet}

  <!-- Project root -->
  <button
    on:click={() => toggleFolder('')}
    class="w-full text-left py-1.5 px-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#d0d7dd]/70 hover:bg-[#2d3446]/40 transition-all"
  >
    {#if expandedFolders.has('')}
      <ChevronDown class="w-3.5 h-3.5 flex-shrink-0" />
    {:else}
      <ChevronRight class="w-3.5 h-3.5 flex-shrink-0" />
    {/if}
    <span class="truncate">{projectName}</span>
  </button>
  {#if expandedFolders.has('')}
    {@render renderTree(treeRoot.children, 1)}
  {/if}
</div>
