<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let showSkipConfirm: boolean = false;
  export let completionModalVisible: boolean = false;
  export let proceedLoading: boolean = false;

  const dispatch = createEventDispatcher<{
    skipConfirm: void;
    skipCancel: void;
    replay: void;
    proceed: void;
  }>();
</script>

{#if showSkipConfirm}
  <div class="pt-modal-backdrop" role="presentation">
    <div class="pt-modal-box" role="dialog" aria-modal="true" aria-label="Skip tutorial confirmation">
      <div class="pt-modal-accent" style="background:#ffb400;"></div>
      <p class="pt-eyebrow" style="color:#ffb400;">Skip Tutorial?</p>
      <h2 class="pt-modal-title">Are you sure you want to skip?</h2>
      <p class="pt-modal-body">
        You can restart the tutorial anytime from the scenario selection page using the Tutorial toggle.
      </p>
      <div class="pt-modal-actions">
        <button class="pt-btn pt-btn-ghost" on:click={() => dispatch("skipCancel")}>Keep Going</button>
        <button class="pt-btn pt-btn-warning" on:click={() => dispatch("skipConfirm")}>Skip Tutorial</button>
      </div>
    </div>
  </div>
{/if}

{#if completionModalVisible}
  <div class="pt-modal-backdrop" role="presentation">
    <div class="pt-modal-box" role="dialog" aria-modal="true" aria-label="Tutorial completed">
      <div class="pt-modal-accent"></div>
      {#if proceedLoading}
        <p class="pt-eyebrow">Setting Up Workspace</p>
        <h2 class="pt-modal-title">Preparing your real workspace...</h2>
        <p class="pt-modal-body">
          Cleaning up the tutorial environment and creating your workspace container. This may take a moment.
        </p>
        <div class="pt-proceed-loading">
          <span class="pt-spinner" aria-hidden="true"></span>
          <span class="pt-loading-label">Please wait...</span>
        </div>
      {:else}
        <p class="pt-eyebrow">Tutorial Complete</p>
        <h2 class="pt-modal-title">You completed the guided tutorial.</h2>
        <p class="pt-modal-body">
          Task 1 and Task 2 flow is now finished. Proceed to your workspace project to continue building.
        </p>
        <div class="pt-modal-actions">
          <button class="pt-btn pt-btn-ghost" on:click={() => dispatch("replay")}>Replay Tutorial</button>
          <button
            class="pt-btn pt-btn-primary"
            data-tour="tutorial-proceed-button"
            on:click={() => dispatch("proceed")}
          >Proceed To Workspace</button>
        </div>
      {/if}
    </div>
  </div>
{/if}

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

  .pt-modal-body {
    margin: 0;
    color: rgba(208, 215, 221, 0.84);
    line-height: 1.5;
    font-size: 0.92rem;
  }

  .pt-modal-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.45rem;
  }

  .pt-proceed-loading {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-top: 1.2rem;
    padding: 0.65rem 0.9rem;
    background: rgba(0, 194, 255, 0.07);
    border: 1px solid rgba(0, 194, 255, 0.2);
    border-radius: 4px;
  }

  .pt-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(0, 194, 255, 0.25);
    border-top-color: #00c2ff;
    border-radius: 50%;
    animation: pt-spin 0.75s linear infinite;
    flex-shrink: 0;
  }

  @keyframes pt-spin { to { transform: rotate(360deg); } }

  .pt-loading-label {
    font-family: "Share Tech Mono", monospace;
    font-size: 0.78rem;
    color: #00c2ff;
    letter-spacing: 0.06em;
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
  .pt-btn-warning { background: rgba(255, 180, 0, 0.12); color: #ffb400; border-color: rgba(255, 180, 0, 0.45); }

  @media (max-height: 700px), (max-width: 500px) {
    .pt-modal-box { padding: 1rem 0.9rem !important; margin: 0.5rem; }
  }
</style>
