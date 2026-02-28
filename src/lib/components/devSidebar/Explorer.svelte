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
    FilePlus,
    FolderPlus,
    Trash2,
    Pencil,
  } from "lucide-svelte";

  export let fileTree: string[] = [];
  export let directories: string[] = [];
  export let selectedFile: string = "";
  export let projectName: string = "project";
  export let onSelectFile: (file: string) => void = () => {};
  export let onCreateFile: (parentPath: string, isDirectory: boolean) => void = () => {};
  export let onDeleteFile: (filePath: string) => void = () => {};
  export let onRenameFile: (oldPath: string, newPath: string) => void = () => {};

  let expandedFolders: Set<string> = new Set();

  // Build tree from flat file paths
  function buildFileTree(paths: string[], dirs: string[]): TreeNode {
    const dirSet = new Set(dirs);
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
        // Check if this path is explicitly a directory or if it's an intermediate path
        const isDirectory = dirSet.has(currentPath) || (i < parts.length - 1);

        let existing = current.children.find((c) => c.name === part);
        if (!existing) {
          existing = {
            name: part,
            path: currentPath,
            isDirectory,
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
  $: treeRoot = buildFileTree(fileTree, directories);

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

  // Context menu state
  let contextMenu: { x: number; y: number; node: TreeNode | null } | null = null;

  // Modal state
  let showModal: "createFile" | "createFolder" | "rename" | "delete" | null = null;
  let modalInput: string = "";
  let modalTargetPath: string = "";
  let modalTargetName: string = "";
  let modalIsDirectory: boolean = false;

  function handleContextMenu(event: MouseEvent, node: TreeNode | null) {
    event.preventDefault();
    event.stopPropagation();
    contextMenu = {
      x: event.clientX,
      y: event.clientY,
      node,
    };
  }

  function closeContextMenu() {
    contextMenu = null;
  }

  function handleCreateFile() {
    if (!contextMenu) return;
    const parentPath = contextMenu.node?.path || "";
    closeContextMenu();
    
    // Open modal for file creation
    modalTargetPath = parentPath;
    modalIsDirectory = false;
    modalInput = "";
    showModal = "createFile";
  }

  function handleCreateFolder() {
    if (!contextMenu) return;
    const parentPath = contextMenu.node?.path || "";
    closeContextMenu();
    
    // Open modal for folder creation
    modalTargetPath = parentPath;
    modalIsDirectory = true;
    modalInput = "";
    showModal = "createFolder";
  }

  function handleDeleteFile() {
    if (!contextMenu || !contextMenu.node) return;
    const filePath = contextMenu.node.path;
    const fileName = contextMenu.node.name;
    const isDirectory = contextMenu.node.isDirectory;
    closeContextMenu();
    
    // Open modal for delete confirmation
    modalTargetPath = filePath;
    modalTargetName = fileName;
    modalIsDirectory = isDirectory;
    showModal = "delete";
  }

  function handleRenameFile() {
    if (!contextMenu || !contextMenu.node) return;
    const oldPath = contextMenu.node.path;
    const oldName = contextMenu.node.name;
    const isDirectory = contextMenu.node.isDirectory;
    closeContextMenu();
    
    // Open modal for rename
    modalTargetPath = oldPath;
    modalTargetName = oldName;
    modalIsDirectory = isDirectory;
    modalInput = oldName;
    showModal = "rename";
  }

  function closeModal() {
    showModal = null;
    modalInput = "";
    modalTargetPath = "";
    modalTargetName = "";
  }

  function confirmDelete() {
    onDeleteFile(modalTargetPath);
    closeModal();
  }

  function submitModal() {
    if (!modalInput.trim() && showModal !== 'delete') return;
    
    if (showModal === "createFile") {
      const fullPath = modalTargetPath ? `${modalTargetPath}/${modalInput}` : modalInput;
      onCreateFile(fullPath, false);
    } else if (showModal === "createFolder") {
      const fullPath = modalTargetPath ? `${modalTargetPath}/${modalInput}` : modalInput;
      onCreateFile(fullPath, true);
    } else if (showModal === "rename") {
      if (modalInput !== modalTargetName) {
        // Construct new path
        const pathParts = modalTargetPath.split("/");
        pathParts.pop();
        const newPath = pathParts.length > 0 ? `${pathParts.join("/")}/${modalInput}` : modalInput;
        onRenameFile(modalTargetPath, newPath);
      }
    } else if (showModal === "delete") {
      onDeleteFile(modalTargetPath);
    }
    
    closeModal();
  }

  // Close context menu when clicking elsewhere
  function handleWindowClick() {
    if (contextMenu) {
      closeContextMenu();
    }
  }
</script>

<div class="py-1" on:click={handleWindowClick} role="presentation">
  {#snippet renderTree(nodes: TreeNode[], depth: number)}
    {#each nodes as node}
      {#if node.isDirectory}
        <button
          on:click={() => toggleFolder(node.path)}
          on:contextmenu={(e) => handleContextMenu(e, node)}
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
          on:contextmenu={(e) => handleContextMenu(e, node)}
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
    on:contextmenu={(e) => handleContextMenu(e, treeRoot)}
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

<!-- Context Menu -->
{#if contextMenu}
  <div
    class="fixed z-50 bg-[#1e1e1e] border border-[#27272a] rounded-lg shadow-xl py-1 min-w-[160px]"
    style="left: {contextMenu.x}px; top: {contextMenu.y}px;"
    on:click|stopPropagation
    on:keydown={(e) => e.key === 'Escape' && closeContextMenu()}
    role="menu"
    tabindex="-1"
  >
    <button
      on:click={handleCreateFile}
      class="w-full px-3 py-1.5 text-left text-sm text-[#d0d7dd] hover:bg-[#2d3446] flex items-center gap-2"
      role="menuitem"
    >
      <FilePlus class="w-4 h-4" />
      New File
    </button>
    <button
      on:click={handleCreateFolder}
      class="w-full px-3 py-1.5 text-left text-sm text-[#d0d7dd] hover:bg-[#2d3446] flex items-center gap-2"
      role="menuitem"
    >
      <FolderPlus class="w-4 h-4" />
      New Folder
    </button>
    {#if contextMenu.node}
      <div class="border-t border-[#27272a] my-1"></div>
      <button
        on:click={handleRenameFile}
        class="w-full px-3 py-1.5 text-left text-sm text-[#d0d7dd] hover:bg-[#2d3446] flex items-center gap-2"
        role="menuitem"
      >
        <Pencil class="w-4 h-4" />
        Rename
      </button>
      <button
        on:click={handleDeleteFile}
        class="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-[#2d3446] flex items-center gap-2"
        role="menuitem"
      >
        <Trash2 class="w-4 h-4" />
        Delete
      </button>
    {/if}
  </div>
{/if}

<!-- Modal -->
{#if showModal}
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    role="dialog"
    tabindex="-1"
  >
    <div 
      class="bg-[#1e1e1e] border border-[#27272a] rounded-lg shadow-xl p-4 w-80"
      role="document"
    >
      {#if showModal === 'createFile'}
        <h3 class="text-lg font-semibold mb-4 text-[#d0d7dd]">New File</h3>
        <input
          type="text"
          bind:value={modalInput}
          placeholder="Enter file name"
          class="w-full px-3 py-2 bg-[#2d3446] border border-[#27272a] rounded text-[#d0d7dd] placeholder-[#d0d7dd]/30 focus:outline-none focus:border-[#07a5c9]"
          on:keydown={(e) => e.key === 'Enter' && submitModal()}
        />
        <div class="flex justify-end gap-2 mt-4">
          <button
            on:click={closeModal}
            class="px-4 py-2 text-sm text-[#d0d7dd] hover:bg-[#2d3446] rounded transition-colors"
          >
            Cancel
          </button>
          <button
            on:click={submitModal}
            class="px-4 py-2 text-sm bg-[#07a5c9] text-white rounded hover:bg-[#07a5c9]/80 transition-colors"
          >
            Create
          </button>
        </div>
      {:else if showModal === 'createFolder'}
        <h3 class="text-lg font-semibold mb-4 text-[#d0d7dd]">New Folder</h3>
        <input
          type="text"
          bind:value={modalInput}
          placeholder="Enter folder name"
          class="w-full px-3 py-2 bg-[#2d3446] border border-[#27272a] rounded text-[#d0d7dd] placeholder-[#d0d7dd]/30 focus:outline-none focus:border-[#07a5c9]"
          on:keydown={(e) => e.key === 'Enter' && submitModal()}
        />
        <div class="flex justify-end gap-2 mt-4">
          <button
            on:click={closeModal}
            class="px-4 py-2 text-sm text-[#d0d7dd] hover:bg-[#2d3446] rounded transition-colors"
          >
            Cancel
          </button>
          <button
            on:click={submitModal}
            class="px-4 py-2 text-sm bg-[#07a5c9] text-white rounded hover:bg-[#07a5c9]/80 transition-colors"
          >
            Create
          </button>
        </div>
      {:else if showModal === 'rename'}
        <h3 class="text-lg font-semibold mb-4 text-[#d0d7dd]">Rename {modalIsDirectory ? 'Folder' : 'File'}</h3>
        <input
          type="text"
          bind:value={modalInput}
          placeholder="Enter new name"
          class="w-full px-3 py-2 bg-[#2d3446] border border-[#27272a] rounded text-[#d0d7dd] placeholder-[#d0d7dd]/30 focus:outline-none focus:border-[#07a5c9]"     
          on:keydown={(e) => e.key === 'Enter' && submitModal()}
        />
        <div class="flex justify-end gap-2 mt-4">
          <button
            on:click={closeModal}
            class="px-4 py-2 text-sm text-[#d0d7dd] hover:bg-[#2d3446] rounded transition-colors"
          >
            Cancel
          </button>
          <button
            on:click={submitModal}
            class="px-4 py-2 text-sm bg-[#07a5c9] text-white rounded hover:bg-[#07a5c9]/80 transition-colors"
          >
            Rename
          </button>
        </div>
      {:else if showModal === 'delete'}
        <h3 class="text-lg font-semibold mb-4 text-[#d0d7dd]">Delete {modalIsDirectory ? 'Folder' : 'File'}?</h3>
        <p class="text-sm text-[#d0d7dd]/70 mb-4">
          Are you sure you want to delete "{modalTargetName}"? This action cannot be undone.
        </p>
        <div class="flex justify-end gap-2">
          <button
            on:click={closeModal}
            class="px-4 py-2 text-sm text-[#d0d7dd] hover:bg-[#2d3446] rounded transition-colors"
          >
            Cancel
          </button>
          <button
            on:click={confirmDelete}
            class="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
