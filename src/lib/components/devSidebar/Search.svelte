<script lang="ts">
  import {
    Search as SearchIcon,
    FileCode,
    X,
    Loader2,
    ChevronRight,
    ChevronDown,
  } from "lucide-svelte";

  export let fileTree: string[] = [];
  export let containerId: string = "";
  export let onSelectFile: (file: string, lineNumber?: number, searchTerm?: string) => void = () => {};

  let searchQuery: string = "";
  let isSearching: boolean = false;
  let searchResults: FileMatch[] = [];
  let totalMatchCount: number = 0;
  let expandedFiles: Set<string> = new Set();
  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Cache fetched file contents so repeat searches are instant
  let fileContentsCache: Record<string, string> = {};

  interface LineMatch {
    lineNumber: number;
    lineContent: string;
  }

  interface FileMatch {
    filePath: string;
    matches: LineMatch[];
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

  function getFileName(path: string): string {
    return path.split("/").pop() || path;
  }

  function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function highlightMatch(text: string, query: string): string {
    if (!query) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const escapedQuery = escapeHtml(query);
    const regex = new RegExp(
      `(${escapeRegex(escapedQuery)})`,
      "gi",
    );
    return escaped.replace(
      regex,
      `<mark class="bg-[#07a5c9]/30 text-white rounded-sm">$1</mark>`,
    );
  }

  // Fetch a single file's content from container
  async function fetchFileContent(filePath: string): Promise<string | null> {
    if (fileContentsCache[filePath] !== undefined) {
      return fileContentsCache[filePath];
    }
    if (!containerId) return null;

    try {
      const res = await fetch(`/api/container/${containerId}/files/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: `/workspace/${filePath}` }),
      });
      const data = await res.json();
      if (data.success) {
        fileContentsCache[filePath] = data.content;
        return data.content;
      }
    } catch {
      // skip files that can't be read (binary, etc.)
    }
    return null;
  }

  // Search all files for the query
  async function performSearch(query: string) {
    if (!query.trim() || !containerId) {
      searchResults = [];
      totalMatchCount = 0;
      return;
    }

    isSearching = true;
    const lowerQuery = query.toLowerCase();
    const results: FileMatch[] = [];
    let matchCount = 0;

    // Filter out known binary extensions
    const searchableFiles = fileTree.filter((f) => {
      const ext = f.split(".").pop()?.toLowerCase() || "";
      const binaryExts = new Set([
        "png", "jpg", "jpeg", "gif", "ico", "svg", "woff", "woff2",
        "ttf", "eot", "mp3", "mp4", "webm", "zip", "tar", "gz",
      ]);
      return !binaryExts.has(ext);
    });

    // Fetch files in parallel batches of 8
    const batchSize = 8;
    for (let i = 0; i < searchableFiles.length; i += batchSize) {
      const batch = searchableFiles.slice(i, i + batchSize);
      const contents = await Promise.all(
        batch.map((f) =>
          fetchFileContent(f).then((c) => ({ file: f, content: c })),
        ),
      );

      for (const { file, content } of contents) {
        if (!content) continue;
        const lines = content.split("\n");
        const lineMatches: LineMatch[] = [];

        for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
          if (lines[lineIdx].toLowerCase().includes(lowerQuery)) {
            lineMatches.push({
              lineNumber: lineIdx + 1,
              lineContent: lines[lineIdx],
            });
            matchCount++;
          }
        }

        if (lineMatches.length > 0) {
          results.push({ filePath: file, matches: lineMatches });
        }
      }
    }

    searchResults = results;
    totalMatchCount = matchCount;

    // Expand all file groups by default
    expandedFiles = new Set(results.map((r) => r.filePath));
    isSearching = false;
  }

  // Debounced search trigger
  $: {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    const q = searchQuery;
    if (q.trim().length >= 2) {
      searchDebounceTimer = setTimeout(() => performSearch(q), 400);
    } else {
      searchResults = [];
      totalMatchCount = 0;
    }
  }

  function clearSearch() {
    searchQuery = "";
    searchResults = [];
    totalMatchCount = 0;
  }

  function toggleFileExpand(filePath: string) {
    expandedFiles = new Set(expandedFiles);
    if (expandedFiles.has(filePath)) {
      expandedFiles.delete(filePath);
    } else {
      expandedFiles.add(filePath);
    }
  }
</script>

<div class="flex flex-col h-full">
  <!-- Search Input -->
  <div class="p-3 border-b border-[#27272a]">
    <div class="relative">
      <SearchIcon class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#d0d7dd]/40" />
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search in files..."
        class="w-full bg-[#0a0e1a] border border-[#27272a] rounded-md pl-8 pr-8 py-1.5 text-sm text-[#d0d7dd] placeholder-[#d0d7dd]/30 focus:outline-none focus:border-[#07a5c9]/50 transition-colors"
      />
      {#if searchQuery}
        <button
          on:click={clearSearch}
          class="absolute right-2 top-1/2 -translate-y-1/2 text-[#d0d7dd]/40 hover:text-[#d0d7dd] transition-colors"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      {/if}
    </div>
    {#if searchQuery.trim().length > 0 && searchQuery.trim().length < 2}
      <p class="text-[10px] text-[#d0d7dd]/30 mt-1.5 px-0.5">Type at least 2 characters</p>
    {/if}
  </div>

  <!-- Results -->
  <div class="flex-1 overflow-y-auto">
    {#if searchQuery.trim().length < 2}
      <div class="p-4 text-center">
        <SearchIcon class="w-8 h-8 mx-auto mb-2 text-[#d0d7dd]/20" />
        <p class="text-xs text-[#d0d7dd]/40">Search across all files in your workspace</p>
        <p class="text-[10px] text-[#d0d7dd]/25 mt-1">Find code snippets, variables, functions...</p>
      </div>
    {:else if isSearching}
      <div class="p-4 text-center">
        <Loader2 class="w-5 h-5 mx-auto mb-2 text-[#07a5c9] animate-spin" />
        <p class="text-xs text-[#d0d7dd]/40">Searching files...</p>
      </div>
    {:else if searchResults.length === 0}
      <div class="p-4 text-center">
        <p class="text-xs text-[#d0d7dd]/40">
          No results for "<span class="text-[#07a5c9]">{searchQuery}</span>"
        </p>
      </div>
    {:else}
      <div class="py-1">
        <div class="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#d0d7dd]/30 font-semibold">
          {totalMatchCount} match{totalMatchCount !== 1 ? "es" : ""} in {searchResults.length} file{searchResults.length !== 1 ? "s" : ""}
        </div>

        {#each searchResults as fileMatch}
          <!-- File group header -->
          <button
            on:click={() => toggleFileExpand(fileMatch.filePath)}
            class="w-full text-left px-2 py-1 flex items-center gap-1.5 text-[13px] hover:bg-[#2d3446]/40 transition-all"
          >
            {#if expandedFiles.has(fileMatch.filePath)}
              <ChevronDown class="w-3 h-3 flex-shrink-0 text-[#d0d7dd]/40" />
            {:else}
              <ChevronRight class="w-3 h-3 flex-shrink-0 text-[#d0d7dd]/40" />
            {/if}
            <FileCode class="w-3.5 h-3.5 flex-shrink-0 {getFileIconColor(getFileName(fileMatch.filePath))}" />
            <span class="truncate text-[#d0d7dd]/90 font-medium">{getFileName(fileMatch.filePath)}</span>
            <span class="ml-auto text-[10px] text-[#d0d7dd]/25 flex-shrink-0 tabular-nums">
              {fileMatch.matches.length}
            </span>
          </button>

          <!-- Matching lines -->
          {#if expandedFiles.has(fileMatch.filePath)}
            {#each fileMatch.matches as match}
              <button
                on:click={() => onSelectFile(fileMatch.filePath, match.lineNumber, searchQuery)}
                class="w-full text-left pl-9 pr-2 py-0.5 flex items-start gap-2 text-[12px] hover:bg-[#2d3446]/50 transition-all"
              >
                <span class="text-[#d0d7dd]/25 flex-shrink-0 w-6 text-right font-mono text-[10px] leading-[18px] tabular-nums">
                  {match.lineNumber}
                </span>
                <span class="text-[#d0d7dd]/70 truncate leading-[18px] font-mono">
                  {@html highlightMatch(match.lineContent.trim(), searchQuery)}
                </span>
              </button>
            {/each}
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>
