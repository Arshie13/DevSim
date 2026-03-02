<script lang="ts">
  import { Lightbulb, Send, AlertTriangle, Bot, User, Coins } from "lucide-svelte";

  export let hints: string[] = [];
  export let scenario: string = "";
  export let tasks: { id: number; text: string; completed: boolean }[] = [];
  export let containerId: string = "";
  export let userId: string = "";
  export let userCoins: number = 0;

  // Coin cost per hint
  const HINT_COST = 100;

  // Chat state
  let userMessage: string = "";
  let messages: { role: "user" | "ai"; content: string; isWarning?: boolean }[] = [];
  let isLoading: boolean = false;
  let chatContainer: HTMLDivElement;
  let previousMessageCount: number = 0;

  // Track if user is manually scrolling
  let userScrolling = false;

  // Only scroll to bottom when new messages are added (not on every change)
  $: {
    const currentCount = messages.length;
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

  // Check if user is asking for code
  function isAskingForCode(message: string): boolean {
    const codePatterns = [
      /\b(write|create|generate|build|make|implement)\s+(code|the|a|an|some|me)\b/i,
      /\b(give|show|provide)\s+(me\s+)?(the\s+)?(code|solution|answer)\b/i,
      /\b(code|solution|answer)\s+(please|now|for me)\b/i,
      /```/,
      /<code>/,
      /function\s+\w+\s*\(/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /import\s+.*from/,
      /export\s+(default\s+)?(function|class|const)/,
    ];

    return codePatterns.some((pattern) => pattern.test(message));
  }

  // Generate context from current state
  function generateContext(): string {
    let context = `Current Scenario: ${scenario}\n\n`;
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
      messages = [
        ...messages,
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
      ];
      return;
    }

    // Check if user has enough coins
    if (userCoins < HINT_COST) {
      messages = [
        ...messages,
        {
          role: "user",
          content: message,
        },
        {
          role: "ai",
          content: `⚠️ Not enough coins! You need ${HINT_COST} coins per hint. You have ${userCoins} coins. Complete tasks or level up to earn more coins!`,
          isWarning: true,
        },
      ];
      return;
    }

    messages = [...messages, { role: "user", content: message }];
    isLoading = true;

    try {
      const response = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context: generateContext(),
          containerId,
          userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        messages = [...messages, { role: "ai", content: data.hint }];
        // Update coin balance
        if (data.coinsRemaining !== undefined) {
          userCoins = data.coinsRemaining;
        }
      } else {
        messages = [
          ...messages,
          {
            role: "ai",
            content: data.error || "Sorry, I couldn't process your request. Please try again.",
          },
        ];
      }
    } catch (error) {
      console.error("Error getting AI hint:", error);
      messages = [
        ...messages,
        {
          role: "ai",
          content: "Sorry, something went wrong. Please try again.",
        },
      ];
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

  // Convert URLs to clickable links
  function formatMessageWithLinks(content: string): string {
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    return content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline">$1</a>');
  }

  $: canSend = userMessage.trim().length > 0 && !isLoading;
</script>

<div class="flex flex-col h-full">
  <!-- Static Hints Section -->
  <div class="p-4 space-y-2 border-b border-zinc-800">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">
      Task Hints
    </h3>
    {#each hints as hint}
      <div class="flex items-start gap-2 p-3 bg-slate-950/60 rounded-lg border border-zinc-800">
        <Lightbulb class="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
        <p class="text-xs text-gray-200 leading-relaxed">{hint}</p>
      </div>
    {/each}
  </div>

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
          <span class="text-xs font-medium text-yellow-500">{userCoins}</span>
        </div>
      </div>
      <p class="text-xs text-gray-400 mt-2">
        💰 Costs {HINT_COST} coins per hint
      </p>
    </div>

    <!-- Messages -->
    <div bind:this={chatContainer} class="flex-1 overflow-y-auto p-4 space-y-4" on:scroll={handleScroll}>
      {#if messages.length === 0}
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
        {#each messages as msg}
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
              {@html formatMessageWithLinks(msg.content)}
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
