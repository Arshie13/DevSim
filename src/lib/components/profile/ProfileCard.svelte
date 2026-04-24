<!--
  ProfileCard.svelte — Left-column identity panel.
  Shows avatar, name, role, bio, quick stats, and action buttons.
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { signOut } from "@auth/sveltekit/client";
  import {
    Calendar,
    Pencil,
    LogOut,
    Link as LinkIcon,
    MapPin,
    Trophy,
  } from "lucide-svelte";
  import type { UserData } from "$types";

  // ── Props ────────────────────────────────────────────────────────────────────
  export let user: UserData;
  export let memberSince: string = "";
  export let bio: string = "";
  export let leaderboardRank: number = 4;

  // ── Derived ──────────────────────────────────────────────────────────────────
  $: isExternalImage = Boolean(user.image && /^https?:\/\//i.test(user.image));
  $: isSvgPath = Boolean(user.image && user.image.startsWith("/"));

  // ── Events ───────────────────────────────────────────────────────────────────
  const dispatch = createEventDispatcher<{
    editProfile: void;
  }>();
</script>

<section
  class="relative h-full bg-obsidian-surface/60 border border-obsidian-accent/25 rounded-card overflow-hidden shadow-[0_0_30px_rgba(7,165,201,0.15)] flex flex-col"
>
  <!-- Top glow line -->
  <div
    class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-accent/40 to-transparent"
  ></div>
  <!-- Grid pattern overlay -->
  <div
    class="absolute inset-0 opacity-[0.02]"
    style="background-image: linear-gradient(rgba(7,165,201,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(7,165,201,0.5) 1px, transparent 1px); background-size: 40px 40px;"
  ></div>

  <div
    class="relative flex-1 flex flex-col items-center justify-center px-5 gap-4"
  >
    <!-- ── Avatar ─────────────────────────────────────────────────────────── -->
    <div class="relative shrink-0">
      <div
        class="avatar-ring w-20 h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 bg-obsidian-bg-light border-[2px] border-obsidian-accent rounded-card flex items-center justify-center shadow-[0_0_24px_rgba(7,165,201,0.30)] overflow-hidden"
      >
        {#if isExternalImage || isSvgPath}
          <img
            src={user.image}
            alt={user.name}
            class="w-full h-full object-contain"
            on:error={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        {:else}
          <!-- Legacy emoji fallback -->
          <span class="text-5xl lg:text-6xl">{user.image}</span>
        {/if}
      </div>

      <!-- Online status -->
      <div
        class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-[2.5px] border-obsidian-surface shadow-[0_0_8px_rgba(16,185,129,0.5)]"
      ></div>
    </div>

    <!-- ── Name & Role ─────────────────────────────────────────────────────── -->
    <div class="flex flex-col items-center text-center">
      <h1
        class="text-2xl font-orbitron font-bold text-obsidian-text-muted tracking-tight"
      >
        {user.name}
      </h1>
      <span
        class="relative text-lg font-orbitron font-bold text-obsidian-text-muted leading-none flex items-center gap-0.5"
      >
        <Trophy class="w-4 h-4 text-amber-400" />#{leaderboardRank}
      </span>

      <!-- Meta line -->
      <div
        class="flex items-center gap-3 mt-2.5 text-[0.65rem] font-mono text-obsidian-text-primary/50 uppercase tracking-wider"
      >
        <span class="flex items-center gap-1"
          ><Calendar class="w-3.5 h-3.5" />{memberSince}</span
        >
        <span class="w-1 h-1 rounded-full bg-obsidian-border"></span>
      </div>

      <!-- Bio -->
      <p
        class="mt-3 text-sm font-rajdhani text-obsidian-text-primary/55 leading-relaxed max-w-[280px]"
      >
        {bio}
      </p>
    </div>

    <!-- ── Action Buttons ─────────────────────────────────────────────────── -->
    <div class="w-full space-y-2 px-1">
      <div class="grid grid-cols-2 gap-2">
        <button
          on:click={() => dispatch("editProfile")}
          class="btn-cyber btn-cyber-outline w-full flex items-center justify-center gap-2"
        >
          <Pencil class="w-3.5 h-3.5" /> Edit Profile
        </button>

        <button
          class="btn-cyber btn-cyber-secondary flex items-center justify-center gap-1.5 !py-2 !px-3"
        >
          <LinkIcon class="w-3 h-3" /> Share
        </button>
      </div>

      <button
        on:click={() => signOut({ callbackUrl: "/login" })}
        class="btn-cyber btn-cyber-danger w-full flex items-center justify-center gap-2"
      >
        <LogOut class="w-3.5 h-3.5" /> Log Out
      </button>
    </div>
  </div>
</section>

<style>
  .avatar-ring {
    position: relative;
  }
  .avatar-ring::after {
    content: "";
    position: absolute;
    inset: -6px;
    border-radius: 4px;
    border: 1px solid transparent;
    border-top-color: #07a5c9;
    animation: spin 10s linear infinite;
    pointer-events: none;
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  :global(.btn-cyber-danger) {
    border: 1px solid rgba(255, 56, 96, 0.5);
    color: #ff3860;
    background: rgba(255, 56, 96, 0.08);
  }
  :global(.btn-cyber-danger:hover) {
    background: rgba(255, 56, 96, 0.18);
    border-color: rgba(255, 56, 96, 0.75);
    box-shadow: 0 0 20px rgba(255, 56, 96, 0.25);
    color: #ff6080;
  }
  :global(.btn-cyber-secondary) {
    border: 1px solid rgba(39, 39, 42, 0.8);
    color: rgba(208, 215, 221, 0.6);
    background: #12192a;
  }
  :global(.btn-cyber-secondary:hover) {
    border-color: rgba(7, 165, 201, 0.35);
    color: #d0d7dd;
    background: rgba(7, 165, 201, 0.08);
  }
</style>
