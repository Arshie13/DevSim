<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Scrollbar from "$lib/components/ui/Scrollbar.svelte";

  export let currentPath: string = "/";
  export let history: string[] = [];
  export let inputValue: string = "";
  export let feedback: string = "";
  export let isPassed: boolean = false;

  const dispatch = createEventDispatcher<{ run: void; check: void }>();
</script>

<div class="mini-terminal">
  <p class="terminal-path">Current path: {currentPath}</p>
  <Scrollbar className="terminal-log">
    {#each history as line}
      <p>{line}</p>
    {/each}
  </Scrollbar>
  <div class="terminal-input-row">
    <span>$</span>
    <input
      type="text"
      bind:value={inputValue}
      placeholder="Try: cd client"
      on:keydown={(event) => event.key === "Enter" && dispatch("run")}
    />
    <button type="button" on:click={() => dispatch("run")}>Run</button>
    <button type="button" class="check-btn" on:click={() => dispatch("check")}>Check</button>
  </div>
  {#if feedback}
    <p class={`practice-feedback ${isPassed ? "pass" : "pending"}`}>{feedback}</p>
  {/if}
</div>

<style>
  .mini-terminal {
    border: 1px solid rgba(136, 146, 160, 0.35);
    background: rgba(3, 8, 18, 0.72);
    padding: 0.65rem;
    overflow: hidden;
  }

  .terminal-path {
    margin: 0 0 0.5rem;
    color: #9db6c7;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.72rem;
  }

  :global(.terminal-log) {
    min-height: 160px;
    max-height: 160px;
    border: 1px solid rgba(136, 146, 160, 0.28);
    padding: 0.45rem;
    margin-bottom: 0.5rem;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.72rem;
    color: #d7f5ff;
    box-sizing: border-box;
  }

  :global(.terminal-log) p {
    margin: 0 0 0.3rem;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .terminal-input-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    gap: 0.4rem;
    align-items: center;
    color: #d7f5ff;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.72rem;
  }

  .terminal-input-row input {
    min-width: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.38);
    border: 1px solid rgba(136, 146, 160, 0.38);
    color: #d7f5ff;
    padding: 0.34rem 0.45rem;
    font-family: inherit;
    font-size: 0.72rem;
  }

  .terminal-input-row button {
    border: 1px solid rgba(7, 165, 201, 0.45);
    background: rgba(7, 165, 201, 0.12);
    color: #dff8ff;
    padding: 0.34rem 0.52rem;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.68rem;
    cursor: pointer;
  }

  .terminal-input-row .check-btn {
    border-color: rgba(136, 146, 160, 0.45);
    background: rgba(255, 255, 255, 0.04);
    color: #d0d7dd;
  }

  .practice-feedback.pass {
    color: #c9ffde;
  }

  .practice-feedback.pending {
    color: #ffdca8;
  }

  @media (max-width: 700px) {
    .terminal-input-row {
      grid-template-columns: 1fr;
      gap: 0.3rem;
    }

    .terminal-input-row span {
      display: none;
    }

    .terminal-input-row button {
      width: 100%;
    }
  }
</style>
