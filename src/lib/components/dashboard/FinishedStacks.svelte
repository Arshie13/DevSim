<script lang="ts">
  import { goto } from "$app/navigation";
  import { Trophy, ChevronRight, Coins, RotateCcw } from "lucide-svelte";
  import LoadingSteps from "$lib/components/ui/LoadingSteps.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import { type IContainer } from "$lib/types";
  import { parseStackName } from '$lib/utils/stacks';

  export let containers: IContainer[] = [];
  export let maxVisible: number = 2;
  export let userCoins: number = 0;

  $: visibleContainers = containers.slice(0, maxVisible);

  function shortStackLabel(stackName: string): string {
    const parsed = parseStackName(stackName);
    const dashIndex = parsed.indexOf(' — ');
    return dashIndex === -1 ? parsed : parsed.slice(0, dashIndex);
  }

  const RESTORE_COST = 100;

  const RESTORE_STEPS = [
    { icon: "🪙", label: "Validating wallet…",       detail: "Checking coin balance & container ownership" },
    { icon: "🐳", label: "Spinning up container…",   detail: "Creating a fresh Docker container" },
    { icon: "📂", label: "Copying workspace data…",  detail: "Streaming saved volume into the new container" },
    { icon: "✅", label: "Finalising restore…",       detail: "Updating records & removing old volume" },
  ];

  let paywallStack: IContainer | null = null;
  let paywallOpen = false;
  let isRestoring = false;
  let restoreStep = 0;
  let restoreError = "";
  let stepTimer: ReturnType<typeof setInterval> | null = null;

  function openPaywall(stack: IContainer) {
    paywallStack = stack;
    paywallOpen = true;
    restoreError = "";
  }

  function closePaywall() {
    if (isRestoring) return;
    paywallOpen = false;
    restoreError = "";
  }

  function startStepTimer() {
    // Advance through steps 0→2 automatically; step 3 is only shown on success.
    stepTimer = setInterval(() => {
      if (restoreStep < RESTORE_STEPS.length - 2) {
        restoreStep += 1;
      }
    }, 2200);
  }

  function stopStepTimer() {
    if (stepTimer !== null) {
      clearInterval(stepTimer);
      stepTimer = null;
    }
  }

  async function handleRestore() {
    if (!paywallStack) return;

    isRestoring = true;
    restoreStep = 0;
    restoreError = "";
    startStepTimer();

    // Close the confirm modal — loading overlay takes over
    paywallOpen = false;

    try {
      const res = await fetch(`/api/docker/container/${paywallStack.id}/restore`, {
        method: "POST",
      });

      stopStepTimer();

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }

      const data = await res.json();

      // Flash the final "Finalising" step briefly before navigating.
      restoreStep = RESTORE_STEPS.length - 1;
      await new Promise((r) => setTimeout(r, 800));

      await goto(`/workspace/${data.newContainerId}`);
    } catch (err) {
      stopStepTimer();
      restoreError = err instanceof Error ? err.message : "Restore failed. Please try again.";
      isRestoring = false;
      // Re-open the modal to show the error
      paywallOpen = true;
    }
  }
</script>

<div class="card-cyber shadow-card-glow hover:shadow-card-glow-hover transition-shadow duration-500 relative overflow-hidden flex flex-col h-full min-h-0">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-3 border-b border-[var(--card-border)] shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-7 h-7 rounded-card bg-cyber-warn/15 flex items-center justify-center border border-cyber-warn/30">
        <Trophy class="w-3.5 h-3.5 text-cyber-warn" />
      </div>
      <div>
        <h3 class="text-sm font-heading font-bold text-obsidian-text-primary">Completed</h3>
        <p class="text-[10px] font-mono text-[var(--text-muted)]">{containers.length} stack{containers.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
    <a
      href="/projects?view=finished"
      class="tag-cyber tag-warn flex items-center gap-1 hover:bg-cyber-warn/15 transition-colors cursor-pointer"
    >
      See All
      <ChevronRight class="w-3 h-3" />
    </a>
  </div>

  <!-- Completed Stack Cards -->
  <div class="flex-1 min-h-0 p-4 flex flex-col">
    {#if containers.length > 0}
      <div class="grid h-full min-h-0 grid-rows-3 gap-2 overflow-y-auto">
        {#each visibleContainers as container}
          {@const canRestore = container.isArchived && container.volumeName}
          <div
            class="flex h-full min-h-0 flex-col justify-between rounded-card border border-[var(--card-border)] bg-obsidian-surface/40 p-2.5 transition-colors duration-300 hover:border-cyber-warn/35"
            style="border-left: 3px solid rgb(var(--warn-rgb) / 0.7)"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex min-w-0 items-center gap-2">
                <div class="w-7 h-7 shrink-0 rounded-card bg-obsidian-surface/70 border border-[var(--card-border)] text-obsidian-text-muted flex items-center justify-center">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 class="text-sm font-heading font-semibold text-obsidian-text-primary truncate">{container.scenario?.name ?? parseStackName(container.stackName ?? '')}</h4>
              </div>
            </div>
            <p class="text-[10px] font-mono uppercase tracking-wider text-obsidian-text-muted truncate">
              {shortStackLabel(container.stackName ?? '')} · Level {container.level}
            </p>
            <div class="flex items-center justify-between gap-2">
              {#if canRestore}
                <button
                  on:click={() => openPaywall(container)}
                  class="btn-cyber flex items-center gap-2 !py-1 !px-2.5 bg-cyber-warn/10 border border-cyber-warn/30 text-cyber-warn text-xs hover:bg-cyber-warn/20 hover:border-cyber-warn/50 hover:shadow-[0_0_15px_rgb(var(--warn-rgb)_/_0.15)] transition-all duration-200"
                >
                  <RotateCcw class="w-3 h-3" />
                  Restore Progress
                </button>
              {:else}
                <span class="text-[10px] font-mono uppercase tracking-wider text-obsidian-text-muted">Not restorable</span>
              {/if}
            </div>
          </div>
        {/each}
        {#if visibleContainers.length > 0 && visibleContainers.length < 3}
          {#each Array.from({ length: 3 - visibleContainers.length }) as _}
            <div class="flex h-full min-h-0 items-center justify-center rounded-card border border-dashed border-[var(--card-border)] opacity-50">
              <span class="text-[9px] font-mono uppercase tracking-wider text-obsidian-text-muted">Open slot</span>
            </div>
          {/each}
        {/if}
      </div>
    {:else}
      <div class="flex-1 flex flex-col items-center justify-center text-center gap-2">
        <div class="w-12 h-12 rounded-card bg-cyber-warn/15 border border-cyber-warn/30 text-cyber-warn flex items-center justify-center">
          <Trophy class="w-6 h-6" />
        </div>
        <p class="font-heading text-lg text-obsidian-text-primary/60">No completed stacks yet</p>
        <p class="text-sm text-obsidian-text-muted">Finish a stack to earn XP, coins and achievements.</p>
        <a href="/stacks" class="btn-cyber btn-cyber-outline inline-flex items-center gap-2 !px-4 !py-2 mt-4 text-xs">
          <ChevronRight class="w-3 h-3" />
          Browse Stacks
        </a>
      </div>
    {/if}
  </div>
</div>

<!-- Restore Paywall — ConfirmationModal -->
{#if paywallStack}
  <ConfirmationModal
    bind:open={paywallOpen}
    icon="🔄"
    iconVariant="warning"
    title="Restore Workspace?"
    confirmLabel="Confirm ({RESTORE_COST} 🪙)"
    cancelLabel="Cancel"
    variant="warning"
    error={restoreError}
    on:confirm={handleRestore}
    on:cancel={closePaywall}
  >
    <!-- Stack preview + cost/balance info -->
    <div class="space-y-3">
      <!-- Stack card -->
      <div class="flex items-center gap-3 bg-obsidian-bg border border-[rgb(var(--accent-rgb)_/_0.12)] rounded-card px-4 py-3">
        <div>
          <p class="font-mono text-[0.85rem] font-semibold text-obsidian-text-primary">{paywallStack.scenario?.name ?? parseStackName(paywallStack.stackName ?? '')}</p>
          {#if paywallStack.scenario?.name}
            <p class="font-mono text-xs text-obsidian-text-muted">{parseStackName(paywallStack.stackName ?? '')}</p>
          {/if}
          <p class="font-mono text-xs text-obsidian-text-muted mt-0.5">Level {paywallStack.level}</p>
        </div>
      </div>

      <!-- Cost row -->
      <div class="flex items-center justify-between bg-cyber-warn/[0.06] border border-cyber-warn/20 rounded-card px-4 py-2.5">
        <span class="font-mono text-[0.8rem] text-obsidian-text-muted uppercase tracking-wider">Restore cost</span>
        <div class="flex items-center gap-1.5 text-cyber-warn font-mono font-semibold text-[0.85rem]">
          <Coins class="w-4 h-4" />
          <span>{RESTORE_COST} coins</span>
        </div>
      </div>

      <!-- Balance row -->
      <div class="flex items-center justify-between px-1">
        <span class="font-mono text-xs text-obsidian-text-muted">Your balance</span>
        <span class="font-mono text-xs font-semibold {userCoins >= RESTORE_COST ? 'text-cyber-success' : 'text-cyber-danger'}">
          🪙 {userCoins} coins
        </span>
      </div>

      {#if userCoins < RESTORE_COST}
        <p class="font-mono text-xs text-cyber-danger/80 text-center">
          Not enough coins. Earn more by completing sprints.
        </p>
      {/if}
    </div>
  </ConfirmationModal>
{/if}

<!-- ── Restore Loading Overlay ──────────────────────────────────────────── -->
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
