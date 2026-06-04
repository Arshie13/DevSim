<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { TutorialStep } from "$components/tutorial/tutorialTypes";

  export let step: TutorialStep;
  export let stack: string;
  export let progress: string;
  export let isCommandStep: boolean;
  export let isManualConfirmStep: boolean;
  export let manualConfirmDisabled: boolean;
  export let pointerReady: boolean;
  export let waitingForTarget: boolean;
  export let clickError: string;
  export let allowSkip: boolean;
  export let arrowDir: "top" | "bottom" | "left" | "right";
  export let arrowOffset: string;
  export let calloutTop: number;
  export let calloutLeft: number;

  const dispatch = createEventDispatcher<{ skip: void; advance: void; runTests: void; submitSprint: void }>();

  let copySuccess = false;

  function renderMarkdown(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, '<code class="pt-inline-code">$1</code>')
      .replace(/\n/g, "<br>");
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copySuccess = true;
      setTimeout(() => { copySuccess = false; }, 2000);
    } catch {
      copySuccess = false;
    }
  }
</script>

<div class="pt-overlay" aria-live="polite">
  <div
    class="pt-panel"
    class:pt-panel--locating={waitingForTarget && !pointerReady}
    role="dialog"
    aria-modal="false"
    aria-label="Interactive tutorial"
    style="top:{calloutTop}px; left:{calloutLeft}px;"
  >
    {#if pointerReady}
      <div
        class="pt-arrow pt-arrow-{arrowDir}"
        style={arrowDir === "top" || arrowDir === "bottom" ? `left:${arrowOffset};` : `top:${arrowOffset};`}
        aria-hidden="true"
      >→</div>
    {/if}

    {#if allowSkip}
      <button class="pt-skip-btn" on:click={() => dispatch("skip")} title="Skip tutorial">Skip</button>
    {/if}

    <header class="pt-header">
      <p class="pt-eyebrow">{stack} Interactive Tutorial</p>
      <h3>{step.title}</h3>
      <span class="pt-progress">Step {progress}</span>
    </header>

    <div class="pt-body">
      <p class="pt-instruction">{@html renderMarkdown(step.instruction)}</p>
      <p class="pt-hint">{@html renderMarkdown(step.hint ?? "")}</p>
      {#if step.copyText}
        <button
          class="pt-btn pt-btn-secondary pt-copy-btn"
          on:click={() => handleCopy(step.copyText ?? "")}
        >{copySuccess ? "✓ Copied!" : "Copy Example"}</button>
      {/if}
    </div>

    {#if waitingForTarget && !pointerReady}
      <p class="pt-muted">Locating target in the workspace...</p>
    {/if}
    {#if clickError}
      <p class="pt-error">{clickError}</p>
    {/if}

    {#if isCommandStep}
      <code class="pt-command">Run in terminal: {step.command}</code>
    {:else if isManualConfirmStep}
      <button
        class="pt-btn pt-btn-primary"
        on:click={() => dispatch("advance")}
        disabled={manualConfirmDisabled}
      >
        {manualConfirmDisabled ? "Save your UI change first" : step.confirmLabel}
      </button>
    {:else if step.action === "runTests"}
      <button class="pt-btn pt-btn-primary" on:click={() => dispatch("runTests")}>Run Tests</button>
    {:else if step.action === "submitSprint"}
      <button class="pt-btn pt-btn-primary" on:click={() => dispatch("submitSprint")}>Submit Sprint</button>
    {/if}
  </div>
</div>

<style>
  .pt-overlay {
    position: fixed;
    inset: 0;
    z-index: 10045;
    pointer-events: none;
  }

  .pt-panel {
    position: fixed;
    z-index: 10046;
    width: min(440px, calc(90vw - 2rem));
    min-height: 320px;
    max-height: min(75vh, 520px);
    overflow: hidden;
    background: #0d1425;
    border: 1px solid rgba(0, 194, 255, 0.45);
    border-radius: 6px;
    box-shadow: 0 12px 50px rgba(0, 0, 0, 0.55);
    padding: 0.85rem;
    pointer-events: auto;
    color: #d0d7dd;
    font-family: "Rajdhani", sans-serif;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .pt-panel--locating { visibility: hidden; pointer-events: none; }

  .pt-arrow {
    position: absolute;
    color: #00c2ff;
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1;
    text-shadow: 0 0 8px rgba(0, 194, 255, 0.8);
  }

  .pt-arrow-top    { bottom: calc(100% + 4px); transform: translateX(-50%) rotate(-90deg); }
  .pt-arrow-bottom { top: calc(100% + 4px);    transform: translateX(-50%) rotate(90deg); }
  .pt-arrow-left   { right: calc(100% + 4px);  transform: translateY(-50%) rotate(180deg); }
  .pt-arrow-right  { left: calc(100% + 4px);   transform: translateY(-50%); }

  .pt-header {
    border-bottom: 1px solid rgba(0, 194, 255, 0.2);
    padding-bottom: 0.55rem;
    margin-bottom: 0.55rem;
  }

  .pt-eyebrow {
    margin: 0;
    color: #00c2ff;
    font-family: "Share Tech Mono", monospace;
    text-transform: uppercase;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
  }

  h3 { margin: 0.35rem 0; font-family: "Orbitron", sans-serif; font-size: 1.1rem; }

  .pt-progress {
    font-family: "Share Tech Mono", monospace;
    font-size: 0.78rem;
    color: rgba(208, 215, 221, 0.72);
  }

  .pt-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    padding-right: 0.25rem;
    box-sizing: border-box;
  }

  .pt-instruction { margin: 0; line-height: 1.45; word-break: break-word; overflow-wrap: anywhere; hyphens: auto; }
  .pt-hint { margin: 0; color: rgba(208, 215, 221, 0.72); font-size: 0.88rem; line-height: 1.4; word-break: break-word; overflow-wrap: anywhere; hyphens: auto; }
  :global(.pt-inline-code) { font-family: "Share Tech Mono", monospace; font-size: 0.85em; background: rgba(0, 194, 255, 0.1); border: 1px solid rgba(0, 194, 255, 0.25); border-radius: 3px; padding: 0.05em 0.3em; color: #00e5a0; }

  .pt-command {
    display: block;
    margin: 0.2rem 0 0.55rem;
    color: #00e5a0;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.74rem;
    white-space: pre-wrap;
    word-break: break-all;
    overflow-wrap: break-word;
    overflow: hidden;
  }

  .pt-error { margin: 0 0 0.55rem; color: #ff6b6b; font-size: 0.84rem; }
  .pt-muted { margin: 0 0 0.55rem; color: rgba(208, 215, 221, 0.72); font-size: 0.82rem; }

  .pt-skip-btn {
    position: absolute;
    top: 0.75rem;
    right: 0.7rem;
    background: none;
    border: none;
    padding: 0.15rem 0.3rem;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.64rem;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: rgba(208, 215, 221, 0.28);
    cursor: pointer;
    transition: color 0.18s;
    z-index: 1;
  }
  .pt-skip-btn:hover { color: rgba(208, 215, 221, 0.65); }

  .pt-btn {
    border-radius: 4px;
    border: 1px solid transparent;
    padding: 0.42rem 0.62rem;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.72rem;
    cursor: pointer;
  }

  .pt-copy-btn { align-self: flex-start; margin-top: 0.2rem; margin-bottom: 0.55rem; }
  .pt-btn-primary { background: #00c2ff; color: #0a0e1a; border-color: #00c2ff; }
  .pt-btn-secondary { background: transparent; color: #00c2ff; border-color: rgba(0, 194, 255, 0.5); }

  @media (max-height: 700px), (max-width: 500px) {
    .pt-panel { padding: 1rem 0.9rem !important; min-height: 280px; max-height: 70vh; }
    .pt-instruction, .pt-hint { font-size: 0.86rem; line-height: 1.35; }
  }
</style>
