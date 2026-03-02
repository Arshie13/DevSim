<script lang="ts">
  import { Send, AlertTriangle, Bot, User, Coins } from "lucide-svelte";
  import { aiChatHistory, aiCoins, aiSelectedFile, aiFileTree, aiFileContents } from "./PrimarySidebar.svelte";

  export let scenario: string = "";
  export let tasks: { id: number; text: string; completed: boolean }[] = [];
  export let containerId: string = "";
  export let userId: string = "";
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

  // Coin cost per hint
  const HINT_COST = 100;

  // Chat state - use store for persistence across tab switches
  let userMessage: string = "";
  let isLoading: boolean = false;
  let chatContainer: HTMLDivElement;
  let previousMessageCount: number = 0;

  // Track if user is manually scrolling
  let userScrolling = false;

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

  // Check if user is asking for code or a solution
  function isAskingForCode(message: string): boolean {
    const codePatterns = [
      // Direct code requests
      /\b(write|create|generate|build|make|implement)\s+(code|the|a|an|some|me)\b/i,
      /\b(give|show|provide)\s+(me\s+)?(the\s+)?(code|solution|answer)\b/i,
      /\b(code|solution|answer)\s+(please|now|for me)\b/i,
      /\bwrite\s+the\s+code\b/i,
      /\bhow\s+to\s+write\b/i,
      /\bhow\s+to\s+create\b/i,
      /\bhow\s+to\s+build\b/i,
      /\bshow\s+me\s+the\s+code\b/i,
      /\bshow\s+me\s+how\b/i,
      /\bcode\s+for\b/i,
      /\bcode\s+to\b/i,
      /\bsolution\s+code\b/i,
      /\bthe\s+code\b/i,
      /\bfull\s+code\b/i,
      /\bcomplete\s+code\b/i,
      /\bentire\s+code\b/i,
      /\ball\s+the\s+code\b/i,
      // Code blocks
      /```/,
      /<code>/,
      // Function/class definitions
      /function\s+\w+\s*\(/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /import\s+.*from/,
      /export\s+(default\s+)?(function|class|const)/,
      /class\s+\w+/,
      // Request for complete solution
      /\bfix\s+this\s+for\s+me\b/i,
      /\bsolve\s+this\s+for\s+me\b/i,
      /\bdo\s+this\s+for\s+me\b/i,
    ];

    return codePatterns.some((pattern) => pattern.test(message));
  }

  // Generate context from current state
  async function generateContext(): Promise<string> {
    let context = `Current Scenario: ${scenario}\n\n`;
    
    // Add conversation history for context
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
    
    context += `Tasks:\n`;
    tasks.forEach((task) => {
      const status = task.completed ? "[✓]" : "[ ]";
      context += `${status} ${task.text}\n`;
    });
    return context;
  }

  // Send message to AI
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
          content:
            "⚠️ Out of Scope: I can only provide hints and guidance, not code solutions. I'm here to help you learn by figuring things out yourself. Try asking for a hint instead!",
          isWarning: true,
        },
      ]);
      return;
    }

    // Check if user has enough coins
    if (currentCoins < HINT_COST) {
      aiChatHistory.update(msgs => [
        ...msgs,
        {
          role: "user",
          content: message,
        },
        {
          role: "ai",
          content: `⚠️ Not enough coins! You need ${HINT_COST} coins per hint. You have ${currentCoins} coins. Complete tasks or level up to earn more coins!`,
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
            content: data.error || "Sorry, I couldn't process your request. Please try again.",
          },
        ]);
      }
    } catch (error) {
      console.error("Error getting AI hint:", error);
      aiChatHistory.update(msgs => [
        ...msgs,
        {
          role: "ai",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      isLoading = false;
    }
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

  // Format message content - convert URLs to links and newlines to <br> tags
  function formatMessage(content: string): string {
    // First escape HTML to prevent XSS
    let formatted = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Convert newlines to <br> tags
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline">$1</a>');
    
    return formatted;
  }

  $: canSend = userMessage.trim().length > 0 && !isLoading;
</script>

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
        💰 Costs {HINT_COST} coins per hint
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
