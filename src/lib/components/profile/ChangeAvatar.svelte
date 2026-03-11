<!--
  ChangeAvatar.svelte
  Modal for selecting or purchasing avatars.
  Categorises avatars into "Owned" (free defaults + purchased premiums)
  and "Premium" (locked, purchasable with coins).
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { X, Coins, Lock, CheckCircle } from "lucide-svelte";
  import {
    DEFAULT_AVATARS,
    PREMIUM_AVATARS,
    type AvatarDefinition,
    type PremiumAvatarDefinition,
  } from "$lib/utils/avatar";

  // ── Props ────────────────────────────────────────────────────────────────────
  /** Whether the modal is visible */
  export let open: boolean = false;
  /** Paths of avatars the user currently owns */
  export let ownedAvatars: string[] = [];
  /** The currently equipped avatar path */
  export let currentAvatar: string = "";
  /** User's coin balance (for affordability check) */
  export let coins: number = 0;

  // ── Internal state ───────────────────────────────────────────────────────────
  type Tab = "owned" | "premium";
  let activeTab: Tab = "owned";
  let pendingSelection: string = currentAvatar;

  $: ownedList = [
    ...DEFAULT_AVATARS,
    ...PREMIUM_AVATARS.filter((a) => ownedAvatars.includes(a.path)),
  ];

  $: premiumList = PREMIUM_AVATARS.filter((a) => !ownedAvatars.includes(a.path));

  // ── Events ───────────────────────────────────────────────────────────────────
  const dispatch = createEventDispatcher<{
    select: string;
    close: void;
  }>();

  function handleClose() {
    open = false;
    dispatch("close");
  }

  function handleConfirm() {
    dispatch("select", pendingSelection);
    open = false;
  }

  function selectOwned(path: string) {
    pendingSelection = path;
  }

  /** Backdrop click → close */
  function onBackdrop(e: MouseEvent) {
    if ((e.target as HTMLElement).dataset.backdrop) handleClose();
  }

  /** Keyboard close */
  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") handleClose();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    data-backdrop="true"
    on:click={onBackdrop}
    on:keydown={onKeydown}
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

    <!-- Panel -->
    <div class="relative z-10 w-full max-w-xl bg-obsidian-surface border border-obsidian-accent/30 rounded-card shadow-[0_0_60px_rgba(7,165,201,0.2)] flex flex-col overflow-hidden max-h-[90vh]">

      <!-- Top glow line -->
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-accent/60 to-transparent"></div>

      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-obsidian-border/50 shrink-0">
        <div>
          <h2 class="text-base font-orbitron font-bold text-obsidian-text-muted tracking-wide">Select Avatar</h2>
          <p class="text-[0.65rem] font-mono text-obsidian-text-primary/40 mt-0.5 uppercase tracking-widest">Customise your identity</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Coin balance -->
          <div class="flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-card px-2.5 py-1.5">
            <Coins class="w-3.5 h-3.5" />
            <span>{coins.toLocaleString()}</span>
          </div>
          <button on:click={handleClose} class="w-8 h-8 rounded-card bg-obsidian-bg-light hover:bg-obsidian-accent/15 border border-obsidian-border/40 hover:border-obsidian-accent/50 flex items-center justify-center transition-all duration-200 text-obsidian-text-primary/50 hover:text-obsidian-text-muted">
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex shrink-0 border-b border-obsidian-border/50">
        <button
          class="flex-1 py-2.5 text-xs font-mono uppercase tracking-widest transition-colors duration-200 border-b-2 {activeTab === 'owned' ? 'border-obsidian-accent text-obsidian-accent' : 'border-transparent text-obsidian-text-primary/40 hover:text-obsidian-text-primary/70'}"
          on:click={() => (activeTab = "owned")}>
          Owned <span class="ml-1 text-[0.55rem] opacity-60">({ownedList.length})</span>
        </button>
        <button
          class="flex-1 py-2.5 text-xs font-mono uppercase tracking-widest transition-colors duration-200 border-b-2 {activeTab === 'premium' ? 'border-amber-400 text-amber-400' : 'border-transparent text-obsidian-text-primary/40 hover:text-obsidian-text-primary/70'}"
          on:click={() => (activeTab = "premium")}>
          Premium <span class="ml-1 text-[0.55rem] opacity-60">({premiumList.length})</span>
        </button>
      </div>

      <!-- Grid area -->
      <div class="flex-1 overflow-y-auto p-4 min-h-0">

        {#if activeTab === "owned"}
          <!-- ── Owned avatars ─────────────────────────────────────────────── -->
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {#each ownedList as avatar (avatar.id)}
              {@const isSelected = pendingSelection === avatar.path}
              {@const isEquipped = currentAvatar === avatar.path}
              <button
                on:click={() => selectOwned(avatar.path)}
                class="group relative flex flex-col items-center gap-2 p-3 rounded-card border transition-all duration-200
                  {isSelected
                    ? 'border-obsidian-accent bg-obsidian-accent/10 shadow-[0_0_20px_rgba(7,165,201,0.3)]'
                    : 'border-obsidian-border/40 bg-obsidian-bg-light hover:border-obsidian-accent/40 hover:bg-obsidian-accent/5'}"
              >
                <!-- Selected checkmark -->
                {#if isSelected}
                  <div class="absolute top-1.5 right-1.5 text-obsidian-accent">
                    <CheckCircle class="w-3.5 h-3.5" />
                  </div>
                {/if}

                <!-- Avatar image -->
                <div
                  class="w-14 h-14 rounded-card flex items-center justify-center overflow-hidden border-2 transition-all duration-200"
                  style="border-color: {isSelected ? avatar.color : 'rgba(39,39,42,0.6)'}; box-shadow: {isSelected ? `0 0 16px ${avatar.color}55` : 'none'};"
                >
                  <img
                    src={avatar.path}
                    alt={avatar.name}
                    class="w-full h-full object-contain"
                    on:error={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      el.style.display = "none";
                      (el.parentElement as HTMLElement).style.background = avatar.color + "22";
                    }}
                  />
                </div>

                <!-- Name -->
                <span class="text-[0.6rem] font-mono uppercase tracking-wide text-obsidian-text-primary/60 group-hover:text-obsidian-text-primary transition-colors">
                  {avatar.name}
                </span>

                <!-- Equipped badge -->
                {#if isEquipped}
                  <span class="text-[0.5rem] font-mono uppercase tracking-widest text-obsidian-accent bg-obsidian-accent/10 border border-obsidian-accent/30 rounded px-1.5 py-0.5 whitespace-nowrap">
                    Equipped
                  </span>
                {:else}
                  <span class="h-[1.125rem]"></span>
                {/if}
              </button>
            {/each}
          </div>

        {:else}
          <!-- ── Premium avatars ────────────────────────────────────────────── -->
          {#if premiumList.length === 0}
            <div class="flex flex-col items-center justify-center h-32 gap-2 text-obsidian-text-primary/30">
              <CheckCircle class="w-8 h-8" />
              <p class="text-xs font-mono uppercase tracking-wider">You own all premium avatars!</p>
            </div>
          {:else}
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {#each premiumList as avatar (avatar.id)}
                {@const canAfford = coins >= avatar.price}
                <div
                  class="group relative flex flex-col items-center gap-2 p-3 rounded-card border border-amber-400/20 bg-obsidian-bg-light opacity-{canAfford ? '100' : '70'} cursor-default"
                >
                  <!-- Lock overlay -->
                  <div class="absolute top-1.5 right-1.5 text-amber-400/60">
                    <Lock class="w-3.5 h-3.5" />
                  </div>

                  <!-- Avatar image with placeholder -->
                  <div
                    class="w-14 h-14 rounded-card flex items-center justify-center overflow-hidden border-2 border-amber-400/30 relative"
                    style="background: {avatar.color}18;"
                  >
                    <img
                      src={avatar.path}
                      alt={avatar.name}
                      class="w-full h-full object-contain"
                      on:error={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <!-- Colour swatch fallback shown when image is missing -->
                    <div
                      class="absolute inset-0 rounded-card flex items-center justify-center"
                      style="background: linear-gradient(135deg, {avatar.color}33, {avatar.color}11);"
                    >
                      <span class="text-2xl font-orbitron font-black opacity-30" style="color:{avatar.color};">?</span>
                    </div>
                  </div>

                  <!-- Name -->
                  <span class="text-[0.6rem] font-mono uppercase tracking-wide text-amber-400/70">
                    {avatar.name}
                  </span>

                  <!-- Price badge -->
                  <div class="flex items-center gap-1 text-[0.6rem] font-mono {canAfford ? 'text-amber-400' : 'text-obsidian-text-primary/40'} bg-amber-400/10 border border-amber-400/20 rounded px-1.5 py-0.5">
                    <Coins class="w-2.5 h-2.5" />
                    {avatar.price.toLocaleString()}
                  </div>

                  <!-- Can't afford label -->
                  {#if !canAfford}
                    <span class="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[0.5rem] font-mono uppercase tracking-widest text-red-400/60 whitespace-nowrap">
                      Need {(avatar.price - coins).toLocaleString()} more
                    </span>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        {/if}
      </div>

      <!-- Footer -->
      <div class="shrink-0 px-5 py-3 border-t border-obsidian-border/50 flex items-center justify-end gap-3">
        <button on:click={handleClose} class="btn-cyber btn-cyber-secondary !py-2 !px-4 text-xs">
          Cancel
        </button>
        <button
          on:click={handleConfirm}
          disabled={pendingSelection === currentAvatar}
          class="btn-cyber btn-cyber-outline !py-2 !px-4 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>

    </div>
  </div>
{/if}

<style>
  .btn-cyber-secondary {
    border: 1px solid rgba(39, 39, 42, 0.80);
    color: rgba(208, 215, 221, 0.60);
    background: #12192a;
  }
  .btn-cyber-secondary:hover {
    border-color: rgba(7, 165, 201, 0.35);
    color: #d0d7dd;
    background: rgba(7, 165, 201, 0.08);
  }
</style>
