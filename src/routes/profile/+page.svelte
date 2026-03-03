<script lang="ts">
  import { signOut } from "@auth/sveltekit/client";
  import Header from "$components/Header.svelte";
  import { userData } from "$mocks";
  import type { PageData } from "./$types";
  import type { UserData } from "$types";
  import {
    Calendar,
    Flame,
    Zap,
    Coins,
    Trophy,
    Pencil,
    Settings,
    GitCommitHorizontalIcon,
    Award,
    Target,
    Users,
    CodeIcon,
    Star,
    MapPin,
    Link as LinkIcon,
    TrendingUp,
    LogOut,
    ArrowLeft,
  } from "lucide-svelte";

  export let data: PageData;

  const profileUserData: UserData = {
    ...userData,
    name: data.user?.name ?? "No Name",
    avatar: data.user?.image ?? "",
  };

  const defaultAvatar = ""

  $: hasProfileImage = Boolean(profileUserData.avatar && /^https?:\/\//i.test(profileUserData.avatar));

  const memberSince = "Sep 12, 2025";

  $: expPercentage = (profileUserData.exp / profileUserData.nextLevelExp) * 100;
  
  // Profile-specific metrics
  const metrics = [
    { label: "Commits",    value: "342", icon: GitCommitHorizontalIcon, color: "#07a5c9", bg: "rgba(7,165,201,0.12)"   },
    { label: "Challenges", value: "28",  icon: Target,                   color: "#ffb400", bg: "rgba(255,180,0,0.12)"   },
    { label: "Reviews",    value: "64",  icon: Award,                    color: "#a855f7", bg: "rgba(168,85,247,0.12)"  },
    { label: "Reputation", value: "4.8", icon: Star,                     color: "#00e5a0", bg: "rgba(0,229,160,0.12)"   },
  ];

  // Friends mock data — Facebook-style with levels (show 4)
  const friends = [
    { name: "CodeNinja42", avatar: "🥷", level: 18 },
    { name: "DevMaster_X", avatar: "🧙", level: 24 },
    { name: "StackPro", avatar: "🦸", level: 15 },
    { name: "ByteRunner", avatar: "🏃", level: 21 },
  ];

  const bio = "Passionate full-stack developer who loves building scalable web applications. Currently exploring systems programming and real-time architectures.";

  function backToDashboard() {
    history.back();
  }
</script>

<svelte:head>
  <title>Profile | DevSim</title>
</svelte:head>

<div class="h-screen flex flex-col bg-obsidian-bg text-obsidian-text-primary text-sm overflow-hidden">
  <div class="w-full max-w-[1200px] mx-auto px-4 pt-3 md:px-6 lg:px-8 lg:pt-4">
    <button
      on:click={backToDashboard}
      class="btn-cyber btn-cyber-secondary inline-flex items-center gap-2 !py-2 !px-4"
    >
      <ArrowLeft class="w-4 h-4" />
      <span>Back</span>
    </button>
  </div>

  <main class="flex-1 w-full max-w-[1200px] mx-auto px-4 py-3 md:px-6 lg:px-8 grid grid-cols-12 gap-3 lg:gap-4 xl:gap-5 min-h-0 overflow-y-auto">

    <!-- LEFT COLUMN — Full-Height Profile -->
    <div class="col-span-12 lg:col-span-4 min-h-0">
      <section class="relative h-full bg-obsidian-surface/60 border border-obsidian-accent/25 rounded-card overflow-hidden shadow-[0_0_30px_rgba(7,165,201,0.15)] flex flex-col">
        <!-- Top glow line -->
        <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-accent/40 to-transparent"></div>
        <!-- Grid pattern overlay -->
        <div class="absolute inset-0 opacity-[0.02]" style="background-image: linear-gradient(rgba(7,165,201,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(7,165,201,0.5) 1px, transparent 1px); background-size: 40px 40px;"></div>

        <!-- Static full-height content -->
        <div class="relative flex-1 flex flex-col items-center justify-center px-5 gap-4">

          <!-- Avatar -->
          <div class="relative shrink-0">
            <div class="avatar-ring w-20 h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 text-5xl lg:text-6xl bg-obsidian-bg-light border-[2px] border-obsidian-accent rounded-card flex items-center justify-center shadow-[0_0_24px_rgba(7,165,201,0.30)]">
              {#if hasProfileImage}
                <img src={profileUserData.avatar} alt={profileUserData.name} class="w-full h-full rounded-card object-cover" />
              {:else}
                {profileUserData.avatar}
              {/if}
            </div>
            <!-- Level badge -->
            <div class="absolute -bottom-2 -right-2 w-9 h-9 rounded-card bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-orbitron text-sm font-bold text-white shadow-[0_0_12px_rgba(251,191,36,0.5)] border-2 border-obsidian-surface/80">
              {profileUserData.level}
            </div>
            <!-- Online status -->
            <div class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-[2.5px] border-obsidian-surface shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          </div>

          <!-- Name & Role -->
          <div class="flex flex-col items-center text-center">
            <h1 class="text-2xl font-orbitron font-bold text-obsidian-text-muted tracking-tight">{profileUserData.name}</h1>
            <p class="text-xs font-mono text-obsidian-accent font-semibold mt-1 flex items-center gap-1.5 uppercase tracking-widest">
              <CodeIcon class="w-4 h-4" /> Full-Stack Developer
            </p>

            <!-- Meta line -->
            <div class="flex items-center gap-3 mt-2.5 text-[0.65rem] font-mono text-obsidian-text-primary/50 uppercase tracking-wider">
              <span class="flex items-center gap-1"><Calendar class="w-3.5 h-3.5" />{memberSince}</span>
              <span class="w-1 h-1 rounded-full bg-obsidian-border"></span>
              <span class="flex items-center gap-1"><MapPin class="w-3.5 h-3.5" />Remote</span>
            </div>

            <!-- Bio -->
            <p class="mt-3 text-sm font-rajdhani text-obsidian-text-primary/55 leading-relaxed max-w-[280px]">{bio}</p>
          </div>

          <!-- Quick Stats Row -->
          <div class="w-full grid grid-cols-3 gap-3 px-1">
            <div class="group relative flex flex-col items-center py-3 bg-obsidian-surface/60 rounded-card border border-obsidian-accent/25 shadow-[0_0_20px_rgba(7,165,201,0.1)] hover:border-obsidian-accent/50 hover:shadow-[0_0_30px_rgba(7,165,201,0.2)] transition-all duration-300 cursor-default overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-obsidian-accent/[0.06] to-transparent"></div>
              <div class="absolute inset-0 bg-obsidian-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span class="relative text-lg font-orbitron font-bold text-obsidian-text-muted leading-none">{profileUserData.completedStacks.length}</span>
              <span class="relative text-[0.6rem] font-mono text-obsidian-text-primary/40 mt-1.5 uppercase tracking-wider">Mastered</span>
            </div>
            <div class="group relative flex flex-col items-center py-3 bg-obsidian-surface/60 rounded-card border border-obsidian-accent/25 shadow-[0_0_20px_rgba(7,165,201,0.1)] hover:border-obsidian-accent/50 hover:shadow-[0_0_30px_rgba(7,165,201,0.2)] transition-all duration-300 cursor-default overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-orange-500/[0.06] to-transparent"></div>
              <div class="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span class="relative text-lg font-orbitron font-bold text-obsidian-text-muted leading-none flex items-center gap-0.5"><Flame class="w-4 h-4 text-orange-400" />7</span>
              <span class="relative text-[0.6rem] font-mono text-obsidian-text-primary/40 mt-1.5 uppercase tracking-wider">Streak</span>
            </div>
            <div class="group relative flex flex-col items-center py-3 bg-obsidian-surface/60 rounded-card border border-obsidian-accent/25 shadow-[0_0_20px_rgba(7,165,201,0.1)] hover:border-obsidian-accent/50 hover:shadow-[0_0_30px_rgba(7,165,201,0.2)] transition-all duration-300 cursor-default overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-amber-500/[0.06] to-transparent"></div>
              <div class="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span class="relative text-lg font-orbitron font-bold text-obsidian-text-muted leading-none flex items-center gap-0.5"><Trophy class="w-4 h-4 text-amber-400" />#4</span>
              <span class="relative text-[0.6rem] font-mono text-obsidian-text-primary/40 mt-1.5 uppercase tracking-wider">Rank</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="w-full space-y-2 px-1">
            <button class="btn-cyber btn-cyber-outline w-full flex items-center justify-center gap-2">
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
    </div>

    <!-- RIGHT COLUMN — Progress + Metrics + Friends -->
    <div class="col-span-12 lg:col-span-8 flex flex-col gap-3 lg:gap-4 min-h-0">

      <!-- Progress / Status Snapshot -->
      <section class="relative bg-obsidian-surface/60 border border-obsidian-accent/25 rounded-card overflow-hidden shadow-[0_0_30px_rgba(7,165,201,0.15)] hover:shadow-[0_0_40px_rgba(7,165,201,0.25)] transition-shadow duration-500">
        <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-accent/40 to-transparent"></div>

        <div class="relative p-5">
          <div class="flex items-center gap-6">
            <!-- Level circle -->
            <div class="relative shrink-0 w-20 h-20">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(39,39,42,1)" stroke-width="5" />
                <circle
                  cx="40" cy="40" r="34" fill="none"
                  stroke="url(#progressGrad)" stroke-width="5"
                  stroke-linecap="round"
                  stroke-dasharray="{2 * Math.PI * 34}"
                  stroke-dashoffset="{2 * Math.PI * 34 * (1 - expPercentage / 100)}"
                  class="transition-all duration-700"
                />
                <defs>
                  <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#07a5c9" />
                    <stop offset="100%" stop-color="#34d399" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-lg font-orbitron font-bold text-obsidian-text-muted leading-none">{profileUserData.level}</span>
                <span class="text-[0.55rem] font-mono text-obsidian-text-primary/40 uppercase tracking-wider">Level</span>
              </div>
            </div>

            <!-- XP details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline gap-2 mb-1">
                <h3 class="text-sm font-orbitron font-semibold text-obsidian-text-muted">Level Progress</h3>
                <span class="text-[0.65rem] font-mono text-obsidian-text-primary/40">{expPercentage.toFixed(0)}% to Level {profileUserData.level + 1}</span>
              </div>
              <div class="xp-track mb-2">
                <div class="xp-fill" style="width: {expPercentage}%"></div>
              </div>
              <div class="flex items-center gap-5 text-[0.65rem] font-mono text-obsidian-text-primary/50 uppercase tracking-wide">
                <span class="flex items-center gap-1"><Zap class="w-3 h-3 text-obsidian-accent" />{profileUserData.exp.toLocaleString()} / {profileUserData.nextLevelExp.toLocaleString()} XP</span>
                <span class="flex items-center gap-1"><Coins class="w-3 h-3 text-amber-400" />{profileUserData.coins.toLocaleString()} coins</span>
                <span class="flex items-center gap-1"><Flame class="w-3 h-3 text-orange-400" />7 day streak</span>
              </div>
            </div>

            <!-- Trend indicator -->
            <div class="flex flex-col items-center gap-1 shrink-0 bg-emerald-500/10 border border-emerald-500/20 rounded-card px-4 py-3">
              <TrendingUp class="w-5 h-5 text-emerald-400" />
              <span class="text-[0.65rem] font-orbitron font-semibold text-emerald-400">+12%</span>
              <span class="text-[0.55rem] font-mono text-obsidian-text-primary/40 uppercase">This week</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Key Metrics -->
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {#each metrics as metric}
          <div class="group relative bg-obsidian-surface/60 border border-obsidian-accent/25 rounded-card p-4 hover:border-obsidian-accent/50 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden shadow-[0_0_30px_rgba(7,165,201,0.15)] hover:shadow-[0_0_40px_rgba(7,165,201,0.25)] cursor-default">
            <!-- Inner glow -->
            <div class="absolute inset-0 bg-gradient-to-br from-obsidian-accent/[0.06] to-transparent"></div>
            <!-- Hover shimmer top -->
            <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative flex items-center gap-3">
              <div class="w-9 h-9 rounded-card border border-obsidian-border/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300" style="background: {metric.bg};">
                <svelte:component this={metric.icon} class="w-4 h-4" style="color: {metric.color};" />
              </div>
              <div>
                <p class="text-xl font-orbitron font-bold text-obsidian-text-muted leading-tight">{metric.value}</p>
                <p class="text-[0.6rem] font-mono text-obsidian-text-primary/50 uppercase tracking-wider">{metric.label}</p>
              </div>
            </div>
            <!-- Accent bottom line -->
            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-obsidian-accent/30 to-transparent opacity-60"></div>
          </div>
        {/each}
      </section>

      <!-- Friends Grid -->
      <section class="relative flex-1 min-h-0 bg-obsidian-surface/60 border border-obsidian-accent/25 rounded-card overflow-hidden shadow-[0_0_30px_rgba(7,165,201,0.15)] hover:shadow-[0_0_40px_rgba(7,165,201,0.25)] transition-shadow duration-500 flex flex-col">
        <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-accent/40 to-transparent"></div>

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-3 border-b border-obsidian-border/60 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-6 h-6 rounded-md bg-obsidian-accent/15 flex items-center justify-center">
              <Users class="w-5 h-5 text-obsidian-accent" />
            </div>
            <h3 class="text-lg font-orbitron font-semibold text-obsidian-text-muted">Friends</h3>
            <span class="text-[0.6rem] font-mono text-obsidian-text-primary/30 bg-obsidian-bg-light px-1.5 py-0.5 rounded-card">{friends.length}</span>
          </div>
          <button class="text-[0.65rem] font-mono text-obsidian-accent hover:text-cyber-bright uppercase tracking-widest transition-colors flex items-center gap-1">
            See All <span>→</span>
          </button>
        </div>

        <!-- Friends Grid -->
        <div class="flex-1 p-3 lg:p-4 flex items-center">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 w-full h-full">
            {#each friends as friend}
              <button class="group relative flex flex-col items-center justify-center gap-3 bg-obsidian-surface/60 border border-obsidian-accent/25 rounded-card transition-all duration-300 shadow-[0_0_25px_rgba(7,165,201,0.1)] hover:border-obsidian-accent/50 hover:shadow-[0_0_35px_rgba(7,165,201,0.25)] hover:-translate-y-0.5 cursor-pointer overflow-hidden">
                <!-- Inner glow -->
                <div class="absolute inset-0 bg-gradient-to-br from-obsidian-accent/[0.06] to-transparent"></div>
                <!-- Hover shimmer top -->
                <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <!-- Full-size Avatar with Level -->
                <div class="relative">
                  <div class="w-16 h-16 lg:w-24 lg:h-24 xl:w-32 xl:h-32 2xl:w-40 2xl:h-40 text-3xl lg:text-5xl xl:text-6xl 2xl:text-8xl bg-gradient-to-br from-obsidian-surface to-obsidian-bg-light border border-obsidian-accent/25 group-hover:border-obsidian-accent/50 rounded-card flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(7,165,201,0.2)]">
                    {friend.avatar}
                  </div>
                  <!-- Level badge on avatar -->
                  <div class="absolute -bottom-1.5 -right-1.5 min-w-[2rem] h-[2rem] rounded-card bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-orbitron text-xs font-bold text-white shadow-[0_0_10px_rgba(251,191,36,0.5)] border-2 border-obsidian-surface px-1.5">
                    {friend.level}
                  </div>
                </div>
                <!-- Name -->
                <span class="relative text-[0.65rem] font-mono uppercase tracking-wide text-obsidian-text-primary/70 group-hover:text-obsidian-accent truncate w-full text-center transition-colors duration-300 px-3">{friend.name}</span>
                <!-- Accent bottom line -->
                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-obsidian-accent/20 to-transparent opacity-60"></div>
              </button>
            {/each}
          </div>
        </div>
      </section>
    </div>

  </main>

  <!-- Ambient Background -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <!-- Grid texture -->
    <div class="absolute inset-0 bg-grid-cyber"></div>
    <!-- Radial ambient orb -->
    <div class="absolute top-0 left-0 right-0 h-[60vh]" style="background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(7,165,201,0.08), transparent);"></div>
    <!-- Scanlines -->
    <div class="absolute inset-0" style="background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.015) 4px); z-index: 200; pointer-events: none;"></div>
    <div class="absolute top-1/4 -left-32 w-96 h-96 bg-obsidian-accent/10 rounded-full blur-[120px]"></div>
    <div class="absolute bottom-1/3 -right-32 w-80 h-80 bg-purple-500/8 rounded-full blur-[100px]"></div>
  </div>
</div>

<style>
  /* Spinning avatar ring */
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

  /* Danger variant for cyber button */
  .btn-cyber-danger {
    border: 1px solid rgba(255, 56, 96, 0.50);
    color: #ff3860;
    background: rgba(255, 56, 96, 0.08);
  }
  .btn-cyber-danger:hover {
    background: rgba(255, 56, 96, 0.18);
    border-color: rgba(255, 56, 96, 0.75);
    box-shadow: 0 0 20px rgba(255, 56, 96, 0.25);
    color: #ff6080;
  }

  /* Secondary/muted cyber button */
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
