<script lang="ts">
  import { Send, AlertTriangle, Bot, User, Coins, X } from "lucide-svelte";
  import { aiChatHistory, aiCoins, aiSelectedFile, aiFileTree, aiFileContents } from "./PrimarySidebar.svelte";
  import { isAskingForCode, getCodeWarningMessage, getInsufficientCoinsMessage, getErrorMessage, getApiErrorMessage, formatMessage as formatMessageContent } from "$lib/ai";

  // SAZ - AI Assistant Name
  const AI_NAME = "SAZ";
  
  // SAZ Profile Image
  const AI_AVATAR = "/images/saz.png";
  
  // Track if avatar image failed to load
  let avatarFailed = false;
  
  function handleAvatarError() {
    avatarFailed = true;
  }

  export let scenario: string = "";
  export let tasks: { id: number; text: string; completed: boolean }[] = [];
  export let containerId: string = "";
  export let userId: string = "";
  
  // Mode: 'chat' for full chat interface, 'quick' for just button-triggered hints
  // Default to 'quick' to show the button in the AI Helper tab
  export let mode: 'chat' | 'quick' = 'quick';
  
  // Allow initial values to be set from parent, but use stores for persistence
  export let initialSelectedFile: string = "";
  export let initialFileTree: string[] = [];
  export let initialFileContents: Record<string, string> = {};
  // Allow initial coin value to be set from parent, but use store for persistence
  export let initialCoins: number = 1000;

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

  // Get the appropriate cost based on mode
  $: hintCost = mode === 'quick' ? QUICK_HINT_COST : CHAT_HINT_COST;

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
    let context = `Current Scenario: ${scenario}\n\n`;
    
    // Add conversation history for context (for chat mode)
    if (mode === 'chat') {
      const chatHistory = $aiChatHistory;
      if (chatHistory.length > 0) {
        context += `Conversation History:\n`;
        chatHistory.forEach((msg) => {
          const role = msg.role === "user" ? "User" : "AI";
          // Truncate very long messages
          const content = msg.content.length > 300 
            ? msg.content.substring(0, 300) + "..."
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
        for (const result of results) {
          if (result) {
            fileContents[result.file] = result.content;
          }
        }
      } catch (e) {
        console.error("Error fetching file contents:", e);
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
        const maxLines = 100; // Limit to first 100 lines
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
    
    // Add task progress context - this is crucial for context awareness
    context += `Your Progress (Tasks):\n`;
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

    // Check if user has enough coins
    if (currentCoins < hintCost) {
      aiChatHistory.update(msgs => [
        ...msgs,
        {
          role: "user",
          content: message,
        },
        {
          role: "ai",
          content: getInsufficientCoinsMessage(hintCost, currentCoins),
          isWarning: true,
        },
      ]);
      return;
    }

    aiChatHistory.update(msgs => [...msgs, { role: "user", content: message }]);
    isLoading = true;

    try {
      // Generate context (now async to fetch file contents)
      const context = await generateContext();
      
      const response = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context,
          containerId,
          userId,
          hintType: mode,
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
    
    // Check coins first
    if (currentCoins < hintCost) {
      quickHintMessage = getInsufficientCoinsMessage(hintCost, currentCoins);
      showQuickHint = true;
      return;
    }

    quickHintLoading = true;
    showQuickHint = true;
    quickHintMessage = "";

    try {
      // Build context from current state
      const context = await generateContext();

      console.log("context from generateContext:", context);
      
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
  <!-- SAZ Profile Header -->
  <div class="flex items-center gap-3 mb-4">
    {#if avatarFailed}
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
        SAZ
      </div>
    {:else}
      <img 
        src={AI_AVATAR} 
        alt="{AI_NAME} avatar" 
        class="w-10 h-10 rounded-full object-cover shadow-lg"
        on:error={handleAvatarError}
      />
    {/if}
    <div class="flex-1 flex items-center justify-between">
      <div>
        <p class="text-sm font-semibold text-gray-200">{AI_NAME}</p>
        <p class="text-xs text-gray-400">AI Coding Assistant</p>
      </div>
      <div class="flex items-center gap-1 bg-yellow-600/20 px-2 py-1 rounded-lg">
        <Coins class="w-3 h-3 text-yellow-500" />
        <span class="text-xs font-medium text-yellow-500">{currentCoins}</span>
      </div>
    </div>
  </div>
  
  <button
    on:click={requestQuickHint}
    disabled={quickHintLoading || !containerId || !userId}
    class="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg transition-all text-sm font-medium text-white"
  >
    <Bot class="w-4 h-4" />
    Get Quick Hint
  </button>
  
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
          {#if avatarFailed}
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              SAZ
            </div>
          {:else}
            <img 
              src={AI_AVATAR} 
              alt="{AI_NAME} avatar" 
              class="w-8 h-8 rounded-full object-cover"
              on:error={handleAvatarError}
            />
          {/if}
          <span class="font-medium text-gray-200">{AI_NAME}</span>
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

<!-- Chat Section (only show when mode is 'chat') -->
{#if mode === 'chat'}
<div class="flex flex-col h-full">
  <!-- Chat Section -->
  <div class="flex-1 flex flex-col min-h-0">
    <div class="p-4 border-b border-zinc-800">
      <div class="flex items-center justify-between">
        <div>
          <!-- No avatar or title here -->
        </div>
        <!-- Coin counter removed from here -->
      </div>
      <!-- Costs text removed -->
    </div>

    <!-- Messages -->
    <div bind:this={chatContainer} class="flex-1 overflow-y-auto p-4 space-y-4" on:scroll={handleScroll}>
      {#if $aiChatHistory.length === 0}
        <div class="flex flex-col items-center justify-center py-8">
          {#if avatarFailed}
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl mb-3 shadow-lg mx-auto">
              SAZ
            </div>
          {:else}
            <img 
              src={AI_AVATAR} 
              alt="{AI_NAME} avatar" 
              class="w-16 h-16 rounded-full object-cover mb-3 shadow-lg mx-auto"
              on:error={handleAvatarError}
            />
          {/if}
          <p class="text-sm text-gray-200">
            Hi! I'm {AI_NAME}, your coding assistant!
          </p>
          <p class="text-xs text-gray-400 mt-1">
            Ask me for hints or help with your tasks
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
                {#if avatarFailed}
                  <div class="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    SZ
                  </div>
                {:else}
                  <img 
                    src={AI_AVATAR} 
                    alt="{AI_NAME} avatar" 
                    class="w-6 h-6 rounded-full object-cover"
                    on:error={handleAvatarError}
                  />
                {/if}
              {/if}
            </div>
            <div class={getMessageClasses(msg)}>
              {@html formatMessage(msg.content)}
            </div>
          </div>
        {/each}

        {#if isLoading}
          <div class="flex gap-3">
            {#if avatarFailed}
              <div class="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                SZ
              </div>
            {:else}
              <img 
                src={AI_AVATAR} 
                alt="{AI_NAME} avatar" 
                class="w-6 h-6 rounded-full object-cover"
                on:error={handleAvatarError}
              />
            {/if}
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
      <div class="flex gap-2">
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
