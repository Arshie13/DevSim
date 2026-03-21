<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  import type { ITask } from '$lib/types';
  import { getLevelConfig } from '$lib/tests/levels';
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
      const response = await fetch(`/api/docker/container/${dbContainerId}/file-changes?id=${dbContainerId}&summary=true`);
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
      // Step 0 - Run tests to validate user work first
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
        
        // Build detailed error message
        let errorMsg = `Tests are not passed yet, pass the test first before moving to the next level.\n\n`;
        errorMsg += `❌ ${failedCount} task(s) did not pass validation.\n\n`;
        
        if (testData.taskResults && testData.taskResults.length > 0) {
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
        
        submitError = errorMsg;
        console.log('[SUBMIT SPRINT] Tests failed:', submitError);
        return;
      }
      
      console.log('[SUBMIT SPRINT] All tests passed! Proceeding with submission...');

      // Check if ALL tasks are completed BEFORE running AI scoring
      const allCompletedTasks = tasks.filter(t => t.isCompleted);
      if (allCompletedTasks.length < tasks.length) {
        const remainingCount = tasks.length - allCompletedTasks.length;
        // Find which tasks are NOT completed
        const incompleteTasks = tasks
          .filter(t => !t.isCompleted)
          .map(t => `❌ ${t.taskName}`)
          .join('\n');
        submitError = `You must complete all ${tasks.length} tasks before submitting.\n\n` +
          `Currently completed: ${allCompletedTasks.length}/${tasks.length}\n` +
          `Remaining: ${remainingCount} task(s)\n\n` +
          `Incomplete tasks:\n${incompleteTasks}`;
        state = 'error';
        return;
      }

      // Get file contents for AI scoring - only fetch files that were tested
      let contentsToCheck: Record<string, string> = { ...fileContents };
      
      // Get test files for this level - these tell us what to check
      // Try both with and without project prefix (LIBRARY_MANAGEMENT/)
      const testFilePaths = [
        `tests/client/level-${level}/`,
        `tests/server/level-${level}/`,
        `LIBRARY_MANAGEMENT/tests/client/level-${level}/`,
        `LIBRARY_MANAGEMENT/tests/server/level-${level}/`,
      ];
      
      // Track files mentioned in test files
      const filesReferencedInTests = new Set<string>();
      
      // Fetch test files to understand what tests check
      for (const testPath of testFilePaths) {
        throwIfSubmissionCanceled();
        try {
          const listRes = await fetch(`/api/docker/container/${containerId}/files/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal,
            body: JSON.stringify({ path: `/workspace/${testPath}` })
          });
          const listData = await listRes.json();
          if (listData.success && listData.files) {
            for (const testFile of listData.files) {
              if (testFile.endsWith('.test.ts') || testFile.endsWith('.test.tsx')) {
                try {
                  const readRes = await fetch(`/api/docker/container/${containerId}/files/read`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal,
                    body: JSON.stringify({ path: `/workspace/${testFile}` })
                  });
                  const readData = await readRes.json();
                  if (readData.success) {
                    contentsToCheck[`TEST_FILE: ${testFile}`] = readData.content;
                    console.log('AI SCORING: ✓ Read test file:', testFile);
                    
                    // Extract file paths from test imports
                    const importMatches = readData.content.match(/from\s+['"]([^'"]+)['"]/g);
                    if (importMatches) {
                      for (const match of importMatches) {
                        const pathMatch = match.match(/from\s+['"]([^'"]+)['"]/);
                        if (pathMatch && !pathMatch[1].startsWith('.') && !pathMatch[1].startsWith('/')) {
                          // External import - skip
                        } else if (pathMatch) {
                          // Convert relative path to absolute
                          const baseDir = testFile.substring(0, testFile.lastIndexOf('/'));
                          let filePath = pathMatch[1];
                          if (filePath.startsWith('./') || filePath.startsWith('../')) {
                            // Resolve relative path
                            const parts = baseDir.split('/');
                            const relParts = filePath.split('/');
                            for (const part of relParts) {
                              if (part === '..') parts.pop();
                              else if (part !== '.') parts.push(part);
                            }
                            filePath = parts.join('/');
                          }
                          // Add common extensions
                          if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js') && !filePath.endsWith('.jsx')) {
                            filePath = filePath + '.ts';
                          }
                          filesReferencedInTests.add(filePath);
                        }
                      }
                    }
                  }
                } catch (e) { 
                  console.log('AI SCORING: Error reading test file:', testFile, e);
                }
              }
            }
          }
        } catch (e) { 
          console.log('AI SCORING: Error listing test path:', testPath, e);
        }
      }
      console.log('AI SCORING: Found', Object.keys(contentsToCheck).filter(k => k.startsWith('TEST_FILE:')).length, 'test files');
      console.log('AI SCORING: Files referenced in tests:', Array.from(filesReferencedInTests));
      
      // Fetch ONLY files that are referenced in test files
      if (filesReferencedInTests.size > 0 && containerId) {
        console.log('AI SCORING: Fetching only files referenced in tests...');
        for (const fileRef of filesReferencedInTests) {
          if (Object.keys(contentsToCheck).length >= 10) break;
          throwIfSubmissionCanceled();
          
          // Try different path variations
          const pathVariations = [
            fileRef,
            `LIBRARY_MANAGEMENT/client/src/${fileRef}`,
            `LIBRARY_MANAGEMENT/server/src/${fileRef}`,
            `client/src/${fileRef}`,
            `server/src/${fileRef}`,
          ];
          
          for (const filePath of pathVariations) {
            try {
              const readRes = await fetch(`/api/docker/container/${containerId}/files/read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal,
                body: JSON.stringify({ path: `/workspace/${filePath}` })
              });
              const readData = await readRes.json();
              if (readData.success) {
                contentsToCheck[filePath] = readData.content;
                console.log('AI SCORING: ✓ Read test-referenced file:', filePath);
                break;
              }
            } catch (e) { /* try next variation */ }
          }
        }
      } else {
        console.log('AI SCORING: No files referenced in tests - not fetching source files');
      }
      
      console.log('AI SCORING: Total files for AI:', Object.keys(contentsToCheck).length);

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
        
        // Get file changes - what files the user modified
        let userFileChanges = '';
        if (fileChanges) {
          userFileChanges = `
=== USER'S FILE CHANGES ===
Created: ${fileChanges.created.join(', ') || 'none'}
Modified: ${fileChanges.modified.join(', ') || 'none'}
Renamed: ${fileChanges.renamed.map(r => `${r.from} → ${r.to}`).join(', ') || 'none'}
Total changes: ${fileChanges.totalChanges}
`;
        }
        // Format test results for AI scoring - transform to expected format
        const testResultsForAI = testResults ? {
          passed: testResults.passed,
          results: {
            summary: testResults.summary,
            results: testData.results || []
          },
          failedTasks: testResults.failedTasks || []
        } : null;
        
        // Get ALL tasks for this level (not just completed ones)
        const allTaskTexts = tasks.map(t => t.taskName);
        
        // Call AI scoring endpoint with test results and file changes
        console.log('AI SCORING: All tasks:', allTaskTexts);
        console.log('AI SCORING: Completed tasks:', completedTaskTexts);
        console.log('AI SCORING: File changes:', userFileChanges);
        console.log('AI SCORING: Sending test results to AI:', JSON.stringify(testResultsForAI)?.slice(0, 500));
        const scoreRes = await fetch('/api/ai/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
          body: JSON.stringify({
            containerId: containerId,
            level,
            tasks: allTaskTexts,  // ALL tasks in the level
            completedTasks: completedTaskTexts,  // Only completed tasks
            fileContents: contentsToCheck,
            fileChanges: userFileChanges,  // User's file changes
            testResults: testResultsForAI  // Pass test results to AI
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
      // Note: All tasks already verified completed before AI scoring
      const completedTasks = tasks.filter(t => t.isCompleted);
      
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
  $: modalTitle    = state === 'error' ? 'Tests Failed' : state === 'loading' ? '' : state === 'testing' ? 'Running Tests…' : 'Submit Sprint?';
  $: modalSubtitle = state === 'confirm'
    ? 'Are you sure you want to submit your completed tasks? This will validate your work and award XP and coins if all tests pass.'
    : '';
  $: confirmLabel  = state === 'error' ? 'Retry' : 'Submit & Continue';
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
