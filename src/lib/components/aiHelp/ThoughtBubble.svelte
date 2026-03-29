<script lang="ts">
  import { createEventDispatcher, onDestroy } from "svelte";
  import { formatMessage as formatMessageContent } from "$lib/ai";

  export let quickHintMessage: string = "";
  export let quickHintLoading: boolean = false;
  export let hintChunks: string[] = [];
  export let currentHintChunk: number = 0;
  export let initialCoins: number = 1000;
  export let QUICK_HINT_COST: number = 100;
  export let showChatButton: boolean = false;

  const dispatch = createEventDispatcher();

  function formatMessage(content: string): string {
    return formatMessageContent(content);
  }

  function handleHide()  { dispatch('hide');  }
  function handleClose() { dispatch('close'); }
  function handlePrev()  { dispatch('prev');  }
  function handleNext()  { dispatch('next');  }
  function handleOpenChat() { dispatch('openChat'); }

  // Header state: show "Thinking..." when loading, otherwise show "Hint Ready" or "Chat Ready"
  $: headerText = quickHintLoading ? "Thinking..." : (showChatButton ? "Chat Ready" : "Hint Ready");
  $: headerEmoji = quickHintLoading ? "💭" : (showChatButton ? "💬" : "💡");

  // Typewriter effect state
  let displayedText = "";
  let currentText = "";
  let typeIndex = 0;
  let typeInterval: ReturnType<typeof setInterval> | null = null;
  const TYPE_SPEED = 20; // ms per character

  // Get plain text from HTML content
  function stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  // Start typewriter effect when text changes
  function startTypewriter(text: string) {
    // Clear any existing interval
    if (typeInterval) {
      clearInterval(typeInterval);
      typeInterval = null;
    }
    
    currentText = text;
    displayedText = "";
    typeIndex = 0;
    
    // Use plain text for typewriter
    const plainText = stripHtml(text);
    
    if (plainText.length === 0) return;
    
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

  // Watch for changes in the current chunk and restart typewriter
  $: {
    const newText = hintChunks[currentHintChunk] || quickHintMessage;
    if (newText && !quickHintLoading) {
      startTypewriter(newText);
    } else {
      displayedText = "";
    }
  }

  // Cleanup on destroy
  onDestroy(() => {
    if (typeInterval) {
      clearInterval(typeInterval);
    }
  });
</script>

<!--
  LAYOUT LOGIC:
  - viewBox="0 0 560 380" — coordinate space (expanded for more content)
  - svg width="560"       — 1:1 rendering, no scaling
  - Cloud body occupies roughly x:30..530, y:14..328
  - The cloud is narrowest at far left (x≈30) and far right (x≈530)
    and also indented at top-left & top-right bumps.
  - Safe content rectangle (well inside all bumps):
      x=100, y=30, width=360, height=280
  - Thought trail exits bottom-right of cloud → down toward avatar
-->
<div class="animate-float" style="position: relative;">
  <svg
    width="560"
    viewBox="0 0 540 360"
    xmlns="http://www.w3.org/2000/svg"
    style="overflow: visible; display: block;"
  >
    <!--
      CLOUD PATH (expanded for larger bubble)
      Safe interior is x:100-460, y:30-310
      All bumps protrude OUTSIDE that rectangle.
      Path goes clockwise from bottom-left.
    -->

    <!-- Glow halo -->
    <path d="
      M130,312 Q74,314 54,278 Q34,242 54,218
      Q30,198 36,168 Q44,138 78,128
      Q66,102 86,82 Q110,60 140,70
      Q146,46 176,38 Q210,28 234,48
      Q256,30 286,36 Q320,42 332,68
      Q352,50 380,62 Q410,76 406,106
      Q430,116 440,146 Q452,180 432,204
      Q452,222 444,252 Q434,276 402,276
      Q392,296 364,296 Q350,282 336,292
      Q310,306 282,296 Q258,308 234,294
      Q206,308 180,296 Q154,306 134,290
      Q112,302 130,312Z
    "
      fill="none"
      stroke="rgba(6,182,212,0.18)"
      stroke-width="10"
    />
    <path d="
      M130,312 Q74,314 54,278 Q34,242 54,218
      Q30,198 36,168 Q44,138 78,128
      Q66,102 86,82 Q110,60 140,70
      Q146,46 176,38 Q210,28 234,48
      Q256,30 286,36 Q320,42 332,68
      Q352,50 380,62 Q410,76 406,106
      Q430,116 440,146 Q452,180 432,204
      Q452,222 444,252 Q434,276 402,276
      Q392,296 364,296 Q350,282 336,292
      Q310,306 282,296 Q258,308 234,294
      Q206,308 180,296 Q154,306 134,290
      Q112,302 130,312Z
    "
      fill="#0f172a"
      stroke="rgba(6,182,212,0.65)"
      stroke-width="2"
    />

    <!-- Thought trail — exits bottom-right, cascades toward avatar -->
    <circle cx="444" cy="316" r="12" fill="#0f172a" stroke="rgba(6,182,212,0.55)" stroke-width="2"/>
    <circle cx="468" cy="340" r="8"  fill="#0f172a" stroke="rgba(6,182,212,0.40)" stroke-width="1.5"/>
    <circle cx="488" cy="360" r="5"  fill="#0f172a" stroke="rgba(6,182,212,0.28)" stroke-width="1.5"/>

    <!--
      CONTENT — strictly inside safe zone x:100, y:30, w:360, h:280
      Left inset 100px accounts for the left-side bumps (~x:30-100 zone)
      Right edge 100+360=460 stays left of right bumps (~x:465+ zone)
      Top inset 30px clears top bumps (~y:2-30 zone)
      Bottom 30+280=310 stays above bottom bumps (~y:312+ zone)
    -->
    <foreignObject x="90" y="65" width="320" height="220">
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        style="
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 12px 14px 12px 14px;
          box-sizing: border-box;
          font-family: sans-serif;
          overflow: hidden;
        "
      >
        <!-- Header -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(6,182,212,0.22);
          margin-bottom: 8px;
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

        <!-- Single message display -->
        {:else}
          <p style="
            font-size: 12px;
            color: #d1d5db;
            margin: 0;
            line-height: 1.55;
            word-break: break-word;
            flex: 1;
            overflow: hidden;
            min-height: 60px;
          ">
            {#if displayedText}
              {displayedText}<span class="typewriter-cursor">|</span>
            {/if}
          </p>
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
              <span style="font-size:11px;color:#6b7280;">{currentHintChunk + 1} / {hintChunks.length}</span>
              <button
                on:click|stopPropagation={currentHintChunk === hintChunks.length - 1 ? handleClose : handleNext}
                style="font-size:11px;color:{currentHintChunk === hintChunks.length - 1 ? '#22d3ee' : '#9ca3af'};background:none;border:none;cursor:pointer;padding:2px 4px;"
              >{currentHintChunk === hintChunks.length - 1 ? 'Done ✓' : 'Next →'}</button>
            </div>
          {/if}

          <!-- Ask more questions button (only shown in chat mode) -->
          {#if showChatButton}
            <div style="
              display:flex;justify-content:center;
              padding-top:6px;border-top:1px solid #3f3f46;margin-top:6px;flex-shrink:0;
            ">
              <button
                on:click|stopPropagation={handleOpenChat}
                style="font-size:11px;color:#22d3ee;background:none;border:none;cursor:pointer;padding:4px 8px;text-decoration:underline;"
              >💬 Ask more questions</button>
            </div>
          {/if}

          <!-- Coins footer -->
          <div style="
            display:flex;justify-content:space-between;
            padding-top:6px;border-top:1px solid #3f3f46;margin-top:6px;flex-shrink:0;
          ">
            <span style="font-size:11px;color:#6b7280;">💰 -{QUICK_HINT_COST} coins</span>
            <span style="font-size:11px;color:#6b7280;">Remaining: {initialCoins}</span>
          </div>
      </div>
    </foreignObject>
  </svg>
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
