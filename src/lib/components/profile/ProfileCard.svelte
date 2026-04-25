<!--
  ProfileCard.svelte — Left-column identity panel.
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { signOut } from "@auth/sveltekit/client";
  import { Calendar, Pencil, LogOut, Link as LinkIcon, Trophy } from "lucide-svelte";
  import type { UserData } from "$types";

  export let user: UserData;
  export let memberSince: string = "";
  export let bio: string = "";
  export let leaderboardRank: number = 4;

  $: isExternalImage = Boolean(user.image && /^https?:\/\//i.test(user.image));
  $: isSvgPath = Boolean(user.image && user.image.startsWith("/"));

  const dispatch = createEventDispatcher<{ editProfile: void }>();
</script>

<section
  class="relative h-full bg-obsidian-bg-light border border-obsidian-accent/25 rounded-card overflow-hidden shadow-[0_0_30px_rgba(7,165,201,0.15)] flex flex-col"
>
  <!-- Top accent bar -->
  <div class="absolute top-0 left-0 right-0 h-[2px] z-10 bg-gradient-to-r from-transparent via-obsidian-accent/50 to-transparent"></div>

  <div class="relative z-10 flex-1 flex flex-col min-h-0">

    <!-- ── Banner + Avatar ──────────────────────────────────────────────── -->
    <div class="relative shrink-0">
      <div class="h-14 xl:h-16 2xl:h-20 bg-gradient-to-br from-obsidian-accent/15 via-purple-500/10 to-transparent"></div>

      <div class="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2">
        <div class="avatar-ring w-16 h-16 xl:w-20 xl:h-20 2xl:w-24 2xl:h-24 bg-obsidian-bg-light border-[2.5px] border-obsidian-accent rounded-card flex items-center justify-center shadow-[0_0_24px_rgba(7,165,201,0.35)] overflow-hidden mb-2">
          {#if isExternalImage || isSvgPath}
            <img
              src={user.image}
              alt={user.name}
              class="w-full h-full object-contain"
              on:error={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          {:else}
            <span class="text-4xl">{user.image}</span>
          {/if}
        </div>
        <!-- Online dot -->
        <div class="online-dot absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-obsidian-surface"></div>
      </div>
    </div>

    <!-- ── Identity ─────────────────────────────────────────────────────── -->
    <div class="flex-1 flex flex-col items-center justify-center text-center px-5 pt-10 xl:pt-12 2xl:pt-14 pb-4 gap-1 min-h-0">
      <h1 class="text-base xl:text-xl 2xl:text-2xl font-orbitron font-bold text-obsidian-text-muted tracking-tight leading-tight">
        {user.name}
      </h1>

      {#if user.email}
        <p class="text-[0.65rem] font-mono text-obsidian-text-primary/40 tracking-wider">
          @{user.email}
        </p>
      {/if}

      <!-- Rank badge -->
      <div class="mt-1.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25">
        <Trophy class="w-3 h-3 text-amber-400" />
        <span class="text-[0.65rem] font-orbitron font-bold text-amber-400 tracking-wide">
          Rank #{leaderboardRank}
        </span>
      </div>

      <!-- Member since -->
      <div class="mt-2 flex items-center gap-1.5 text-[0.6rem] font-mono text-obsidian-text-primary/40 uppercase tracking-wider">
        <Calendar class="w-3 h-3" />
        <span>Member since {memberSince}</span>
      </div>

      {#if bio}
        <p class="mt-3 text-xs font-rajdhani text-obsidian-text-primary/55 leading-relaxed max-w-[240px]">
          {bio}
        </p>
      {/if}
    </div>

    <!-- Divider -->
    <div class="shrink-0 mx-5 h-px bg-gradient-to-r from-transparent via-obsidian-border/60 to-transparent"></div>

    <!-- ── Actions ──────────────────────────────────────────────────────── -->
    <div class="shrink-0 px-5 py-4 flex flex-col gap-2">
      <div class="grid grid-cols-2 gap-2">
        <button
          on:click={() => dispatch("editProfile")}
          class="btn-cyber btn-cyber-outline flex items-center justify-center gap-1.5 text-xs"
        >
          <Pencil class="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          class="btn-cyber btn-cyber-secondary flex items-center justify-center gap-1.5 text-xs !py-2 !px-3"
        >
          <LinkIcon class="w-3 h-3" />
          Share
        </button>
      </div>

      <button
        on:click={() => signOut({ callbackUrl: "/login" })}
        class="btn-cyber btn-cyber-danger w-full flex items-center justify-center gap-2 text-xs"
      >
        <LogOut class="w-3.5 h-3.5" />
        Log Out
      </button>
    </div>
  </div>
</section>

<style>
  /* Online dot pulse */
  .online-dot {
    box-shadow: 0 0 6px rgba(16,185,129,0.6);
    animation: dot-pulse 2s ease-in-out infinite;
  }
  @keyframes dot-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.6; transform: scale(0.85); }
  }

  /* Spinning accent ring around avatar */
  .avatar-ring { position: relative; }
  .avatar-ring::after {
    content: "";
    position: absolute;
    inset: -5px;
    border-radius: 6px;
    border: 1px solid transparent;
    border-top-color: rgba(7, 165, 201, 0.8);
    border-right-color: rgba(7, 165, 201, 0.2);
    animation: spin 8s linear infinite;
    pointer-events: none;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
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
    background: rgba(18, 25, 42, 0.8);
  }
  :global(.btn-cyber-secondary:hover) {
    border-color: rgba(7, 165, 201, 0.35);
    color: #d0d7dd;
    background: rgba(7, 165, 201, 0.08);
  }
</style>
