<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let stack: string;
  export let title: string;
  export let scenario: string = "";
  export let level: number = 1;
  export let allowSkip: boolean = true;

  const dispatch = createEventDispatcher<{ begin: void; skip: void }>();
</script>

<div class="pt-modal-backdrop" role="presentation">
  <div class="pt-modal-box" role="dialog" aria-modal="true" aria-label="Tutorial introduction">
    <div class="pt-modal-accent"></div>
    <p class="pt-eyebrow">Welcome</p>
    <h2 class="pt-modal-title">Guided Sprint Tutorial</h2>
    <p class="pt-modal-meta">
      Level {String(level).padStart(2, "0")} · {stack} · {title}
    </p>
    <p class="pt-modal-body">
      You will complete Task 1 and Task 2 in order: board workflow, README
      setup, terminal commands, preview checks, and testing. Follow each
      highlighted action to proceed.
    </p>
    {#if scenario}
      <p class="pt-modal-scenario">{scenario}</p>
    {/if}
    <div class="pt-modal-actions">
      {#if allowSkip}
        <button class="pt-btn pt-btn-ghost" on:click={() => dispatch("skip")}>Skip Tutorial</button>
      {/if}
      <button class="pt-btn pt-btn-primary" on:click={() => dispatch("begin")}>Begin Tutorial</button>
    </div>
  </div>
</div>

<style>
  .pt-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10060;
    background: rgba(0, 0, 10, 0.88);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .pt-modal-box {
    width: min(520px, 90vw);
    max-height: min(92vh, 820px);
    overflow-y: auto;
    border-radius: 6px;
    border: 1px solid rgba(0, 194, 255, 0.35);
    background: #0d1425;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    padding: 1.35rem 1.2rem 1.15rem;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .pt-modal-accent {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: #00c2ff;
  }

  .pt-eyebrow {
    margin: 0;
    color: #00c2ff;
    font-family: "Share Tech Mono", monospace;
    text-transform: uppercase;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
  }

  .pt-modal-title {
    margin: 0.45rem 0 0.8rem;
    font-family: "Orbitron", sans-serif;
    color: #d0d7dd;
    font-size: 1.08rem;
  }

  .pt-modal-meta {
    margin: 0 0 0.45rem;
    color: #00c2ff;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-family: "Share Tech Mono", monospace;
  }

  .pt-modal-body {
    margin: 0;
    color: rgba(208, 215, 221, 0.84);
    line-height: 1.5;
    font-size: 0.92rem;
  }

  .pt-modal-scenario {
    margin: 0.75rem 0 0;
    color: rgba(208, 215, 221, 0.75);
    font-size: 0.82rem;
    line-height: 1.45;
    border-left: 2px solid rgba(0, 194, 255, 0.35);
    padding-left: 0.6rem;
  }

  .pt-modal-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.45rem;
  }

  .pt-btn {
    border-radius: 4px;
    border: 1px solid transparent;
    padding: 0.42rem 0.62rem;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.72rem;
    cursor: pointer;
  }

  .pt-btn-primary { background: #00c2ff; color: #0a0e1a; border-color: #00c2ff; }
  .pt-btn-ghost { background: transparent; color: rgba(208, 215, 221, 0.85); border-color: rgba(208, 215, 221, 0.25); }

  @media (max-height: 700px), (max-width: 500px) {
    .pt-modal-box { padding: 1rem 0.9rem !important; margin: 0.5rem; }
  }
</style>
