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

  // AI review accordion state
  let aiReviewOpen = false;

  // AI Scoring state
  let aiScoring: {
    stars: number;
    score: number;
    feedback: string;
    improvements: string;
    nextTime: string;
    loading: boolean;
    done: boolean;
  } = { stars: 1, score: 50, feedback: '', improvements: '', nextTime: '', loading: false, done: false };

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
    aiReviewOpen = false;
    aiScoring = { stars: 1, score: 50, feedback: '', improvements: '', nextTime: '', loading: false, done: false };
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
      
      // Always fetch ALL files from the container for complete AI analysis
      // Start with any already-provided file contents (e.g. currently open file)
      let filesToCheck = existingFiles;
      let contentsToCheck: Record<string, string> = { ...fileContents };
      
      if (containerId) {
        try {
          console.log('AI SCORING: Fetching file list from container...');
          const listRes = await fetch(`/api/docker/container/${containerId}/files/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          const listData = await listRes.json();
          if (listData.success) {
            filesToCheck = listData.files || [];
            console.log('AI SCORING: Total files in workspace:', filesToCheck.length);
            
            // Read ALL files from the workspace
            let filesRead = 0;
            let filesFailed = 0;
            for (const file of filesToCheck) {
              // Skip if already read
              if (contentsToCheck[file]) {
                console.log('AI SCORING: ↩ Already have:', file);
                continue;
              }
              // Skip node_modules, .git, dist, .next
              if (file.includes('node_modules') || file.includes('/.git/') || file.includes('/.next/') || file.includes('/dist/')) continue;
              // Skip binary files
              if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.gif') || file.endsWith('.ico')) continue;
              if (file.endsWith('.mp4') || file.endsWith('.zip') || file.endsWith('.tar') || file.endsWith('.gz')) continue;
              if (file.endsWith('.lock') || file.endsWith('.log')) continue;
              
              try {
                const readRes = await fetch(`/api/docker/container/${containerId}/files/read`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ path: `/workspace/${file}` })
                });
                const readData = await readRes.json();
                if (readData.success) {
                  contentsToCheck[file] = readData.content;
                  filesRead++;
                  console.log('AI SCORING: ✓ Read file:', file, '(' + readData.content.length + ' chars)');
                } else {
                  filesFailed++;
                  console.log('AI SCORING: ✗ Failed:', file, '-', readData.message || 'unknown error');
                }
              } catch (e) {
                filesFailed++;
                console.log('AI SCORING: ✗ Exception:', file, '-', e);
              }
            }
            console.log('AI SCORING: ==============================');
            console.log('AI SCORING: Files read:', filesRead, '| Failed:', filesFailed);
            console.log('AI SCORING: All files for AI:', Object.keys(contentsToCheck));
            console.log('AI SCORING: ==============================');
          } else {
            console.warn('AI SCORING: File list fetch failed:', listData);
          }
        } catch (e) {
          console.warn('AI SCORING: Could not fetch file list:', e);
        }
      }
      
      console.log('=== TEST RUN: Starting test validation ===');
      console.log('TEST: Level:', level, '| Tasks:', tasks.length);
      console.log('TEST: File contents to check:', Object.keys(contentsToCheck).length, 'files');
      
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
      
      console.log('TEST: Response status:', testRes.status);
      
      const testData = await testRes.json();
      console.log('=== TEST RUN: Results Received ===');
      console.log('TEST: Passed:', testData.passed);
      console.log('TEST: Total Tests:', testData.results?.summary.total);
      console.log('TEST: Passed Tests:', testData.results?.summary.passed);
      console.log('TEST: Failed Tests:', testData.results?.summary.failed);
      
      if (testData.failedTasks.length > 0) {
        console.log('=== TEST RUN: Failed Tasks ===');
        testData.failedTasks.forEach((task: any, index: number) => {
          console.log(`${index + 1}. ${task.taskText}`);
          task.errors.forEach((error: string) => {
            console.log(`   • ${error}`);
          });
        });
      }
      
      console.log('=== TEST RUN: Detailed Results ===');
      testData.results?.results.forEach((result: any) => {
        console.log(`${result.passed ? '✅' : '❌'} ${result.testName}: ${result.message}`);
      });
      
      testResults = {
        passed: testData.passed,
        failedTasks: testData.failedTasks || [],
        summary: testData.results?.summary || { total: 0, passed: 0, failed: 0 }
      };
      
      // If tests failed, show error with details
      if (!testData.passed) {
        state = 'error';
        const failedCount = testData.failedTasks?.length || 0;
        
        // Build detailed error message
        let errorMsg = `Tests failed! ${failedCount} task(s) did not pass validation:\n\n`;
        
        if (testData.failedTasks && testData.failedTasks.length > 0) {
          for (const task of testData.failedTasks) {
            errorMsg += `❌ ${task.taskText}\n`;
            if (task.errors && task.errors.length > 0) {
              for (const err of task.errors) {
                errorMsg += `   • ${err}\n`;
              }
            }
            errorMsg += '\n';
          }
        } else {
          errorMsg += 'Please review your work and try again.';
        }
        
        submitError = errorMsg;
        console.log('TEST: Submit error message:', submitError);
        return;
      }

      // AI Scoring - evaluate the user's code including test results
      aiScoring.loading = true;
      console.log('AI SCORING: Starting AI scoring...');
      console.log('AI SCORING: Files available for AI:', Object.keys(contentsToCheck).length);
      console.log('AI SCORING: Test results to include:', JSON.stringify(testData));
      try {
        // Get completed task texts for the scoring
        const completedTaskTexts = tasks.filter(t => t.completed).map(t => t.text);
        
        // Call AI scoring endpoint with test results
        const scoreRes = await fetch('/api/ai/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            containerId: containerId,
            level,
            completedTasks: completedTaskTexts,
            fileContents: contentsToCheck,
            testResults: testData  // Pass test results to AI
          })
        });
        
        const scoreData = await scoreRes.json();
        console.log('AI SCORING: Response received:', scoreData);
        if (scoreData.success) {
          aiScoring = {
            stars: scoreData.stars || 1,
            score: scoreData.score || 50,
            feedback: scoreData.feedback || 'Your code passes the tests but there is room for improvement.',
            improvements: scoreData.improvements || '',
            nextTime: scoreData.nextTime || '',
            loading: false,
            done: true
          };
        } else {
          aiScoring = {
            stars: 1,
            score: 35,
            feedback: 'Your code passes the tests but there is room for improvement.',
            improvements: '',
            nextTime: '',
            loading: false,
            done: true
          };
        }
      } catch (e) {
        console.warn('AI Scoring failed:', e);
        aiScoring = {
          stars: 1,
          score: 35,
          feedback: 'Your code passes the tests but there is room for improvement.',
          improvements: '',
          nextTime: '',
          loading: false,
          done: true
        };
      }
      console.log('AI SCORING: Complete - Stars:', aiScoring.stars, 'Score:', aiScoring.score);
      console.log('AI SCORING: feedback:', aiScoring.feedback);
      console.log('AI SCORING: improvements:', aiScoring.improvements);
      console.log('AI SCORING: nextTime:', aiScoring.nextTime);

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

      <!-- AI Scoring Display -->
      {#if aiScoring.done && !aiScoring.loading}
        <div class="mb-5 bg-[#0d1321] border border-[rgba(99,102,241,0.25)] rounded-[6px] overflow-hidden">
          <!-- Always-visible summary row -->
          <div class="flex items-center justify-between px-4 py-3">
            <div class="flex items-center gap-2">
              {#each [1, 2, 3] as star}
                <span class="text-xl {star <= aiScoring.stars ? 'text-[#fbbf24]' : 'text-[#2d3446]'}">
                  {star <= aiScoring.stars ? '★' : '☆'}
                </span>
              {/each}
              <span class="font-mono text-sm font-bold ml-1 {aiScoring.score >= 75 ? 'text-[#4ade80]' : aiScoring.score >= 50 ? 'text-[#fbbf24]' : 'text-[#f97316]'}">
                {aiScoring.score}<span class="text-[#6b7280] font-normal">/100</span>
              </span>
            </div>
            <button
              on:click={() => aiReviewOpen = !aiReviewOpen}
              class="font-mono text-[0.7rem] text-[#6366f1] hover:text-[#818cf8] transition-colors flex items-center gap-1"
            >
              {aiReviewOpen ? 'Hide' : 'View'} feedback
              <span class="transition-transform duration-200 {aiReviewOpen ? 'rotate-180' : ''}">▾</span>
            </button>
          </div>

          <!-- Collapsible detail -->
          {#if aiReviewOpen}
            <div class="border-t border-[rgba(99,102,241,0.15)] px-4 py-3 text-left space-y-3 max-h-[200px] overflow-y-auto scrollbar-thin">
              <!-- Overall Feedback -->
              <p class="font-mono text-[0.78rem] text-[#9ca3af] leading-relaxed">
                {aiScoring.feedback}
              </p>

              <!-- Improvements -->
              {#if aiScoring.improvements}
                <div>
                  <p class="font-mono text-[0.65rem] tracking-[0.12em] uppercase text-[#fbbf24] mb-1 flex items-center gap-1">
                    <span>🔧</span> What to Improve
                  </p>
                  <div class="font-mono text-[0.75rem] text-[#d0d7dd] leading-relaxed whitespace-pre-line bg-[#0a0e1a] rounded px-3 py-2 border border-[rgba(251,191,36,0.12)]">
                    {aiScoring.improvements}
                  </div>
                </div>
              {/if}

              <!-- Next Time Tips -->
              {#if aiScoring.nextTime}
                <div>
                  <p class="font-mono text-[0.65rem] tracking-[0.12em] uppercase text-[#4ade80] mb-1 flex items-center gap-1">
                    <span>💡</span> Next Time
                  </p>
                  <div class="font-mono text-[0.75rem] text-[#d0d7dd] leading-relaxed whitespace-pre-line bg-[#0a0e1a] rounded px-3 py-2 border border-[rgba(74,222,128,0.12)]">
                    {aiScoring.nextTime}
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {:else if aiScoring.loading}
        <div class="mb-5 px-4 py-3 bg-[#0d1321] border border-[rgba(99,102,241,0.25)] rounded-[6px] flex items-center gap-3">
          <div class="w-4 h-4 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
          <p class="font-mono text-[0.72rem] text-[#6366f1]">Analyzing your code…</p>
        </div>
      {/if}

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