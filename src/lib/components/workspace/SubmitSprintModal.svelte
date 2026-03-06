<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  import type { Task } from '$lib/interface/LevelConfig';
  import LoadingSteps from '$lib/components/ui/LoadingSteps.svelte';
  import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';

  // -- Props --------------------------------------------------------------------
  export let dbContainerId: string | null;
  export let containerId: string; // Docker container ID for file operations
  export let tasks: Task[];
  export let level: number = 1;
  export let fileContents: Record<string, string> = {};
  export let existingFiles: string[] = [];

  // -- State --------------------------------------------------------------------
  type ModalState = 'confirm' | 'testing' | 'loading' | 'success' | 'error';
  let state: ModalState = 'confirm';
  let showModal = false;
  let submitStep = 0;
  let submitError = '';
  let submitRewards = { xp: 0, coins: 0 };

  // Test results state
  let testResults: {
    passed: boolean;
    failedTasks: Array<{ taskId: number; taskText: string; errors: string[] }>;
    summary: { total: number; passed: number; failed: number };
  } | null = null;

  const SUBMIT_STEPS = [
    { icon: '🧪', label: 'Running tests…', detail: 'Validating your work against level requirements' },
    { icon: '🏁', label: 'Recording completion…', detail: 'Recording your progress & awarding rewards' },
    { icon: '📦', label: 'Advancing level…', detail: 'Preparing the next challenge'},
  ];

  // Add testing step
  const TESTING_STEPS = [
    { icon: '🧪', label: 'Running tests…', detail: 'Validating your work against level requirements' },
  ];

  $: completedCount = tasks.filter(t => t.completed).length;

  // -- Events -------------------------------------------------------------------
  const dispatch = createEventDispatcher<{ submitted: { xp: number; coins: number; advanceToNextLevel: boolean } }>();

  // Track if we're advancing to next level (for success UI)
  let advancingToNextLevel = false;

  // -- Public API ---------------------------------------------------------------
  export function open() {
    submitError = '';
    submitStep = 0;
    state = 'confirm';
    showModal = true;
    testResults = null;
  }

  function close() {
    if (state === 'loading') return;
    showModal = false;
    state = 'confirm';
  }

  // -- Submit flow --------------------------------------------------------------
  async function handleConfirm() {
    if (!dbContainerId) {
      submitError = 'Could not resolve container record. Please refresh and try again.';
      state = 'error';
      return;
    }

    state = 'loading';
    submitStep = 0;
    submitError = '';
    testResults = null;

    try {
      // Step 0 - Run tests to validate user work
      submitStep = 0;
      
      // Fetch file list if not provided
      let filesToCheck = existingFiles;
      let contentsToCheck = fileContents;
      
      if (containerId && Object.keys(fileContents).length === 0) {
        try {
          const listRes = await fetch(`/api/docker/container/${containerId}/files/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          const listData = await listRes.json();
          if (listData.success) {
            filesToCheck = listData.files || [];
            
            // Read key files for validation
            const keyFiles = ['package.json', 'prisma/schema.prisma', 'app/api/users/route.ts', 'app/api/users/+server.ts'];
            for (const file of keyFiles) {
              try {
                const readRes = await fetch(`/api/docker/container/${containerId}/files/read`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ path: `/workspace/${file}` })
                });
                const readData = await readRes.json();
                if (readData.success) {
                  contentsToCheck[file] = readData.content;
                }
              } catch (e) {
                // File might not exist
              }
            }
          }
        } catch (e) {
          console.warn('Could not fetch file list:', e);
        }
      }
      
      // Run tests
      const testRes = await fetch('/api/tests/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          tasks: tasks.map(t => ({ id: t.id, text: t.text, completed: t.completed })),
          fileContents: contentsToCheck,
          existingFiles: filesToCheck
        })
      });
      
      const testData = await testRes.json();
      testResults = {
        passed: testData.passed,
        failedTasks: testData.failedTasks || [],
        summary: testData.results?.summary || { total: 0, passed: 0, failed: 0 }
      };
      
      // If tests failed, show error with details
      if (!testData.passed) {
        state = 'error';
        const failedCount = testData.failedTasks?.length || 0;
        submitError = `Tests failed! ${failedCount} task(s) did not pass validation.\n\n`;
        submitError += testData.failedTasks?.map((t: any) => 
          `• ${t.taskText}:\n  ${t.errors?.join('\n  ') || 'Validation failed'}`
        ).join('\n\n') || 'Please review your work and try again.';
        return;
      }

      // Step 1 - Submit completed tasks
      submitStep = 1;
      const completedTasks = tasks.filter(t => t.completed);
      
      // Check if ALL tasks are completed before allowing submission
      if (completedTasks.length < tasks.length) {
        const remainingCount = tasks.length - completedTasks.length;
        submitError = `You must complete all ${tasks.length} tasks before submitting.

` +
          `Currently completed: ${completedTasks.length}/${tasks.length}
` +
          `Remaining: ${remainingCount} task(s)`;
        state = 'error';
        return;
      }
      
      // Submit each completed task one by one
      let allLevelsComplete = false;
      
      for (let i = 0; i < completedTasks.length; i++) {
        const task = completedTasks[i];
        const submitRes = await fetch(`/api/docker/container/${dbContainerId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: task.text })
        });
        const submitData = await submitRes.json();
        
        if (!submitRes.ok) {
          throw new Error(submitData.message ?? `Failed to submit task: ${task.text}`);
        }
        
        // Collect rewards (last one will have the full reward)
        submitRewards = submitData.rewards;
        
        // Check if all levels are now complete
        allLevelsComplete = submitData.allLevelsComplete ?? false;
        
        // If all levels complete, stop submitting more tasks
        if (allLevelsComplete) {
          break;
        }
      }

      // Step 2 - archive ONLY if all levels complete
      if (allLevelsComplete) {
        submitStep = 2;
        const archiveRes = await fetch(`/api/docker/container/${dbContainerId}/archive`, { method: 'POST' });
        const archiveData = await archiveRes.json();
        
        // If archive fails but submit succeeded, still show success
        if (!archiveRes.ok && !archiveData.success) {
          console.warn('Archive failed:', archiveData.message);
        }
      }

      // Determine what to do next based on level completion
      const advanceToNextLevel = allLevelsComplete === false;
      advancingToNextLevel = advanceToNextLevel;
      
      state = 'success';
      dispatch('submitted', { ...submitRewards, advanceToNextLevel });
    } catch (err) {
      submitError = err instanceof Error ? err.message : String(err);
      state = 'error';
    }
  }

  function handleDone() {
    goto('/dashboard');
  }

  function handleContinueWorking() {
    // Close modal and let parent reload the page
    showModal = false;
    state = 'confirm';
    // Dispatch event to notify parent to reload
    dispatch('submitted', { ...submitRewards, advanceToNextLevel: true });
  }

  // -- Derived props fed into ConfirmationModal ----------------------------------
  $: modalIcon     = state === 'error' ? '⚠' : state === 'loading' ? '' : '⟨/⟩';
  $: iconVariant   = (state === 'error' ? 'danger' : state === 'testing' ? 'warning' : 'accent') as 'accent' | 'danger' | 'warning' | 'success';
  $: modalTitle    = state === 'error' ? 'Tests Failed' : state === 'loading' ? '' : state === 'testing' ? 'Running Tests…' : 'Submit Sprint?';
  $: modalSubtitle = state === 'confirm'
    ? 'Are you sure you want to submit your completed tasks? This will validate your work and award XP and coins if all tests pass.'
    : state === 'testing'
    ? 'Please wait while we validate your work against the level requirements...'
    : '';
  $: confirmLabel  = state === 'error' ? 'Retry' : 'Submit & Continue';
  $: cancelLabel   = state === 'error' ? 'Close'  : state === 'testing' ? 'Cancel' : 'Cancel';
  $: variant       = (state === 'error' ? 'danger' : state === 'testing' ? 'warning' : 'primary') as 'primary' | 'danger' | 'warning' | 'success';
  $: modalError    = state === 'error' ? submitError : '';
  $: hideActions   = state === 'loading' || state === 'testing';
  $: showSuccess   = state === 'success';
</script>

<!-- ConfirmationModal is the shell — all 4 states drive its props/slots -->
<ConfirmationModal
  bind:open={showModal}
  icon={modalIcon}
  {iconVariant}
  title={modalTitle}
  subtitle={modalSubtitle}
  {confirmLabel}
  {cancelLabel}
  {variant}
  {hideActions}
  {showSuccess}
  error={modalError}
  on:confirm={handleConfirm}
  on:cancel={close}
>
  <!-- Default slot: body changes per state -->
  {#if state === 'confirm'}
    <!-- Task summary -->
    <div class="bg-[#0a0e1a] border border-[rgba(30,42,58,0.9)] rounded-[4px] px-4 py-3.5 mb-4">
      <p class="font-mono text-[0.75rem] tracking-[0.1em] uppercase text-[#8892a0] mb-2.5">Sprint tasks</p>
      <ul class="list-none m-0 p-0 flex flex-col gap-1.5">
        {#each tasks as task}
          <li class="flex items-center gap-2.5 font-mono text-[0.88rem] {task.completed ? 'opacity-100' : 'opacity-35'}">
            <span class="font-bold w-4 text-center {task.completed ? 'text-[#00e5a0]' : 'text-[#2d3446]'}">
              {task.completed ? '✓' : '○'}
            </span>
            <span class="{task.completed ? 'text-[#d0d7dd]' : 'text-[#8892a0] line-through'}">
              {task.text}
            </span>
          </li>
        {/each}
      </ul>
      <p class="mt-2.5 font-mono text-[0.75rem] text-[#8892a0] text-right">{completedCount} / {tasks.length} completed</p>
    </div>

    <!-- Reward preview chips -->
    <div class="flex gap-2.5 mb-1">
      <div class="flex-1 text-center py-2 rounded-[4px] font-mono text-[0.82rem] tracking-[0.04em] border bg-[rgba(15,34,16,0.8)] border-[rgba(22,163,74,0.25)] text-[#4ade80]">
        ⚡ XP incoming
      </div>
      <div class="flex-1 text-center py-2 rounded-[4px] font-mono text-[0.82rem] tracking-[0.04em] border bg-[rgba(31,21,8,0.8)] border-[rgba(202,138,4,0.25)] text-[#fbbf24]">
        🪙 Coins incoming
      </div>
    </div>

  {:else if state === 'loading' || state === 'testing'}
    <!-- LoadingSteps fills the body; action row is hidden via hideActions -->
    {#if state === 'testing'}
      <!-- Testing state - show progress with test info -->
      <div class="flex flex-col items-center justify-center py-6">
        <div class="text-4xl mb-4 animate-pulse">🧪</div>
        <h3 class="font-['Chakra_Petch',sans-serif] text-lg font-bold text-[#d0d7dd] mb-2">
          Running Tests...
        </h3>
        <p class="font-mono text-sm text-[#8892a0] text-center max-w-xs">
          Validating your work against level {level} requirements
        </p>
        <!-- Progress indicator -->
        <div class="mt-6 w-64 h-2 bg-[#1a2234] rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-[#10b981] to-[#059669] animate-pulse" style="width: 60%"></div>
        </div>
      </div>
    {:else}
      <LoadingSteps
        card={false}
        step={submitStep}
        steps={SUBMIT_STEPS}
        title={advancingToNextLevel ? 'Advancing Level…' : 'Completing Sprint…'}
        subtitle="Please keep this window open."
      />
    {/if}
  {/if}

  <!-- Success slot -->
  <svelte:fragment slot="success">
    <div class="text-center py-2">
      <div class="text-5xl burst-anim" aria-hidden="true">🎉</div>
      <h2 class="mt-2.5 mb-1 font-['Chakra_Petch',sans-serif] text-[1.6rem] font-bold tracking-[0.08em] text-[#d0d7dd]">
        {advancingToNextLevel ? 'Level Complete!' : 'Sprint Complete!'}
      </h2>
      <p class="font-mono text-[0.85rem] text-[#8892a0] mb-6">
        {advancingToNextLevel 
          ? 'Great job! You can continue working on the next level.' 
          : 'Your workspace has been submitted successfully.'}
      </p>

      <div class="flex justify-center gap-4 mb-7">
        <!-- XP badge -->
        <div class="flex items-center gap-1.5 px-4 py-2.5 rounded-[4px] border bg-[rgba(15,34,16,0.8)] border-[rgba(22,163,74,0.30)] fade-up-anim">
          <span class="text-[1.1rem]">⚡</span>
          <span class="font-mono text-[1.5rem] font-extrabold text-[#4ade80]">+{submitRewards.xp}</span>
          <span class="font-['Chakra_Petch',sans-serif] text-[0.72rem] font-semibold tracking-[0.12em] text-[#8892a0] self-end pb-0.5">XP</span>
        </div>
        <!-- Coin badge -->
        <div class="flex items-center gap-1.5 px-4 py-2.5 rounded-[4px] border bg-[rgba(31,21,8,0.8)] border-[rgba(180,83,0,0.30)] fade-up-anim [animation-delay:0.25s]">
          <span class="text-[1.1rem]">🪙</span>
          <span class="font-mono text-[1.5rem] font-extrabold text-[#fbbf24]">+{submitRewards.coins}</span>
          <span class="font-['Chakra_Petch',sans-serif] text-[0.72rem] font-semibold tracking-[0.12em] text-[#8892a0] self-end pb-0.5">Coins</span>
        </div>
      </div>

      <div class="flex justify-center gap-3">
        {#if advancingToNextLevel}
          <button
            on:click={handleContinueWorking}
            class="px-5 py-2.5 font-['Chakra_Petch',sans-serif] text-[0.78rem] font-bold tracking-[0.08em] uppercase text-white border-none cursor-pointer transition-[opacity,box-shadow] duration-200 hover:opacity-90 fade-up-anim"
            style="background:linear-gradient(135deg,#10b981,#059669);clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));box-shadow:0 0 16px rgba(16,185,129,0.35);"
          >
            Continue Working →
          </button>
        {/if}
        <button
          on:click={handleDone}
          class="px-7 py-2.5 font-['Chakra_Petch',sans-serif] text-[0.78rem] font-bold tracking-[0.08em] uppercase text-[#0a0e1a] border-none cursor-pointer transition-[opacity,box-shadow] duration-200 hover:opacity-90 hover:text-white fade-up-anim {advancingToNextLevel ? '[animation-delay:0.1s]' : ''}"
          style="background:linear-gradient(135deg,#07a5c9,#6366f1);clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));box-shadow:0 0 16px rgba(7,165,201,0.35);"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  </svelte:fragment>
</ConfirmationModal>

<style>
  .burst-anim {
    animation: burst-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes burst-pop {
    from { transform: scale(0.3); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  .fade-up-anim {
    animation: fade-up 0.4s 0.15s ease both;
  }
  @keyframes fade-up {
    from { transform: translateY(10px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
</style>