<!--
  EditProfile.svelte — Root modal for all profile editing.
  Navigation sidebar on the left, section content on the right.
  Currently implements: Change Avatar.
  Future sections (Bio, Location, Social Links, etc.) are placeholders.
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { X, ImageIcon, FileText, MapPin, Link as LinkIcon, Bell } from "lucide-svelte";
  import ChangeAvatar from "./ChangeAvatar.svelte";
  import type { UserData } from "$types";

  // ── Props ────────────────────────────────────────────────────────────────────
  export let open: boolean = false;
  export let user: UserData;

  // ── Section registry ─────────────────────────────────────────────────────────
  type SectionId = "avatar" | "bio" | "location" | "links" | "notifications";

  interface Section {
    id: SectionId;
    label: string;
    icon: typeof ImageIcon;
    implemented: boolean;
  }

  const sections: Section[] = [
    { id: "avatar",        label: "Avatar",        icon: ImageIcon,  implemented: true  },
    { id: "bio",           label: "Bio",            icon: FileText,   implemented: false },
    { id: "location",      label: "Location",       icon: MapPin,     implemented: false },
    { id: "links",         label: "Social Links",   icon: LinkIcon,   implemented: false },
    { id: "notifications", label: "Notifications",  icon: Bell,       implemented: false },
  ];

  let activeSection: SectionId = "avatar";
  let changeAvatarOpen = false;

  // ── Events ───────────────────────────────────────────────────────────────────
  const dispatch = createEventDispatcher<{
    close: void;
    /** Emitted whenever user data is mutated so the parent can react */
    update: UserData;
  }>();

  function handleClose() {
    open = false;
    dispatch("close");
  }

  function handleAvatarSelect(event: CustomEvent<string>) {
    const newPath = event.detail;
    user = { ...user, avatar: newPath };
    dispatch("update", user);
  }

  function handleAvatarPurchase(event: CustomEvent<{ newCoins: number; newOwnedAvatars: string[]; purchasedPath: string }>) {
    const { newCoins, newOwnedAvatars, purchasedPath } = event.detail;
    user = {
      ...user,
      coins: newCoins,
      ownedAvatars: newOwnedAvatars,
      // Automatically equip the avatar that was just purchased
      avatar: purchasedPath,
    };
    dispatch("update", user);
  }

  function onBackdrop(e: MouseEvent) {
    if ((e.target as HTMLElement).dataset.backdrop) handleClose();
  }

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

    <!-- Modal shell -->
    <div class="relative z-10 w-full max-w-2xl bg-obsidian-surface border border-obsidian-accent/30 rounded-card shadow-[0_0_60px_rgba(7,165,201,0.2)] flex overflow-hidden max-h-[90vh]">

      <!-- Top glow line -->
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-accent/60 to-transparent z-10"></div>

      <!-- ── Left Nav ───────────────────────────────────────────────────────── -->
      <nav class="w-44 shrink-0 bg-obsidian-bg border-r border-obsidian-border/50 flex flex-col">
        <div class="px-4 py-4 border-b border-obsidian-border/40">
          <p class="text-[0.6rem] font-mono text-obsidian-text-primary/40 uppercase tracking-widest">Edit Profile</p>
        </div>
        <ul class="flex-1 py-2">
          {#each sections as section}
            <li>
              <button
                on:click={() => (activeSection = section.id)}
                class="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono uppercase tracking-wide transition-all duration-200
                  {activeSection === section.id
                    ? 'text-obsidian-accent bg-obsidian-accent/10 border-r-2 border-obsidian-accent'
                    : 'text-obsidian-text-primary/40 hover:text-obsidian-text-primary/70 hover:bg-obsidian-accent/5 border-r-2 border-transparent'}"
              >
                <svelte:component this={section.icon} class="w-3.5 h-3.5 shrink-0" />
                {section.label}
                {#if !section.implemented}
                  <span class="ml-auto text-[0.5rem] font-mono text-obsidian-text-primary/25 bg-obsidian-border/30 rounded px-1">soon</span>
                {/if}
              </button>
            </li>
          {/each}
        </ul>
      </nav>

      <!-- ── Right Content ──────────────────────────────────────────────────── -->
      <div class="flex-1 flex flex-col min-h-0 overflow-hidden">

        <!-- Content header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-obsidian-border/50 shrink-0">
          <h2 class="text-sm font-orbitron font-bold text-obsidian-text-muted tracking-wide">
            {sections.find((s) => s.id === activeSection)?.label ?? "Edit"}
          </h2>
          <button
            on:click={handleClose}
            class="w-8 h-8 rounded-card bg-obsidian-bg-light hover:bg-obsidian-accent/15 border border-obsidian-border/40 hover:border-obsidian-accent/50 flex items-center justify-center transition-all duration-200 text-obsidian-text-primary/50 hover:text-obsidian-text-muted"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Section body -->
        <div class="flex-1 overflow-y-auto p-5">

          <!-- ── Avatar section ───────────────────────────────────────────── -->
          {#if activeSection === "avatar"}
            <div class="flex flex-col items-center gap-5">
              <p class="text-xs font-mono text-obsidian-text-primary/40 text-center max-w-xs leading-relaxed">
                Your avatar is your identity in DevSim. Choose from your owned collection or unlock premium avatars with coins.
              </p>

              <!-- Current avatar preview -->
              <div class="relative">
                <div
                  class="avatar-ring w-24 h-24 bg-obsidian-bg-light border-[2px] border-obsidian-accent rounded-card flex items-center justify-center overflow-hidden shadow-[0_0_24px_rgba(7,165,201,0.30)]"
                >
                  <img
                    src={user.avatar}
                    alt="Current avatar"
                    class="w-full h-full object-contain"
                    on:error={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <span class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[0.6rem] font-mono text-obsidian-text-primary/40 uppercase tracking-wider whitespace-nowrap">Current</span>
              </div>

              <div class="mt-2 flex flex-col items-center gap-3 w-full max-w-xs">
                <button
                  on:click={() => (changeAvatarOpen = true)}
                  class="btn-cyber btn-cyber-outline w-full flex items-center justify-center gap-2 text-xs"
                >
                  <ImageIcon class="w-3.5 h-3.5" /> Browse Avatars
                </button>
                <p class="text-[0.6rem] font-mono text-obsidian-text-primary/30 text-center">
                  Owned: {user.ownedAvatars.length} &nbsp;|&nbsp; Premium requires coins
                </p>
              </div>
            </div>

          <!-- ── Placeholder sections ─────────────────────────────────────── -->
          {:else}
            <div class="flex flex-col items-center justify-center h-40 gap-3 text-obsidian-text-primary/25">
              <svelte:component this={sections.find((s) => s.id === activeSection)?.icon ?? FileText} class="w-8 h-8" />
              <p class="text-xs font-mono uppercase tracking-wider">Coming Soon</p>
            </div>
          {/if}

        </div>
      </div>
    </div>
  </div>

  <!-- ChangeAvatar sub-modal -->
  <ChangeAvatar
    bind:open={changeAvatarOpen}
    ownedAvatars={user.ownedAvatars}
    currentAvatar={user.avatar}
    coins={user.coins}
    on:select={handleAvatarSelect}
    on:purchase={handleAvatarPurchase}
  />
{/if}

<style>
  .avatar-ring {
    position: relative;
  }
  .avatar-ring::after {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 4px;
    border: 1px solid transparent;
    border-top-color: #07a5c9;
    animation: spin 10s linear infinite;
    pointer-events: none;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
</style>
