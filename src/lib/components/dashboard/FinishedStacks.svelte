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
  <div class="flex items-center justify-between px-5 py-4 border-b border-obsidian-border/60">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
        <Trophy class="w-4 h-4 text-amber-400" />
      </div>
      <div>
        <h3 class="text-sm font-semibold text-obsidian-text-muted">Completed</h3>
        <p class="text-xs text-obsidian-text-primary/50">{stacks.length} stack{stacks.length !== 1 ? 's' : ''} mastered</p>
      </div>
    </div>
    <button
      class="flex items-center gap-1 text-xs text-obsidian-accent hover:text-obsidian-accent/80 transition-colors font-medium"
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
          <div class="group relative bg-obsidian-bg-light border border-obsidian-border/60 rounded-lg p-4 hover:border-amber-500/30 transition-all duration-300">
            <!-- Success gradient overlay -->
            <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="relative">
                    <span class="text-2xl">{stack.icon}</span>
                    <!-- Completion badge -->
                    <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 class="text-sm font-semibold text-obsidian-text-muted">{stack.name}</h4>
                    <p class="text-xs text-obsidian-text-primary/50">
                      {stack.frontend} • {stack.backend} • {stack.database}
                    </p>
                  </div>
                </div>
                
                <!-- Rating -->
                <div class="flex items-center gap-0.5">
                  {#each Array(5) as _, i}
                    <Star 
                      class="w-3 h-3 {i < stack.rating ? 'text-amber-400 fill-amber-400' : 'text-obsidian-border'}" 
                    />
                  {/each}
                </div>
              </div>

              <!-- Stats Row -->
              <div class="flex items-center gap-4 text-xs">
                <div class="flex items-center gap-1.5 text-obsidian-text-primary/60">
                  <Zap class="w-3 h-3 text-cyan-400" />
                  <span>+{stack.xpEarned.toLocaleString()} XP</span>
                </div>
                <div class="flex items-center gap-1.5 text-obsidian-text-primary/60">
                  <Coins class="w-3 h-3 text-amber-400" />
                  <span>+{stack.coinsEarned}</span>
                </div>
                <div class="ml-auto text-obsidian-text-primary/40">
                  {stack.completedAt}
                </div>
              </div>

              <!-- Restore Button -->
              <button
                on:click={() => openPaywall(stack)}
                class="mt-3 w-full flex items-center justify-center gap-2 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/20 hover:border-amber-500/50 transition-all duration-200"
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
        <div class="text-center text-obsidian-text-primary/40">
          <p class="text-lg">No completed stacks yet</p>
          <p class="text-md mt-1">Complete your first stack to see it here!</p>
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
    <div class="relative w-full max-w-sm mx-4 bg-obsidian-surface border border-amber-500/40 rounded-2xl shadow-[0_0_60px_rgba(251,191,36,0.15)] overflow-hidden">
      <!-- Top glow -->
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"></div>

      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-obsidian-border/60">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <RotateCcw class="w-4 h-4 text-amber-400" />
          </div>
          <h3 class="text-sm font-semibold text-obsidian-text-muted">Restore Progress</h3>
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
        <p class="text-sm text-obsidian-text-primary/70">
          You're about to restore your saved workspace for:
        </p>
        <div class="flex items-center gap-3 bg-obsidian-bg-light border border-obsidian-border/50 rounded-lg px-4 py-3">
          <span class="text-2xl">{paywallStack.icon}</span>
          <div>
            <p class="text-sm font-semibold text-obsidian-text-muted">{paywallStack.name}</p>
            <p class="text-xs text-obsidian-text-primary/50">{paywallStack.frontend} · {paywallStack.backend} · {paywallStack.database}</p>
          </div>
        </div>

        <!-- Cost vs Balance -->
        <div class="flex items-center justify-between bg-amber-500/10 border border-amber-500/25 rounded-lg px-4 py-3">
          <span class="text-sm text-obsidian-text-primary/70">Restore cost</span>
          <div class="flex items-center gap-1.5 text-amber-400 font-semibold text-sm">
            <Coins class="w-4 h-4" />
            <span>{RESTORE_COST} coins</span>
          </div>
        </div>

        <div class="flex items-center justify-between px-1">
          <span class="text-xs text-obsidian-text-primary/50">Your balance</span>
          <span class="text-xs font-medium {userCoins >= RESTORE_COST ? 'text-emerald-400' : 'text-rose-400'}">
            🪙 {userCoins} coins
          </span>
        </div>

        {#if userCoins < RESTORE_COST}
          <p class="text-xs text-rose-400/80 text-center">
            Not enough coins. Earn more by completing sprints.
          </p>
        {/if}

        {#if restoreError}
          <div class="flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
            <AlertCircle class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p class="text-xs text-rose-400">{restoreError}</p>
          </div>
        {/if}
      </div>

      <!-- Actions -->
      <div class="flex gap-3 px-6 pb-5">
        <button
          on:click={closePaywall}
          disabled={isRestoring}
          class="flex-1 py-2.5 rounded-lg border border-obsidian-border/60 text-sm text-obsidian-text-primary/60 hover:border-obsidian-border hover:text-obsidian-text-primary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          on:click={handleRestore}
          disabled={isRestoring || userCoins < RESTORE_COST}
          class="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all
            {userCoins >= RESTORE_COST && !isRestoring
              ? 'bg-amber-500 hover:bg-amber-400 text-obsidian-bg'
              : 'bg-amber-500/30 border border-amber-500/20 text-amber-400/50 cursor-not-allowed'}"
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
