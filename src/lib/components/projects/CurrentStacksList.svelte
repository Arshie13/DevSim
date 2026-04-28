<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import { Play, Archive, Lock } from "lucide-svelte";
  import { parseStackName } from "$lib/utils/stacks";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import LoadingSteps from "$lib/components/ui/LoadingSteps.svelte";
  import { toast } from "$lib/stores/toast";
  import type { IContainer } from "$types";
  import ProjectCard from "./ProjectCard.svelte";

  export let containers: IContainer[] = [];

  const ARCHIVE_STEPS = [
    { icon: "💾", label: "Saving workspace state", detail: "Capturing /workspace into a tar stream" },
    { icon: "📦", label: "Creating persistent volume", detail: "Allocating named Docker volume" },
    { icon: "🧹", label: "Removing container",        detail: "Stopping and cleaning up the original container" },
    { icon: "✅", label: "Finalizing archive",         detail: "Updating database records" },
  ];

  let confirmTarget: IContainer | null = null;
  let confirmOpen = false;
  let isArchiving = false;
  let archiveStep = 0;
  let archiveError = "";
  let stepTimer: ReturnType<typeof setInterval> | null = null;

  function isArchivable(c: IContainer): boolean {
    return (c.status ?? "").toLowerCase() === "completed" && !c.isArchived;
  }

  function openArchiveConfirm(c: IContainer) {
    if (!isArchivable(c)) return;
    confirmTarget = c;
    confirmOpen = true;
    archiveError = "";
  }

  function closeConfirm() {
    if (isArchiving) return;
    confirmOpen = false;
    archiveError = "";
  }

  function startStepTimer() {
    stepTimer = setInterval(() => {
      if (archiveStep < ARCHIVE_STEPS.length - 2) archiveStep += 1;
    }, 1800);
  }

  function stopStepTimer() {
    if (stepTimer !== null) {
      clearInterval(stepTimer);
      stepTimer = null;
    }
  }

  function continueSprint(c: IContainer) {
    goto(`/workspace/${c.id}`);
  }

  async function handleArchive() {
    if (!confirmTarget) return;
    const target = confirmTarget;

    isArchiving = true;
    archiveStep = 0;
    archiveError = "";
    confirmOpen = false;
    startStepTimer();

    try {
      const res = await fetch(`/api/docker/container/${target.containerId}/archive`, {
        method: "POST",
      });

      stopStepTimer();

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Archive failed (${res.status})`);
      }

      archiveStep = ARCHIVE_STEPS.length - 1;
      await new Promise((r) => setTimeout(r, 700));

      toast.success("Stack archived. Restore it any time for 100 coins.");
      isArchiving = false;
      confirmTarget = null;
      await invalidateAll();
    } catch (err) {
      stopStepTimer();
      archiveError = err instanceof Error ? err.message : "Archive failed.";
      toast.error(archiveError);
      isArchiving = false;
      confirmOpen = true;
    }
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  {#each containers as c (c.id)}
    {@const archivable = isArchivable(c)}
    <ProjectCard container={c} variant="current">
      <svelte:fragment slot="actions">
        <button
          type="button"
          class="action-btn action-btn--continue"
          on:click={() => continueSprint(c)}
        >
          <Play class="w-3.5 h-3.5" />
          <span>Continue Sprint</span>
        </button>

        <button
          type="button"
          class="action-btn action-btn--archive"
          class:disabled={!archivable}
          aria-disabled={!archivable}
          on:click={() => openArchiveConfirm(c)}
          title={archivable
            ? "Archive this stack to free Docker resources"
            : "Complete the sprint before archiving"}
          disabled={!archivable}
        >
          {#if archivable}
            <Archive class="w-3.5 h-3.5" />
          {:else}
            <Lock class="w-3.5 h-3.5" />
          {/if}
          <span>Archive</span>
        </button>
      </svelte:fragment>
    </ProjectCard>
  {/each}
</div>

<!-- Confirm modal -->
{#if confirmTarget}
  <ConfirmationModal
    bind:open={confirmOpen}
    icon="📦"
    iconVariant="warning"
    title="Archive this stack?"
    subtitle="The container will be replaced with a saved volume."
    confirmLabel="Archive Stack"
    cancelLabel="Cancel"
    variant="warning"
    error={archiveError}
    on:confirm={handleArchive}
    on:cancel={closeConfirm}
  >
    <div class="space-y-3">
      <div class="info-row">
        <p class="info-title">{confirmTarget.scenario?.name ?? parseStackName(confirmTarget.workspace_stacks ?? [])}</p>
        {#if confirmTarget.scenario?.name}
          <p class="info-sub">{parseStackName(confirmTarget.workspace_stacks ?? [])}</p>
        {/if}
        <p class="info-sub">Level {confirmTarget.level}</p>
      </div>

      <div class="cost-row">
        <span class="cost-label">Restore cost later</span>
        <span class="cost-value">🪙 100 coins</span>
      </div>

      <p class="footnote">
        Your Docker container will be stopped and the workspace saved to a volume.
        You can restore it anytime from the Finished tab.
      </p>
    </div>
  </ConfirmationModal>
{/if}

<!-- Loading overlay -->
{#if isArchiving}
  <LoadingSteps
    overlay
    step={archiveStep}
    steps={ARCHIVE_STEPS}
    icon="📦"
    title="Archiving Workspace"
    subtitle="Please keep this window open. This may take a moment."
    footer="DEVSIM · WORKSPACE ARCHIVE"
    error={archiveError}
    errorPrefix="Archive failed"
    on:retry={handleArchive}
  />
{/if}

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
    border: 1px solid;
    background: transparent;
    transition: color 0.2s, background 0.2s, box-shadow 0.2s, border-color 0.2s;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
  }

  .action-btn--continue {
    color: var(--accent);
    border-color: rgba(7, 165, 201, 0.55);
    background: rgba(7, 165, 201, 0.06);
  }

  .action-btn--continue:hover {
    background: rgba(7, 165, 201, 0.16);
    border-color: rgba(7, 165, 201, 0.9);
    box-shadow: 0 0 14px rgba(7, 165, 201, 0.3);
  }

  .action-btn--archive {
    color: var(--warn);
    border-color: rgba(255, 180, 0, 0.5);
  }

  .action-btn--archive:hover:not(.disabled):not(:disabled) {
    background: rgba(255, 180, 0, 0.12);
    border-color: rgba(255, 180, 0, 0.9);
    box-shadow: 0 0 14px rgba(255, 180, 0, 0.3);
  }

  .action-btn.disabled,
  .action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    color: var(--text-muted);
    border-color: rgba(136, 146, 160, 0.3);
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
    font-family: var(--font-mono);
    font-size: 0.74rem;
  }

  .cost-label {
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.66rem;
  }

  .cost-value {
    color: var(--warn);
    font-weight: 700;
  }

  .footnote {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--text-muted);
    line-height: 1.55;
  }
</style>
