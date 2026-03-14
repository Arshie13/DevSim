<script lang="ts">
  import { onMount } from 'svelte';

  /** Callback fired when the button is clicked. */
  export let onOpen: () => void;

  let pulsing = true;

  onMount(() => {
    // Pulse/glow animation for ~3 seconds on first load, then settle
    const t = setTimeout(() => (pulsing = false), 3400);
    return () => clearTimeout(t);
  });
</script>

<button
  class="hb-btn"
  class:hb-pulsing={pulsing}
  on:click={onOpen}
  data-tour="help-button"
  title="Workspace Guide"
  aria-label="Open workspace guide"
>
  <!-- Question mark icon -->
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    aria-hidden="true"
  >
    <path
      d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" stroke-width="1.5"/>
  </svg>
</button>

<style>
  .hb-btn {
    position: fixed;
    bottom: 1.4rem;
    right: 1.4rem;
    z-index: 9990;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: #07a5c9;
    border: none;
    color: #0a0e1a;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 14px rgba(7, 165, 201, 0.42);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .hb-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 22px rgba(7, 165, 201, 0.65);
  }
  .hb-btn:active {
    transform: scale(0.96);
  }

  /* Pulse glow on first load (~3 s, 2 cycles) */
  .hb-pulsing {
    animation: hbPulse 1.6s ease-in-out 2;
  }

  @keyframes hbPulse {
    0%, 100% {
      box-shadow: 0 2px 14px rgba(7, 165, 201, 0.42);
    }
    50% {
      box-shadow:
        0 0 0 10px rgba(7, 165, 201, 0.12),
        0 0 0 20px rgba(7, 165, 201, 0.05),
        0 4px 22px rgba(7, 165, 201, 0.6);
    }
  }
</style>
