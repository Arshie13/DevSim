<script lang="ts">
  import { Code, Coins, Zap, Trophy } from "lucide-svelte";
  import type { UserData } from "$types";

  export let userData: UserData;

  $: expPercentage = (userData.exp / userData.nextLevelExp) * 100;
</script>

<header class="border-b border-obsidian-accent/20 bg-obsidian-bg-light sticky top-0 z-50">
  <div class="w-full px-16 py-4 flex items-center justify-between">
    <!-- Logo -->
    <div class="flex items-center gap-3">
      <div class="relative">
        <div class="bg-obsidian-text-muted p-2 rounded-lg">
          <Code class="w-5 h-5 text-obsidian-bg" />
        </div>
        <!-- Animated pulse -->
        <div class="absolute inset-0 bg-obsidian-text-muted rounded-lg animate-ping opacity-20"></div>
      </div>
      <div>
        <h1 class="text-xl font-bold text-obsidian-text-muted tracking-tight">DevSim</h1>
        <p class="text-xs text-obsidian-text-primary/50 uppercase tracking-widest">Developer Simulation</p>
      </div>
    </div>

    <!-- Center Stats -->
    <div class="flex items-center gap-6">
      <!-- Level & XP -->
      <div class="flex items-center gap-3 bg-obsidian-surface/80 border border-obsidian-border rounded-xl px-4 py-2">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-sm font-bold text-white shadow-[0_0_10px_rgba(251,191,36,0.3)]">
            {userData.level}
          </div>
          <div class="text-sm">
            <p class="text-obsidian-text-primary/60">Level</p>
            <p class="text-obsidian-text-muted font-semibold">{userData.level}</p>
          </div>
        </div>
        <div class="w-px h-8 bg-obsidian-border"></div>
        <div class="flex items-center gap-2">
          <Zap class="w-4 h-4 text-obsidian-accent" />
          <div class="w-44">
            <div class="flex justify-between text-xs text-obsidian-text-primary/50 mb-1">
              <span>XP</span>
              <span>{userData.exp}/{userData.nextLevelExp}</span>
            </div>
            <div class="h-2.5 bg-obsidian-border rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-obsidian-accent to-emerald-400 rounded-full transition-all duration-500"
                style="width: {expPercentage}%"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievements Preview -->
      <div class="flex items-center gap-2 bg-obsidian-surface/80 border border-obsidian-border rounded-xl px-4 py-2">
        <Trophy class="w-4 h-4 text-amber-400" />
        <span class="text-sm font-medium text-obsidian-text-primary">{userData.completedStacks.length}</span>
        <span class="text-xs text-obsidian-text-primary/50">completed</span>
      </div>
    </div>

    <!-- User Section -->
    <div class="flex items-center gap-4">
      <!-- Coins -->
      <div class="flex items-center gap-2 bg-obsidian-surface/80 border border-obsidian-border px-4 py-2 rounded-xl">
        <Coins class="w-4 h-4 text-amber-400" />
        <span class="font-semibold text-obsidian-text-muted">{userData.coins.toLocaleString()}</span>
      </div>
      
      <!-- User Avatar -->
      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-semibold text-obsidian-text-muted">{userData.username}</p>
          <p class="text-xs text-obsidian-text-primary/50 uppercase tracking-wider">Developer</p>
        </div>
        <div class="relative">
          <div
            class="text-2xl w-11 h-11 bg-obsidian-surface border-2 border-obsidian-border rounded-full flex items-center justify-center"
          >
            {userData.avatar}
          </div>
          <!-- Online indicator -->
          <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-obsidian-bg"></div>
        </div>
      </div>
    </div>
  </div>
</header>
