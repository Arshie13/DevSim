<script lang="ts">
  import { RotateCcw, Coins } from "lucide-svelte";
  import { parseStackName } from "$lib/utils/stacks";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import LoadingSteps from "$lib/components/ui/LoadingSteps.svelte";
  import { toast } from "$lib/stores/toast";
  import type { IContainer } from "$types";
  import ProjectCard from "./ProjectCard.svelte";
  import RestoreSuccessModal from "./RestoreSuccessModal.svelte";

  export let containers: IContainer[] = [];
  export let userCoins: number = 0;

  const RESTORE_COST = 100;

  const RESTORE_STEPS = [
    { icon: "🪙", label: "Validating wallet…",       detail: "Checking coin balance & container ownership" },
    { icon: "🐳", label: "Spinning up container…",   detail: "Creating a fresh Docker container" },
    { icon: "📂", label: "Copying workspace data…",  detail: "Streaming saved volume into the new container" },
    { icon: "✅", label: "Finalising restore…",       detail: "Updating records & removing old volume" },
  ];

  let target: IContainer | null = null;
  let confirmOpen = false;
  let isRestoring = false;
  let restoreStep = 0;
  let restoreError = "";
  let stepTimer: ReturnType<typeof setInterval> | null = null;

  let successOpen = false;
  let restoredContainerId = "";

  function canRestore(c: IContainer): boolean {
    return Boolean(c.isArchived && c.volumeName);
  }

  function openConfirm(c: IContainer) {
    if (!canRestore(c)) return;
    target = c;
    confirmOpen = true;
    restoreError = "";
  }

  function closeConfirm() {
    if (isRestoring) return;
    confirmOpen = false;
    restoreError = "";
  }

  function startStepTimer() {
    stepTimer = setInterval(() => {
      if (restoreStep < RESTORE_STEPS.length - 2) restoreStep += 1;
    }, 2200);
  }

  function stopStepTimer() {
    if (stepTimer !== null) {
      clearInterval(stepTimer);
      stepTimer = null;
    }
  }

  async function handleRestore() {
    if (!target) return;
    const t = target;

    isRestoring = true;
    restoreStep = 0;
    restoreError = "";
    confirmOpen = false;
    startStepTimer();

    try {
      const res = await fetch(`/api/docker/container/${t.id}/restore`, { method: "POST" });

      stopStepTimer();

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }

      const data = await res.json();

      restoreStep = RESTORE_STEPS.length - 1;
      await new Promise((r) => setTimeout(r, 700));

      isRestoring = false;
      target = null;

      restoredContainerId = data.newContainerId ?? t.id;
      successOpen = true;
    } catch (err) {
      stopStepTimer();
      restoreError = err instanceof Error ? err.message : "Restore failed. Please try again.";
      toast.error(restoreError);
      isRestoring = false;
      confirmOpen = true;
    }
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  {#each containers as c (c.id)}
    {@const enabled = canRestore(c) && userCoins >= RESTORE_COST}
    <ProjectCard container={c} variant="finished">
      <svelte:fragment slot="actions">
        <button
          type="button"
          class="action-btn action-btn--restore"
          on:click={() => openConfirm(c)}
          disabled={!enabled}
          aria-disabled={!enabled}
          title={!canRestore(c)
            ? "This stack cannot be restored"
            : userCoins < RESTORE_COST
              ? `Not enough coins (need ${RESTORE_COST})`
              : "Restore workspace progress"}
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Restore</span>
          <span class="cost-chip">
            <Coins class="w-3 h-3" />
            {RESTORE_COST}
          </span>
        </button>
      </svelte:fragment>
    </ProjectCard>
  {/each}
</div>

<!-- Restore Confirmation -->
{#if target}
  <ConfirmationModal
    bind:open={confirmOpen}
    icon="🔄"
    iconVariant="warning"
    title="Restore Workspace?"
    confirmLabel="Confirm ({RESTORE_COST} 🪙)"
    cancelLabel="Cancel"
    variant="warning"
    error={restoreError}
    on:confirm={handleRestore}
    on:cancel={closeConfirm}
  >
    <div class="space-y-3">
      <div class="info-row">
        <p class="info-title">{target.scenario?.name ?? parseStackName(target.workspace_stacks ?? [])}</p>
        {#if target.scenario?.name}
          <p class="info-sub">{parseStackName(target.workspace_stacks ?? [])}</p>
        {/if}
        <p class="info-sub">Level {target.level}</p>
      </div>

      <div class="cost-row">
        <span class="cost-label">Restore cost</span>
        <div class="cost-value">
          <Coins class="w-4 h-4" />
          <span>{RESTORE_COST} coins</span>
        </div>
      </div>

      <div class="balance-row">
        <span class="balance-label">Your balance</span>
        <span class="balance-value" class:ok={userCoins >= RESTORE_COST} class:bad={userCoins < RESTORE_COST}>
          🪙 {userCoins} coins
        </span>
      </div>

      {#if userCoins < RESTORE_COST}
        <p class="warning-line">Not enough coins. Earn more by completing sprints.</p>
      {/if}
    </div>
  </ConfirmationModal>
{/if}

<!-- Loading Overlay -->
{#if isRestoring}
  <LoadingSteps
    overlay
    step={restoreStep}
    steps={RESTORE_STEPS}
    icon="🔄"
    title="Restoring Workspace"
    subtitle="Please keep this window open. This may take a moment."
    footer="DEVSIM · WORKSPACE RESTORE"
    error={restoreError}
    errorPrefix="Restore failed"
    on:retry={handleRestore}
  />
{/if}

<!-- Success Modal -->
<RestoreSuccessModal bind:open={successOpen} newContainerId={restoredContainerId} />

<style>
  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.95rem;
    font-family: var(--font-heading);
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    color: var(--warn);
    border: 1px solid rgba(255, 180, 0, 0.5);
    background: rgba(255, 180, 0, 0.06);
    transition: all 0.2s ease;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
  }

  .action-btn:hover:not(:disabled) {
    background: rgba(255, 180, 0, 0.16);
    border-color: rgba(255, 180, 0, 0.9);
    box-shadow: 0 0 14px rgba(255, 180, 0, 0.3);
  }

  .action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .cost-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 0.62rem;
    background: rgba(255, 180, 0, 0.18);
    border: 1px solid rgba(255, 180, 0, 0.4);
    margin-left: 0.2rem;
  }

  /* Modal body */
  .info-row {
    background: rgba(10, 14, 26, 0.6);
    border: 1px solid rgba(7, 165, 201, 0.18);
    border-radius: 4px;
    padding: 0.75rem 1rem;
  }

  .info-title {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .info-sub {
    margin: 0.2rem 0 0;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  .cost-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 1rem;
    border-radius: 4px;
    background: rgba(255, 180, 0, 0.06);
    border: 1px solid rgba(255, 180, 0, 0.25);
  }

  .cost-label {
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-family: var(--font-mono);
    font-size: 0.66rem;
  }

  .cost-value {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--warn);
    font-family: var(--font-mono);
    font-size: 0.78rem;
    font-weight: 700;
  }

  .balance-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.25rem;
  }

  .balance-label {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-muted);
  }

  .balance-value {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 700;
  }

  .balance-value.ok  { color: var(--success); }
  .balance-value.bad { color: var(--danger); }

  .warning-line {
    margin: 0;
    text-align: center;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: rgba(255, 56, 96, 0.85);
  }
</style>
