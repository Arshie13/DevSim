<script lang="ts">
  import { createEventDispatcher, onDestroy } from "svelte";
  import { formatMessage as formatMessageContent } from "$lib/ai";
  import BubbleCloud from "$lib/components/ui/BubbleCloud.svelte";
  import Scrollbar from "$lib/components/ui/Scrollbar.svelte";

  export let quickHintMessage: string = "";
  export let quickHintLoading: boolean = false;
  export let hintChunks: string[] = [];
  export let currentHintChunk: number = 0;
  export let initialCoins: number = 1000;
  export let QUICK_HINT_COST: number = 100;
  export let CHAT_MESSAGE_COST: number = 200;
  export let showChatButton: boolean = false;

  // Determine which cost to display based on chat mode
  $: displayedCost = showChatButton ? CHAT_MESSAGE_COST : QUICK_HINT_COST;

  const dispatch = createEventDispatcher();

  // Track which texts have already been shown (to skip typewriter on revisit)
  let shownTexts: Set<string> = new Set();

  function formatMessage(content: string): string {
    return formatMessageContent(content);
  }

  function handleHide()  { dispatch('hide');  }
  function handleClose() { dispatch('close'); }
  function handlePrev()  { dispatch('prev');  }
  function handleNext()  { dispatch('next');  }


  // Header state: show "Thinking..." when loading, otherwise show "Hint Ready" or "Chat Ready"
  $: headerText = quickHintLoading ? "Thinking..." : (showChatButton ? "Chat Ready" : "Hint Ready");
  $: headerEmoji = quickHintLoading ? "💭" : (showChatButton ? "💬" : "💡");

  // Typewriter effect state
  let displayedHtml = "";
  let formattedText = "";
  let isTyping = false;
  let typeIndex = 0;
  let typeInterval: ReturnType<typeof setInterval> | null = null;
  const TYPE_SPEED = 20; // ms per character

  function splitNumberedHintSections(message: string): string[] {
    const normalized = message.replace(/\r\n/g, "\n").trim();
    if (!normalized) return [];

    // Split list-like hints into stable sections so each item maps to one slide.
    const matches = [...normalized.matchAll(/(?:^|\n|\s)(\d+[.)])\s+([\s\S]*?)(?=(?:\n|\s)\d+[.)]\s+|$)/g)];
    if (matches.length < 2) return [];

    return matches
      .map((match) => `${match[1]} ${match[2].trim()}`.trim())
      .filter(Boolean);
  }

  $: numberedHintChunks = splitNumberedHintSections(quickHintMessage || "");
  $: displayChunks = hintChunks.length > 0
    ? hintChunks
    : (numberedHintChunks.length > 1
      ? numberedHintChunks
      : (quickHintMessage ? [quickHintMessage] : []));
  $: currentDisplayChunk = Math.min(currentHintChunk, Math.max(displayChunks.length - 1, 0));
  $: activeChunk = displayChunks[currentDisplayChunk] || "";

  const REMINDERS = [
    "AI can make mistakes. Verify important details.",
    "Use specific prompts with files, errors, and goals.",
    "Vague prompts can increase AI hallucinations."
  ];
  let activeReminder = "";
  let reminderQueue: string[] = [];

  function refillReminderQueue() {
    reminderQueue = [...REMINDERS].sort(() => Math.random() - 0.5);

    // Avoid immediate repetition across queue refills.
    if (activeReminder && reminderQueue.length > 1 && reminderQueue[0] === activeReminder) {
      const first = reminderQueue.shift();
      if (first) reminderQueue.push(first);
    }
  }

  function pickNextReminder(): string {
    if (REMINDERS.length === 0) return "";
    if (REMINDERS.length === 1) return REMINDERS[0];
    if (reminderQueue.length === 0) refillReminderQueue();
    return reminderQueue.shift() || REMINDERS[0];
  }

  activeReminder = pickNextReminder();
  let wasLoading = quickHintLoading;
  let lastReminderHintKey = "";

  // Get plain text from HTML content
  function stripHtml(html: string): string {
    if (typeof document === "undefined") {
      return html.replace(/<[^>]*>/g, "");
    }
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  function escapeHtmlText(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function truncateHtmlByVisibleChars(html: string, maxVisibleChars: number): string {
    if (maxVisibleChars <= 0) return "";

    if (typeof document === "undefined") {
      return escapeHtmlText(stripHtml(html).slice(0, maxVisibleChars));
    }

    const template = document.createElement("template");
    template.innerHTML = html;
    let remaining = maxVisibleChars;
    const VOID_TAGS = new Set(["br", "img", "hr", "input", "meta", "link"]);

    const serializeNode = (node: Node): string => {
      if (remaining <= 0) return "";

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        const slice = text.slice(0, remaining);
        remaining -= slice.length;
        return escapeHtmlText(slice);
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return "";
      }

      const el = node as Element;
      const tag = el.tagName.toLowerCase();
      const attrs = Array.from(el.attributes)
        .map((attr) => ` ${attr.name}="${escapeHtmlText(attr.value)}"`)
        .join("");

      if (VOID_TAGS.has(tag)) {
        return `<${tag}${attrs}>`;
      }

      let childrenHtml = "";
      for (const child of Array.from(el.childNodes)) {
        if (remaining <= 0) break;
        childrenHtml += serializeNode(child);
      }

      return `<${tag}${attrs}>${childrenHtml}</${tag}>`;
    };

    let output = "";
    for (const child of Array.from(template.content.childNodes)) {
      if (remaining <= 0) break;
      output += serializeNode(child);
    }

    return output;
  }

  function normalizeAsteriskFormatting(content: string): string {
    // Fallback for AI responses that use markdown-like asterisks for emphasis.
    return content
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>');
  }

  // Start typewriter effect when text changes
  function startTypewriter(text: string, skipAnimation: boolean = false) {
    // Clear any existing interval
    if (typeInterval) {
      clearInterval(typeInterval);
      typeInterval = null;
    }
    
    const htmlText = normalizeAsteriskFormatting(formatMessage(text));
    formattedText = htmlText;

    // Typewriter animates the already-parsed HTML so formatting stays consistent.
    const plainText = stripHtml(htmlText);
    
    if (plainText.length === 0) {
      displayedHtml = "";
      isTyping = false;
      return;
    }
    
    // If this text was already shown, skip animation and show full text
    if (skipAnimation) {
      displayedHtml = htmlText;
      isTyping = false;
      return;
    }
    
    // First time seeing this text - run typewriter
    displayedHtml = "";
    typeIndex = 0;
    isTyping = true;
    
    typeInterval = setInterval(() => {
      if (typeIndex < plainText.length) {
        displayedHtml = truncateHtmlByVisibleChars(htmlText, typeIndex + 1);
        typeIndex++;
      } else {
        // Done typing
        isTyping = false;
        displayedHtml = htmlText;
        if (typeInterval) {
          clearInterval(typeInterval);
          typeInterval = null;
        }
      }
    }, TYPE_SPEED);
  }

  // Detect if this component is being reused (message already shown)
  // We check if the current text is already in our shownTexts set
  $: {
    const newText = activeChunk;
    if (newText && !quickHintLoading) {
      // Check if this specific text has been shown before
      const textKey = stripHtml(newText);
      const skipAnimation = shownTexts.has(textKey);
      
      // Mark as shown
      if (!skipAnimation) {
        shownTexts.add(textKey);
      }
      
      startTypewriter(newText, skipAnimation);
    } else {
      displayedHtml = "";
    }
  }

  // Keep one reminder stable for the full session.
  // If a session starts with loading, pick once at loading start and keep it
  // unchanged after the hint appears. For no-loading sessions (e.g. warnings),
  // rotate once per new root message.
  $: {
    if (quickHintLoading && !wasLoading) {
      activeReminder = pickNextReminder();
    }

    const stableHintKey = stripHtml(quickHintMessage || "").trim();
    const hasHintText = Boolean(stableHintKey);

    if (!quickHintLoading && hasHintText) {
      // Keep a marker for the latest resolved message so no-loading sessions
      // can detect future changes correctly.
      if (stableHintKey !== lastReminderHintKey) {
        if (!wasLoading) {
          activeReminder = pickNextReminder();
        }
        lastReminderHintKey = stableHintKey;
      }
    }

    wasLoading = quickHintLoading;
  }

  // Cleanup on destroy
  onDestroy(() => {
    if (typeInterval) {
      clearInterval(typeInterval);
    }
  });
</script>
<div class="animate-float" style="position: relative; top: 24px; z-index: 9999;">
  <BubbleCloud width={600} viewBox="0 0 530 360" contentX={85} contentY={70} contentWidth={320} contentHeight={220} contentPadding="8px 10px 6px">
        <!-- Header -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(6,182,212,0.22);
          margin-bottom: 6px;
          flex-shrink: 0;
        ">
          <span style="font-size: 12px; color: #22d3ee; font-weight: 500;">{headerEmoji} {headerText}</span>
          <div style="display: flex; gap: 2px;">
            <button
              on:click|stopPropagation={handleHide}
              style="background:none;border:none;cursor:pointer;color:#9ca3af;padding:1px 6px;font-size:18px;line-height:1;"
              title="Hide temporarily"
            >−</button>
            <button
              on:click|stopPropagation={handleClose}
              style="background:none;border:none;cursor:pointer;color:#9ca3af;padding:1px 6px;font-size:18px;line-height:1;"
            >×</button>
          </div>
        </div>

        <!-- Loading state -->
        {#if quickHintLoading}
          <div style="flex:1;display:flex;align-items:center;justify-content:center;gap:8px;">
            <span class="dot" style="animation-delay:0ms;"></span>
            <span class="dot" style="animation-delay:150ms;"></span>
            <span class="dot" style="animation-delay:300ms;"></span>
            <span style="font-size:12px;color:#9ca3af;margin-left:4px;">Getting hint...</span>
          </div>

        <!-- Single message display with proper word break -->
        {:else}
          <Scrollbar className="flex-1 min-h-[56px] max-h-[128px]">
            <p style="
              font-size: 12px;
              color: #d1d5db;
              margin: 0;
              line-height: 1.6;
              word-break: break-word;
              overflow-wrap: anywhere;
              hyphens: auto;
            ">
              {#if isTyping && displayedHtml}
                {@html displayedHtml}<span class="typewriter-cursor">|</span>
              {:else if formattedText}
                {@html formattedText}
              {/if}
            </p>
          </Scrollbar>
        {/if}

          <!-- Navigation / Actions -->
          {#if displayChunks.length > 1}
            <div style="
              padding-top:6px;
              border-top:1px solid #3f3f46;
              margin-top:8px;
              flex-shrink:0;
            ">
              {#if displayChunks.length > 1}
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <button
                    on:click|stopPropagation={handlePrev}
                    disabled={currentDisplayChunk === 0}
                    style="font-size:11px;color:#9ca3af;background:none;border:none;cursor:pointer;opacity:{currentDisplayChunk===0?'0.3':'1'};padding:2px 4px;"
                  >← Prev</button>
                  <span style="font-size:11px;color:#fbbf24;">💡 {currentDisplayChunk + 1} of {displayChunks.length}</span>
                  <button
                    on:click|stopPropagation={currentDisplayChunk === displayChunks.length - 1 ? handleClose : handleNext}
                    style="font-size:11px;color:{currentDisplayChunk === displayChunks.length - 1 ? '#22d3ee' : '#9ca3af'};background:none;border:none;cursor:pointer;padding:2px 4px;"
                  >{currentDisplayChunk === displayChunks.length - 1 ? 'Done ✓' : 'Next →'}</button>
                </div>
              {/if}
            </div>
          {/if}

          <!-- Coins footer -->
          <div style="
            display:flex;justify-content:space-between;
            padding-top:6px;border-top:1px solid #3f3f46;margin-top:6px;flex-shrink:0;
          ">
            <span style="font-size:11px;color:#6b7280;">💰 -{displayedCost} coins</span>
            <span style="font-size:11px;color:#6b7280;">Remaining: {initialCoins}</span>
          </div>

          <!-- AI reminder -->
          <p style="font-size:10px;color:#9ca3af;margin:3px 0 0;line-height:1.3;text-align:center;flex-shrink:0;">{activeReminder}</p>
  </BubbleCloud>
</div>

<style>
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-5px); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  :global(.dot) {
    width: 9px;
    height: 9px;
    background: #06b6d4;
    border-radius: 50%;
    display: inline-block;
    animation: bounce 1s ease-in-out infinite;
  }
  :global(.typewriter-cursor) {
    animation: blink 0.8s step-end infinite;
    color: #22d3ee;
    font-weight: bold;
  }

</style>
