<script lang="ts">
  import { goto } from "$app/navigation";
  import { Trophy, Star, ChevronRight, Coins, Zap, RotateCcw, X, AlertCircle } from "lucide-svelte";
  import type { FinishedStack } from "$types";
  import LoadingSteps from "$lib/components/ui/LoadingSteps.svelte";

  export let stacks: FinishedStack[];
  export let maxVisible: number = 2;
  export let userCoins: number = 0;

  $: visibleStacks = stacks.slice(0, maxVisible);

  const RESTORE_COST = 100;

  const RESTORE_STEPS = [
    { icon: "🪙", label: "Validating wallet…",       detail: "Checking coin balance & container ownership" },
    { icon: "🐳", label: "Spinning up container…",   detail: "Creating a fresh Docker container" },
    { icon: "📂", label: "Copying workspace data…",  detail: "Streaming saved volume into the new container" },
    { icon: "✅", label: "Finalising restore…",       detail: "Updating records & removing old volume" },
  ];

  let paywallStack: FinishedStack | null = null;
  let isRestoring = false;
  let restoreStep = 0;
  let restoreError = "";
  let stepTimer: ReturnType<typeof setInterval> | null = null;

  function openPaywall(stack: FinishedStack) {
    paywallStack = stack;
    restoreError = "";
  }

  function closePaywall() {
    if (isRestoring) return;
    paywallStack = null;
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
    }
  }
</script>

<div class="relative bg-obsidian-surface/40 border border-amber-500/25 rounded-xl overflow-hidden shadow-[0_0_35px_rgba(251,191,36,0.1)] hover:shadow-[0_0_45px_rgba(251,191,36,0.18)] transition-shadow duration-500">
  <!-- Top edge glow -->
  <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-text-primary/40 to-transparent"></div>
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-card bg-cyber-warn/15 flex items-center justify-center border border-cyber-warn/30">
        <Trophy class="w-4 h-4 text-cyber-warn" />
      </div>
      <div>
        <h3 class="text-sm font-orbitron font-bold text-obsidian-text-muted">Completed</h3>
        <p class="text-xs font-mono text-[var(--text-muted)]">{stacks.length} stack{stacks.length !== 1 ? 's' : ''} mastered</p>
      </div>
    </div>
    <button
      class="tag-cyber tag-warn flex items-center gap-1 hover:bg-cyber-warn/15 transition-colors cursor-pointer"
    >
      See All
      <ChevronRight class="w-3 h-3" />
    </button>
  </div>

  <!-- Completed Stack Cards -->
  <div class="p-4 min-h-[280px] flex flex-col">
    {#if stacks.length > 0}
      <div class="space-y-3">
        {#each visibleStacks as stack}
          <div class="group relative bg-obsidian-bg border border-[var(--card-border)] rounded-card p-4 hover:border-cyber-warn/40 transition-all duration-300 hover:translate-x-1">
            <!-- Top shimmer -->
            <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-warn to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <!-- Success gradient overlay -->
            <div class="absolute inset-0 rounded-card bg-gradient-to-r from-cyber-warn/5 to-cyber-success/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="relative">
                    <span class="text-2xl">{stack.icon}</span>
                    <!-- Completion badge -->
                    <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-cyber-success rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(0,229,160,0.4)]">
                      <svg class="w-2.5 h-2.5 text-obsidian-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 class="text-sm font-orbitron font-semibold text-obsidian-text-muted">{stack.name}</h4>
                    <p class="text-xs font-mono text-[var(--text-muted)]">
                      {stack.frontend} • {stack.backend} • {stack.database}
                    </p>
                  </div>
                </div>
                
                <!-- Rating -->
                <div class="flex items-center gap-0.5">
                  {#each Array(5) as _, i}
                    <Star 
                      class="w-3 h-3 {i < stack.rating ? 'text-cyber-warn fill-cyber-warn' : 'text-obsidian-border'}" 
                    />
                  {/each}
                </div>
              </div>

              <!-- Stats Row -->
              <div class="flex items-center gap-4 font-mono text-xs">
                <div class="tag-cyber tag-cyan flex items-center gap-1.5">
                  <Zap class="w-3 h-3" />
                  <span>+{stack.xpEarned.toLocaleString()} XP</span>
                </div>
                <div class="tag-cyber tag-warn flex items-center gap-1.5">
                  <Coins class="w-3 h-3" />
                  <span>+{stack.coinsEarned}</span>
                </div>
                <div class="ml-auto text-[var(--text-muted)]">
                  {stack.completedAt}
                </div>
              </div>

              <!-- Restore Button (clip-path) -->
              <button
                on:click={() => openPaywall(stack)}
                class="btn-cyber mt-3 w-full flex items-center justify-center gap-2 !py-1.5 bg-cyber-warn/10 border border-cyber-warn/30 text-cyber-warn text-xs hover:bg-cyber-warn/20 hover:border-cyber-warn/50 hover:shadow-[0_0_15px_rgba(255,180,0,0.15)] transition-all duration-200"
              >
                <RotateCcw class="w-3 h-3" />
                Restore Progress
              </button>
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

<!-- Paywall Modal -->
{#if paywallStack}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    on:click|self={closePaywall}
  >
    <div class="relative w-full max-w-sm mx-4 bg-obsidian-bg-light border border-cyber-warn/30 rounded-card shadow-[0_0_60px_rgba(255,180,0,0.12)] overflow-hidden">
      <!-- Top glow -->
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-warn/60 to-transparent"></div>

      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-card bg-cyber-warn/15 flex items-center justify-center border border-cyber-warn/30">
            <RotateCcw class="w-4 h-4 text-cyber-warn" />
          </div>
          <h3 class="text-sm font-orbitron font-semibold text-obsidian-text-muted">Restore Progress</h3>
        </div>
        <button
          on:click={closePaywall}
          class="text-obsidian-text-primary/40 hover:text-obsidian-text-primary/80 transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4">
        <p class="text-sm font-rajdhani text-obsidian-text-primary/70">
          You're about to restore your saved workspace for:
        </p>
        <div class="flex items-center gap-3 bg-obsidian-bg border border-[var(--card-border)] rounded-card px-4 py-3">
          <span class="text-2xl">{paywallStack.icon}</span>
          <div>
            <p class="text-sm font-orbitron font-semibold text-obsidian-text-muted">{paywallStack.name}</p>
            <p class="text-xs font-mono text-[var(--text-muted)]">{paywallStack.frontend} · {paywallStack.backend} · {paywallStack.database}</p>
          </div>
        </div>

        <!-- Cost vs Balance -->
        <div class="flex items-center justify-between bg-cyber-warn/10 border border-cyber-warn/25 rounded-card px-4 py-3">
          <span class="text-sm font-rajdhani text-obsidian-text-primary/70">Restore cost</span>
          <div class="flex items-center gap-1.5 text-cyber-warn font-orbitron font-semibold text-sm">
            <Coins class="w-4 h-4" />
            <span>{RESTORE_COST} coins</span>
          </div>
        </div>

        <div class="flex items-center justify-between px-1">
          <span class="text-xs font-mono text-[var(--text-muted)]">Your balance</span>
          <span class="text-xs font-orbitron font-medium {userCoins >= RESTORE_COST ? 'text-cyber-success' : 'text-cyber-danger'}">
            🪙 {userCoins} coins
          </span>
        </div>

        {#if userCoins < RESTORE_COST}
          <p class="text-xs font-rajdhani text-cyber-danger/80 text-center">
            Not enough coins. Earn more by completing sprints.
          </p>
        {/if}

        {#if restoreError}
          <div class="flex items-start gap-2 bg-cyber-danger/10 border border-cyber-danger/30 rounded-card px-3 py-2">
            <AlertCircle class="w-4 h-4 text-cyber-danger shrink-0 mt-0.5" />
            <p class="text-xs font-rajdhani text-cyber-danger">{restoreError}</p>
          </div>
        {/if}
      </div>

      <!-- Actions -->
      <div class="flex gap-3 px-6 pb-5">
        <button
          on:click={closePaywall}
          disabled={isRestoring}
          class="btn-cyber btn-cyber-outline flex-1 !py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          on:click={handleRestore}
          disabled={isRestoring || userCoins < RESTORE_COST}
          class="btn-cyber flex-1 !py-2.5 text-sm font-orbitron font-medium transition-all
            {userCoins >= RESTORE_COST && !isRestoring
              ? 'bg-cyber-warn hover:bg-[#ffc933] text-obsidian-bg hover:shadow-[0_0_20px_rgba(255,180,0,0.3)]'
              : 'bg-cyber-warn/30 border border-cyber-warn/20 text-cyber-warn/50 cursor-not-allowed'}"
        >
          {#if isRestoring}
            Restoring...
          {:else}
            Confirm ({RESTORE_COST} 🪙)
          {/if}
        </button>
      </div>
    </div>
  </div>
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
