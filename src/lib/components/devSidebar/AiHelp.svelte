<script lang="ts">
  import { Send, AlertTriangle, Bot, User, Coins, X, MessageSquare, Paperclip, File, FileText } from "lucide-svelte";
  import { aiChatHistory, aiCoins, aiSelectedFile, aiFileTree, aiFileContents } from "./PrimarySidebar.svelte";
  import { isAskingForCode, getCodeWarningMessage, getInsufficientCoinsMessage, getErrorMessage, getApiErrorMessage, formatMessage as formatMessageContent } from "$lib/ai";

  export let scenario: string = "";
  export let tasks: { id: number; text: string; completed: boolean }[] = [];
  export let containerId: string = "";
  export let userId: string = "";
  export let projectName: string = "DevSim Project";
  
  // Mode: 'chat' for full chat interface, 'quick' for just button-triggered hints
  // Default to 'quick' to show the button in the AI Helper tab
  export let mode: 'chat' | 'quick' = 'quick';
  
  // Allow initial values to be set from parent, but use stores for persistence
  export let initialSelectedFile: string = "";
  export let initialFileTree: string[] = [];
  export let initialFileContents: Record<string, string> = {};
  // Allow initial coin value to be set from parent, but use store for persistence
  export let initialCoins: number = 1000;

  // Maximum number of files that can be attached
  const MAX_ATTACHED_FILES = 3;

  // Attached files state
  let attachedFiles: { path: string; name: string }[] = [];
  let showFilePicker: boolean = false;
  let filteredFileTree: string[] = [];

  // Filter file tree to show only relevant source files
  $: {
    const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.vue', '.py', '.java', '.go', '.rs', '.json', '.html', '.css', '.scss'];
    filteredFileTree = initialFileTree.filter(f => 
      sourceExtensions.some(ext => f.endsWith(ext)) &&
      !attachedFiles.some(af => af.path === f)
    ).slice(0, 50); // Limit to 50 files for performance
  }

  // Check if we can attach more files
  $: canAttachMore = attachedFiles.length < MAX_ATTACHED_FILES;

  // Use a combined object that merges props and stores for context
  // This ensures we always have the latest data
  // We prioritize the store value after first interaction to ensure coin updates reflect
  $: currentSelectedFile = initialSelectedFile || $aiSelectedFile;
  $: currentFileTree = initialFileTree.length > 0 ? initialFileTree : $aiFileTree;
  $: currentFileContents = Object.keys(initialFileContents).length > 0 ? initialFileContents : $aiFileContents;
  // Use store value after the first update (when store has been set from API response)
  $: currentCoins = ($aiCoins !== 1000 || initialCoins === 1000) ? $aiCoins : initialCoins;

  // Update stores for persistence (these don't affect the current* vars above)
  $: if (initialSelectedFile) aiSelectedFile.set(initialSelectedFile);
  $: if (initialFileTree.length > 0) aiFileTree.set(initialFileTree);
  $: if (Object.keys(initialFileContents).length > 0) aiFileContents.set(initialFileContents);
  $: if (initialCoins !== 1000) aiCoins.set(initialCoins);

  // Coin costs per hint type
  const QUICK_HINT_COST = 100;  // Button-triggered hints based on progress
  const CHAT_HINT_COST = 200;   // Full chat with conversation history
  const ATTACHED_FILE_COST = 15; // Cost per attached file

  // Get the base hint cost based on mode
  $: hintCost = mode === 'quick' ? QUICK_HINT_COST : CHAT_HINT_COST;
  
  // Calculate total cost including attached files
  $: totalCost = hintCost + (attachedFiles.length * ATTACHED_FILE_COST);

  // Chat state - use store for persistence across tab switches
  let userMessage: string = "";
  let isLoading: boolean = false;
  let chatContainer: HTMLDivElement;
  let previousMessageCount: number = 0;

  // Track if user is manually scrolling
  let userScrolling = false;

  // Quick hint mode state
  let showQuickHint: boolean = false;
  let quickHintMessage: string = "";
  let quickHintLoading: boolean = false;

  // Only scroll to bottom when new messages are added (not on every change)
  $: {
    const currentCount = $aiChatHistory.length;
    if (currentCount > previousMessageCount && !userScrolling && chatContainer) {
      setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 50);
    }
    previousMessageCount = currentCount;
  }

  // Track user scroll interaction
  function handleScroll() {
    if (!chatContainer) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainer;
    // If user scrolls up away from bottom, set userScrolling = true
    // If user scrolls to bottom, allow auto-scroll again
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    userScrolling = !isAtBottom;
  }

  // Generate context from current state - includes file contents and task progress
  async function generateContext(): Promise<string> {
    let context = `=== PROJECT OVERVIEW ===\n`;
    context += `Project: ${projectName || 'DevSim Workspace'}\n`;
    context += `Scenario: ${scenario}\n\n`;
    
    // Add conversation history for context (for chat mode)
    if (mode === 'chat') {
      const chatHistory = $aiChatHistory;
      if (chatHistory.length > 0) {
        context += `=== RECENT CONVERSATION ===\n`;
        // Show last 4 messages for context
        const recentHistory = chatHistory.slice(-4);
        recentHistory.forEach((msg) => {
          const role = msg.role === "user" ? "User" : "AI";
          const content = msg.content.length > 500 
            ? msg.content.substring(0, 500) + "..."
            : msg.content;
          context += `${role}: ${content}\n`;
        });
        context += "\n";
      }
    }
    
    // Use the reactive current* vars which have latest props data
    const selectedFile = currentSelectedFile;
    const fileContents = currentFileContents;
    const fileTree = currentFileTree;
    
    // Add file tree - show all files for context
    if (fileTree.length > 0) {
      context += `Project Files (${fileTree.length} files):\n`;
      // Show first 30 files to avoid context overflow
      const filesToShow = fileTree.slice(0, 30);
      filesToShow.forEach((file) => {
        context += `- ${file}\n`;
      });
      if (fileTree.length > 30) {
        context += `- ... and ${fileTree.length - 30} more files\n`;
      }
      context += "\n";
    }
    
    // Try to read multiple files for better context
    // Focus on source files that are likely important
    const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.vue', '.py', '.java', '.go', '.rs'];
    const importantFiles = fileTree.filter(f => sourceExtensions.some(ext => f.endsWith(ext)));
    
    // Prioritize the selected file first, then read others
    const filesToRead: string[] = [];
    
    // Always include the selected file if we have one
    if (selectedFile) {
      filesToRead.push(selectedFile);
    }
    
    // Add up to 4 more important files we don't have content for
    for (const file of importantFiles) {
      if (filesToRead.length >= 5) break;
      if (!fileContents[file] && file !== selectedFile) {
        filesToRead.push(file);
      }
    }
    
    // Fetch missing file contents in parallel
    if (filesToRead.length > 0 && containerId) {
      try {
        const fetchPromises = filesToRead.map(async (file) => {
          try {
            const res = await fetch(`/api/docker/container/${containerId}/files/read`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: `/workspace/${file}` }),
            });
            const data = await res.json();
            if (data.success) {
              return { file, content: data.content };
            }
          } catch (e) {
            console.error(`Error reading file ${file}:`, e);
          }
          return null;
        });
        
        const results = await Promise.all(fetchPromises);
        console.log('[AI Helper] File fetch results:', results.length, 'files');
        for (const result of results) {
          if (result) {
            console.log('[AI Helper] Adding file to context:', result.file);
            fileContents[result.file] = result.content;
          }
        }
      } catch (e) {
        console.error("[AI Helper] Error fetching file contents:", e);
      }
    }
    
    // Add content of files with line numbers
    const filesWithContent = filesToRead.filter(f => fileContents[f]);
    
    for (const file of filesWithContent) {
      if (!file) continue;
      const content = fileContents[file];
      if (content) {
        context += `=== File: ${file} ===\n`;
        // Add line numbers to help with context
        const lines = content.split('\n');
        const maxLines = 200; // Increased for more context
        const linesToShow = lines.slice(0, maxLines);
        
        linesToShow.forEach((line, index) => {
          const lineNum = index + 1;
          context += `${lineNum}: ${line}\n`;
        });
        
        if (lines.length > maxLines) {
          context += `... (showing first ${maxLines} of ${lines.length} lines)\n`;
        }
        context += "\n";
      }
    }
    
  // Add attached files to the context
    if (attachedFiles.length > 0) {
      console.log('[AI Helper] Reading attached files:', attachedFiles);
      context += `=== ATTACHED FILES (${attachedFiles.length}/${MAX_ATTACHED_FILES}) ===\n`;
      
      // Fetch contents of attached files
      const attachedFetchPromises = attachedFiles.map(async (file) => {
        try {
          const filePath = `/workspace/${file.path}`;
          console.log('[AI Helper] Fetching file:', filePath);
          const res = await fetch(`/api/docker/container/${containerId}/files/read`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: filePath }),
          });
          const data = await res.json();
          console.log('[AI Helper] File result:', file.path, 'success:', data.success);
          if (data.success) {
            return { file, content: data.content };
          }
        } catch (e) {
          console.error(`[AI Helper] Error reading attached file ${file.path}:`, e);
        }
        return null;
      });
      
      const attachedResults = await Promise.all(attachedFetchPromises);
      
      for (const result of attachedResults) {
        if (result) {
          const { file, content } = result;
          context += `--- ${file.name} ---\n`;
          const lines = content.split('\n');
          const maxLines = 150; // More lines for attached files
          const linesToShow = lines.slice(0, maxLines);
          
          linesToShow.forEach((line: string, index: number) => {
            const lineNum = index + 1;
            context += `${lineNum}: ${line}\n`;
          });
          
          if (lines.length > maxLines) {
            context += `... (showing first ${maxLines} of ${lines.length} lines)\n`;
          }
          context += "\n";
        }
      }
    }
    
    // Add task progress context - this is crucial for context awareness
    context += `Your Progress (Tasks):\n`;
    
    console.log('[AI Helper] Full context being sent (first 500 chars):', context.substring(0, 500));
    const completedCount = tasks.filter(t => t.completed).length;
    context += `Completed: ${completedCount}/${tasks.length}\n`;
    tasks.forEach((task) => {
      const status = task.completed ? "[✓]" : "[ ]";
      context += `${status} ${task.text}\n`;
    });
    
    return context;
  }

  // Send message to AI (for chat mode)
  async function sendMessage() {
    if (!userMessage.trim() || isLoading) return;

    const message = userMessage.trim();
    userMessage = "";

    // Check if asking for code
    if (isAskingForCode(message)) {
      aiChatHistory.update(msgs => [
        ...msgs,
        {
          role: "user",
          content: message,
        },
        {
          role: "ai",
          content: getCodeWarningMessage(),
          isWarning: true,
        },
      ]);
      return;
    }

    // Check if user has enough coins (including attached file costs)
    if (currentCoins < totalCost) {
      aiChatHistory.update(msgs => [
        ...msgs,
        {
          role: "user",
          content: message,
        },
        {
          role: "ai",
          content: getInsufficientCoinsMessage(totalCost, currentCoins),
          isWarning: true,
        },
      ]);
      return;
    }

    // Add message to chat history with attached files if any
    const filesToInclude = [...attachedFiles];
    const filesCount = filesToInclude.length;
    aiChatHistory.update(msgs => [...msgs, { role: "user", content: message, attachedFiles: filesCount > 0 ? filesToInclude : undefined }]);
    isLoading = true;

    try {
      // Generate context (now async to fetch file contents)
      const context = await generateContext();
      
      // Clear attached files after generating context
      attachedFiles = [];
      
      const response = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context,
          containerId,
          userId,
          hintType: mode,
          attachedFilesCount: filesCount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        aiChatHistory.update(msgs => [...msgs, { role: "ai", content: data.hint }]);
        // Update coin balance in store and force re-render
        if (data.coinsRemaining !== undefined) {
          aiCoins.set(data.coinsRemaining);
          // Also update the initialCoins prop to keep them in sync
          initialCoins = data.coinsRemaining;
        }
      } else {
        aiChatHistory.update(msgs => [
          ...msgs,
          {
            role: "ai",
            content: getApiErrorMessage(data.error),
          },
        ]);
      }
    } catch (error) {
      console.error("Error getting AI hint:", error);
      aiChatHistory.update(msgs => [
        ...msgs,
        {
          role: "ai",
          content: getErrorMessage(),
        },
      ]);
    } finally {
      isLoading = false;
    }
  }

  // Quick hint - triggered by button without requiring chat
  async function requestQuickHint() {
    if (isLoading || !containerId || !userId) return;
    
    // Check coins first (including attached file costs)
    if (currentCoins < totalCost) {
      quickHintMessage = getInsufficientCoinsMessage(totalCost, currentCoins);
      showQuickHint = true;
      return;
    }

    quickHintLoading = true;
    showQuickHint = true;
    quickHintMessage = "";

    // Save attached files count before clearing
    const attachedFilesCount = attachedFiles.length;

    try {
      // Build context from current state
      const context = await generateContext();
      
      // Clear attached files after requesting hint
      attachedFiles = [];
      
      // Default hint message based on current progress
      const hintMessage = `I'm working on the current task. Can you give me a hint on what to do next based on my progress?`;
      
      const response = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: hintMessage,
          context,
          containerId,
          userId,
          hintType: mode,
          attachedFilesCount: attachedFilesCount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        quickHintMessage = data.hint;
        // Update coin balance
        if (data.coinsRemaining !== undefined) {
          aiCoins.set(data.coinsRemaining);
          initialCoins = data.coinsRemaining;
        }
      } else {
        quickHintMessage = getApiErrorMessage(data.error);
      }
    } catch (error) {
      console.error("Error getting quick hint:", error);
      quickHintMessage = getErrorMessage();
    } finally {
      quickHintLoading = false;
    }
  }

  function closeQuickHint() {
    showQuickHint = false;
    quickHintMessage = "";
  }

  function attachFile(filePath: string) {
    if (!canAttachMore) return;
    
    const fileName = filePath.split('/').pop() || filePath;
    attachedFiles = [...attachedFiles, { path: filePath, name: fileName }];
    showFilePicker = false;
  }

  function removeAttachedFile(filePath: string) {
    attachedFiles = attachedFiles.filter(f => f.path !== filePath);
  }

  // Handle enter key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  // Helper for conditional classes
  function getMessageClasses(msg: { role: "user" | "ai"; isWarning?: boolean }): string {
    let classes = "max-w-[85%] p-3 rounded-lg text-sm ";
    if (msg.role === "user") {
      classes += "bg-cyan-600/20 text-gray-100";
    } else if (msg.isWarning) {
      classes += "bg-yellow-600/20 border border-yellow-600/50 text-yellow-200";
    } else {
      classes += "bg-slate-900/60 text-gray-300";
    }
    return classes;
  }

  function getIconClasses(msg: { role: "user" | "ai"; isWarning?: boolean }): string {
    let classes = "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ";
    if (msg.role === "user") {
      classes += "bg-cyan-500";
    } else if (msg.isWarning) {
      classes += "bg-yellow-600";
    } else {
      classes += "bg-slate-700";
    }
    return classes;
  }

  // Format message content
  function formatMessage(content: string): string {
    return formatMessageContent(content);
  }

  $: canSend = userMessage.trim().length > 0 && !isLoading;
</script>

<!-- Quick Hint Button - Always visible in AI Helper tab -->
<div class="p-4 border-b border-zinc-800">
  <button
    on:click={requestQuickHint}
    disabled={quickHintLoading || !containerId || !userId}
    class="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg transition-all text-sm font-medium text-white"
  >
    <Bot class="w-4 h-4" />
    Get Quick Hint
  </button>
  
  {#if currentCoins < QUICK_HINT_COST}
    <p class="text-xs text-yellow-500 text-center mt-2">
      ⚠️ Not enough coins ({currentCoins}/{QUICK_HINT_COST})
    </p>
  {:else}
    <p class="text-xs text-gray-500 text-center mt-2">
      💰 Quick hint: {QUICK_HINT_COST} coins | Chat: {CHAT_HINT_COST} coins
    </p>
  {/if}
  
  <!-- Toggle between Quick and Chat mode -->
  <div class="flex gap-2 mt-3">
    <button
      on:click={() => mode = 'quick'}
      class="flex-1 py-1 px-2 text-xs rounded transition-all {mode === 'quick' ? 'bg-cyan-500 text-white' : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'}"
    >
      ⚡ Quick
    </button>
    <button
      on:click={() => mode = 'chat'}
      class="flex-1 py-1 px-2 text-xs rounded transition-all {mode === 'chat' ? 'bg-cyan-500 text-white' : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'}"
    >
      💬 Chat
    </button>
  </div>
</div>

<!-- Quick Hint Result Modal -->
{#if showQuickHint}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={closeQuickHint}>
    <div class="bg-[#12192a] border border-[#27272a] rounded-lg max-w-md w-full p-4" on:click|stopPropagation>
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <Bot class="w-5 h-5 text-cyan-500" />
          <span class="font-medium text-gray-200">AI Hint</span>
        </div>
        <button on:click={closeQuickHint} class="text-gray-400 hover:text-gray-200">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      {#if quickHintLoading}
        <div class="flex items-center justify-center py-8">
          <div class="flex gap-1">
            <span class="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 0ms;"></span>
            <span class="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 150ms;"></span>
            <span class="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 300ms;"></span>
          </div>
        </div>
      {:else}
        <div class="text-sm text-gray-300 whitespace-pre-wrap">
          {@html formatMessage(quickHintMessage)}
        </div>
        <div class="mt-3 pt-3 border-t border-[#27272a] flex items-center justify-between text-xs text-gray-500">
          <span>Coins spent: {QUICK_HINT_COST}</span>
          <span>Coins remaining: {initialCoins}</span>
        </div>
      {/if}
    </div>
  </div>
{/if}

<!-- File Picker Modal -->
{#if showFilePicker}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showFilePicker = false}>
    <div class="bg-[#12192a] border border-[#27272a] rounded-lg max-w-md w-full max-h-[70vh] flex flex-col" on:click|stopPropagation>
      <div class="flex items-center justify-between p-4 border-b border-[#27272a]">
        <div class="flex items-center gap-2">
          <Paperclip class="w-5 h-5 text-cyan-500" />
          <span class="font-medium text-gray-200">Attach Files</span>
          <span class="text-xs text-gray-500">({attachedFiles.length}/{MAX_ATTACHED_FILES})</span>
        </div>
        <button on:click={() => showFilePicker = false} class="text-gray-400 hover:text-gray-200">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-2">
        {#if filteredFileTree.length === 0}
          <p class="text-sm text-gray-400 text-center py-4">No files available to attach</p>
        {:else}
          <div class="space-y-1">
            {#each filteredFileTree as filePath}
              <button
                on:click={() => attachFile(filePath)}
                class="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-800 text-left transition-colors"
              >
                <FileText class="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span class="text-sm text-gray-300 truncate">{filePath}</span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
      
      <div class="p-3 border-t border-[#27272a] text-xs text-gray-500">
        💡 Click a file to attach it. The file contents will be included in your AI request for better context.
      </div>
    </div>
  </div>
{/if}

<!-- Chat Section (only show when mode is 'chat') -->
{#if mode === 'chat'}
<div class="flex flex-col h-full">
  <!-- Chat Section -->
  <div class="flex-1 flex flex-col min-h-0">
    <div class="p-4 border-b border-zinc-800">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-300">
            Ask for Hints
          </h3>
          <p class="text-xs text-gray-400 mt-1">
            Ask me for hints only. I won't provide code solutions.
          </p>
        </div>
        <div class="flex items-center gap-1 bg-yellow-600/20 px-2 py-1 rounded-lg">
          <Coins class="w-3 h-3 text-yellow-500" />
          <span class="text-xs font-medium text-yellow-500">{currentCoins}</span>
        </div>
      </div>
      <p class="text-xs text-gray-400 mt-2">
        💰 Costs {hintCost} coins per hint
      </p>
      <p class="text-xs text-gray-500">
        📎 +{ATTACHED_FILE_COST} coins per attached file
      </p>
    </div>

    <!-- Messages -->
    <div bind:this={chatContainer} class="flex-1 overflow-y-auto p-4 space-y-4" on:scroll={handleScroll}>
      {#if $aiChatHistory.length === 0}
        <div class="text-center py-8">
          <Bot class="w-12 h-12 mx-auto text-cyan-500/50 mb-3" />
          <p class="text-sm text-gray-200">
            Need help? Ask me for hints!
          </p>
          <p class="text-xs text-gray-400 mt-2">
            Examples: "How do I start?", "I'm stuck on the first task"
          </p>
        </div>
      {:else}
        {#each $aiChatHistory as msg}
          <div class="flex gap-3" class:flex-row-reverse={msg.role === "user"}>
            <div class={getIconClasses(msg)}>
              {#if msg.role === "user"}
                <User class="w-3 h-3 text-white" />
              {:else if msg.isWarning}
                <AlertTriangle class="w-3 h-3 text-white" />
              {:else}
                <Bot class="w-3 h-3 text-cyan-500" />
              {/if}
            </div>
            <div class={getMessageClasses(msg)}>
              {@html formatMessage(msg.content)}
              
              <!-- Show attached files in chat message -->
              {#if msg.role === "user" && msg.attachedFiles && msg.attachedFiles.length > 0}
                <div class="mt-2 pt-2 border-t border-slate-700/50">
                  <div class="text-xs text-gray-500 mb-1">📎 Attached files:</div>
                  <div class="flex flex-wrap gap-1">
                    {#each msg.attachedFiles as file}
                      <div class="flex items-center gap-1 bg-slate-800/50 border border-zinc-700/50 rounded px-2 py-0.5 text-xs">
                        <FileText class="w-3 h-3 text-cyan-500" />
                        <span class="text-gray-400">{file.name}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {/each}

        {#if isLoading}
          <div class="flex gap-3">
            <div class="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
              <Bot class="w-3 h-3 text-cyan-500" />
            </div>
            <div class="bg-slate-900/60 p-3 rounded-lg">
              <div class="flex gap-1">
                <span class="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 0ms;"></span>
                <span class="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 150ms;"></span>
                <span class="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 300ms;"></span>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>

    <!-- Input -->
    <div class="p-4 border-t border-zinc-800">
      <!-- Attached Files Display -->
      {#if attachedFiles.length > 0}
        <div class="flex flex-wrap gap-2 mb-3">
          {#each attachedFiles as file}
            <div class="flex items-center gap-1 bg-slate-800 border border-zinc-700 rounded-md px-2 py-1 text-xs">
              <FileText class="w-3 h-3 text-cyan-500" />
              <span class="text-gray-300 max-w-[120px] truncate">{file.name}</span>
              <button 
                on:click={() => removeAttachedFile(file.path)}
                class="text-gray-500 hover:text-red-400 ml-1"
              >
                <X class="w-3 h-3" />
              </button>
            </div>
          {/each}
        </div>
      {/if}
      
      <div class="flex gap-2">
        <!-- Attach File Button -->
        <button
          on:click={() => showFilePicker = true}
          disabled={!canAttachMore}
          class="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-all"
          title={canAttachMore ? "Attach up to 3 files" : "Maximum files attached"}
        >
          <Paperclip class="w-4 h-4 text-gray-400" />
        </button>
        
        <input
          type="text"
          bind:value={userMessage}
          on:keydown={handleKeydown}
          placeholder="Ask for a hint..."
          class="flex-1 bg-slate-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          disabled={isLoading}
        />
        <button
          on:click={sendMessage}
          disabled={!canSend}
          class="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-all"
        >
          <Send class="w-4 h-4 text-white" />
        </button>
      </div>
      
      {#if attachedFiles.length > 0}
        <p class="text-xs text-gray-500 mt-2">
          📎 {attachedFiles.length}/{MAX_ATTACHED_FILES} files attached for context
        </p>
      {/if}
    </div>
  </div>
</div>
{/if}

<style>
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #27272a;
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #3f3f46;
  }
</style>
