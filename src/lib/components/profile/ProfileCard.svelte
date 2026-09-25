<!--
  ProfileCard.svelte — Left-column identity panel.
  Integrated level progress (ring + XP bar), compact layout with visual hierarchy.
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { signOut } from "@auth/sveltekit/client";
  import {
    Calendar,
    Pencil,
    LogOut,
    Link as LinkIcon,
    Trophy,
    Zap,
  } from "lucide-svelte";
  import type { UserData } from "$types";
  import { toast } from "$lib/stores/toast";
  import { computeLevel } from "$lib/utils/level";

  export let user: UserData;
  export let memberSince: string = "";
  export let bio: string = "";
  export let leaderboardRank: number = 4;
  export let isOwnProfile: boolean = false;

  $: isExternalImage = Boolean(user.image && /^https?:\/\//i.test(user.image));
  $: isSvgPath = Boolean(user.image && user.image.startsWith("/"));

  $: computed = computeLevel(user.xp);
  $: effectiveLevel = computed.level;
  $: xpPercentage = Math.min((computed.xpIntoLevel / computed.xpForLevel) * 100, 100);
  $: circumference = 2 * Math.PI * 34;
  $: dashOffset = circumference * (1 - xpPercentage / 100);

  const dispatch = createEventDispatcher<{ editProfile: void }>();

  async function shareProfile() {
    if (!user.username) {
      toast.error("Set a username to share your profile");
      return;
    }
    const url = `${window.location.origin}/rivals/${user.username}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied to clipboard");
    } catch {
      toast.error("Failed to copy profile link");
    }
  }
</script>

<section
  class="relative h-full bg-obsidian-bg-light border border-obsidian-accent/25 rounded-card overflow-hidden shadow-accent-glow-lg hover:shadow-accent-glow-hover transition-shadow duration-500 flex flex-col"
>
  <!-- Top accent bar -->
  <div
    class="absolute top-0 left-0 right-0 h-[2px] z-10 bg-gradient-to-r from-transparent via-obsidian-accent/50 to-transparent"
  ></div>

  <div class="relative z-10 flex-1 flex flex-col min-h-0">
    <!-- ── Banner + Avatar ──────────────────────────────────────────────── -->
    <div class="relative min-h-16 flex-1">
      <div
        class="absolute inset-0 bg-gradient-to-br from-obsidian-accent/15 via-cyber-purple/10 to-transparent"
      ></div>

      <div class="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2">
        <div
          class="avatar-ring w-20 h-20 bg-obsidian-bg-light border-[2.5px] border-obsidian-accent rounded-card flex items-center justify-center shadow-[0_0_24px_rgb(var(--accent-rgb)_/_0.35)] overflow-hidden"
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
            <span class="text-3xl">{user.image}</span>
          {/if}
        </div>
        <!-- Online dot -->
        <div
          class="online-dot absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-cyber-success rounded-full border-2 border-obsidian-surface"
        ></div>
      </div>
    </div>

    <!-- ── Identity ─────────────────────────────────────────────────────── -->
    <div
      class="flex flex-col items-center text-center px-5 pt-12 pb-3 gap-1.5"
    >
      <h1
        class="text-xl font-heading font-bold text-obsidian-text-primary tracking-tight leading-tight"
      >
        {user.name}
      </h1>

      {#if user.username}
        <p
          class="text-xs font-label text-obsidian-text-primary/40 tracking-wider"
        >
          {user.username}
        </p>
      {:else if user.email}
        <p
          class="text-xs font-label text-obsidian-text-primary/40 tracking-wider"
        >
          @{user.email}
        </p>
      {/if}

      <!-- Rank badge -->
      <div
        class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyber-gold/10 border border-cyber-gold/25"
      >
        <Trophy class="w-3 h-3 text-cyber-gold" />
        <span
          class="text-[0.65rem] font-heading font-bold text-cyber-gold tracking-wide"
        >
          Rank #{leaderboardRank}
        </span>
      </div>

      {#if bio}
        <p
          class="text-xs font-body text-obsidian-text-primary/55 leading-relaxed max-w-[230px]"
        >
          {bio}
        </p>
      {/if}
    </div>

    <!-- ── Level Progress ──────────────────────────────────────────────── -->
    <div class="shrink-0 px-5 pb-3">
      <!-- Surface well (lighter container) -->
      <div class="rounded-card border border-obsidian-border/40 bg-obsidian-surface/40 p-3">
        <div class="flex items-center gap-3">
          <!-- Level ring: smaller, number only, dead-center -->
          <div class="relative shrink-0 w-12 h-12">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="rgb(var(--text-primary-rgb) / 0.2)"
                stroke-width="5"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="url(#profileLvlGrad)"
                stroke-width="5"
                stroke-linecap="round"
                stroke-dasharray={circumference}
                stroke-dashoffset={dashOffset}
                class="transition-all duration-700"
              />
              <defs>
                <linearGradient id="profileLvlGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="var(--accent)" />
                  <stop offset="100%" stop-color="var(--success)" />
                </linearGradient>
              </defs>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span
                class="text-lg font-heading font-bold text-obsidian-text-muted leading-none tabular-nums"
                >{effectiveLevel}</span
              >
            </div>
          </div>

          <!-- XP bar -->
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline justify-between gap-2 mb-1">
              <h3
                class="font-heading text-xs font-semibold text-obsidian-text-muted"
              >
                Level Progress
              </h3>
              <span class="text-[0.65rem] font-label text-obsidian-text-primary/40">
                {xpPercentage.toFixed(0)}% to Level {effectiveLevel + 1}
              </span>
            </div>
            <div class="xp-track">
              <div class="xp-fill" style="width: {xpPercentage}%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Member Since ───────────────────────────────────────────────── -->
    <div class="shrink-0 px-5 pb-4">
      <div
        class="flex items-center justify-center gap-1.5 text-[0.65rem] font-label text-obsidian-text-primary/40 uppercase tracking-wider"
      >
        <Calendar class="w-3 h-3" />
        <span>Member since {memberSince}</span>
      </div>
    </div>

    <!-- Divider -->
    <div
      class="shrink-0 mx-5 h-px bg-gradient-to-r from-transparent via-obsidian-border/60 to-transparent"
    ></div>

    <!-- ── Actions ──────────────────────────────────────────────────────── -->
    <div class="shrink-0 px-5 py-4 flex flex-col gap-3">
      <div class="grid gap-3" class:grid-cols-2={isOwnProfile}>
        {#if isOwnProfile}
          <button
            on:click={() => dispatch("editProfile")}
            class="btn-cyber btn-cyber-outline flex items-center justify-center gap-1.5 px-4 py-2 text-xs"
          >
            <Pencil class="w-3.5 h-3.5" />
            Edit
          </button>
        {/if}
        <button
          on:click={shareProfile}
          class="btn-cyber btn-cyber-secondary flex items-center justify-center gap-1.5 px-4 py-2 text-xs"
        >
          <LinkIcon class="w-3 h-3" />
          Share Profile
        </button>
      </div>

      {#if isOwnProfile}
      <button
        on:click={() => signOut({ callbackUrl: "/login" })}
        class="btn-cyber btn-cyber-danger w-full flex items-center justify-center gap-2 px-4 py-2 text-xs"
      >
        <LogOut class="w-3.5 h-3.5" />
        Log Out
      </button>
      {/if}
    </div>
  </div>
</section>

<style>
  /* Online dot pulse */
  .online-dot {
    box-shadow: 0 0 6px rgb(var(--success-rgb) / 0.6);
    animation: dot-pulse 2s ease-in-out infinite;
  }
  @keyframes dot-pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(0.85);
    }
  }

  /* Spinning accent ring around avatar */
  .avatar-ring {
    position: relative;
  }
  .avatar-ring::after {
    content: "";
    position: absolute;
    inset: -5px;
    border-radius: var(--radius-card);
    border: 1px solid transparent;
    border-top-color: rgb(var(--accent-rgb) / 0.8);
    border-right-color: rgb(var(--accent-rgb) / 0.2);
    animation: spin 8s linear infinite;
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
</style>
