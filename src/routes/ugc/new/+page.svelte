<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { ArrowLeft, Plus, Trash2, Save, AlertCircle } from "lucide-svelte";
  import type { PageData } from "./$types";
  import { toast } from "$lib/stores/toast";

  export let data: PageData;
  export let form: { success?: boolean; message?: string; ugcId?: string } | null;

  // Available tech stacks (commonly used in web development)
  const availableTechStacks = [
    "React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt.js",
    "Node.js", "Express", "Django", "Flask", "Ruby on Rails", "Laravel", "ASP.NET Core",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle",
    "TypeScript", "JavaScript", "Python", "Ruby", "Go", "Rust", "Java", "C#",
    "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Vercel", "Netlify",
    "GraphQL", "REST API", "WebSocket", "gRPC",
    "Tailwind CSS", "Bootstrap", "Material UI", "Chakra UI",
    "Prisma", "TypeORM", "Sequelize", "Mongoose"
  ];

  // Form state
  let repoLink = "";
  let scenario = "";
  let selectedTechStacks: string[] = [];
  let levels = [
    {
      id: "",
      title: "",
      order: 1,
      description: "",
      xpReward: 100,
      tasks: [
        {
          id: "",
          title: "",
          description: "",
          hint: "",
          order: 1
        }
      ]
    }
  ];

  // UI state
  let isSubmitting = false;
  let newTechStack = "";
  let showTechStackDropdown = false;

  function addTechStack() {
    if (newTechStack && !selectedTechStacks.includes(newTechStack)) {
      selectedTechStacks = [...selectedTechStacks, newTechStack];
    }
    newTechStack = "";
    showTechStackDropdown = false;
  }

  function removeTechStack(stack: string) {
    selectedTechStacks = selectedTechStacks.filter(s => s !== stack);
  }

  function addLevel() {
    const newOrder = levels.length > 0 ? Math.max(...levels.map(l => l.order)) + 1 : 1;
    levels = [...levels, {
      id: "",
      title: "",
      order: newOrder,
      description: "",
      xpReward: 100,
      tasks: []
    }];
  }

  function removeLevel(index: number) {
    levels = levels.filter((_, i) => i !== index);
    // Re-order levels
    levels = levels.map((level, i) => ({ ...level, order: i + 1 }));
  }

  function addTask(levelIndex: number) {
    const level = levels[levelIndex];
    const newOrder = level.tasks.length > 0 ? Math.max(...level.tasks.map(t => t.order)) + 1 : 1;
    levels[levelIndex].tasks = [...level.tasks, {
      id: "",
      title: "",
      description: "",
      hint: "",
      order: newOrder
    }];
    levels = [...levels];
  }

  function removeTask(levelIndex: number, taskIndex: number) {
    levels[levelIndex].tasks = levels[levelIndex].tasks.filter((_, i) => i !== taskIndex);
    // Re-order tasks
    levels[levelIndex].tasks = levels[levelIndex].tasks.map((task, i) => ({ ...task, order: i + 1 }));
    levels = [...levels];
  }

  function handleSubmit() {
    isSubmitting = true;
    return async ({ result }: { result: any }) => {
      isSubmitting = false;
      if (result.type === "success" && result.data?.success) {
        toast.success("Submission created successfully!");
        goto(`/ugc/${result.data.ugcId}`);
      } else if (result.type === "failure") {
        toast.error(result.data?.message || "Failed to create submission");
      }
    };
  }

  // Filter tech stacks based on search
  $: filteredTechStacks = availableTechStacks.filter(
    stack => stack.toLowerCase().includes(newTechStack.toLowerCase()) && 
             !selectedTechStacks.includes(stack)
  );
</script>

<div class="min-h-screen bg-gray-900 text-gray-100 p-6">
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <a href="/ugc" class="p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <ArrowLeft class="w-5 h-5" />
        </a>
        <div>
          <h1 class="text-2xl font-bold">New Submission</h1>
          <p class="text-gray-400">Create a new user generated content</p>
        </div>
      </div>
    </div>

    <form method="POST" use:enhance={handleSubmit} class="space-y-8">
      <!-- Repository Link -->
      <section class="bg-gray-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
          Repository
        </h2>
        <div>
          <label for="repoLink" class="block text-sm font-medium text-gray-300 mb-2">
            GitHub Repository URL <span class="text-red-400">*</span>
          </label>
          <input
            type="url"
            id="repoLink"
            name="repoLink"
            bind:value={repoLink}
            placeholder="https://github.com/username/repo"
            required
            class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-400"
          />
          <p class="text-gray-400 text-sm mt-2">Link to your GitHub repository</p>
        </div>
      </section>

      <!-- Scenario -->
      <section class="bg-gray-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
          Scenario <span class="text-red-400">*</span>
        </h2>
        <div>
          <label for="scenario" class="block text-sm font-medium text-gray-300 mb-2">
            Description / Challenge
          </label>
          <textarea
            id="scenario"
            name="scenario"
            bind:value={scenario}
            rows="6"
            placeholder="Describe the coding challenge or scenario..."
            required
            class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-100 placeholder-gray-400 resize-none"
          ></textarea>
        </div>
      </section>

      <!-- Tech Stacks -->
      <section class="bg-gray-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <span class="w-2 h-2 bg-green-500 rounded-full"></span>
          Tech Stacks <span class="text-red-400">*</span>
        </h2>
        
        <!-- Selected tech stacks -->
        <div class="flex flex-wrap gap-2 mb-4">
          {#each selectedTechStacks as stack}
            <span class="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-700 rounded-full text-sm">
              {stack}
              <button
                type="button"
                on:click={() => removeTechStack(stack)}
                class="ml-1 hover:text-red-400 transition-colors"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </span>
          {/each}
        </div>

        <!-- Add tech stack -->
        <div class="relative">
          <div class="flex gap-2">
            <input
              type="text"
              bind:value={newTechStack}
              on:focus={() => showTechStackDropdown = true}
              on:blur={() => setTimeout(() => showTechStackDropdown = false, 200)}
              placeholder="Add a tech stack..."
              class="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-100 placeholder-gray-400"
            />
            <button
              type="button"
              on:click={addTechStack}
              class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus class="w-4 h-4" />
              Add
            </button>
          </div>

          <!-- Dropdown suggestions -->
          {#if showTechStackDropdown && filteredTechStacks.length > 0}
            <div class="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {#each filteredTechStacks.slice(0, 10) as stack}
                <button
                  type="button"
                  on:mousedown={() => { selectedTechStacks = [...selectedTechStacks, stack]; newTechStack = ""; }}
                  class="w-full px-4 py-2 text-left hover:bg-gray-600 transition-colors"
                >
                  {stack}
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Hidden input to send tech stacks as JSON -->
        <input type="hidden" name="techStacks" value={JSON.stringify(selectedTechStacks)} />
      </section>

      <!-- Levels -->
      <section class="bg-gray-800 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold flex items-center gap-2">
            <span class="w-2 h-2 bg-orange-500 rounded-full"></span>
            Levels & Tasks <span class="text-red-400">*</span>
          </h2>
          <button
            type="button"
            on:click={addLevel}
            class="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
            Add Level
          </button>
        </div>

        {#if levels.length === 0}
          <p class="text-gray-400 text-center py-8">No levels yet. Add one to get started.</p>
        {:else}
          <div class="space-y-6">
            {#each levels as level, levelIndex}
              <div class="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div class="flex items-start gap-4 mb-4">
                  <div class="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <label for="level-title-{levelIndex}" class="block text-sm font-medium text-gray-300 mb-1">
                        Level Title
                      </label>
                      <input
                        type="text"
                        id="level-title-{levelIndex}"
                        bind:value={level.title}
                        placeholder="e.g., Basic Setup"
                        class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-100 placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label for="level-xp-{levelIndex}" class="block text-sm font-medium text-gray-300 mb-1">
                        XP Reward
                      </label>
                      <input
                        type="number"
                        id="level-xp-{levelIndex}"
                        bind:value={level.xpReward}
                        min="0"
                        class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-100"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    on:click={() => removeLevel(levelIndex)}
                    class="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
                    title="Remove level"
                  >
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>

                <div class="mb-4">
                  <label for="level-desc-{levelIndex}" class="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="level-desc-{levelIndex}"
                    bind:value={level.description}
                    rows="2"
                    placeholder="Describe what the user needs to accomplish..."
                    class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-100 placeholder-gray-400 resize-none"
                  ></textarea>
                </div>

                <!-- Tasks -->
                <div class="ml-4 pl-4 border-l-2 border-gray-600">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="text-sm font-medium text-gray-300">Tasks</h3>
                    <button
                      type="button"
                      on:click={() => addTask(levelIndex)}
                      class="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1"
                    >
                      <Plus class="w-3.5 h-3.5" />
                      Add Task
                    </button>
                  </div>

                  {#if level.tasks.length === 0}
                    <p class="text-gray-500 text-sm py-2">No tasks yet. Add at least one task.</p>
                  {:else}
                    <div class="space-y-3">
                      {#each level.tasks as task, taskIndex}
                        <div class="bg-gray-600/30 rounded-lg p-3">
                          <div class="flex items-start gap-2 mb-2">
                            <span class="text-xs font-medium text-gray-400 mt-2">{taskIndex + 1}.</span>
                            <div class="flex-1">
                              <input
                                type="text"
                                bind:value={task.title}
                                placeholder="Task title"
                                class="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-100 text-sm placeholder-gray-400"
                              />
                            </div>
                            <button
                              type="button"
                              on:click={() => removeTask(levelIndex, taskIndex)}
                              class="p-1 hover:text-red-400 transition-colors"
                            >
                              <Trash2 class="w-4 h-4" />
                            </button>
                          </div>
                          <div class="ml-5 space-y-2">
                            <textarea
                              bind:value={task.description}
                              rows="2"
                              placeholder="Task description..."
                              class="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-100 text-sm placeholder-gray-400 resize-none"
                            ></textarea>
                            <input
                              type="text"
                              bind:value={task.hint}
                              placeholder="Hint (optional)"
                              class="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-100 text-sm placeholder-gray-400"
                            />
                          </div>
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Hidden input to send levels as JSON -->
        <input type="hidden" name="levels" value={JSON.stringify(levels)} />
      </section>

      <!-- Submit -->
      <div class="flex justify-end gap-4">
        <a
          href="/ugc"
          class="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={isSubmitting}
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
        >
          {#if isSubmitting}
            <div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            Creating...
          {:else}
            <Save class="w-4 h-4" />
            Create Submission
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
