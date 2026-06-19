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

<div class="card-cyber shadow-card-glow hover:shadow-card-glow-hover transition-shadow duration-500 relative overflow-hidden">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-card bg-cyber-warn/15 flex items-center justify-center border border-cyber-warn/30">
        <Trophy class="w-4 h-4 text-cyber-warn" />
      </div>
      <div>
        <h3 class="text-sm font-orbitron font-bold text-obsidian-text-muted">Completed</h3>
        <p class="text-xs font-mono text-[var(--text-muted)]">{containers.length} stack{containers.length !== 1 ? 's' : ''} mastered</p>
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
  <div class="p-4 min-h-[280px] flex flex-col">
    {#if containers.length > 0}
      <div class="space-y-3">
        {#each visibleContainers as container}
          {@const canRestore = container.isArchived && container.volumeName}
          <div class="group relative bg-obsidian-bg border border-[var(--card-border)] rounded-card p-4 hover:border-cyber-warn/40 transition-all duration-300 hover:translate-x-1">
            <!-- Top shimmer -->
            <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-warn to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <!-- Success gradient overlay -->
            <div class="absolute inset-0 rounded-card bg-gradient-to-r from-cyber-warn/5 to-cyber-success/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <!-- Completion badge -->
                  <div class="relative w-10 h-10 rounded-card bg-cyber-warn/10 border border-cyber-warn/25 flex items-center justify-center">
                    <svg class="w-5 h-5 text-cyber-warn" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-sm font-orbitron font-semibold text-obsidian-text-muted">
                      {container.scenario?.name ?? parseStackName(container.workspace_stacks ?? container.containerStacks ?? [])}
                    </h4>
                    {#if container.scenario?.name}
                      <p class="text-xs font-mono text-cyber-warn opacity-70 mt-0.5 truncate">
                        {parseStackName(container.workspace_stacks ?? container.containerStacks ?? [])}
                      </p>
                    {/if}
                    <p class="text-xs font-mono text-[var(--text-muted)] mt-0.5">
                      Level {container.level} • Completed
                    </p>
                  </div>
                </div>
              </div>

              <!-- Restore Button (clip-path) -->
              {#if canRestore}
                <button
                  on:click={() => openPaywall(container)}
                  class="btn-cyber mt-3 w-full flex items-center justify-center gap-2 !py-1.5 bg-cyber-warn/10 border border-cyber-warn/30 text-cyber-warn text-xs hover:bg-cyber-warn/20 hover:border-cyber-warn/50 hover:shadow-[0_0_15px_rgba(255,180,0,0.15)] transition-all duration-200"
                >
                  <RotateCcw class="w-3 h-3" />
                  Restore Progress
                </button>
              {:else}
                <div class="mt-3 w-full px-3 py-1.5 bg-obsidian-bg border border-[var(--card-border)] rounded text-xs font-mono text-[var(--text-muted)] text-center">
                  Not restorable
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <p class="text-lg font-orbitron text-obsidian-text-primary/40">No completed stacks yet</p>
          <p class="text-md font-rajdhani text-[var(--text-muted)] mt-1">Complete your first stack to see it here!</p>
        </div>
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
      <div class="flex items-center gap-3 bg-[#0a0e1a] border border-[rgba(7,165,201,0.12)] rounded-[4px] px-4 py-3">
        <div>
          <p class="font-mono text-[0.85rem] font-semibold text-[#d0d7dd]">{paywallStack.scenario?.name ?? parseStackName(paywallStack.workspace_stacks ?? paywallStack.containerStacks ?? [])}</p>
          {#if paywallStack.scenario?.name}
            <p class="font-mono text-xs text-[#8892a0]">{parseStackName(paywallStack.workspace_stacks ?? paywallStack.containerStacks ?? [])}</p>
          {/if}
          <p class="font-mono text-xs text-[#8892a0] mt-0.5">Level {paywallStack.level}</p>
        </div>
      </div>

      <!-- Cost row -->
      <div class="flex items-center justify-between bg-[rgba(255,180,0,0.06)] border border-[rgba(255,180,0,0.2)] rounded-[4px] px-4 py-2.5">
        <span class="font-mono text-[0.8rem] text-[#8892a0] uppercase tracking-wider">Restore cost</span>
        <div class="flex items-center gap-1.5 text-[#ffb400] font-mono font-semibold text-[0.85rem]">
          <Coins class="w-4 h-4" />
          <span>{RESTORE_COST} coins</span>
        </div>
      </div>

      <!-- Balance row -->
      <div class="flex items-center justify-between px-1">
        <span class="font-mono text-xs text-[#8892a0]">Your balance</span>
        <span class="font-mono text-xs font-semibold {userCoins >= RESTORE_COST ? 'text-[#00e5a0]' : 'text-[#ff3860]'}">
          🪙 {userCoins} coins
        </span>
      </div>

      {#if userCoins < RESTORE_COST}
        <p class="font-mono text-xs text-[#ff3860]/80 text-center">
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
