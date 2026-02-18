<script lang="ts">
  import Header from "$components/Header.svelte";
  import { userData } from "$mocks";
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
  } from "lucide-svelte";

  const memberSince = "Sep 12, 2025";

  $: expPercentage = (userData.exp / userData.nextLevelExp) * 100;
  
  // Profile-specific metrics
  const metrics = [
    { label: "Commits", value: "342", icon: GitCommitHorizontalIcon, color: "text-obsidian-accent", bg: "bg-obsidian-accent/15" },
    { label: "Challenges", value: "28", icon: Target, color: "text-amber-400", bg: "bg-amber-400/15" },
    { label: "Reviews", value: "64", icon: Award, color: "text-purple-400", bg: "bg-purple-400/15" },
    { label: "Reputation", value: "4.8", icon: Star, color: "text-emerald-400", bg: "bg-emerald-400/15" },
  ];

  // Friends mock data — Facebook-style with levels (show 4)
  const friends = [
    { name: "CodeNinja42", avatar: "🥷", level: 18 },
    { name: "DevMaster_X", avatar: "🧙", level: 24 },
    { name: "StackPro", avatar: "🦸", level: 15 },
    { name: "ByteRunner", avatar: "🏃", level: 21 },
  ];

  const bio = "Passionate full-stack developer who loves building scalable web applications. Currently exploring systems programming and real-time architectures.";
</script>

<svelte:head>
  <title>Profile | DevSim</title>
</svelte:head>

<div class="h-screen flex flex-col bg-obsidian-bg text-obsidian-text-primary text-[0.8rem] overflow-hidden">
  <Header {userData} />

  <main class="flex-1 w-full px-6 py-4 grid grid-cols-12 gap-4 min-h-0">

    <!-- LEFT COLUMN — Full-Height Profile -->
    <div class="col-span-4 min-h-0">
      <section class="relative h-full bg-obsidian-surface/60 border border-obsidian-accent/25 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(7,165,201,0.15)] flex flex-col">
        <!-- Top glow line -->
        <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-accent/40 to-transparent"></div>
        <!-- Grid pattern overlay -->
        <div class="absolute inset-0 opacity-[0.02]" style="background-image: linear-gradient(rgba(7,165,201,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(7,165,201,0.5) 1px, transparent 1px); background-size: 40px 40px;"></div>

        <!-- Static full-height content -->
        <div class="relative flex-1 flex flex-col items-center justify-center px-5 gap-4">

          <!-- Avatar -->
          <div class="relative shrink-0">
            <div class="w-28 h-28 text-6xl bg-obsidian-bg-light border-[3px] border-obsidian-accent/50 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(7,165,201,0.25),0_8px_32px_rgba(0,0,0,0.4)] ring-4 ring-obsidian-surface/60">
              {userData.avatar}
            </div>
            <!-- Level badge -->
            <div class="absolute -bottom-2 -right-2 w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-sm font-bold text-white shadow-[0_0_12px_rgba(251,191,36,0.5)] border-2 border-obsidian-surface/80">
              {userData.level}
            </div>
            <!-- Online status -->
            <div class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-[2.5px] border-obsidian-surface shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          </div>

          <!-- Name & Role -->
          <div class="flex flex-col items-center text-center">
            <h1 class="text-2xl font-bold text-obsidian-text-muted tracking-tight">{userData.username}</h1>
            <p class="text-sm text-obsidian-accent font-semibold mt-1 flex items-center gap-1.5">
              <CodeIcon class="w-4 h-4" /> Full-Stack Developer
            </p>

            <!-- Meta line -->
            <div class="flex items-center gap-3 mt-2.5 text-xs text-obsidian-text-primary/50">
              <span class="flex items-center gap-1"><Calendar class="w-3.5 h-3.5" />{memberSince}</span>
              <span class="w-1 h-1 rounded-full bg-obsidian-border"></span>
              <span class="flex items-center gap-1"><MapPin class="w-3.5 h-3.5" />Remote</span>
            </div>

            <!-- Bio -->
            <p class="mt-3 text-xs text-obsidian-text-primary/55 leading-relaxed max-w-[280px]">{bio}</p>
          </div>

          <!-- Quick Stats Row -->
          <div class="w-full grid grid-cols-3 gap-3 px-1">
            <div class="group relative flex flex-col items-center py-3 bg-obsidian-surface/60 rounded-xl border border-obsidian-accent/25 shadow-[0_0_20px_rgba(7,165,201,0.1)] hover:border-obsidian-accent/50 hover:shadow-[0_0_30px_rgba(7,165,201,0.2)] transition-all duration-300 cursor-default overflow-hidden">
              <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-obsidian-accent/[0.06] to-transparent"></div>
              <div class="absolute inset-0 rounded-xl bg-obsidian-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span class="relative text-lg font-bold text-obsidian-text-muted leading-none">{userData.completedStacks.length}</span>
              <span class="relative text-[0.65rem] text-obsidian-text-primary/40 mt-1.5 uppercase tracking-wider">Mastered</span>
            </div>
            <div class="group relative flex flex-col items-center py-3 bg-obsidian-surface/60 rounded-xl border border-obsidian-accent/25 shadow-[0_0_20px_rgba(7,165,201,0.1)] hover:border-obsidian-accent/50 hover:shadow-[0_0_30px_rgba(7,165,201,0.2)] transition-all duration-300 cursor-default overflow-hidden">
              <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500/[0.06] to-transparent"></div>
              <div class="absolute inset-0 rounded-xl bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span class="relative text-lg font-bold text-obsidian-text-muted leading-none flex items-center gap-0.5"><Flame class="w-4 h-4 text-orange-400" />7</span>
              <span class="relative text-[0.65rem] text-obsidian-text-primary/40 mt-1.5 uppercase tracking-wider">Streak</span>
            </div>
            <div class="group relative flex flex-col items-center py-3 bg-obsidian-surface/60 rounded-xl border border-obsidian-accent/25 shadow-[0_0_20px_rgba(7,165,201,0.1)] hover:border-obsidian-accent/50 hover:shadow-[0_0_30px_rgba(7,165,201,0.2)] transition-all duration-300 cursor-default overflow-hidden">
              <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/[0.06] to-transparent"></div>
              <div class="absolute inset-0 rounded-xl bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span class="relative text-lg font-bold text-obsidian-text-muted leading-none flex items-center gap-0.5"><Trophy class="w-4 h-4 text-amber-400" />#4</span>
              <span class="relative text-[0.65rem] text-obsidian-text-primary/40 mt-1.5 uppercase tracking-wider">Rank</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="w-full space-y-2 px-1">
            <button class="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-obsidian-accent/25 to-obsidian-accent/15 hover:from-obsidian-accent/35 hover:to-obsidian-accent/25 border border-obsidian-accent/40 hover:border-obsidian-accent/60 rounded-xl text-sm font-semibold text-obsidian-text-muted transition-all duration-300 shadow-[0_0_15px_rgba(7,165,201,0.1)] hover:shadow-[0_0_25px_rgba(7,165,201,0.25)]">
              <Pencil class="w-3.5 h-3.5 text-obsidian-accent" /> Edit Profile
            </button>
            <div class="grid grid-cols-2 gap-2">
              <button class="flex items-center justify-center gap-1.5 py-2 bg-obsidian-bg-light hover:bg-obsidian-surface border border-obsidian-border/60 hover:border-obsidian-border rounded-xl text-xs text-obsidian-text-primary/70 hover:text-obsidian-text-muted transition-all">
                <LinkIcon class="w-3 h-3" /> Share
              </button>
              <button class="flex items-center justify-center gap-1.5 py-2 bg-obsidian-bg-light hover:bg-obsidian-surface border border-obsidian-border/60 hover:border-obsidian-border rounded-xl text-xs text-obsidian-text-primary/70 hover:text-obsidian-text-muted transition-all">
                <Settings class="w-3 h-3" /> Settings
              </button>
            </div>
          </div>

        </div>
      </section>
    </div>

    <!-- RIGHT COLUMN — Progress + Metrics + Friends -->
    <div class="col-span-8 flex flex-col gap-4 min-h-0">

      <!-- Progress / Status Snapshot -->
      <section class="relative bg-obsidian-surface/60 border border-obsidian-accent/25 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(7,165,201,0.15)] hover:shadow-[0_0_40px_rgba(7,165,201,0.25)] transition-shadow duration-500">
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
                <span class="text-lg font-bold text-obsidian-text-muted leading-none">{userData.level}</span>
                <span class="text-[0.55rem] text-obsidian-text-primary/40 uppercase tracking-wider">Level</span>
              </div>
            </div>

            <!-- XP details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline gap-2 mb-1">
                <h3 class="text-sm font-semibold text-obsidian-text-muted">Level Progress</h3>
                <span class="text-[0.65rem] text-obsidian-text-primary/40">{expPercentage.toFixed(0)}% to Level {userData.level + 1}</span>
              </div>
              <div class="h-2 bg-obsidian-border rounded-full overflow-hidden mb-2">
                <div class="h-full bg-gradient-to-r from-obsidian-accent to-emerald-400 rounded-full transition-all duration-700" style="width: {expPercentage}%"></div>
              </div>
              <div class="flex items-center gap-5 text-xs text-obsidian-text-primary/50">
                <span class="flex items-center gap-1"><Zap class="w-3 h-3 text-obsidian-accent" />{userData.exp.toLocaleString()} / {userData.nextLevelExp.toLocaleString()} XP</span>
                <span class="flex items-center gap-1"><Coins class="w-3 h-3 text-amber-400" />{userData.coins.toLocaleString()} coins</span>
                <span class="flex items-center gap-1"><Flame class="w-3 h-3 text-orange-400" />7 day streak</span>
              </div>
            </div>

            <!-- Trend indicator -->
            <div class="flex flex-col items-center gap-1 shrink-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
              <TrendingUp class="w-5 h-5 text-emerald-400" />
              <span class="text-[0.65rem] font-semibold text-emerald-400">+12%</span>
              <span class="text-[0.55rem] text-obsidian-text-primary/40">This week</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Key Metrics -->
      <section class="grid grid-cols-4 gap-3">
        {#each metrics as metric}
          <div class="group relative bg-obsidian-surface/60 border border-obsidian-accent/25 rounded-xl p-4 hover:border-obsidian-accent/50 transition-all duration-300 overflow-hidden shadow-[0_0_30px_rgba(7,165,201,0.15)] hover:shadow-[0_0_40px_rgba(7,165,201,0.25)] cursor-default">
            <!-- Inner glow -->
            <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-obsidian-accent/[0.06] to-transparent"></div>
            <!-- Hover glow overlay -->
            <div class="absolute inset-0 rounded-xl bg-obsidian-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg {metric.bg} border border-obsidian-border/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <svelte:component this={metric.icon} class="w-4 h-4 {metric.color}" />
              </div>
              <div>
                <p class="text-xl font-bold text-obsidian-text-muted leading-tight">{metric.value}</p>
                <p class="text-[0.65rem] text-obsidian-text-primary/50 uppercase tracking-wider">{metric.label}</p>
              </div>
            </div>
            <!-- Accent bottom line -->
            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-obsidian-accent/30 to-transparent opacity-60"></div>
          </div>
        {/each}
      </section>

      <!-- Friends Grid -->
      <section class="relative flex-1 min-h-0 bg-obsidian-surface/60 border border-obsidian-accent/25 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(7,165,201,0.15)] hover:shadow-[0_0_40px_rgba(7,165,201,0.25)] transition-shadow duration-500 flex flex-col">
        <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-obsidian-accent/40 to-transparent"></div>

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-3 border-b border-obsidian-border/60 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-6 h-6 rounded-md bg-obsidian-accent/15 flex items-center justify-center">
              <Users class="w-5 h-5 text-obsidian-accent" />
            </div>
            <h3 class="text-lg font-semibold text-obsidian-text-muted">Friends</h3>
            <span class="text-[0.6rem] text-obsidian-text-primary/30 bg-obsidian-bg-light px-1.5 py-0.5 rounded-md">{friends.length}</span>
          </div>
          <button class="text-md text-obsidian-accent hover:text-obsidian-accent/80 font-medium transition-colors flex items-center gap-1">
            See All <span class="text-md">→</span>
          </button>
        </div>

        <!-- Friends Grid -->
        <div class="flex-1 p-4 flex items-center">
          <div class="grid grid-cols-4 gap-4 w-full h-full">
            {#each friends as friend}
              <button class="group relative flex flex-col items-center justify-center gap-3 bg-obsidian-surface/60 border border-obsidian-accent/25 rounded-2xl transition-all duration-300 shadow-[0_0_25px_rgba(7,165,201,0.1)] hover:border-obsidian-accent/50 hover:shadow-[0_0_35px_rgba(7,165,201,0.25)] cursor-pointer overflow-hidden">
                <!-- Inner glow -->
                <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-obsidian-accent/[0.06] to-transparent"></div>
                <!-- Hover glow overlay -->
                <div class="absolute inset-0 rounded-2xl bg-obsidian-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <!-- Full-size Avatar with Level -->
                <div class="relative">
                  <div class="w-[12rem] h-[12rem] text-[8rem] bg-gradient-to-br from-obsidian-surface to-obsidian-bg-light border-2 border-obsidian-border/50 group-hover:border-obsidian-accent/40 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(7,165,201,0.2)] group-hover:scale-105">
                    {friend.avatar}
                  </div>
                  <!-- Level badge on avatar -->
                  <div class="absolute -bottom-1.5 -right-1.5 min-w-[2rem] h-[2rem] rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-sm font-bold text-white shadow-[0_0_10px_rgba(251,191,36,0.5)] border-2 border-obsidian-surface px-1.5">
                    {friend.level}
                  </div>
                </div>
                <!-- Name -->
                <span class="relative text-sm font-semibold text-obsidian-text-primary/70 group-hover:text-obsidian-text-muted truncate w-full text-center transition-colors duration-300 px-3">{friend.name}</span>
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
    <div class="absolute inset-0 opacity-[0.02]" style="background-image: linear-gradient(rgba(7,165,201,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(7,165,201,0.5) 1px, transparent 1px); background-size: 50px 50px;"></div>
    <div class="absolute top-1/4 -left-32 w-96 h-96 bg-obsidian-accent/10 rounded-full blur-[120px]"></div>
    <div class="absolute bottom-1/3 -right-32 w-80 h-80 bg-purple-500/8 rounded-full blur-[100px]"></div>
  </div>
</div>
