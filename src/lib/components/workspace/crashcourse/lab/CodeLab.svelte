<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let code: string = "";
  export let feedback: string = "";
  export let isPassed: boolean = false;

  const dispatch = createEventDispatcher<{ check: void }>();
</script>

<div class="mini-editor">
  <textarea bind:value={code} spellcheck="false"></textarea>
  <div class="editor-actions">
    <button type="button" on:click={() => dispatch("check")}>Check</button>
    {#if feedback}
      <p class={`practice-feedback ${isPassed ? "pass" : "pending"}`}>{feedback}</p>
    {/if}
  </div>
</div>

<style>
  .mini-editor textarea {
    width: 100%;
    min-height: 180px;
    max-height: 180px;
    box-sizing: border-box;
    background: rgba(0, 0, 0, 0.38);
    border: 1px solid rgba(136, 146, 160, 0.38);
    color: #d7f5ff;
    padding: 0.55rem;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.72rem;
    resize: vertical;
  }

  .editor-actions {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .editor-actions p {
    margin: 0;
    color: #d0d7dd;
    font-family: "Exo 2", sans-serif;
    font-size: 0.76rem;
  }

  .editor-actions button {
    border: 1px solid rgba(7, 165, 201, 0.45);
    background: rgba(7, 165, 201, 0.12);
    color: #dff8ff;
    padding: 0.34rem 0.52rem;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.68rem;
    cursor: pointer;
  }

  .practice-feedback.pass {
    color: #c9ffde;
  }

  .practice-feedback.pending {
    color: #ffdca8;
  }
</style>
