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

<div class="card-cyber shadow-card-glow hover:shadow-card-glow-hover transition-shadow duration-500">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-card bg-obsidian-accent/15 flex items-center justify-center border border-obsidian-accent/30">
        <Play class="w-4 h-4 text-obsidian-accent" />
      </div>
      <div>
        <h3 class="text-sm font-orbitron font-bold text-obsidian-text-muted">In Progress</h3>
        <p class="text-xs font-mono text-[var(--text-muted)]">{containers.length} stack{containers.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
    <a
      href="/projects?view=current"
      class="tag-cyber tag-cyan flex items-center gap-1 hover:bg-obsidian-accent/15 transition-colors cursor-pointer"
    >
      See All
      <ChevronRight class="w-3 h-3" />
    </a>
  </div>

    <!-- Stack Cards -->
  <div class="p-4 min-h-[280px] flex flex-col">
    {#if containers.length > 0}
      <div class="space-y-3">
        {#each visibleContainers as container}
          <div class="bg-obsidian-bg border border-[var(--card-border)] rounded-card p-4 hover:border-[var(--card-hover)] transition-colors duration-300">
            <div class="relative">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-card bg-obsidian-accent/10 border border-obsidian-accent/25 flex items-center justify-center text-obsidian-accent">
                    <Container class="w-5 h-5" />
                  </div>
                  <div>
                    <h4 class="text-sm font-orbitron font-semibold text-obsidian-text-muted">
                      {container.scenario.name}
                    </h4>
                    {#if container.scenario.name}
                      <p class="text-xs font-mono text-[var(--accent)] opacity-70 mt-0.5 truncate">
                        {parseStackName(container.stackName ?? '')}
                      </p>
                    {/if}
                  </div>
                </div>
                <div class="flex items-center gap-1 font-mono text-xs text-[var(--text-muted)]">
                  <Clock class="w-3 h-3" />
                  <span>{formatLastActive(container.updated_at)}</span>
                </div>
              </div>

              <div class="flex justify-between text-xs">
                <span class="font-mono text-[var(--text-muted)]">Level {container.level}</span>
                <span class="tag-cyber tag-cyan">{container.status}</span>
              </div>

              <div class="flex items-center gap-2 mt-3">
                <a href="/workspace/{container.id}" class="btn-cyber btn-cyber-outline flex-1 !py-2 !px-4 flex items-center justify-center gap-2 text-xs">
                  <Play class="w-3 h-3" />
                  Continue
                </a>
                <button
                  type="button"
                  aria-label="Delete {container.scenario.name} workspace"
                  title="Delete workspace"
                  on:click={() => openDeleteConfirmation(container)}
                  class="btn-cyber !p-2 border border-cyber-danger/40 text-cyber-danger hover:bg-cyber-danger/15 hover:border-cyber-danger/70"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <p class="text-lg font-orbitron text-obsidian-text-primary/40">No stacks in progress</p>
          <a href="/stacks" class="btn-cyber btn-cyber-outline inline-flex items-center gap-2 !px-4 !py-2 mt-4 text-xs">
            <Play class="w-3 h-3" />
            Start a Stack
          </a>
        </div>
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
