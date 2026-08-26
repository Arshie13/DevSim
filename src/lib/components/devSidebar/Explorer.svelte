<script lang="ts" context="module">
  export interface TreeNode {
    name: string;
    path: string;
    isDirectory: boolean;
    children: TreeNode[];
  }
</script>

<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";
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
  import FileActions from "./FileActions.svelte";
  import Modal from "$lib/components/Modal.svelte";

  export let fileTree: string[] = [];
  export let directories: string[] = [];
  export let selectedFile: string = "";
  export let projectName: string = "project";
  export let onSelectFile: (file: string) => void = () => {};
  export let onCreateFile: (parentPath: string, isDirectory: boolean) => void = () => {};
  export let onDeleteFile: (filePath: string, isDirectory: boolean) => void = () => {};
  export let onRenameFile: (oldPath: string, newPath: string) => void = () => {};

  let expandedFolders: Set<string> = new Set();
  let hasInitializedRootFolder = false;

  // Build tree from flat file paths
  function buildFileTree(paths: string[], dirs: string[]): TreeNode {
    const dirSet = new Set(dirs);
    const root: TreeNode = {
      name: projectName,
      path: "",
      isDirectory: true,
      children: [],
    };

    // Build explicit directory nodes first so empty folders are visible.
    for (const dirPath of dirs) {
      if (!dirPath) continue;

      const parts = dirPath.split("/").filter(Boolean);
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const currentPath = parts.slice(0, i + 1).join("/");

        let existing = current.children.find((c) => c.name === part);
        if (!existing) {
          existing = {
            name: part,
            path: currentPath,
            isDirectory: true,
            children: [],
          };
          current.children.push(existing);
        } else if (!existing.isDirectory) {
          existing.isDirectory = true;
        }

        current = existing;
      }
    }

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

  // Expand root once on first load; allow tutorial to collapse it later.
  $: if (treeRoot && !hasInitializedRootFolder) {
    expandedFolders = new Set([""]);
    hasInitializedRootFolder = true;
  }

  function collapseRootFolder() {
    expandedFolders = new Set(expandedFolders);
    expandedFolders.delete("");
  }

  function handleTourCollapseRootFolder() {
    collapseRootFolder();
  }

  onMount(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('devsim-tour-collapse-root-folder', handleTourCollapseRootFolder as EventListener);
  });

  onDestroy(() => {
    if (typeof window === 'undefined') return;
    window.removeEventListener('devsim-tour-collapse-root-folder', handleTourCollapseRootFolder as EventListener);
  });

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
  let contextMenuEl: HTMLDivElement | null = null;
  let contextMenuPosition = { x: 0, y: 0 };

  const CONTEXT_MENU_MARGIN = 8;
  const CONTEXT_MENU_FALLBACK_WIDTH = 180;
  const CONTEXT_MENU_FALLBACK_HEIGHT = 180;

  // Modal state
  let showModal: "createFile" | "createFolder" | "rename" | "delete" | null = null;
  let modalInput: string = "";
  let modalTargetPath: string = "";
  let modalTargetName: string = "";
  let modalIsDirectory: boolean = false;

  function clampContextMenuPosition(x: number, y: number, menuWidth: number, menuHeight: number) {
    const maxX = Math.max(CONTEXT_MENU_MARGIN, window.innerWidth - menuWidth - CONTEXT_MENU_MARGIN);
    const maxY = Math.max(CONTEXT_MENU_MARGIN, window.innerHeight - menuHeight - CONTEXT_MENU_MARGIN);

    return {
      x: Math.min(Math.max(x, CONTEXT_MENU_MARGIN), maxX),
      y: Math.min(Math.max(y, CONTEXT_MENU_MARGIN), maxY),
    };
  }

  function repositionContextMenu() {
    if (!contextMenu) return;

    const rect = contextMenuEl?.getBoundingClientRect();
    const width = rect?.width ?? CONTEXT_MENU_FALLBACK_WIDTH;
    const height = rect?.height ?? CONTEXT_MENU_FALLBACK_HEIGHT;

    contextMenuPosition = clampContextMenuPosition(contextMenu.x, contextMenu.y, width, height);
  }

  async function handleContextMenu(event: MouseEvent, node: TreeNode | null) {
    event.preventDefault();
    event.stopPropagation();
    contextMenu = {
      x: event.clientX,
      y: event.clientY,
      node,
    };

    await tick();
    repositionContextMenu();
  }

  function closeContextMenu() {
    contextMenu = null;
    contextMenuEl = null;
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

  function handleCreateFileFromButton() {
    // Create file at root level
    modalTargetPath = "";
    modalIsDirectory = false;
    modalInput = "";
    showModal = "createFile";
  }

  function handleCreateFolderFromButton() {
    // Create folder at root level
    modalTargetPath = "";
    modalIsDirectory = true;
    modalInput = "";
    showModal = "createFolder";
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
    onDeleteFile(modalTargetPath, modalIsDirectory);
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
      onDeleteFile(modalTargetPath, modalIsDirectory);
    }
    
    closeModal();
  }

  // Close context menu when clicking elsewhere
  function handleWindowClick() {
    if (contextMenu) {
      closeContextMenu();
    }
  }

  function handleWindowResize() {
    if (contextMenu) {
      repositionContextMenu();
    }
  }

  // Reactive modal props
  $: modalProps = (() => {
    switch (showModal) {
      case "createFile":
        return {
          title: "New File",
          inputPlaceholder: "Enter file name",
          message: "",
          confirmText: "Create",
          showInput: true,
          confirmButtonColor: "bg-[#07a5c9]",
        };
      case "createFolder":
        return {
          title: "New Folder",
          inputPlaceholder: "Enter folder name",
          message: "",
          confirmText: "Create",
          showInput: true,
          confirmButtonColor: "bg-[#07a5c9]",
        };
      case "rename":
        return {
          title: `Rename ${modalIsDirectory ? "Folder" : "File"}`,
          inputPlaceholder: "Enter new name",
          message: "",
          confirmText: "Rename",
          showInput: true,
          confirmButtonColor: "bg-[#07a5c9]",
        };
      case "delete":
        return {
          title: `Delete ${modalIsDirectory ? "Folder" : "File"}?`,
          inputPlaceholder: "",
          message: `Are you sure you want to delete "${modalTargetName}"? This action cannot be undone.`,
          confirmText: "Delete",
          showInput: false,
          confirmButtonColor: "bg-red-600",
        };
      default:
        return {
          title: "",
          inputPlaceholder: "",
          message: "",
          confirmText: "",
          showInput: false,
          confirmButtonColor: "",
        };
    }
  })();

  $: isModalOpen = showModal !== null;
</script>

<svelte:window on:resize={handleWindowResize} />

<div class="py-1" on:click={handleWindowClick} role="presentation">
  <FileActions
    onCreateFile={handleCreateFileFromButton}
    onCreateFolder={handleCreateFolderFromButton}
  />
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
        {@const isReadmeFile = /^readme(\..+)?$/i.test(node.name)}
        <button
          on:click={() => handleSelectFile(node.path)}
          on:contextmenu={(e) => handleContextMenu(e, node)}
          data-tour={isReadmeFile ? 'tutorial-readme-file' : undefined}
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
    data-tour="tutorial-workspace-root-toggle"
    class="w-full text-left py-1.5 px-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#d0d7dd]/70 hover:bg-[#2d3446]/40 transition-all"
  >
    {#if expandedFolders.has('')}
      <ChevronDown class="w-3.5 h-3.5 flex-shrink-0" />
    {:else}
      <ChevronRight class="w-3.5 h-3.5 flex-shrink-0" />
    {/if}
    <span class="truncate" data-tour="tutorial-workspace-root-label">{projectName}</span>
  </button>
  {#if expandedFolders.has('')}
    {@render renderTree(treeRoot.children, 1)}
  {/if}
</div>

<!-- Context Menu -->
{#if contextMenu}
  <div
    bind:this={contextMenuEl}
    class="fixed z-50 py-1 min-w-[160px]"
    style="left: {contextMenuPosition.x}px; top: {contextMenuPosition.y}px;background:#12192a;border:1px solid rgba(7,165,201,0.2);border-radius:4px;box-shadow:0 0 24px rgba(7,165,201,0.1),0 8px 32px rgba(0,0,0,0.5);"
    on:click|stopPropagation
    on:keydown={(e) => e.key === 'Escape' && closeContextMenu()}
    role="menu"
    tabindex="-1"
  >
    <!-- Only show New File/New Folder when right-clicking on empty space or a folder -->
    {#if !contextMenu.node || contextMenu.node.isDirectory}
      <button
        on:click={handleCreateFile}
        class="w-full px-3 py-1.5 text-left flex items-center gap-2 text-[0.72rem] text-[#8892a0] hover:text-[#07a5c9] hover:bg-[rgba(7,165,201,0.06)] transition-colors"
        style="font-family:'Share Tech Mono',monospace;"
        role="menuitem"
      >
        <FilePlus class="w-3.5 h-3.5 flex-shrink-0" />
        New File
      </button>
      <button
        on:click={handleCreateFolder}
        class="w-full px-3 py-1.5 text-left flex items-center gap-2 text-[0.72rem] text-[#8892a0] hover:text-[#07a5c9] hover:bg-[rgba(7,165,201,0.06)] transition-colors"
        style="font-family:'Share Tech Mono',monospace;"
        role="menuitem"
      >
        <FolderPlus class="w-3.5 h-3.5 flex-shrink-0" />
        New Folder
      </button>
    {/if}
    {#if contextMenu.node}
      <div class="my-1" style="border-top:1px solid rgba(7,165,201,0.08);"></div>
      <button
        on:click={handleRenameFile}
        class="w-full px-3 py-1.5 text-left flex items-center gap-2 text-[0.72rem] text-[#8892a0] hover:text-[#d0d7dd] hover:bg-[rgba(7,165,201,0.06)] transition-colors"
        style="font-family:'Share Tech Mono',monospace;"
        role="menuitem"
      >
        <Pencil class="w-3.5 h-3.5 flex-shrink-0" />
        Rename
      </button>
      <button
        on:click={handleDeleteFile}
        class="w-full px-3 py-1.5 text-left flex items-center gap-2 text-[0.72rem] text-[#ff3860] hover:bg-[rgba(255,56,96,0.08)] transition-colors"
        style="font-family:'Share Tech Mono',monospace;"
        role="menuitem"
      >
        <Trash2 class="w-3.5 h-3.5 flex-shrink-0" />
        Delete
      </button>
    {/if}
  </div>
{/if}

<!-- Modal -->
<Modal
  show={isModalOpen}
  title={modalProps.title}
  inputPlaceholder={modalProps.inputPlaceholder}
  message={modalProps.message}
  confirmText={modalProps.confirmText}
  showInput={modalProps.showInput}
  confirmButtonColor={modalProps.confirmButtonColor}
  bind:inputValue={modalInput}
  onClose={closeModal}
  onConfirm={showModal === 'delete' ? confirmDelete : submitModal}
/>
