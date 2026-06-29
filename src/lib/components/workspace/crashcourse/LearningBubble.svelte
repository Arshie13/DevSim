<script lang="ts">
  import BubbleCloud from "$lib/components/ui/BubbleCloud.svelte";
  import Scrollbar from "$lib/components/ui/Scrollbar.svelte";

  export let eyebrow: string = "Crash Course";
  export let title: string = "Learning Content";
  export let body: string = "";
  export let actionLabel: string = "";
  export let showAction: boolean = false;
  export let onAction: () => void = () => {};
</script>

<BubbleCloud
  className="learning-bubble"
  accentColor="#07a5c9"
  accentRgb="7,165,201"
  width={750}
  viewBox="0 0 600 440"
  contentX={30}
  contentY={36}
  contentWidth={544}
  contentHeight={360}
  contentPadding="20px 28px 14px"
>
  <div class="board-inner">
    <div class="sys-header">
      <span class="sys-indicator"></span>
      <p class="eyebrow">{eyebrow}</p>
    </div>
    <h3 class="title">{title}</h3>
    <Scrollbar className="body-scrollbar">
      <div class="body">{@html body}</div>
    </Scrollbar>

    {#if showAction}
      <div class="action-row">
        <button type="button" class="action-btn" on:click={onAction}>
          <span class="btn-arrow">&#9654;</span> {actionLabel || "Start Lab"}
        </button>
      </div>
    {/if}
  </div>
</BubbleCloud>

<style>
  :global(.learning-bubble) {
    --board-neon: #07a5c9;
  }

  .board-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 0;
  }

  .sys-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
    flex-shrink: 0;
  }

  .sys-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--board-neon);
    box-shadow: 0 0 6px var(--board-neon);
    flex-shrink: 0;
    animation: sys-pulse 2s ease-in-out infinite;
  }

  @keyframes sys-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  .eyebrow {
    margin: 0 0 2px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.85rem;
    color: rgba(7, 165, 201, 0.7);
    text-align: center;
  }

  .title {
    margin: 0 0 0.6rem;
    font-family: "Orbitron", monospace;
    font-size: 1.3rem;
    line-height: 1.35;
    color: #e4f8ff;
    text-align: center;
    white-space: pre-line;
    text-shadow: 0 0 12px rgba(7, 165, 201, 0.2);
    flex-shrink: 0;
  }

  :global(.body-scrollbar) {
    flex: 1;
    min-height: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 0 0.5rem 0 0;
    scrollbar-gutter: stable;
  }

  .body {
    margin: 0;
    font-family: "Exo 2", sans-serif;
    font-size: 1rem;
    line-height: 1.5;
    color: #c8d4de;
    text-align: start;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .action-row {
    flex-shrink: 0;
    margin-top: 0.5rem;
    display: flex;
    justify-content: center;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border: 1px solid rgba(7, 165, 201, 0.4);
    background: rgba(7, 165, 201, 0.08);
    color: #c6f0ff;
    padding: 0.5rem 1rem;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.78rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.18s ease;
    position: relative;
  }

  .action-btn::before {
    content: "";
    position: absolute;
    inset: -1px;
    border: 1px solid rgba(7, 165, 201, 0.1);
    pointer-events: none;
  }

  .action-btn:hover {
    background: rgba(7, 165, 201, 0.16);
    border-color: rgba(7, 165, 201, 0.65);
    box-shadow: 0 0 14px rgba(7, 165, 201, 0.15), inset 0 0 14px rgba(7, 165, 201, 0.04);
    color: #e6fbff;
  }

  .btn-arrow {
    font-size: 0.6rem;
  }

  /* ---- Learning content markdown formatting ---- */

  :global(.body .lc-inline) {
    display: inline;
    vertical-align: baseline;
    line-height: inherit;
    white-space: nowrap;
  }

  :global(.body .lc-pre) {
    margin: 0.5rem 0 0.75rem;
    line-height: 1.55;
    box-shadow: 0 0 14px rgba(6, 182, 212, 0.1);
  }

  :global(.body .lc-pre code) {
    display: block;
    line-height: 1.55;
    tab-size: 2;
  }

  :global(.body strong) {
    color: #e2f0f5;
    font-weight: 700;
  }

  :global(.body a) {
    color: #22d3ee;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  :global(.body a:hover) {
    color: #67e8f9;
  }
</style>
