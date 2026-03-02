<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  import type { Task } from '$lib/interface/LevelConfig';
  import LoadingSteps from '$lib/components/ui/LoadingSteps.svelte';
  import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';

  // -- Props --------------------------------------------------------------------
  export let dbContainerId: string | null;
  export let tasks: Task[];

  // -- State --------------------------------------------------------------------
  type ModalState = 'confirm' | 'loading' | 'success' | 'error';
  let state: ModalState = 'confirm';
  let showModal = false;
  let submitStep = 0;
  let submitError = '';
  let submitRewards = { xp: 0, coins: 0 };

  const SUBMIT_STEPS = [
    { icon: '🏁', label: 'Recording completion…', detail: 'Marking sprint as complete & awarding rewards' },
    { icon: '📦', label: 'Archiving workspace…' },
  ];

  $: completedCount = tasks.filter(t => t.completed).length;

  // -- Events -------------------------------------------------------------------
  const dispatch = createEventDispatcher<{ submitted: { xp: number; coins: number } }>();

  // -- Public API ---------------------------------------------------------------
  export function open() {
    submitError = '';
    submitStep = 0;
    state = 'confirm';
    showModal = true;
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

    try {
      // Step 0 - mark completed
      const submitRes = await fetch(`/api/docker/container/${dbContainerId}/submit`, { method: 'POST' });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData.message ?? 'Failed to submit sprint.');
      submitRewards = submitData.rewards;

      // Step 1 - archive
      submitStep = 1;
      const archiveRes = await fetch(`/api/docker/container/${dbContainerId}/archive`, { method: 'POST' });
      const archiveData = await archiveRes.json();
      if (!archiveRes.ok) throw new Error(archiveData.message ?? 'Failed to archive container.');

      state = 'success';
      dispatch('submitted', submitRewards);
    } catch (err) {
      submitError = err instanceof Error ? err.message : String(err);
      state = 'error';
    }
  }

  function handleDone() {
    goto('/dashboard');
  }

  // -- Derived props fed into ConfirmationModal ----------------------------------
  $: modalIcon     = state === 'error' ? '⚠' : '⟨/⟩';
  $: iconVariant   = (state === 'error' ? 'danger' : 'accent') as 'accent' | 'danger' | 'warning' | 'success';
  $: modalTitle    = state === 'error' ? 'Something went wrong' : 'Submit Sprint?';
  $: modalSubtitle = state === 'confirm'
    ? 'Are you sure you want to submit this sprint? This will mark the sprint as complete, award you your rewards, and archive your workspace.'
    : '';
  $: confirmLabel  = state === 'error' ? 'Retry' : 'Confirm & Archive';
  $: cancelLabel   = state === 'error' ? 'Close'  : 'Cancel';
  $: variant       = (state === 'error' ? 'danger' : 'primary') as 'primary' | 'danger' | 'warning' | 'success';
  $: modalError    = state === 'error' ? submitError : '';
  $: hideActions   = state === 'loading';
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
    <div class="ss-task-box">
      <p class="ss-task-label">Sprint tasks</p>
      <ul class="ss-task-list">
        {#each tasks as task}
          <li class="ss-task-item" class:done={task.completed}>
            <span class="ss-check">{task.completed ? '✓' : '○'}</span>
            <span class="ss-text">{task.text}</span>
          </li>
        {/each}
      </ul>
      <p class="ss-task-count">{completedCount} / {tasks.length} completed</p>
    </div>

    <!-- Reward preview chips -->
    <div class="ss-reward-chips">
      <div class="ss-chip xp">⚡ XP incoming</div>
      <div class="ss-chip coin">🪙 Coins incoming</div>
    </div>

  {:else if state === 'loading'}
    <!-- LoadingSteps fills the body; action row is hidden via hideActions -->
    <LoadingSteps
      card={false}
      step={submitStep}
      steps={SUBMIT_STEPS}
      title="Archiving Sprint…"
      subtitle="Please keep this window open."
    />
  {/if}

  <!-- Success slot -->
  <svelte:fragment slot="success">
    <div class="ss-success">
      <div class="ss-burst" aria-hidden="true">🎉</div>
      <h2 class="ss-success-title">Sprint Complete!</h2>
      <p class="ss-success-sub">Your workspace has been archived successfully.</p>

      <div class="ss-rewards-row">
        <div class="ss-badge xp-badge">
          <span class="ss-badge-icon">⚡</span>
          <span class="ss-badge-value">+{submitRewards.xp}</span>
          <span class="ss-badge-unit">XP</span>
        </div>
        <div class="ss-badge coin-badge">
          <span class="ss-badge-icon">🪙</span>
          <span class="ss-badge-value">+{submitRewards.coins}</span>
          <span class="ss-badge-unit">Coins</span>
        </div>
      </div>

      <button class="ss-btn-done" on:click={handleDone}>Back to Dashboard</button>
    </div>
  </svelte:fragment>
</ConfirmationModal>

<style>
  /* Task box */
  .ss-task-box {
    background: var(--bg, #0a0e1a);
    border: 1px solid rgba(30, 42, 58, 0.9);
    border-radius: 4px;
    padding: 0.875rem 1rem;
    margin-bottom: 1rem;
  }
  .ss-task-label {
    font-family: var(--font-mono, 'Share Tech Mono', monospace);
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted, #8892a0);
    margin: 0 0 0.6rem;
  }
  .ss-task-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .ss-task-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-family: var(--font-mono, 'Share Tech Mono', monospace);
    font-size: 0.78rem;
    opacity: 0.35;
  }
  .ss-task-item.done { opacity: 1; }
  .ss-check { color: var(--success, #00e5a0); font-weight: 700; width: 1rem; text-align: center; }
  .ss-task-item:not(.done) .ss-check { color: var(--surface, #2d3446); }
  .ss-text { color: var(--text-primary, #d0d7dd); }
  .ss-task-item:not(.done) .ss-text { color: var(--text-muted, #8892a0); text-decoration: line-through; }
  .ss-task-count {
    margin: 0.6rem 0 0;
    font-family: var(--font-mono, 'Share Tech Mono', monospace);
    font-size: 0.65rem;
    color: var(--text-muted, #8892a0);
    text-align: right;
  }

  /* Reward chips */
  .ss-reward-chips {
    display: flex;
    gap: 0.6rem;
    margin-bottom: 0.25rem;
  }
  .ss-chip {
    flex: 1;
    text-align: center;
    padding: 0.45rem 0;
    border-radius: 4px;
    font-family: var(--font-mono, 'Share Tech Mono', monospace);
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    border: 1px solid transparent;
  }
  .ss-chip.xp   { background: rgba(15, 34, 16, 0.8);  border-color: rgba(22, 163, 74, 0.25);  color: #4ade80; }
  .ss-chip.coin { background: rgba(31, 21, 8, 0.8);   border-color: rgba(202, 138, 4, 0.25);  color: #fbbf24; }

  /* Success panel */
  .ss-success {
    text-align: center;
    padding: 0.5rem 0;
  }
  .ss-burst {
    font-size: 3rem;
    animation: ss-burst-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes ss-burst-pop {
    from { transform: scale(0.3); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  .ss-success-title {
    margin: 0.6rem 0 0.3rem;
    font-family: var(--font-head, 'Orbitron', sans-serif);
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--text-primary, #d0d7dd);
  }
  .ss-success-sub {
    font-family: var(--font-mono, 'Share Tech Mono', monospace);
    font-size: 0.75rem;
    color: var(--text-muted, #8892a0);
    margin: 0 0 1.5rem;
  }
  .ss-rewards-row {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1.75rem;
  }
  .ss-badge {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 1.1rem;
    border-radius: 4px;
    border: 1px solid transparent;
    animation: ss-fade-up 0.4s 0.15s ease both;
  }
  @keyframes ss-fade-up {
    from { transform: translateY(10px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  .xp-badge   { background: rgba(15, 34, 16, 0.8);  border-color: rgba(22, 163, 74, 0.30); }
  .coin-badge { background: rgba(31, 21, 8, 0.8);   border-color: rgba(180, 83, 0, 0.30);  animation-delay: 0.25s; }
  .ss-badge-icon  { font-size: 1.1rem; }
  .ss-badge-value {
    font-family: var(--font-mono, 'Share Tech Mono', monospace);
    font-size: 1.3rem;
    font-weight: 800;
  }
  .xp-badge   .ss-badge-value { color: #4ade80; }
  .coin-badge .ss-badge-value { color: #fbbf24; }
  .ss-badge-unit {
    font-family: var(--font-head, 'Orbitron', sans-serif);
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    color: var(--text-muted, #8892a0);
    align-self: flex-end;
    padding-bottom: 3px;
  }

  /* Back to Dashboard button */
  .ss-btn-done {
    padding: 0.65rem 1.75rem;
    font-family: var(--font-head, 'Orbitron', sans-serif);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--bg, #0a0e1a);
    background: linear-gradient(135deg, var(--accent, #07a5c9), #6366f1);
    border: none;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    cursor: pointer;
    transition: opacity 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 16px rgba(7, 165, 201, 0.35);
    animation: ss-fade-up 0.4s 0.4s ease both;
  }
  .ss-btn-done:hover {
    opacity: 0.88;
    box-shadow: 0 0 24px rgba(7, 165, 201, 0.55);
    color: #fff;
  }
</style>