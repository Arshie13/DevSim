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
  contentX={65}
  contentY={70}
  contentWidth={360}
  contentHeight={206}
  contentPadding="12px 20px 10px"
>
  <p class="eyebrow">{eyebrow}</p>
  <h3 class="title">{title}</h3>
  <Scrollbar className="body-scrollbar">
    <p class="body">{body}</p>
  </Scrollbar>

  {#if showAction}
    <div class="action-row">
      <button type="button" class="action-btn" on:click={onAction}>{actionLabel || "Start Lab"}</button>
    </div>
  {/if}
</BubbleCloud>

<style>
  :global(.learning-bubble) {
    filter: drop-shadow(0 0 26px rgba(7, 165, 201, 0.2));
  }

  .eyebrow {
    margin: 0 0 0.3rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.72rem;
    color: #07a5c9;
    text-align: center;
  }

  .title {
    margin: 0 0 1rem;
    font-family: "Orbitron", monospace;
    font-size: 0.94rem;
    line-height: 1.35;
    color: #e4f8ff;
    text-align: center;
    white-space: pre-line;
  }

  :global(.body-scrollbar) {
    max-height: 206px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    padding: 0 0.85rem 0 0.35rem;
    scrollbar-gutter: stable;
  }
  
  .body {
    margin: 0;
    font-family: "Exo 2", sans-serif;
    font-size: 0.8rem;
    line-height: 1.42;
    color: #d0d7dd;
    text-align: start;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    white-space: break-spaces;
  }

  .action-row {
    margin-top: 0.7rem;
    display: flex;
    justify-content: center;
  }

  .action-btn {
    border: 1px solid rgba(7, 165, 201, 0.5);
    background: rgba(7, 165, 201, 0.14);
    color: #e6fbff;
    padding: 0.36rem 0.7rem;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.66rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .action-btn:hover {
    background: rgba(7, 165, 201, 0.22);
    border-color: rgba(7, 165, 201, 0.7);
  }
</style>
