<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let title: string = "Interactive Lab";
  export let instructions: string = "";
  export let isPassed: boolean = false;
  export let hint: string | null = null;
  export let hintsUsed: number = 0;

  const dispatch = createEventDispatcher<{ close: void }>();

  $: coinReward = hintsUsed === 0 ? 20 : hintsUsed === 1 ? 15 : hintsUsed === 2 ? 10 : 5;
</script>

<div class="lab-modal-overlay" role="dialog" aria-modal="true" aria-label="Interactive lab">
  <div class="lab-modal">
    <div class="lab-header">
      <h4>{title}</h4>
      <button type="button" class="close-lab-btn" on:click={() => dispatch("close")}>Close</button>
    </div>

    <p class="interactive-instructions">{instructions || "Interactive practice mode"}</p>

    {#if hint}
      <div class="lab-hint-bar" role="status">
        <span class="lab-hint-icon" aria-hidden="true">💡</span>
        <span class="lab-hint-text">{hint}</span>
      </div>
    {/if}

    {#if hintsUsed > 0}
      <p class="coin-note">Hints used: {hintsUsed} — coin reward: {coinReward} (20 max for no hints)</p>
    {/if}

    <div class="interactive-status-row">
      <span class={`interactive-status-pill ${isPassed ? "pass" : "pending"}`}>
        {isPassed ? "Practice complete" : "Practice pending"}
      </span>
    </div>

    <slot />
  </div>
</div>

<style>
  .lab-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 10060;
    display: grid;
    place-items: center;
    background: rgba(3, 8, 18, 0.55);
    backdrop-filter: blur(9px);
    -webkit-backdrop-filter: blur(9px);
    padding: 1rem;
  }

  .lab-modal {
    width: min(780px, calc(100vw - 2rem));
    background: rgba(10, 14, 26, 0.96);
    border: 1px solid rgba(7, 165, 201, 0.28);
    padding: 0.88rem;
    box-sizing: border-box;
  }

  .lab-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.65rem;
  }

  .lab-header h4 {
    margin: 0;
    color: #e4f8ff;
    font-family: "Orbitron", monospace;
    font-size: 0.86rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .close-lab-btn {
    border: 1px solid rgba(136, 146, 160, 0.45);
    background: rgba(255, 255, 255, 0.04);
    color: #d0d7dd;
    padding: 0.32rem 0.54rem;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.66rem;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .interactive-instructions {
    margin: 0 0 0.7rem;
    color: #d0d7dd;
    font-family: "Exo 2", sans-serif;
    font-size: 0.8rem;
    line-height: 1.35;
    white-space: pre-line;
  }

  .interactive-status-row {
    margin-bottom: 0.6rem;
  }

  .interactive-status-pill {
    display: inline-block;
    border: 1px solid rgba(136, 146, 160, 0.4);
    color: #b7c4d1;
    background: rgba(255, 255, 255, 0.03);
    padding: 0.18rem 0.48rem;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.64rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .lab-hint-bar {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    margin: 0 0 0.7rem;
    padding: 0.45rem 0.55rem;
    background: rgba(255, 200, 87, 0.1);
    border: 1px solid rgba(255, 184, 28, 0.35);
    border-radius: 2px;
  }

  .lab-hint-icon {
    font-size: 0.8rem;
    line-height: 1.3;
    flex: none;
  }

  .lab-hint-text {
    color: #ffdca8;
    font-family: "Exo 2", sans-serif;
    font-size: 0.74rem;
    line-height: 1.4;
  }

  .interactive-status-pill.pass {
    border-color: rgba(32, 197, 129, 0.5);
    color: #d8ffe9;
    background: rgba(32, 197, 129, 0.16);
  }

  .coin-note {
    margin: 0 0 0.55rem;
    color: #9db6c7;
    font-family: "Exo 2", sans-serif;
    font-size: 0.7rem;
    font-style: italic;
  }
</style>
