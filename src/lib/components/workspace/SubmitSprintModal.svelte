<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';
  import type { Task } from '$lib/interface/LevelConfig';

  // ── Props ──────────────────────────────────────────────────────────────────

  /** Docker container ID from the URL route params. */
  export let containerId: string;
  /** Database container record ID (needed for submit + archive API calls). */
  export let dbContainerId: string | null;
  /** The list of sprint tasks to display in the summary. */
  export let tasks: Task[];

  // ── Internal state ─────────────────────────────────────────────────────────

  let showModal = false;
  let isSubmitting = false;
  let submitError = '';
  let submitSuccess = false;
  let submitRewards = { xp: 0, coins: 0 };

  // ── Events ─────────────────────────────────────────────────────────────────

  const dispatch = createEventDispatcher<{
    /** Fired after the sprint has been submitted and archived successfully. */
    submitted: { xp: number; coins: number };
  }>();

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Open the confirmation modal. Call this from the parent. */
  export function open() {
    submitError = '';
    submitSuccess = false;
    showModal = true;
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleConfirmSubmit() {
    if (!dbContainerId) {
      console.error('[SubmitSprintModal] dbContainerId is null — URL containerId:', containerId);
      submitError = 'Could not resolve container record. Please refresh and try again.';
      return;
    }

    console.log('[SubmitSprintModal] dbContainerId:', dbContainerId);
    isSubmitting = true;
    submitError = '';

    try {
      // Step 1: Mark container as completed
      console.log('[SubmitSprintModal] Calling submit endpoint...');
      const submitRes = await fetch(
        `/api/docker/container/${dbContainerId}/submit`,
        { method: 'POST' }
      );
      const submitData = await submitRes.json();
      console.log('[SubmitSprintModal] Submit response:', submitRes.status, submitData);

      if (!submitRes.ok) {
        throw new Error(submitData.message ?? 'Failed to submit sprint.');
      }

      submitRewards = submitData.rewards;

      // Step 2: Archive workspace to Docker volume + remove container
      console.log('[SubmitSprintModal] Calling archive endpoint...');
      const archiveRes = await fetch(
        `/api/docker/container/${dbContainerId}/archive`,
        { method: 'POST' }
      );
      const archiveData = await archiveRes.json();
      console.log('[SubmitSprintModal] Archive response:', archiveRes.status, archiveData);

      if (!archiveRes.ok) {
        throw new Error(archiveData.message ?? 'Failed to archive container.');
      }

      // Both calls succeeded — show the success state (user clicks OK to redirect)
      submitSuccess = true;
      dispatch('submitted', submitRewards);
    } catch (err) {
      console.error('[SubmitSprintModal] Error:', err);
      submitError = err instanceof Error ? err.message : String(err);
    } finally {
      isSubmitting = false;
    }
  }

  function handleSuccessConfirm() {
    goto('/dashboard');
  }
</script>

<ConfirmModal
  bind:open={showModal}
  title="Submit Sprint?"
  description="This will mark your sprint as <strong class='text-white'>complete</strong>, save your workspace to a Docker volume, and remove the running container. You can restore it later from the dashboard."
  confirmLabel="Confirm & Archive"
  loadingLabel="Archiving…"
  variant="primary"
  isLoading={isSubmitting}
  error={submitError}
  showSuccess={submitSuccess}
  on:confirm={handleConfirmSubmit}
>
  <!-- Body: task completion summary -->
  <div class="bg-[#0a0e1a] rounded-lg p-3 mt-4 text-sm">
    <p class="text-[#d0d7dd]/50 mb-2">Tasks completed</p>
    <ul class="space-y-1">
      {#each tasks as task}
        <li class="flex items-center gap-2">
          <span class={task.completed ? 'text-green-400' : 'text-[#d0d7dd]/30'}>
            {task.completed ? '✓' : '○'}
          </span>
          <span class={task.completed ? 'text-[#d0d7dd]' : 'text-[#d0d7dd]/40 line-through'}>
            {task.text}
          </span>
        </li>
      {/each}
    </ul>
    <p class="text-xs text-[#d0d7dd]/40 mt-2">
      {tasks.filter(t => t.completed).length} / {tasks.length} tasks done
    </p>
  </div>

  <!-- Success state shown after archive completes -->
  <svelte:fragment slot="success">
    <div class="text-center py-4">
      <p class="text-4xl mb-3">🎉</p>
      <h2 class="text-xl font-bold text-white mb-1">Sprint Submitted!</h2>
      <p class="text-sm text-[#d0d7dd]/60 mb-4">
        Your workspace has been archived successfully.
      </p>

      <div class="flex justify-center gap-6 text-sm mb-6">
        <span class="text-yellow-400 font-semibold">
          +{submitRewards.xp} XP ⚡
        </span>
        <span class="text-yellow-300 font-semibold">
          +{submitRewards.coins} Coins 🪙
        </span>
      </div>

      <button
        on:click={handleSuccessConfirm}
        class="px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg transition"
      >
        OK
      </button>
    </div>
  </svelte:fragment>
</ConfirmModal>
