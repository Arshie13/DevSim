<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { Play, Clock, ChevronRight, Container, Trash2 } from "lucide-svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import { parseStackName } from '$lib/utils/stacks';
  import type { IContainer } from "$types";

  export let containers: IContainer[];
  export let maxVisible: number = 2;

  let deletingContainerId: string | null = null;
  let deleteStack: IContainer | null = null;
  let deleteModalOpen = false;
  let deleteError = "";
  let removedContainerIds: string[] = [];

  $: visibleContainers = containers
    .filter((container) => !removedContainerIds.includes(container.id))
    .slice(0, maxVisible);

  function shortStackLabel(stackName: string): string {
    const parsed = parseStackName(stackName);
    const dashIndex = parsed.indexOf(' — ');
    return dashIndex === -1 ? parsed : parsed.slice(0, dashIndex);
  }

  function openDeleteConfirmation(container: IContainer) {
    deleteStack = container;
    deleteError = "";
    deleteModalOpen = true;
  }

  function closeDeleteConfirmation() {
    if (deletingContainerId) return;
    deleteModalOpen = false;
    deleteStack = null;
    deleteError = "";
  }

  async function handleDelete() {
    if (!deleteStack) return;

    const container = deleteStack;
    deletingContainerId = container.id;
    deleteError = "";

    try {
      const response = await fetch(`/api/docker/container/${container.id}/destroy`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? `Delete failed (${response.status})`);
      }

      removedContainerIds = [...removedContainerIds, container.id];
      deleteModalOpen = false;
      deleteStack = null;
      await invalidateAll();
    } catch (error) {
      deleteError = error instanceof Error ? error.message : "Delete failed. Please try again.";
    } finally {
      deletingContainerId = null;
    }
  }

  function formatLastActive(date: Date | string | undefined): string {
    if (!date) return 'Just now';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return 'Just now';
    const now = new Date().getTime();
    const diff = now - d.getTime();
    if (diff < 0) return 'Just now';

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }
</script>

<div class="card-cyber shadow-card-glow hover:shadow-card-glow-hover transition-shadow duration-500 flex flex-col h-full min-h-0">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-3 border-b border-[var(--card-border)] shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-7 h-7 rounded-card bg-cyber-purple/15 flex items-center justify-center border border-cyber-purple/30">
        <Play class="w-3.5 h-3.5 text-cyber-purple" />
      </div>
      <div>
        <h3 class="text-lg font-heading font-bold text-obsidian-text-primary">In Progress</h3>
        <p class="text-xs font-mono text-[var(--text-muted)]">{containers.length} stack{containers.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
    <a
      href="/projects?view=current"
      class="tag-cyber tag-purple flex items-center gap-1 hover:bg-obsidian-accent/15 transition-colors cursor-pointer"
    >
      See All
      <ChevronRight class="w-3 h-3" />
    </a>
  </div>

  <!-- Stack Cards -->
  <div class="flex-1 min-h-0 p-4 flex flex-col">
    {#if containers.length > 0}
      <div class="grid h-full min-h-0 grid-rows-3 gap-2 overflow-y-auto">
        {#each visibleContainers as container}
          <div
            class="flex h-full min-h-0 flex-col justify-between rounded-card border border-[var(--card-border)] bg-obsidian-surface/40 p-2.5 transition-colors duration-300 hover:border-[rgb(var(--purple-rgb)_/_0.35)]"
            style="border-left: 3px solid rgb(var(--purple-rgb) / 0.7)"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex min-w-0 items-center gap-2">
                <div class="w-7 h-7 shrink-0 rounded-card bg-obsidian-surface/70 border border-[var(--card-border)] text-obsidian-text-muted flex items-center justify-center">
                  <Container class="w-3.5 h-3.5" />
                </div>
                <h4 class="text-md font-heading font-semibold text-obsidian-text-primary truncate">{container.scenario.name}</h4>
              </div>
              <span class="tag-cyber tag-cyan shrink-0 !py-0.5 !px-2 !text-xs">{container.status}</span>
            </div>
            <p class="text-xs font-mono uppercase tracking-wider text-obsidian-text-muted truncate">
              {shortStackLabel(container.stackName ?? '')} · Level {container.level} · <Clock class="w-3.5 h-3.5 inline" /> {formatLastActive(container.updated_at)}
            </p>
            <div class="flex items-center justify-between gap-2">
              <a href="/workspace/{container.id}" class="btn-cyber btn-cyber-outline !py-1 !px-2.5 flex items-center gap-1.5 text-xs">
                <Play class="w-3.5 h-3.5" />Continue
              </a>
              <button type="button" aria-label="Delete {container.scenario.name} workspace" title="Delete workspace" on:click={() => openDeleteConfirmation(container)}
                class="btn-cyber !p-1.5 border border-cyber-danger/40 text-cyber-danger hover:bg-cyber-danger/15 hover:border-cyber-danger/70">
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        {/each}
        {#if visibleContainers.length > 0 && visibleContainers.length < 3}
          {#each Array.from({ length: 3 - visibleContainers.length }) as _}
            <div class="flex h-full min-h-0 items-center justify-center rounded-card border border-dashed border-[var(--card-border)] opacity-50">
              <span class="text-xs font-mono uppercase tracking-wider text-obsidian-text-muted">Open slot</span>
            </div>
          {/each}
        {/if}
      </div>
    {:else}
      <div class="flex-1 flex flex-col items-center justify-center text-center gap-2">
        <div class="w-12 h-12 rounded-card bg-cyber-purple/15 border border-cyber-purple/30 text-cyber-purple flex items-center justify-center">
          <Play class="w-6 h-6" />
        </div>
        <p class="font-heading text-lg text-obsidian-text-primary/60">No stacks in progress</p>
        <p class="text-sm text-obsidian-text-muted">Pick a scenario and start building.</p>
        <a href="/stacks" class="btn-cyber btn-cyber-outline inline-flex items-center gap-2 !px-4 !py-2 mt-4 text-xs">
          <Play class="w-3 h-3" />
          Start a Stack
        </a>
      </div>
    {/if}
  </div>
</div>

{#if deleteStack}
  <ConfirmationModal
    bind:open={deleteModalOpen}
    icon="⚠"
    iconVariant="danger"
    title="Delete Workspace?"
    description="This will permanently delete the workspace and its Docker container. This action cannot be undone."
    confirmLabel="Delete Workspace"
    cancelLabel="Cancel"
    variant="danger"
    isLoading={deletingContainerId === deleteStack.id}
    loadingLabel="Deleting..."
    error={deleteError}
    on:confirm={handleDelete}
    on:cancel={closeDeleteConfirmation}
  >
    <p class="font-mono text-sm text-[var(--text-muted)] mb-4">
      {deleteStack.scenario?.name ?? "This workspace"}
    </p>
  </ConfirmationModal>
{/if}
