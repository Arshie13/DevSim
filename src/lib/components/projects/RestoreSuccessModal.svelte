<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import { Play, Layers } from "lucide-svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";

  export let open: boolean = false;
  export let newContainerId: string = "";

  let busy = false;

  async function continueToWorkspace() {
    if (!newContainerId || busy) return;
    busy = true;
    await goto(`/workspace/${newContainerId}`);
  }

  async function backToProjects() {
    if (busy) return;
    busy = true;
    open = false;
    await invalidateAll();
    busy = false;
  }
</script>

<ConfirmationModal
  bind:open
  icon="✅"
  iconVariant="success"
  title="Workspace Restored"
  subtitle="Your saved progress has been brought back online."
  variant="success"
  hideActions={true}
  closeOnBackdropClick={false}
>
  <div class="rs-body">
    <p class="rs-line">
      The container is up and ready. Choose where to go next.
    </p>

    <div class="rs-buttons">
      <button
        type="button"
        class="rs-btn rs-btn--primary"
        on:click={continueToWorkspace}
        disabled={busy}
      >
        <Play class="w-4 h-4" />
        <span>Continue to Workspace</span>
      </button>

      <button
        type="button"
        class="rs-btn rs-btn--ghost"
        on:click={backToProjects}
        disabled={busy}
      >
        <Layers class="w-4 h-4" />
        <span>Back to Projects</span>
      </button>
    </div>
  </div>
</ConfirmationModal>

<style>
  .rs-body {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    align-items: stretch;
  }

  .rs-line {
    margin: 0;
    text-align: center;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--text-muted);
    line-height: 1.6;
  }

  .rs-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    .rs-buttons { grid-template-columns: 1fr; }
  }

  .rs-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.7rem 1.1rem;
    font-family: var(--font-heading);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s ease;
    clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px));
  }

  .rs-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .rs-btn--primary {
    color: var(--bg);
    background: var(--success);
    border: 1px solid var(--success);
  }

  .rs-btn--primary:hover:not(:disabled) {
    background: #1bf2b2;
    box-shadow: 0 0 22px rgba(0, 229, 160, 0.45);
  }

  .rs-btn--ghost {
    color: var(--accent);
    background: transparent;
    border: 1px solid rgba(7, 165, 201, 0.55);
  }

  .rs-btn--ghost:hover:not(:disabled) {
    background: rgba(7, 165, 201, 0.1);
    border-color: rgba(7, 165, 201, 0.9);
    box-shadow: 0 0 18px rgba(7, 165, 201, 0.3);
  }
</style>
