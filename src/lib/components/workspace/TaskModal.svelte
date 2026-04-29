<script lang="ts">
	import { Lock, BookOpen } from 'lucide-svelte';
	import Scrollbar from '../ui/Scrollbar.svelte';

	export let open = false;
	export let title = '';
	export let userStory = '';
	export let acceptanceCriteria: string[] = [];
	export let hints: { id: string; content: string; order: number }[] = [];
	export let status: 'backlog' | 'in-progress' | 'in-review' | 'done' = 'backlog';
	export let isLocked: boolean = false;
	export let taskOrder: number | null = null;
	export let onClose: () => void = () => {};
	export let onOpenCrashCourse: () => void = () => {};

	function handleOpenCrashCourse() {
		onOpenCrashCourse();
		onClose();
	}

	let showHints = false;

	function closeModal() {
		onClose();
	}

	function handleBackdropClick() {
		closeModal();
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (!open) return;
		if (event.key === 'Escape') closeModal();
	}

	$: statusLabel = status === 'in-progress'
		? 'In Progress'
		: status === 'in-review'
			? 'In Review'
			: status === 'done'
				? 'Done'
				: 'Backlog';
	$: statusClasses =
		status === 'done'
			? 'text-[var(--success)] border-[rgba(0,229,160,0.4)] bg-[rgba(0,229,160,0.1)]'
			: status === 'in-review'
				? 'text-[var(--accent)] border-[rgba(7,165,201,0.4)] bg-[rgba(7,165,201,0.12)]'
			: status === 'in-progress'
				? 'text-[var(--warn)] border-[rgba(255,180,0,0.4)] bg-[rgba(255,180,0,0.1)]'
				: 'text-[var(--text-muted)] border-[rgba(136,146,160,0.4)] bg-[rgba(136,146,160,0.1)]';
</script>

<svelte:window on:keydown={handleWindowKeydown} />

			{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[10020] flex items-center justify-center bg-[rgba(0,0,0,0.72)] p-4 backdrop-blur-sm"
		on:click={handleBackdropClick}
	>
		<dialog
			open
			tabindex="-1"
			data-tour="board-task-modal"
			class="modal-enter relative w-full max-w-2xl overflow-hidden rounded-[4px] border border-[rgba(7,165,201,0.3)] bg-[var(--bg-light)] shadow-[0_0_28px_var(--accent-glow)]"
			on:click|stopPropagation
			aria-label="Task details"
		>
			<div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"></div>

			<header class="flex items-start justify-between gap-4 border-b border-[rgba(7,165,201,0.15)] px-5 py-4">
				<div class="min-w-0">
					<span class={`rounded-[2px] border px-2 py-1 text-[0.62rem] uppercase tracking-[0.12em] [font-family:var(--font-mono)] ${statusClasses}`}>
						{statusLabel}
					</span>
					<h2 class="truncate text-[1.05rem] text-[var(--text-primary)] [font-family:var(--font-heading)] mt-4">
						{title || 'Untitled task'}
					</h2>
				</div>

				<div class="flex items-center gap-3">
					<button
						type="button"
						data-tour="board-task-modal-close"
						on:click={closeModal}
						class="rounded-[2px] border border-[rgba(7,165,201,0.3)] px-2 py-1 text-[0.68rem] uppercase tracking-[0.1em] text-[var(--accent)] transition-all duration-200 hover:bg-[var(--accent-dim)] hover:text-[var(--cyan-bright)] [font-family:var(--font-mono)]"
						aria-label="Close task details"
					>
						Close
					</button>
				</div>
			</header>

			<Scrollbar className="max-h-[70vh]">
				<div class="space-y-5 px-5 py-5">
					{#if isLocked}
						<section class="rounded-[4px] border border-[rgba(255,180,0,0.3)] bg-[rgba(255,180,0,0.06)] p-6 text-center">
							<div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(255,180,0,0.4)] bg-[rgba(255,180,0,0.12)]">
								<Lock class="h-5 w-5" style="color: #FFB400;" />
							</div>
							<p class="mb-2 text-[0.72rem] uppercase tracking-[0.16em] [font-family:var(--font-mono)]" style="color: #FFB400;">
								Crash course required
							</p>
							<p class="mb-4 text-[0.92rem] leading-relaxed text-[var(--text-primary)] [font-family:var(--font-body)]">
								Complete the crash course{taskOrder ? ` for Task ${taskOrder}` : ''} to unlock the user story, acceptance criteria, and hints.
							</p>
							<button
								type="button"
								on:click={handleOpenCrashCourse}
								class="inline-flex items-center gap-2 rounded-[3px] border px-4 py-2 text-[0.7rem] uppercase tracking-[0.12em] transition-colors [font-family:var(--font-mono)]"
								style="color: #FFB400; background: rgba(255,180,0,0.12); border-color: rgba(255,180,0,0.45);"
							>
								<BookOpen class="h-4 w-4" />
								Open Crash Course
							</button>
						</section>
					{:else}
					<section class="rounded-[4px] border border-[rgba(7,165,201,0.18)] bg-[rgba(7,165,201,0.06)] p-4">
					<p class="mb-2 text-[0.64rem] uppercase tracking-[0.14em] text-[var(--accent)] [font-family:var(--font-mono)]">
						User Story
					</p>
					<p class="whitespace-pre-line text-[0.92rem] leading-relaxed text-[var(--text-primary)] [font-family:var(--font-body)]">
						{userStory || 'No user story was provided for this task yet.'}
					</p>
					</section>

					<section data-tour="board-task-ac" class="rounded-[4px] border border-[rgba(7,165,201,0.15)] bg-[var(--bg)] p-4">
						<p class="mb-3 text-[0.64rem] uppercase tracking-[0.14em] text-[var(--text-muted)] [font-family:var(--font-mono)]">
							Acceptance Criteria
						</p>

						{#if acceptanceCriteria.length > 0}
							<ol class="space-y-2">
								{#each acceptanceCriteria as criterion, index}
									<li class="flex items-start gap-3 rounded-[3px] border border-[rgba(7,165,201,0.12)] bg-[rgba(18,25,42,0.7)] px-3 py-2.5">
										<span class="mt-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-[2px] border border-[rgba(7,165,201,0.35)] bg-[rgba(7,165,201,0.12)] text-[0.62rem] text-[var(--accent)] [font-family:var(--font-mono)]">
											{index + 1}
										</span>
										<span class="text-[0.88rem] leading-relaxed text-[var(--text-primary)] [font-family:var(--font-body)]">
											{criterion}
										</span>
									</li>
								{/each}
							</ol>
						{:else}
							<p class="rounded-[3px] border border-dashed border-[rgba(7,165,201,0.2)] px-3 py-3 text-[0.82rem] text-[var(--text-muted)] [font-family:var(--font-body)]">
								No acceptance criteria listed for this task.
							</p>
						{/if}
					</section>

					{#if hints && hints.length > 0}
						<section class="rounded-[4px] border border-[rgba(255,180,0,0.15)] bg-[rgba(255,180,0,0.06)] p-4">
							<button
								type="button"
								on:click={() => (showHints = !showHints)}
								class="flex w-full items-center justify-between"
							>
								<p class="text-[0.64rem] uppercase tracking-[0.14em] text-[#FFB400] [font-family:var(--font-mono)]">
									Hints ({hints.length})
								</p>
								<span class="text-[0.64rem] text-[#FFB400] [font-family:var(--font-mono)]">
									{showHints ? '▲ Hide' : '▼ Show'}
								</span>
							</button>

							{#if showHints}
								<ol class="mt-3 space-y-2">
									{#each hints as hint, index}
										<li class="flex items-start gap-3 rounded-[3px] border border-[rgba(255,180,0,0.12)] bg-[rgba(18,25,42,0.7)] px-3 py-2.5">
											<span class="mt-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-[2px] border border-[rgba(255,180,0,0.35)] bg-[rgba(255,180,0,0.12)] text-[0.62rem] text-[#FFB400] [font-family:var(--font-mono)]">
												{index + 1}
											</span>
											<span class="text-[0.88rem] leading-relaxed text-[var(--text-primary)] [font-family:var(--font-body)]">
												{hint.content}
											</span>
										</li>
									{/each}
								</ol>
							{/if}
						</section>
					{/if}
					{/if}
				</div>
			</Scrollbar>
		</dialog>
	</div>
{/if}

<style>
	@keyframes modalIn {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.985);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.modal-enter {
		animation: modalIn 0.25s ease;
	}
</style>
