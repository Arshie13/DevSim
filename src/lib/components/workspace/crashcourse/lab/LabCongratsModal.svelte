<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let title: string = "Lab Completed";
  export let message: string = "Great work. Your lab result has been recorded.";

  const dispatch = createEventDispatcher<{ confirm: void }>();
</script>

<div class="lab-success-overlay" role="dialog" aria-modal="true" aria-label="Lab completed">
  <div class="lab-success-modal">
    <h4>{title}</h4>
    <p>{message}</p>
    <button type="button" on:click={() => dispatch("confirm")}>Back to Crash Course</button>
  </div>
</div>

<style>
  .lab-success-overlay {
    position: fixed;
    inset: 0;
    z-index: 10070;
    display: grid;
    place-items: center;
    background: rgba(3, 8, 18, 0.5);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    padding: 1rem;
  }

  .lab-success-modal {
    width: min(420px, calc(100vw - 2rem));
    background: rgba(10, 14, 26, 0.97);
    border: 1px solid rgba(7, 165, 201, 0.35);
    padding: 1rem;
    box-sizing: border-box;
    text-align: center;
  }

  .lab-success-modal h4 {
    margin: 0 0 0.5rem;
    color: #d8ffe9;
    font-family: "Orbitron", monospace;
    font-size: 0.85rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .lab-success-modal p {
    margin: 0 0 0.8rem;
    color: #d0d7dd;
    font-family: "Exo 2", sans-serif;
    font-size: 0.8rem;
    line-height: 1.35;
  }

  .lab-success-modal button {
    border: 1px solid rgba(32, 197, 129, 0.5);
    background: rgba(32, 197, 129, 0.18);
    color: #e9fff3;
    padding: 0.38rem 0.65rem;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.67rem;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    cursor: pointer;
  }
</style>
