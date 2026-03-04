<!--
  ProfileCard.svelte — Left-column identity panel.
  Shows avatar, name, role, bio, quick stats, and action buttons.
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { signOut } from "@auth/sveltekit/client";
  import {
    Calendar,
    Flame,
    Pencil,
    Settings,
    Trophy,
    LogOut,
    Link as LinkIcon,
    MapPin,
    CodeIcon,
  } from "lucide-svelte";
  import type { UserData } from "$types";

  // ── Props ────────────────────────────────────────────────────────────────────
  export let user: UserData;
  export let memberSince: string = "";
  export let bio: string = "";
  export let location: string = "Remote";
  export let role: string = "Full-Stack Developer";
  export let streakDays: number = 7;
  export let leaderboardRank: number = 4;

  // ── Derived ──────────────────────────────────────────────────────────────────
  $: isExternalImage = Boolean(user.avatar && /^https?:\/\//i.test(user.avatar));
  $: isSvgPath = Boolean(user.avatar && user.avatar.startsWith("/"));

  // ── Events ───────────────────────────────────────────────────────────────────
  const dispatch = createEventDispatcher<{
    editProfile: void;
  }>();
</script>

<section
  class="relative h-full bg-obsidian-surface/60 border border-obsidian-accent/25 rounded-card overflow-hidden shadow-[0_0_30px_rgba(7,165,201,0.15)] flex flex-col"
>
  <!-- Top glow line -->
  <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-accent/40 to-transparent"></div>
  <!-- Grid pattern overlay -->
  <div
    class="absolute inset-0 opacity-[0.02]"
    style="background-image: linear-gradient(rgba(7,165,201,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(7,165,201,0.5) 1px, transparent 1px); background-size: 40px 40px;"
  ></div>

  <div class="relative flex-1 flex flex-col items-center justify-center px-5 gap-4">

    <!-- ── Avatar ─────────────────────────────────────────────────────────── -->
    <div class="relative shrink-0">
      <div
        class="avatar-ring w-20 h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 bg-obsidian-bg-light border-[2px] border-obsidian-accent rounded-card flex items-center justify-center shadow-[0_0_24px_rgba(7,165,201,0.30)] overflow-hidden"
      >
        {#if isExternalImage || isSvgPath}
          <img
            src={user.avatar}
            alt={user.name}
            class="w-full h-full object-contain"
            on:error={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        {:else}
          <!-- Legacy emoji fallback -->
          <span class="text-5xl lg:text-6xl">{user.avatar}</span>
        {/if}
      </div>

      <!-- Level badge -->
      <div
        class="absolute -bottom-2 -right-2 w-9 h-9 rounded-card bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-orbitron text-sm font-bold text-white shadow-[0_0_12px_rgba(251,191,36,0.5)] border-2 border-obsidian-surface/80"
      >
        {user.level}
      </div>
      <!-- Online status -->
      <div class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-[2.5px] border-obsidian-surface shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
    </div>

    <!-- ── Name & Role ─────────────────────────────────────────────────────── -->
    <div class="flex flex-col items-center text-center">
      <h1 class="text-2xl font-orbitron font-bold text-obsidian-text-muted tracking-tight">{user.name}</h1>
      <p class="text-xs font-mono text-obsidian-accent font-semibold mt-1 flex items-center gap-1.5 uppercase tracking-widest">
        <CodeIcon class="w-4 h-4" />{role}
      </p>

      <!-- Meta line -->
      <div class="flex items-center gap-3 mt-2.5 text-[0.65rem] font-mono text-obsidian-text-primary/50 uppercase tracking-wider">
        <span class="flex items-center gap-1"><Calendar class="w-3.5 h-3.5" />{memberSince}</span>
        <span class="w-1 h-1 rounded-full bg-obsidian-border"></span>
        <span class="flex items-center gap-1"><MapPin class="w-3.5 h-3.5" />{location}</span>
      </div>

      <!-- Bio -->
      <p class="mt-3 text-sm font-rajdhani text-obsidian-text-primary/55 leading-relaxed max-w-[280px]">{bio}</p>
    </div>

    <!-- ── Quick Stats ─────────────────────────────────────────────────────── -->
    <div class="w-full grid grid-cols-3 gap-3 px-1">
      <!-- Mastered -->
      <div
        class="group relative flex flex-col items-center py-3 bg-obsidian-surface/60 rounded-card border border-obsidian-accent/25 shadow-[0_0_20px_rgba(7,165,201,0.1)] hover:border-obsidian-accent/50 hover:shadow-[0_0_30px_rgba(7,165,201,0.2)] transition-all duration-300 cursor-default overflow-hidden"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-obsidian-accent/[0.06] to-transparent"></div>
        <div class="absolute inset-0 bg-obsidian-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span class="relative text-lg font-orbitron font-bold text-obsidian-text-muted leading-none">{user.completedStacks.length}</span>
        <span class="relative text-[0.6rem] font-mono text-obsidian-text-primary/40 mt-1.5 uppercase tracking-wider">Mastered</span>
      </div>

      <!-- Streak -->
      <div
        class="group relative flex flex-col items-center py-3 bg-obsidian-surface/60 rounded-card border border-obsidian-accent/25 shadow-[0_0_20px_rgba(7,165,201,0.1)] hover:border-obsidian-accent/50 hover:shadow-[0_0_30px_rgba(7,165,201,0.2)] transition-all duration-300 cursor-default overflow-hidden"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-orange-500/[0.06] to-transparent"></div>
        <div class="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span class="relative text-lg font-orbitron font-bold text-obsidian-text-muted leading-none flex items-center gap-0.5">
          <Flame class="w-4 h-4 text-orange-400" />{streakDays}
        </span>
        <span class="relative text-[0.6rem] font-mono text-obsidian-text-primary/40 mt-1.5 uppercase tracking-wider">Streak</span>
      </div>

      <!-- Rank -->
      <div
        class="group relative flex flex-col items-center py-3 bg-obsidian-surface/60 rounded-card border border-obsidian-accent/25 shadow-[0_0_20px_rgba(7,165,201,0.1)] hover:border-obsidian-accent/50 hover:shadow-[0_0_30px_rgba(7,165,201,0.2)] transition-all duration-300 cursor-default overflow-hidden"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-amber-500/[0.06] to-transparent"></div>
        <div class="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span class="relative text-lg font-orbitron font-bold text-obsidian-text-muted leading-none flex items-center gap-0.5">
          <Trophy class="w-4 h-4 text-amber-400" />#{leaderboardRank}
        </span>
        <span class="relative text-[0.6rem] font-mono text-obsidian-text-primary/40 mt-1.5 uppercase tracking-wider">Rank</span>
      </div>
    </div>

    <!-- ── Action Buttons ─────────────────────────────────────────────────── -->
    <div class="w-full space-y-2 px-1">
      <button
        on:click={() => dispatch("editProfile")}
        class="btn-cyber btn-cyber-outline w-full flex items-center justify-center gap-2"
      >
        <Pencil class="w-3.5 h-3.5" /> Edit Profile
      </button>

      <div class="grid grid-cols-2 gap-2">
        <button class="btn-cyber btn-cyber-secondary flex items-center justify-center gap-1.5 !py-2 !px-3">
          <LinkIcon class="w-3 h-3" /> Share
        </button>
        <button class="btn-cyber btn-cyber-secondary flex items-center justify-center gap-1.5 !py-2 !px-3">
          <Settings class="w-3 h-3" /> Settings
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

  :global(.btn-cyber-danger) {
    border: 1px solid rgba(255, 56, 96, 0.50);
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
    border: 1px solid rgba(39, 39, 42, 0.80);
    color: rgba(208, 215, 221, 0.60);
    background: #12192a;
  }
  :global(.btn-cyber-secondary:hover) {
    border-color: rgba(7, 165, 201, 0.35);
    color: #d0d7dd;
    background: rgba(7, 165, 201, 0.08);
  }
</style>
