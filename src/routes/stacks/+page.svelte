<script lang="ts">
  import {
    Code,
    Zap,
    Trophy,
    Coins,
    User,
    ChevronRight,
    CheckCircle,
    X,
    Clock,
    Star,
    Target,
    Lock,
  } from "lucide-svelte";
  import type { TechStack } from "$types";
  import { TECH_STACKS, userData } from "$mocks";

  let showLevelsModal = false;
  let selectedStack: TechStack | null = null;

  function getStackProgress(stackId: string) {
    const current = userData.currentStacks.find((s) => s.stackId === stackId);
    if (current) return current;
    if (userData.completedStacks.includes(stackId)) {
      return { completed: true };
    }
    return null;
  }

  function handleStackSelect(stack: TechStack) {
    selectedStack = stack;
    showLevelsModal = true;
  }

  function closeModal() {
    showLevelsModal = false;
    selectedStack = null;
  }

  function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
      case "Beginner":
        return "text-green-400 bg-green-500/20";
      case "Intermediate":
        return "text-yellow-400 bg-yellow-500/20";
      case "Advanced":
        return "text-orange-400 bg-orange-500/20";
      case "Expert":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  }

  function handleStartLevel(level: number) {
    console.log("Starting level:", level);
    // Navigate to coding environment
    // window.location.href = `/coding/${selectedStack.id}/${level.level}`;
  }

  $: expPercentage = (userData.exp / userData.nextLevelExp) * 100;
  $: currentStackLevel = selectedStack
    ? userData.currentStacks.find((s: any) => s.stackId === selectedStack!.id)
        ?.currentLevel || 0
    : 0;
</script>

<svelte:head>
  <title>DevSim - Developer Simulation Platform</title>
</svelte:head>

<div
  class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white"
>
  <!-- Header -->
  <header class="border-b border-white/10 bg-black/20 backdrop-blur-sm">
    <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg"
        >
          <Code class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl font-bold">DevSim</h1>
          <p class="text-xs text-gray-400">Developer Simulation Platform</p>
        </div>
      </div>

      <!-- User Stats -->
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
          <Coins class="w-5 h-5 text-yellow-400" />
          <span class="font-bold">{userData.coins}</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right">
            <p class="text-sm font-semibold">{userData.username}</p>
            <p class="text-xs text-gray-400">Level {userData.level}</p>
          </div>
          <div class="text-3xl">{userData.avatar}</div>
        </div>
      </div>
    </div>
  </header>

  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Stats Bar -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div
        class="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4"
      >
        <div class="flex items-center gap-2 mb-2">
          <Zap class="w-5 h-5 text-purple-400" />
          <span class="text-sm text-gray-300">Experience</span>
        </div>
        <div class="mb-2">
          <div class="flex justify-between text-xs text-gray-400 mb-1">
            <span>{userData.exp} XP</span>
            <span>{userData.nextLevelExp} XP</span>
          </div>
          <div class="w-full bg-black/30 rounded-full h-2">
            <div
              class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style="width: {expPercentage}%"
            ></div>
          </div>
        </div>
        <p class="text-2xl font-bold">
          {userData.exp} / {userData.nextLevelExp}
        </p>
      </div>

      <div
        class="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4"
      >
        <div class="flex items-center gap-2 mb-2">
          <Trophy class="w-5 h-5 text-blue-400" />
          <span class="text-sm text-gray-300">Stacks Completed</span>
        </div>
        <p class="text-4xl font-bold">{userData.completedStacks.length}</p>
        <p class="text-xs text-gray-400 mt-1">
          of {TECH_STACKS.length} available
        </p>
      </div>

      <div
        class="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4"
      >
        <div class="flex items-center gap-2 mb-2">
          <Code class="w-5 h-5 text-green-400" />
          <span class="text-sm text-gray-300">Active Sprints</span>
        </div>
        <p class="text-4xl font-bold">{userData.currentStacks.length}</p>
        <p class="text-xs text-gray-400 mt-1">in progress</p>
      </div>
    </div>

    <!-- Section Title -->
    <div class="mb-6">
      <h2 class="text-3xl font-bold mb-2">Choose Your Stack</h2>
      <p class="text-gray-400">
        Select a technology stack to begin your developer journey
      </p>
    </div>

    <!-- Tech Stacks Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each TECH_STACKS as stack}
        {@const progress = getStackProgress(stack.id)}
        {@const isCompleted = progress?.completed}
        {@const isInProgress = progress && !progress.completed}

        <button
          on:click={() => handleStackSelect(stack)}
          class="relative bg-gradient-to-br {stack.color} p-[2px] rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer text-left"
        >
          <div class="bg-slate-900/90 backdrop-blur-sm rounded-2xl p-6 h-full">
            <!-- Status Badge -->
            {#if isCompleted}
              <div
                class="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
              >
                <CheckCircle class="w-3 h-3" />
                Completed
              </div>
            {/if}
            {#if isInProgress && progress && "currentLevel" in progress}
              <div
                class="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold"
              >
                Level {progress.currentLevel}
              </div>
            {/if}

            <!-- Stack Icon -->
            <div class="text-5xl mb-4">{stack.icon}</div>

            <!-- Stack Info -->
            <h3 class="text-2xl font-bold mb-2">{stack.name}</h3>
            <p class="text-gray-400 text-sm mb-4">{stack.description}</p>

            <!-- Tags -->
            <div class="flex flex-wrap gap-2 mb-4">
              {#each stack.tags as tag}
                <span class="bg-white/10 px-2 py-1 rounded-full text-xs">
                  {tag}
                </span>
              {/each}
            </div>

            <!-- Progress Bar for In Progress -->
            {#if isInProgress && progress && "currentLevel" in progress}
              <div class="mb-4">
                <div class="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{progress.currentLevel} / {stack.levels}</span>
                </div>
                <div class="w-full bg-black/30 rounded-full h-2">
                  <div
                    class="bg-gradient-to-r {stack.color} h-2 rounded-full"
                    style="width: {(progress.currentLevel / stack.levels) *
                      100}%"
                  ></div>
                </div>
              </div>
            {/if}

            <!-- Action Button -->
            <div
              class="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all {isCompleted
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : isInProgress
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                  : 'bg-white/10 hover:bg-white/20'}"
            >
              {#if isCompleted}
                <Trophy class="w-5 h-5" />
                Replay
              {:else if isInProgress}
                Continue
                <ChevronRight class="w-5 h-5" />
              {:else}
                Start Sprint
                <ChevronRight class="w-5 h-5" />
              {/if}
            </div>

            <!-- Levels Badge -->
            <div class="mt-4 text-center text-xs text-gray-500">
              {stack.levels} Sprint Levels
            </div>
          </div>
        </button>
      {/each}
    </div>

    <!-- Quick Actions -->
    <div class="mt-12 grid grid-cols-2 gap-4">
      <button
        class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
      >
        <User class="w-5 h-5" />
        Customize Avatar
      </button>
      <button
        class="bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
      >
        <Trophy class="w-5 h-5" />
        View Leaderboard
      </button>
    </div>
  </div>
</div>

<!-- Levels Modal -->
{#if showLevelsModal && selectedStack}
  <div
    class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl"
    >
      <!-- Modal Header -->
      <div class="bg-gradient-to-r {selectedStack.color} p-6 relative">
        <button
          on:click={closeModal}
          class="absolute top-4 right-4 bg-black/30 hover:bg-black/50 p-2 rounded-lg transition-all"
        >
          <X class="w-6 h-6 text-white" />
        </button>

        <div class="flex items-center gap-4">
          <div class="text-6xl">{selectedStack.icon}</div>
          <div>
            <h2 class="text-3xl font-bold mb-1 text-white">
              {selectedStack.name}
            </h2>
            <p class="text-white/80">{selectedStack.description}</p>
            <div class="flex gap-2 mt-2">
              {#each selectedStack.tags as tag}
                <span
                  class="bg-black/30 px-3 py-1 rounded-full text-xs text-white"
                >
                  {tag}
                </span>
              {/each}
            </div>
          </div>
        </div>

        <!-- Progress Overview -->
        <div class="mt-4 bg-black/30 rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-white">Overall Progress</span>
            <span class="text-sm font-bold text-white">
              {currentStackLevel} / {selectedStack.levels}
            </span>
          </div>
          <div class="w-full bg-black/30 rounded-full h-3">
            <div
              class="bg-white h-3 rounded-full transition-all duration-500"
              style="width: {(currentStackLevel / selectedStack.levels) * 100}%"
            ></div>
          </div>
        </div>
      </div>

      <!-- Levels List -->
      <div class="overflow-y-auto max-h-[calc(90vh-240px)] p-6">
        {#if selectedStack.sprintLevels && selectedStack.sprintLevels.length > 0}
          <div class="space-y-4">
            {#each selectedStack.sprintLevels as level}
              {@const isCompleted = currentStackLevel > level.level}
              {@const isCurrent = currentStackLevel === level.level}
              {@const isLocked = level.level > currentStackLevel + 1}

              <div
                class="relative border rounded-xl p-5 transition-all {isLocked
                  ? 'bg-slate-800/50 border-slate-700/50 opacity-60'
                  : isCurrent
                    ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/50 shadow-lg shadow-purple-500/20'
                    : isCompleted
                      ? 'bg-green-900/20 border-green-500/30'
                      : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'}"
              >
                <!-- Level Number Badge -->
                <div
                  class="absolute -top-3 -left-3 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg {isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      : 'bg-slate-700 text-gray-400'}"
                >
                  {#if isCompleted}
                    <CheckCircle class="w-6 h-6" />
                  {:else}
                    {level.level}
                  {/if}
                </div>

                <!-- Lock Icon -->
                {#if isLocked}
                  <div class="absolute top-5 right-5">
                    <Lock class="w-6 h-6 text-gray-500" />
                  </div>
                {/if}

                <div class="ml-6">
                  <!-- Level Header -->
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-xl font-bold text-white">
                          {level.title}
                        </h3>
                        <span
                          class="px-3 py-1 rounded-full text-xs font-semibold {getDifficultyColor(
                            level.difficulty,
                          )}"
                        >
                          {level.difficulty}
                        </span>
                      </div>
                      <p class="text-gray-400 text-sm">{level.description}</p>
                    </div>
                  </div>

                  <!-- Level Info -->
                  <div class="flex gap-6 mb-4 text-sm">
                    <div class="flex items-center gap-2">
                      <Clock class="w-4 h-4 text-blue-400" />
                      <span class="text-gray-400">
                        {level.estimatedTime} • Deadline: {level.deadline}h
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <Star class="w-4 h-4 text-yellow-400" />
                      <span class="text-gray-400">{level.rewards.exp} XP</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <Coins class="w-4 h-4 text-yellow-400" />
                      <span class="text-gray-400"
                        >{level.rewards.coins} Coins</span
                      >
                    </div>
                  </div>

                  <!-- Tasks Checklist -->
                  {#if !isLocked}
                    <div class="bg-black/20 rounded-lg p-4 mb-4">
                      <div class="flex items-center gap-2 mb-3">
                        <Target class="w-4 h-4 text-purple-400" />
                        <span class="text-sm font-semibold text-white"
                          >Sprint Tasks</span
                        >
                      </div>
                      <ul class="space-y-2">
                        {#each level.tasks as task}
                          <li
                            class="flex items-start gap-2 text-sm text-gray-300"
                          >
                            <div
                              class="mt-1 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center {isCompleted
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-600'}"
                            >
                              {#if isCompleted}
                                <CheckCircle class="w-3 h-3 text-white" />
                              {/if}
                            </div>
                            <span
                              class={isCompleted
                                ? "line-through text-gray-500"
                                : ""}
                            >
                              {task}
                            </span>
                          </li>
                        {/each}
                      </ul>
                    </div>
                  {/if}

                  <!-- Action Button -->
                  {#if !isLocked}
                    <button
                      on:click={() => handleStartLevel(level.level)}
                      disabled={isCompleted}
                      class="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all {isCompleted
                        ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                        : isCurrent
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white'}"
                    >
                      {#if isCompleted}
                        <CheckCircle class="w-5 h-5" />
                        Completed
                      {:else if isCurrent}
                        Start Sprint
                        <ChevronRight class="w-5 h-5" />
                      {:else}
                        View Details
                        <ChevronRight class="w-5 h-5" />
                      {/if}
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-12 text-gray-400">
            <p class="text-lg">Sprint levels coming soon for this stack!</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
  }
</style>
