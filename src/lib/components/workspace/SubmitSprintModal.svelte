<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  import type { ITask } from '$lib/types';
  import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
  import SubmitSprintConfirmContent from '$lib/components/workspace/SubmitSprintConfirmContent.svelte';
  import SubmitSprintProgressContent from '$lib/components/workspace/SubmitSprintProgressContent.svelte';
  import SubmitSprintSuccessContent from '$lib/components/workspace/SubmitSprintSuccessContent.svelte';

  // -- Props --------------------------------------------------------------------
  export let dbContainerId: string | null;
  export let containerId: string; // Docker container ID for file operations
  export let tasks: ITask[];
  export let level: number = 1;
  export let fileContents: Record<string, string> = {};
  export let existingFiles: string[] = [];
  export let levelXpReward: number = 0;
  export let levelCoinReward: number = 0;

  // -- State --------------------------------------------------------------------
  type ModalState = 'confirm' | 'testing' | 'loading' | 'success' | 'error';
  let state: ModalState = 'confirm';
  let showModal = false;
  let showCancelConfirmModal = false;
  let submitStep = 0;
  let submitError = '';
  let submitRewards = { xp: 0, coins: 0 };
  let submittedNextLevel: number | null = null;
  let cancelingSubmit = false;
  let submitAbortController: AbortController | null = null;
  let isSubmitFlowCanceled = false;

  // File changes tracking
  type FileChangeSummary = {
    created: string[];
    modified: string[];
    renamed: { from: string; to: string }[];
    totalChanges: number;
  };
  let fileChanges: FileChangeSummary | null = null;
  let loadingFileChanges = false;

  // Test results state
  let testResults: {
    passed: boolean;
    failedTasks: Array<{ taskId: string; taskText: string; errors: string[] }>;
    summary: { total: number; passed: number; failed: number };
  } | null = null;

  // Regression tracking for submit sprint - tasks that were done but now fail
  let regressedTasks: Array<{ taskId: string; taskName: string }> = [];

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

  const MIN_SUBMIT_STEP_VISIBLE_MS = 800;
  let submitStepStartedAt = 0;

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  function startSubmitStep(step: number) {
    submitStep = Math.min(Math.max(step, 0), SUBMIT_STEPS.length - 1);
    submitStepStartedAt = Date.now();
  }

  async function ensureCurrentSubmitStepIsVisible() {
    const elapsed = Date.now() - submitStepStartedAt;
    const remaining = MIN_SUBMIT_STEP_VISIBLE_MS - elapsed;
    if (remaining > 0) {
      await sleep(remaining);
    }
  }

  async function advanceSubmitStep(step: number) {
    await ensureCurrentSubmitStepIsVisible();
    throwIfSubmissionCanceled();
    startSubmitStep(step);
  }

  $: activeSubmitStepIndex = Math.min(Math.max(submitStep, 0), SUBMIT_STEPS.length - 1);
  $: activeSubmitStep = SUBMIT_STEPS[activeSubmitStepIndex];
  $: loadingTitle = activeSubmitStep?.label ?? 'Submitting…';
  $: loadingSubtitle = activeSubmitStep?.detail ?? 'Please keep this window open.';

  $: completedCount = tasks.filter(t => t.isCompleted).length;

  // -- Events -------------------------------------------------------------------
  const dispatch = createEventDispatcher<{ submitted: { xp: number; coins: number; advanceToNextLevel: boolean; nextLevel: number | null } }>();

  // Track if we're advancing to next level (for success UI)
  let advancingToNextLevel = false;

  // -- File Changes Functions ----------------------------------------------------
  async function fetchFileChanges() {
    if (!dbContainerId) return;
    
    loadingFileChanges = true;
    try {
      const response = await fetch(`/api/docker/container/${dbContainerId}/file-changes?containerId=${dbContainerId}&summary=true`);
      const data = await response.json();
      if (data.success && data.data) {
        fileChanges = data.data;
      }
    } catch (error) {
      console.error('Error fetching file changes:', error);
    } finally {
      loadingFileChanges = false;
    }
  }

  // -- Public API ---------------------------------------------------------------
  export function open() {
    submitError = '';
    submitStep = 0;
    submittedNextLevel = null;
    state = 'confirm';
    showModal = true;
    testResults = null;
    regressedTasks = [];
    aiScoring = { stars: 1, score: 50, feedback: '', improvements: '', nextTime: '', loading: false, done: false };
    
    // Fetch file changes when modal opens
    fetchFileChanges();
  }

  function close() {
    if (state === 'loading') return;
    showModal = false;
    state = 'confirm';
  }

  function openCancelConfirmation() {
    showCancelConfirmModal = true;
  }

  function dismissCancelConfirmation() {
    showCancelConfirmModal = false;
  }

  async function confirmCancelSubmission() {
    showCancelConfirmModal = false;
    cancelingSubmit = true;
    isSubmitFlowCanceled = true;
    submitAbortController?.abort();
    submitAbortController = null;

    // Best effort: stop test process in container when canceling during test step.
    if (state === 'testing') {
      try {
        await fetch(`/api/docker/container/${containerId}/tests/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.warn('[SUBMIT SPRINT] Failed to cancel running tests:', error);
      }
    }

    cancelingSubmit = false;
    showModal = false;
    state = 'confirm';
    submitStep = 0;
    submittedNextLevel = null;
    submitError = '';
  }

  function throwIfSubmissionCanceled() {
    if (isSubmitFlowCanceled) {
      throw new DOMException('Submission canceled by user', 'AbortError');
    }
  }

  // -- Submit flow --------------------------------------------------------------
  async function handleConfirm() {
    if (!dbContainerId) {
      submitError = 'Could not resolve container record. Please refresh and try again.';
      state = 'error';
      return;
    }

    isSubmitFlowCanceled = false;
    cancelingSubmit = false;
    submitAbortController = new AbortController();
    const signal = submitAbortController.signal;

    state = 'loading';
    startSubmitStep(0);
    submitError = '';
    testResults = null;

    try {
      throwIfSubmissionCanceled();
      // Step 0 - Run tests to validate user work
      
      // Always fetch ALL files from the container for complete AI analysis
      // Start with any already-provided file contents (e.g. currently open file)
      let filesToCheck = existingFiles;
      let contentsToCheck: Record<string, string> = { ...fileContents };
      
      if (containerId) {
        try {
          console.log('AI SCORING: Fetching file list from container...');
          const listRes = await fetch(`/api/docker/container/${containerId}/files/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal,
            body: JSON.stringify({})
          });

          const listData: { success: boolean; data: Array<{ filePath: string }> } = await listRes.json();
          if (listData.success) {
            const unfilteredFilesToCheck = listData.data.map((data) => data.filePath) || [];
            filesToCheck = unfilteredFilesToCheck.filter((value, index) => unfilteredFilesToCheck.indexOf(value) === index)
            console.log('AI SCORING: Total files in workspace:', filesToCheck.length);
            
            // Read ALL files from the workspace
            let filesRead = 0;
            let filesFailed = 0;
            for (const file of filesToCheck) {
              throwIfSubmissionCanceled();
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
                  signal,
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
      
      // Run grouped level tests (Submit Sprint validation)
      console.log('[SUBMIT SPRINT] Running grouped level tests for level:', level);
      state = 'testing';
      throwIfSubmissionCanceled();
      
      const testRes = await fetch(`/api/docker/container/${containerId}/tests/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          command: `test:tasks:l${level}`,
          level,
          taskIds: tasks.map((task) => task.id),
          type: 'level'
        })
      });
      
      const testData = await testRes.json();
      console.log('[SUBMIT SPRINT] Test results:', testData);
      
      testResults = {
        passed: testData.passed,
        failedTasks: testData.taskResults?.filter((t: { passed: boolean }) => !t.passed).map((t: { taskId: string; taskName: string; errors: string[] }) => ({
          taskId: t.taskId,
          taskText: t.taskName,
          errors: t.errors
        })) || [],
        summary: testData.summary || { total: 0, passed: 0, failed: 0 }
      };
      
      // If tests failed, show error with details
      if (!testData.passed) {
        state = 'error';
        const failedCount = testResults.failedTasks.length;
        
        // Check for regressions - tasks that were marked as done but now fail
        const completedTaskIds = new Set(tasks.filter(t => t.isCompleted).map(t => t.id));
        regressedTasks = testData.taskResults
          ?.filter((t: { passed: boolean; taskId: string }) => !t.passed && completedTaskIds.has(t.taskId))
          .map((t: { taskId: string; taskName: string }) => ({ taskId: t.taskId, taskName: t.taskName })) || [];
        
        const hasRegressions = regressedTasks.length > 0;
        
        // Build detailed error message
        let errorMsg = '';
        
        if (hasRegressions) {
          // Special message for regression case - tasks that were done but now fail
          errorMsg = `⚠️ Previously Completed Tasks Are Now Failing\n\n`;
          errorMsg += `${regressedTasks.length} task(s) that were marked as completed have started failing due to recent changes.\n\n`;
          errorMsg += `Regressed Tasks:\n`;
          for (const task of regressedTasks) {
            errorMsg += `   • ${task.taskName}\n`;
          }
          errorMsg += `\n💡 Tip: Review your recent changes or click "Fix Issues" to continue working on these tasks.\n\n`;
        } else {
          // Standard message for tasks that were never completed
          errorMsg = `Tests are not passed yet, pass the test first before moving to the next level.\n\n`;
          errorMsg += `❌ ${failedCount} task(s) did not pass validation.\n\n`;
        }
        
        if (testData.taskResults && testData.taskResults.length > 0) {
          // Only show failed task details if not already shown in regression section
          if (!hasRegressions) {
            for (const task of testData.taskResults.filter((t: { passed: boolean }) => !t.passed)) {
              errorMsg += `❌ ${task.taskName}\n`;
              if (task.errors && task.errors.length > 0) {
                for (const err of task.errors) {
                  errorMsg += `   • ${err}\n`;
                }
              }
              errorMsg += '\n';
            }
          }
        }
        
        submitError = errorMsg;
        console.log('[SUBMIT SPRINT] Tests failed:', submitError);
        return;
      }
      
      console.log('[SUBMIT SPRINT] All tests passed! Proceeding with submission...');

      state = 'loading';
      await advanceSubmitStep(1);

      // AI Scoring - evaluate the user's code including test results
      aiScoring.loading = true;
      console.log('AI SCORING: Starting AI scoring...');
      console.log('AI SCORING: Files available for AI:', Object.keys(contentsToCheck).length);
      // console.log('AI SCORING: Test results to include:', JSON.stringify(testData));
      try {
        throwIfSubmissionCanceled();
        // Get completed task texts for the scoring
        const completedTaskTexts = tasks.filter(t => t.isCompleted).map(t => t.taskName);
        await fetch(`/api/docker/container/${containerId}/archive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
        }).then(res => res.json()).then(() => {
          console.log('Container has been Archived');
        }).catch(e => {
          console.warn('err', e);
        });
        // Call AI scoring endpoint with test results
        const scoreRes = await fetch('/api/ai/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
          body: JSON.stringify({
            containerId: containerId,
            level,
            completedTasks: completedTaskTexts,
            fileContents: contentsToCheck,
            // testResults: testData  // Pass test results to AI
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
      const completedTasks = tasks.filter(t => t.isCompleted);
      
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
      let nextLevelFromSubmit: number | null = null;
      
      for (let i = 0; i < completedTasks.length; i++) {
        throwIfSubmissionCanceled();
        const task = completedTasks[i];
        // Only pass advanceLevel: true for the last task (when all tasks will be complete)
        const isLastTask = i === completedTasks.length - 1;
        const submitRes = await fetch(`/api/docker/container/${dbContainerId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
          body: JSON.stringify({ taskId: task.taskName, advanceLevel: isLastTask })
        });
        const submitData = await submitRes.json();
        
        if (!submitRes.ok) {
          throw new Error(submitData.message ?? `Failed to submit task: ${task.taskName}`);
        }
        
        // Collect rewards (last one will have the full reward)
        submitRewards = submitData.rewards;
        
        // Check if all levels are now complete
        allLevelsComplete = submitData.allLevelsComplete ?? false;
        nextLevelFromSubmit = submitData.nextLevel ?? null;
        
        // If all levels complete, stop submitting more tasks
        if (allLevelsComplete) {
          break;
        }
      }

      // Step 2 - No need to call archive endpoint separately!
      // The submit endpoint already marks the container as archived in the database
      // when allLevelsComplete is true (see submit endpoint lines 137-145)
      // Calling archive again would result in "already archived" error

      await advanceSubmitStep(2);

      // clear the logs for the next level
      await fetch(`/api/docker/container/${containerId}/clear-logs`, {
        method: "DELETE",
        signal
      });

      // Determine what to do next based on level completion
      const advanceToNextLevel = allLevelsComplete === false;
      advancingToNextLevel = advanceToNextLevel;
      submittedNextLevel = nextLevelFromSubmit;

      await ensureCurrentSubmitStepIsVisible();
      
      state = 'success';
    } catch (err) {
      if ((err instanceof DOMException && err.name === 'AbortError') || isSubmitFlowCanceled) {
        state = 'confirm';
        submitError = '';
        return;
      }
      submitError = err instanceof Error ? err.message : String(err);
      state = 'error';
    } finally {
      submitAbortController = null;
      cancelingSubmit = false;
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
    dispatch('submitted', {
      ...submitRewards,
      advanceToNextLevel: advancingToNextLevel,
      nextLevel: submittedNextLevel,
    });
  }

  // -- Derived props fed into ConfirmationModal ----------------------------------
  $: modalIcon     = state === 'error' ? '⚠' : state === 'loading' ? '' : '⟨/⟩';
  $: iconVariant   = (state === 'error' ? 'danger' : state === 'testing' ? 'warning' : 'accent') as 'accent' | 'danger' | 'warning' | 'success';
  $: modalTitle    = state === 'error'
    ? (regressedTasks.length > 0 ? 'Tasks Regressed' : 'Tests Failed')
    : state === 'loading' ? '' : state === 'testing' ? 'Running Tests…' : 'Submit Sprint?';
  $: modalSubtitle = state === 'confirm'
    ? 'Are you sure you want to submit your completed tasks? This will validate your work and award XP and coins if all tests pass.'
    : '';
  $: confirmLabel  = state === 'error'
    ? (regressedTasks.length > 0 ? 'Fix Issues' : 'Retry')
    : 'Submit & Continue';
  $: cancelLabel   = state === 'error' ? 'Close'  : state === 'testing' ? 'Cancel' : 'Cancel';
  $: variant       = (state === 'error' ? 'danger' : state === 'testing' ? 'warning' : 'primary') as 'primary' | 'danger' | 'warning' | 'success';
  $: modalError    = state === 'error' ? submitError : '';
  $: hideActions   = state === 'loading' || state === 'testing';
  $: hideHeader    = state === 'loading' || state === 'testing';
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
  {hideHeader}
  {showSuccess}
  error={modalError}
  on:confirm={handleConfirm}
  on:cancel={close}
>
  <!-- Default slot: body changes per state -->
  {#if state === 'confirm'}
    <SubmitSprintConfirmContent
      {tasks}
      {completedCount}
      {loadingFileChanges}
      {fileChanges}
      rewardXp={levelXpReward}
      rewardCoins={levelCoinReward}
    />

  {:else if state === 'loading' || state === 'testing'}
    <SubmitSprintProgressContent
      state={state as 'loading' | 'testing'}
      {activeSubmitStepIndex}
      {activeSubmitStep}
      submitSteps={SUBMIT_STEPS}
      {loadingTitle}
      {loadingSubtitle}
      {cancelingSubmit}
      on:cancel={openCancelConfirmation}
    />
  {/if}

  <!-- Success slot -->
  <svelte:fragment slot="success">
    <SubmitSprintSuccessContent
      {advancingToNextLevel}
      {aiScoring}
      {submitRewards}
      on:done={handleDone}
      on:continue={handleContinueWorking}
    />
  </svelte:fragment>
</ConfirmationModal>

<ConfirmationModal
  bind:open={showCancelConfirmModal}
  icon="⚠"
  iconVariant="warning"
  title="Cancel Submission?"
  subtitle="This will stop test/submit progress for this run"
  description="Are you sure you want to cancel this submission process?"
  confirmLabel="Yes, Cancel"
  cancelLabel="No, Continue"
  variant="warning"
  isLoading={cancelingSubmit}
  loadingLabel="Canceling…"
  on:confirm={confirmCancelSubmission}
  on:cancel={dismissCancelConfirmation}
/>
