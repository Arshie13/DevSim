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

  // Track if this is the first render for this specific message
  let isFirstRender = true;
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
  let displayedText = "";
  let currentText = "";
  let typeIndex = 0;
  let typeInterval: ReturnType<typeof setInterval> | null = null;
  const TYPE_SPEED = 20; // ms per character

  const REMINDERS = [
    "AI can make mistakes. Verify important details.",
    "Use specific prompts with files, errors, and goals.",
    "Vague prompts can increase AI hallucinations."
  ];
  let activeReminder = REMINDERS[Math.floor(Math.random() * REMINDERS.length)];
  let wasLoading = quickHintLoading;
  let shouldPickReminderAfterLoad = false;
  let lastReminderHintKey = "";

  function pickRandomReminder(): string {
    const next = REMINDERS[Math.floor(Math.random() * REMINDERS.length)];
    if (REMINDERS.length > 1 && next === activeReminder) {
      const fallbackIndex = (REMINDERS.indexOf(next) + 1) % REMINDERS.length;
      return REMINDERS[fallbackIndex];
    }
    return next;
  }

  // Get plain text from HTML content
  function stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  // Start typewriter effect when text changes
  function startTypewriter(text: string, skipAnimation: boolean = false) {
    // Clear any existing interval
    if (typeInterval) {
      clearInterval(typeInterval);
      typeInterval = null;
    }
    
    currentText = text;
    
    // Use plain text for typewriter
    const plainText = stripHtml(text);
    
    if (plainText.length === 0) {
      displayedText = "";
      return;
    }
    
    // If this text was already shown, skip animation and show full text
    if (skipAnimation) {
      displayedText = plainText;
      return;
    }
    
    // First time seeing this text - run typewriter
    displayedText = "";
    typeIndex = 0;
    
    typeInterval = setInterval(() => {
      if (typeIndex < plainText.length) {
        // Get the next character
        displayedText = plainText.substring(0, typeIndex + 1);
        typeIndex++;
      } else {
        // Done typing
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
    const newText = hintChunks[currentHintChunk] || quickHintMessage;
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
      displayedText = "";
    }
  }

  // Pick one reminder per hint session: when loading starts, arm update;
  // when loading ends and a hint exists, pick once and keep it stable.
  $: {
    if (quickHintLoading && !wasLoading) {
      shouldPickReminderAfterLoad = true;
    }

    const stableHintKey = stripHtml(quickHintMessage || "").trim();
    const hasHintText = Boolean(stableHintKey);

    // Hint text can arrive slightly after loading flips to false, so keep the
    // session armed until text exists, then pick exactly once.
    if (!quickHintLoading && shouldPickReminderAfterLoad && hasHintText) {
      activeReminder = pickRandomReminder();
      shouldPickReminderAfterLoad = false;
      lastReminderHintKey = stableHintKey;
    }

    // Fallback path: if no loading transition happens, rotate once when
    // the session's root hint message changes.
    if (!quickHintLoading && !shouldPickReminderAfterLoad && hasHintText && stableHintKey !== lastReminderHintKey) {
      activeReminder = pickRandomReminder();
      lastReminderHintKey = stableHintKey;
    }

    wasLoading = quickHintLoading;
  }

  // Reset tracking when a completely new message arrives
  $: if (quickHintMessage && hintChunks.length > 0) {
    // Check if this is a new message (different from previous)
    const textKey = stripHtml(quickHintMessage);
    if (!shownTexts.has(textKey)) {
      isFirstRender = true;
    }
  }

  // Cleanup on destroy
  onDestroy(() => {
    if (typeInterval) {
      clearInterval(typeInterval);
    }
  });
</script>

<div class="animate-float" style="position: relative; z-index: 9999;">
  <BubbleCloud width={560} viewBox="0 0 520 350" contentX={85} contentY={75} contentWidth={320} contentHeight={200} contentPadding="8px 10px 2px">
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
          <Scrollbar className="flex-1 min-h-[60px] max-h-[140px]">
            <p style="
              font-size: 12px;
              color: #d1d5db;
              margin: 0;
              line-height: 1.6;
              word-break: break-word;
              overflow-wrap: anywhere;
              hyphens: auto;
            ">
              {#if displayedText}
                {displayedText}<span class="typewriter-cursor">|</span>
              {/if}
            </p>
          </Scrollbar>
        {/if}

          <!-- Pagination -->
          {#if hintChunks.length > 1}
            <div style="
              display:flex;align-items:center;justify-content:space-between;
              padding-top:6px;border-top:1px solid #3f3f46;margin-top:6px;flex-shrink:0;
            ">
              <button
                on:click|stopPropagation={handlePrev}
                disabled={currentHintChunk === 0}
                style="font-size:11px;color:#9ca3af;background:none;border:none;cursor:pointer;opacity:{currentHintChunk===0?'0.3':'1'};padding:2px 4px;"
              >← Prev</button>
              <span style="font-size:11px;color:#fbbf24;">💡 {currentHintChunk + 1} of {hintChunks.length}</span>
              <button
                on:click|stopPropagation={currentHintChunk === hintChunks.length - 1 ? handleClose : handleNext}
                style="font-size:11px;color:{currentHintChunk === hintChunks.length - 1 ? '#22d3ee' : '#9ca3af'};background:none;border:none;cursor:pointer;padding:2px 4px;"
              >{currentHintChunk === hintChunks.length - 1 ? 'Done ✓' : 'Next →'}</button>
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
          <p style="font-size:10px;color:#9ca3af;margin:4px 0 0;line-height:1.35;text-align:center;flex-shrink:0;">{activeReminder}</p>
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
