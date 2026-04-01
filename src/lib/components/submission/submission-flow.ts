import { writable, derived, get } from 'svelte/store';
import { goto } from '$app/navigation';
import { createEventDispatcher } from 'svelte';
import {
  SUBMIT_STEPS,
  MIN_SUBMIT_STEP_VISIBLE_MS,
  DEFAULT_AI_SCORING,
  FALLBACK_AI_SCORING,
  SKIP_PATHS,
  SKIP_EXTENSIONS,
} from '$lib/constants/submissionConstants';
import type {
  SubmitState,
  SubmitRewards,
  FileChangeSummary,
  TestResult,
  RegressedTask,
  AIScoring,
  SubmitFlowResult,
} from '$types/Submission';

import type { ITask } from '$lib/types';

interface SubmitFlowOptions {
  dbContainerId: string | null;
  containerId: string;
  tasks: ITask[];
  level: number;
  fileContents: Record<string, string>;
  existingFiles: string[];
  onComplete: (result: SubmitFlowResult & { nextLevel: number | null }) => void;
}

export function createSubmitFlow(options: SubmitFlowOptions) {
  const { dbContainerId, containerId, tasks, level, fileContents, existingFiles, onComplete } = options;

  // Core state
  const state = writable<SubmitState>('confirm');
  const showModal = writable(true);
  const showCancelConfirm = writable(false);
  const submitStep = writable(0);
  const submitError = writable('');
  const cancelingSubmit = writable(false);
  const isCanceled = writable(false);
  
  // Data state
  const fileChanges = writable<FileChangeSummary | null>(null);
  const loadingFileChanges = writable(false);
  const testResults = writable<TestResult | null>(null);
  const regressedTasks = writable<RegressedTask[]>([]);
  const aiScoring = writable<AIScoring>({ ...DEFAULT_AI_SCORING });
  const rewards = writable<SubmitRewards>({ xp: 0, coins: 0 });
  const nextLevel = writable<number | null>(null);
  const advancingToNextLevel = writable(false);

  // Abort controller for cancellation
  let abortController: AbortController | null = null;
  let submitStepStartedAt = 0;

  // Derived
  const completedCount = derived(
    [state], 
    () => tasks.filter(t => t.isCompleted).length
  );

  const totalTasks = tasks.length;

  const activeStep = derived([submitStep], ([$step]) => ({
    index: Math.min(Math.max($step, 0), SUBMIT_STEPS.length - 1),
    data: SUBMIT_STEPS[Math.min(Math.max($step, 0), SUBMIT_STEPS.length - 1)],
  }));

  const canSubmit = derived(
    [state], 
    ([$state]) => $state !== 'loading' && $state !== 'testing'
  );

  // Utils
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  function throwIfCanceled() {
    if (get(isCanceled)) {
      throw new DOMException('Submission canceled by user', 'AbortError');
    }
  }

  async function ensureStepVisible() {
    const elapsed = Date.now() - submitStepStartedAt;
    const remaining = MIN_SUBMIT_STEP_VISIBLE_MS - elapsed;
    if (remaining > 0) await sleep(remaining);
    throwIfCanceled();
  }

  function startStep(step: number) {
    submitStep.set(Math.min(Math.max(step, 0), SUBMIT_STEPS.length - 1));
    submitStepStartedAt = Date.now();
  }

  async function advanceStep(step: number) {
    await ensureStepVisible();
    startStep(step);
  }

  // API Calls
  async function fetchFileChanges() {
    if (!dbContainerId) return;
    loadingFileChanges.set(true);
    
    try {
      const res = await fetch(
        `/api/docker/container/${dbContainerId}/file-changes?containerId=${dbContainerId}&summary=true`
      );
      const data = await res.json();
      if (data.success && data.data) {
        fileChanges.set(data.data);
      }
    } catch (e) {
      console.error('Error fetching file changes:', e);
    } finally {
      loadingFileChanges.set(false);
    }
  }

  async function fetchAllFiles(signal: AbortSignal): Promise<Record<string, string>> {
    const contents = { ...fileContents };
    
    if (!containerId) return contents;

    try {
      const listRes = await fetch(
        `/api/docker/container/${containerId}/files/logs`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
          body: JSON.stringify({}),
        }
      );

      const listData: { success: boolean; data: Array<{ filePath: string }> } = 
        await listRes.json();

      if (!listData.success) {
        console.warn('AI SCORING: File list fetch failed:', listData);
        return contents;
      }

      const files = [...new Set(listData.data.map(d => d.filePath))];
      let read = 0, failed = 0;

      for (const file of files) {
        throwIfCanceled();
        
        if (contents[file]) continue;
        if (SKIP_PATHS.some(p => file.includes(p))) continue;
        if (SKIP_EXTENSIONS.some(ext => file.endsWith(ext))) continue;

        try {
          const readRes = await fetch(
            `/api/docker/container/${containerId}/files/read`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal,
              body: JSON.stringify({ path: `/workspace/${file}` }),
            }
          );
          const readData = await readRes.json();
          
          if (readData.success) {
            contents[file] = readData.content;
            read++;
          } else {
            failed++;
          }
        } catch (e) {
          failed++;
        }
      }

      console.log(`AI SCORING: Files read: ${read} | Failed: ${failed}`);
      return contents;
    } catch (e) {
      console.warn('AI SCORING: Could not fetch file list:', e);
      return contents;
    }
  }

  async function runTests(signal: AbortSignal): Promise<TestResult> {
    const res = await fetch(`/api/docker/container/${containerId}/tests/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        command: `test:tasks:l${level}`,
        level,
        taskIds: tasks.map(t => t.id),
        type: 'level',
      }),
    });

    const data = await res.json();

    const completedIds = new Set(tasks.filter(t => t.isCompleted).map(t => t.id));
    
    return {
      passed: data.passed,
      failedTasks: data.taskResults
        ?.filter((t: { passed: boolean }) => !t.passed)
        .map((t: { taskId: string; taskName: string; errors: string[] }) => ({
          taskId: t.taskId,
          taskText: t.taskName,
          errors: t.errors,
        })) || [],
      summary: data.summary || { total: 0, passed: 0, failed: 0 },
      regressed: data.taskResults
        ?.filter((t: { passed: boolean; taskId: string }) => 
          !t.passed && completedIds.has(t.taskId)
        )
        .map((t: { taskId: string; taskName: string }) => ({
          taskId: t.taskId,
          taskName: t.taskName,
        })) || [],
    };
  }

  async function scoreWithAI(
    contents: Record<string, string>, 
    signal: AbortSignal
  ): Promise<AIScoring> {
    const completedTexts = tasks.filter(t => t.isCompleted).map(t => t.taskName);
    
    try {
      const res = await fetch('/api/ai/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          containerId,
          level,
          completedTasks: completedTexts,
          fileContents: contents,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        return {
          stars: data.stars || 1,
          score: data.score || 50,
          feedback: data.feedback || '',
          improvements: data.improvements || '',
          nextTime: data.nextTime || '',
          loading: false,
          done: true,
        };
      }
      return { ...FALLBACK_AI_SCORING };
    } catch (e) {
      console.warn('AI Scoring failed:', e);
      return { ...FALLBACK_AI_SCORING };
    }
  }

  async function submitTasks(signal: AbortSignal): Promise<SubmitFlowResult> {
    const completed = tasks.filter(t => t.isCompleted);
    
    if (completed.length < tasks.length) {
      throw new Error(
        `You must complete all ${tasks.length} tasks before submitting.\n` +
        `Currently completed: ${completed.length}/${tasks.length}\n` +
        `Remaining: ${tasks.length - completed.length} task(s)`
      );
    }

    let allLevelsComplete = false;
    let nextLevelNum: number | null = null;
    const totalRewards = { xp: 0, coins: 0 };

    for (let i = 0; i < completed.length; i++) {
      throwIfCanceled();
      const isLast = i === completed.length - 1;
      
      const res = await fetch(`/api/docker/container/${dbContainerId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          taskId: completed[i].taskName,
          advanceLevel: isLast,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? `Failed to submit: ${completed[i].taskName}`);
      }

      totalRewards.xp = data.rewards?.xp ?? 0;
      totalRewards.coins = data.rewards?.coins ?? 0;
      allLevelsComplete = data.allLevelsComplete ?? false;
      nextLevelNum = data.nextLevel ?? null;

      if (allLevelsComplete) break;
    }

    return {
      rewards: totalRewards,
      advanceToNextLevel: !allLevelsComplete,
      nextLevel: nextLevelNum,
      allLevelsComplete,
    };
  }

  async function archiveContainer(signal: AbortSignal) {
    if (!dbContainerId) return;
    
    try {
      const res = await fetch(`/api/docker/container/${dbContainerId}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
      });

      if (!res.ok) {
        console.error('[SUBMIT SPRINT] Archive failed:', await res.text());
      } else {
        const data = await res.json();
        console.log('[SUBMIT SPRINT] Archived:', data.volumeName);
      }
    } catch (e) {
      console.error('[SUBMIT SPRINT] Archive error:', e);
    }
  }

  async function clearLogs(signal: AbortSignal) {
    try {
      await fetch(`/api/docker/container/${containerId}/clear-logs`, {
        method: 'DELETE',
        signal,
      });
    } catch (e) {
      console.warn('Failed to clear logs:', e);
    }
  }

  // Main flow
  async function start() {
    if (!dbContainerId) {
      submitError.set('Could not resolve container record. Please refresh and try again.');
      state.set('error');
      return;
    }

    isCanceled.set(false);
    cancelingSubmit.set(false);
    abortController = new AbortController();
    const signal = abortController.signal;

    state.set('loading');
    startStep(0);
    submitError.set('');
    testResults.set(null);
    regressedTasks.set([]);
    aiScoring.set({ ...DEFAULT_AI_SCORING, loading: true });

    try {
      throwIfCanceled();
      
      // Step 0: Gather files
      const contents = await fetchAllFiles(signal);
      
      // Step 1: Run tests
      state.set('testing');
      throwIfCanceled();
      const results = await runTests(signal);
      testResults.set(results);

      if (!results.passed) {
        regressedTasks.set(results.regressed);
        state.set('error');
        buildErrorMessage(results);
        return;
      }

      // Step 2: AI Scoring
      state.set('loading');
      await advanceStep(1);
      const scoring = await scoreWithAI(contents, signal);
      aiScoring.set(scoring);

      // Step 3: Submit tasks
      const result = await submitTasks(signal);
      rewards.set(result.rewards);
      nextLevel.set(result.nextLevel);
      advancingToNextLevel.set(result.advanceToNextLevel);

      // Step 4: Archive if complete
      if (result.allLevelsComplete) {
        await archiveContainer(signal);
      }

      await advanceStep(2);
      await clearLogs(signal);
      await ensureStepVisible();

      state.set('success');
    } catch (err) {
      if ((err instanceof DOMException && err.name === 'AbortError') || get(isCanceled)) {
        state.set('confirm');
        submitError.set('');
        return;
      }
      submitError.set(err instanceof Error ? err.message : String(err));
      state.set('error');
    } finally {
      abortController = null;
      cancelingSubmit.set(false);
    }
  }

  function buildErrorMessage(results: TestResult) {
    const hasRegressions = results.regressed.length > 0;
    let msg = '';

    if (hasRegressions) {
      msg = `⚠️ Previously Completed Tasks Are Now Failing\n\n`;
      msg += `${results.regressed.length} task(s) that were marked as completed have started failing.\n\n`;
      msg += `Regressed Tasks:\n`;
      for (const t of results.regressed) {
        msg += `   • ${t.taskName}\n`;
      }
      msg += `\n💡 Tip: Review your recent changes or click "Fix Issues" to continue working.\n`;
    } else {
      msg = `Tests are not passed yet, pass the test first before moving to the next level.\n\n`;
      msg += `❌ ${results.failedTasks.length} task(s) did not pass validation.\n\n`;
      
      for (const task of results.failedTasks) {
        msg += `❌ ${task.taskText}\n`;
        for (const err of task.errors) {
          msg += `   • ${err}\n`;
        }
        msg += '\n';
      }
    }

    submitError.set(msg);
  }

  // Actions
  function cancel() {
    if (get(state) === 'loading' || get(state) === 'testing') return;
    showModal.set(false);
    state.set('confirm');
  }

  function openCancelConfirm() {
    showCancelConfirm.set(true);
  }

  function dismissCancelConfirm() {
    showCancelConfirm.set(false);
  }

  async function confirmCancel() {
    showCancelConfirm.set(false);
    cancelingSubmit.set(true);
    isCanceled.set(true);
    abortController?.abort();

    if (get(state) === 'testing') {
      try {
        await fetch(`/api/docker/container/${containerId}/tests/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        console.warn('Failed to cancel tests:', e);
      }
    }

    cancelingSubmit.set(false);
    showModal.set(false);
    state.set('confirm');
    submitStep.set(0);
    submitError.set('');
  }

  function handleDone() {
    goto('/dashboard');
  }

  function handleContinue() {
    showModal.set(false);
    state.set('confirm');
    onComplete({
      rewards: get(rewards),
      advanceToNextLevel: get(advancingToNextLevel),
      nextLevel: get(nextLevel),
      allLevelsComplete: get(nextLevel) === null,
    });
  }

  function reset() {
    state.set('confirm');
    submitStep.set(0);
    submitError.set('');
    nextLevel.set(null);
    isCanceled.set(false);
    fetchFileChanges();
  }

  return {
    // State stores
    state,
    showModal,
    showCancelConfirm,
    submitStep,
    submitError,
    cancelingSubmit,
    fileChanges,
    loadingFileChanges,
    testResults,
    regressedTasks,
    aiScoring,
    rewards,
    nextLevel,
    advancingToNextLevel,
    completedCount,
    totalTasks,
    activeStep,
    canSubmit,
    
    // Actions
    start,
    cancel,
    openCancelConfirm,
    dismissCancelConfirm,
    confirmCancel,
    handleDone,
    handleContinue,
    reset,
    fetchFileChanges,
  };
}