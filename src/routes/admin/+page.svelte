<script lang="ts">
  import { enhance } from '$app/forms';
  import { Trash2, Edit2, Plus, ChevronDown, ChevronRight, Save, X } from 'lucide-svelte';
  
  export let data;
  
  // State for editing
  let editingScenario: string | null = null;
  let editingLevel: string | null = null;
  let editingTask: string | null = null;
  
  // Form data stores
  let scenarioForm = { name: '', description: '', difficulty: '' };
  let levelForm = { title: '', subtitle: '', order: 0, deadline: new Date().toISOString().split('T')[0], levelDescription: '', xpReward: 100, coinReward: 50 };
  let taskForm = { taskName: '', userStory: '', order: 0, testType: 'none' };
  
  // New item forms
  let showNewScenario = false;
  let newScenario = { name: '', description: '', difficulty: 'Easy' };
  let expandedLevels: Set<string> = new Set();
  let expandedTasks: Set<string> = new Set();
  
  function toggleLevel(levelId: string) {
    if (expandedLevels.has(levelId)) {
      expandedLevels.delete(levelId);
    } else {
      expandedLevels.add(levelId);
    }
    expandedLevels = expandedLevels;
  }
  
  function toggleTask(taskId: string) {
    if (expandedTasks.has(taskId)) {
      expandedTasks.delete(taskId);
    } else {
      expandedTasks.add(taskId);
    }
    expandedTasks = expandedTasks;
  }
  
  function startEditScenario(scenario: any) {
    editingScenario = scenario.id;
    scenarioForm = { name: scenario.name, description: scenario.description, difficulty: scenario.difficulty };
  }
  
  function startEditLevel(level: any) {
    editingLevel = level.id;
    levelForm = {
      title: level.title,
      subtitle: level.subtitle,
      order: level.order,
      deadline: level.deadline ? new Date(level.deadline).toISOString().split('T')[0] : '',
      levelDescription: level.levelDescription,
      xpReward: level.xpReward,
      coinReward: level.coinReward
    };
  }
  
  function startEditTask(task: any) {
    editingTask = task.id;
    taskForm = { taskName: task.taskName, userStory: task.userStory, order: task.order, testType: task.testType || 'none' };
  }
</script>

<div class="min-h-screen bg-zinc-900 text-gray-200 p-6">
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">Admin - Scenario Management</h1>
        <p class="text-gray-400 mt-1">Manage scenarios, levels, tasks, acceptance criteria, and hints</p>
      </div>
      <button 
        on:click={() => showNewScenario = !showNewScenario}
        class="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg transition-colors"
      >
        <Plus class="w-4 h-4" />
        Add Scenario
      </button>
    </div>
    
    <!-- New Scenario Form -->
    {#if showNewScenario}
      <div class="bg-zinc-800 rounded-lg p-6 mb-6 border border-zinc-700">
        <h2 class="text-lg font-semibold mb-4">New Scenario</h2>
        <form method="POST" action="?/createScenario" use:enhance>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Name</label>
              <input 
                type="text" 
                name="name" 
                bind:value={newScenario.name}
                class="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white" 
                required 
              />
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">Difficulty</label>
              <select 
                name="difficulty" 
                bind:value={newScenario.difficulty}
                class="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">Description</label>
              <input 
                type="text" 
                name="description" 
                bind:value={newScenario.description}
                class="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white" 
              />
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <button type="submit" class="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg">
              <Save class="w-4 h-4" />
              Create
            </button>
            <button type="button" on:click={() => showNewScenario = false} class="flex items-center gap-2 bg-zinc-600 hover:bg-zinc-500 px-4 py-2 rounded-lg">
              <X class="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    {/if}
    
    <!-- Scenarios List -->
    <div class="space-y-4">
      {#each data.scenarios as scenario (scenario.id)}
        <div class="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
          <!-- Scenario Header -->
          <div class="p-4 flex items-center justify-between bg-zinc-800/50">
            <div class="flex-1">
              {#if editingScenario === scenario.id}
                <form method="POST" action="?/updateScenario" use:enhance class="flex gap-4 items-center">
                  <input type="hidden" name="id" value={scenario.id} />
                  <input 
                    type="text" 
                    name="name" 
                    bind:value={scenarioForm.name}
                    class="bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white" 
                  />
                  <input 
                    type="text" 
                    name="difficulty" 
                    bind:value={scenarioForm.difficulty}
                    class="bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white w-24" 
                  />
                  <input 
                    type="text" 
                    name="description" 
                    bind:value={scenarioForm.description}
                    class="bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white flex-1" 
                  />
                  <button type="submit" class="text-green-400 hover:text-green-300">
                    <Save class="w-4 h-4" />
                  </button>
                  <button type="button" on:click={() => editingScenario = null} class="text-gray-400 hover:text-gray-300">
                    <X class="w-4 h-4" />
                  </button>
                </form>
              {:else}
                <div class="flex items-center gap-3">
                  <h3 class="text-lg font-semibold text-white">{scenario.name}</h3>
                  <span class="text-xs bg-zinc-700 px-2 py-0.5 rounded text-gray-300">{scenario.difficulty}</span>
                  <span class="text-xs text-gray-500">{scenario.levels?.length || 0} levels</span>
                </div>
                {#if scenario.description}
                  <p class="text-sm text-gray-400 mt-1">{scenario.description}</p>
                {/if}
              {/if}
            </div>
            <div class="flex items-center gap-2">
              {#if editingScenario !== scenario.id}
                <button 
                  on:click={() => startEditScenario(scenario)}
                  class="p-2 text-gray-400 hover:text-white hover:bg-zinc-700 rounded"
                >
                  <Edit2 class="w-4 h-4" />
                </button>
              {/if}
              <form method="POST" action="?/deleteScenario" use:enhance>
                <input type="hidden" name="id" value={scenario.id} />
                <button type="submit" class="p-2 text-gray-400 hover:text-red-400 hover:bg-zinc-700 rounded">
                  <Trash2 class="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
          
          <!-- Levels -->
          {#if scenario.levels && scenario.levels.length > 0}
            <div class="border-t border-zinc-700">
              {#each scenario.levels as level (level.id)}
                <div class="border-b border-zinc-700/50 last:border-b-0">
                  <!-- Level Header -->
                  <div 
                    class="p-3 flex items-center justify-between cursor-pointer hover:bg-zinc-700/30"
                    on:click={() => toggleLevel(level.id)}
                    on:keypress={(e) => e.key === 'Enter' && toggleLevel(level.id)}
                    role="button"
                    tabindex="0"
                  >
                    <div class="flex items-center gap-2">
                      {#if expandedLevels.has(level.id)}
                        <ChevronDown class="w-4 h-4 text-gray-400" />
                      {:else}
                        <ChevronRight class="w-4 h-4 text-gray-400" />
                      {/if}
                      <span class="font-medium text-gray-200">Level {level.order}: {level.title}</span>
                      <span class="text-xs text-gray-500">({level.tasks?.length || 0} tasks)</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-500">{level.xpReward} XP | {level.coinReward} coins</span>
                      {#if editingLevel !== level.id}
                        <button 
                          on:click|stopPropagation={() => startEditLevel(level)}
                          class="p-1 text-gray-400 hover:text-white hover:bg-zinc-700 rounded"
                        >
                          <Edit2 class="w-3 h-3" />
                        </button>
                      {/if}
                      <form method="POST" action="?/deleteLevel" on:click|stopPropagation use:enhance>
                        <input type="hidden" name="id" value={level.id} />
                        <button type="submit" class="p-1 text-gray-400 hover:text-red-400 hover:bg-zinc-700 rounded">
                          <Trash2 class="w-3 h-3" />
                        </button>
                      </form>
                    </div>
                  </div>
                  
                  <!-- Level Edit Form -->
                  {#if editingLevel === level.id}
                    <div class="p-3 bg-zinc-700/30 border-b border-zinc-700/50">
                      <form method="POST" action="?/updateLevel" use:enhance class="space-y-3">
                        <input type="hidden" name="id" value={level.id} />
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label class="block text-xs text-gray-400">Title</label>
                            <input type="text" name="title" bind:value={levelForm.title} class="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm" />
                          </div>
                          <div>
                            <label class="block text-xs text-gray-400">Subtitle</label>
                            <input type="text" name="subtitle" bind:value={levelForm.subtitle} class="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm" />
                          </div>
                          <div>
                            <label class="block text-xs text-gray-400">Order</label>
                            <input type="number" name="order" bind:value={levelForm.order} class="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm" />
                          </div>
                          <div>
                            <label class="block text-xs text-gray-400">Deadline</label>
                            <input type="date" name="deadline" bind:value={levelForm.deadline} class="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm" />
                          </div>
                          <div>
                            <label class="block text-xs text-gray-400">XP Reward</label>
                            <input type="number" name="xpReward" bind:value={levelForm.xpReward} class="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm" />
                          </div>
                          <div>
                            <label class="block text-xs text-gray-400">Coin Reward</label>
                            <input type="number" name="coinReward" bind:value={levelForm.coinReward} class="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm" />
                          </div>
                          <div class="col-span-2">
                            <label class="block text-xs text-gray-400">Description</label>
                            <input type="text" name="levelDescription" bind:value={levelForm.levelDescription} class="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm" />
                          </div>
                        </div>
                        <div class="flex gap-2">
                          <button type="submit" class="flex items-center gap-1 text-xs bg-cyan-500 hover:bg-cyan-600 px-3 py-1 rounded">
                            <Save class="w-3 h-3" /> Save
                          </button>
                          <button type="button" on:click={() => editingLevel = null} class="text-xs text-gray-400 hover:text-white">Cancel</button>
                        </div>
                      </form>
                    </div>
                  {/if}
                  
                  <!-- Expanded Level Content -->
                  {#if expandedLevels.has(level.id)}
                    <div class="p-3 bg-zinc-900/30 space-y-3">
                      <!-- Add Task Form -->
                      <form method="POST" action="?/createTask" use:enhance class="flex gap-2 items-end">
                        <input type="hidden" name="levelId" value={level.id} />
                        <div class="flex-1">
                          <input 
                            type="text" 
                            name="taskName" 
                            placeholder="Task name"
                            class="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm" 
                            required
                          />
                        </div>
                        <div class="flex-1">
                          <input 
                            type="text" 
                            name="userStory" 
                            placeholder="User story"
                            class="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm" 
                          />
                        </div>
                        <div class="w-20">
                          <input 
                            type="number" 
                            name="order" 
                            value={level.tasks?.length || 0}
                            class="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm" 
                          />
                        </div>
                        <button type="submit" class="bg-cyan-500 hover:bg-cyan-600 px-2 py-1 rounded text-sm">
                          <Plus class="w-3 h-3" />
                        </button>
                      </form>
                      
                      <!-- Tasks List -->
                      {#if level.tasks && level.tasks.length > 0}
                        {#each level.tasks as task (task.id)}
                          <div class="bg-zinc-800 rounded border border-zinc-600">
                            <!-- Task Header -->
                            <div 
                              class="p-2 flex items-center justify-between cursor-pointer hover:bg-zinc-700/30"
                              on:click={() => toggleTask(task.id)}
                              on:keypress={(e) => e.key === 'Enter' && toggleTask(task.id)}
                              role="button"
                              tabindex="0"
                            >
                              <div class="flex items-center gap-2">
                                {#if expandedTasks.has(task.id)}
                                  <ChevronDown class="w-3 h-3 text-gray-400" />
                                {:else}
                                  <ChevronRight class="w-3 h-3 text-gray-400" />
                                {/if}
                                <span class="text-sm text-gray-200">{task.taskName}</span>
                                <span class="text-xs text-gray-500">{task.order}</span>
                              </div>
                              <div class="flex items-center gap-1">
                                {#if editingTask !== task.id}
                                  <button 
                                    on:click|stopPropagation={() => startEditTask(task)}
                                    class="p-1 text-gray-400 hover:text-white hover:bg-zinc-700 rounded"
                                  >
                                    <Edit2 class="w-3 h-3" />
                                  </button>
                                {/if}
                                <form method="POST" action="?/deleteTask" on:click|stopPropagation use:enhance>
                                  <input type="hidden" name="id" value={task.id} />
                                  <button type="submit" class="p-1 text-gray-400 hover:text-red-400 hover:bg-zinc-700 rounded">
                                    <Trash2 class="w-3 h-3" />
                                  </button>
                                </form>
                              </div>
                            </div>
                            
                            <!-- Task Edit Form -->
                            {#if editingTask === task.id}
                              <div class="p-2 bg-zinc-700/30 border-t border-zinc-600">
                                <form method="POST" action="?/updateTask" use:enhance class="space-y-2">
                                  <input type="hidden" name="id" value={task.id} />
                                  <div class="grid grid-cols-2 gap-2">
                                    <div>
                                      <label class="block text-xs text-gray-400">Task Name</label>
                                      <input type="text" name="taskName" bind:value={taskForm.taskName} class="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs" />
                                    </div>
                                    <div>
                                      <label class="block text-xs text-gray-400">Order</label>
                                      <input type="number" name="order" bind:value={taskForm.order} class="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs" />
                                    </div>
                                    <div class="col-span-2">
                                      <label class="block text-xs text-gray-400">User Story</label>
                                      <input type="text" name="userStory" bind:value={taskForm.userStory} class="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs" />
                                    </div>
                                    <div>
                                      <label class="block text-xs text-gray-400">Test Type</label>
                                      <select name="testType" bind:value={taskForm.testType} class="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs">
                                        <option value="none">None</option>
                                        <option value="automated">Automated</option>
                                        <option value="manual">Manual</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div class="flex gap-2">
                                    <button type="submit" class="flex items-center gap-1 text-xs bg-cyan-500 hover:bg-cyan-600 px-2 py-1 rounded">
                                      <Save class="w-3 h-3" /> Save
                                    </button>
                                    <button type="button" on:click={() => editingTask = null} class="text-xs text-gray-400 hover:text-white">Cancel</button>
                                  </div>
                                </form>
                              </div>
                            {/if}
                            
                            <!-- Expanded Task Content: Acceptance Criteria & Hints -->
                            {#if expandedTasks.has(task.id)}
                              <div class="p-2 bg-zinc-900/50 border-t border-zinc-600 space-y-2">
                                <!-- Acceptance Criteria -->
                                <div>
                                  <div class="flex items-center justify-between mb-1">
                                    <span class="text-xs font-medium text-gray-300">Acceptance Criteria</span>
                                    <form method="POST" action="?/createAcceptanceCriteria" use:enhance class="flex gap-1">
                                      <input type="hidden" name="taskId" value={task.id} />
                                      <input 
                                        type="text" 
                                        name="description" 
                                        placeholder="Add criteria..."
                                        class="bg-zinc-700 border border-zinc-600 rounded px-2 py-0.5 text-xs w-40" 
                                      />
                                      <button type="submit" class="text-cyan-400 hover:text-cyan-300">
                                        <Plus class="w-3 h-3" />
                                      </button>
                                    </form>
                                  </div>
                                  {#if task.acceptanceCriteria && task.acceptanceCriteria.length > 0}
                                    <div class="space-y-1 ml-4">
                                      {#each task.acceptanceCriteria as ac (ac.id)}
                                        <div class="flex items-center gap-2 text-xs">
                                          <input 
                                            type="checkbox" 
                                            checked={ac.isRequired}
                                            on:change={(e) => {
                                              // Would need a form action to update
                                            }}
                                            class="rounded"
                                          />
                                          <span class="text-gray-300">{ac.description}</span>
                                          <form method="POST" action="?/deleteAcceptanceCriteria" use:enhance class="ml-auto">
                                            <input type="hidden" name="id" value={ac.id} />
                                            <button type="submit" class="text-gray-500 hover:text-red-400">
                                              <Trash2 class="w-3 h-3" />
                                            </button>
                                          </form>
                                        </div>
                                      {/each}
                                    </div>
                                  {:else}
                                    <p class="text-xs text-gray-500 ml-4">No acceptance criteria</p>
                                  {/if}
                                </div>
                                
                                <!-- Hints -->
                                <div>
                                  <div class="flex items-center justify-between mb-1">
                                    <span class="text-xs font-medium text-gray-300">Hints</span>
                                    <form method="POST" action="?/createHint" use:enhance class="flex gap-1">
                                      <input type="hidden" name="taskId" value={task.id} />
                                      <input 
                                        type="text" 
                                        name="description" 
                                        placeholder="Add hint..."
                                        class="bg-zinc-700 border border-zinc-600 rounded px-2 py-0.5 text-xs w-40" 
                                      />
                                      <button type="submit" class="text-cyan-400 hover:text-cyan-300">
                                        <Plus class="w-3 h-3" />
                                      </button>
                                    </form>
                                  </div>
                                  {#if task.hints && task.hints.length > 0}
                                    <div class="space-y-1 ml-4">
                                      {#each task.hints as hint (hint.id)}
                                        <div class="flex items-center gap-2 text-xs">
                                          <span class="text-yellow-400">💡</span>
                                          <span class="text-gray-300">{hint.description}</span>
                                          <form method="POST" action="?/deleteHint" use:enhance class="ml-auto">
                                            <input type="hidden" name="id" value={hint.id} />
                                            <button type="submit" class="text-gray-500 hover:text-red-400">
                                              <Trash2 class="w-3 h-3" />
                                            </button>
                                          </form>
                                        </div>
                                      {/each}
                                    </div>
                                  {:else}
                                    <p class="text-xs text-gray-500 ml-4">No hints</p>
                                  {/if}
                                </div>
                              </div>
                            {/if}
                          </div>
                        {/each}
                      {/if}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
          
          <!-- Add Level Form -->
          <div class="p-3 border-t border-zinc-700 bg-zinc-900/30">
            <form method="POST" action="?/createLevel" use:enhance class="flex gap-2 items-end">
              <input type="hidden" name="scenarioId" value={scenario.id} />
              <div class="flex-1">
                <input 
                  type="text" 
                  name="title" 
                  placeholder="Level title"
                  class="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm" 
                  required
                />
              </div>
              <div class="w-20">
                <input 
                  type="number" 
                  name="order" 
                  value={scenario.levels?.length || 0}
                  placeholder="Order"
                  class="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm" 
                />
              </div>
              <button type="submit" class="bg-cyan-500 hover:bg-cyan-600 px-3 py-1 rounded text-sm">
                <Plus class="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      {/each}
      
      {#if data.scenarios.length === 0}
        <div class="text-center py-12 text-gray-500">
          <p>No scenarios found. Create one to get started.</p>
        </div>
      {/if}
    </div>
  </div>
</div>