<script lang="ts">
	import { Lightbulb } from "lucide-svelte";
	import type { KanbanTask } from "$lib/types/KanbanBoard";

	export let open = false;
	// export let title = '';
	// export let userStory = '';
	// export let acceptanceCriteria: string[] = [];
	// export let hints: string[] = [];
	// export let status: 'backlog' | 'in-progress' | 'in-review' | 'done' = 'backlog';
	export let selectedTask: KanbanTask | null;
	export let onClose: () => void = () => {};

	console.log("selected task: ", selectedTask);

	function closeModal() {
		onClose();
	}

	function handleBackdropClick() {
		closeModal();
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (!open) return;
		if (event.key === "Escape") closeModal();
	}

	$: statusLabel =
		selectedTask?.status === "in-progress"
			? "In Progress"
			: selectedTask?.status === "in-review"
				? "In Review"
				: selectedTask?.status === "done"
					? "Done"
					: "Backlog";
	$: statusClasses =
		selectedTask?.status === "done"
			? "text-[var(--success)] border-[rgba(0,229,160,0.4)] bg-[rgba(0,229,160,0.1)]"
			: selectedTask?.status === "in-review"
				? "text-[var(--accent)] border-[rgba(7,165,201,0.4)] bg-[rgba(7,165,201,0.12)]"
				: selectedTask?.status === "in-progress"
					? "text-[var(--warn)] border-[rgba(255,180,0,0.4)] bg-[rgba(255,180,0,0.1)]"
					: "text-[var(--text-muted)] border-[rgba(136,146,160,0.4)] bg-[rgba(136,146,160,0.1)]";

	let showHints = false;
</script>

<svelte:window on:keydown={handleWindowKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	{#if !selectedTask}
		<div
			class="fixed inset-0 z-[220] flex items-center justify-center bg-[rgba(0,0,0,0.72)] p-4 backdrop-blur-sm"
		>
			<div class="text-[var(--text-primary)]">Loading task details...</div>
		</div>
	{:else}
		<div
			class="fixed inset-0 z-[220] flex items-center justify-center bg-[rgba(0,0,0,0.72)] p-4 backdrop-blur-sm"
			on:click={handleBackdropClick}
		>
			<dialog
				open
				tabindex="-1"
				class="modal-enter relative w-full max-w-2xl overflow-hidden rounded-[4px] border border-[rgba(7,165,201,0.3)] bg-[var(--bg-light)] shadow-[0_0_28px_var(--accent-glow)]"
				on:click|stopPropagation
				aria-label="Task details"
			>
				<div
					class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
				></div>

				<header
					class="flex items-start justify-between gap-4 border-b border-[rgba(7,165,201,0.15)] px-5 py-4"
				>
					<div class="min-w-0">
						<p
							class="mb-2 text-[0.62rem] uppercase tracking-[0.16em] text-[var(--text-muted)] [font-family:var(--font-mono)]"
						>
							// Task Brief
						</p>
						<h2
							class="truncate text-[1.05rem] text-[var(--text-primary)] [font-family:var(--font-heading)]"
						>
							{selectedTask.text || "Untitled task"}
						</h2>
					</div>

					<div class="flex items-center gap-3">
						<span
							class={`rounded-[2px] border px-2 py-1 text-[0.62rem] uppercase tracking-[0.12em] [font-family:var(--font-mono)] ${statusClasses}`}
						>
							{statusLabel}
						</span>
						{#if selectedTask.hints.length > 0}
							<button
								type="button"
								on:click={() => (showHints = !showHints)}
								class="rounded-[2px] border border-[rgba(255,180,0,0.3)] px-2 py-1 text-[0.62rem] uppercase tracking-[0.1em] text-[var(--warn)] transition-all duration-200 hover:bg-[rgba(255,180,0,0.1)] [font-family:var(--font-mono)]"
							>
								<Lightbulb class="w-3 h-3 inline mr-1" />
								{showHints ? "Hide Hint" : "View Hint"}
							</button>
						{/if}
						<button
							type="button"
							on:click={closeModal}
							class="rounded-[2px] border border-[rgba(7,165,201,0.3)] px-2 py-1 text-[0.68rem] uppercase tracking-[0.1em] text-[var(--accent)] transition-all duration-200 hover:bg-[var(--accent-dim)] hover:text-[var(--cyan-bright)] [font-family:var(--font-mono)]"
							aria-label="Close task details"
						>
							Close
						</button>
					</div>
				</header>

				<div class="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5">
					<section
						class="rounded-[4px] border border-[rgba(7,165,201,0.18)] bg-[rgba(7,165,201,0.06)] p-4"
					>
						<p
							class="mb-2 text-[0.64rem] uppercase tracking-[0.14em] text-[var(--accent)] [font-family:var(--font-mono)]"
						>
							User Story
						</p>
						<p
							class="whitespace-pre-line text-[0.92rem] leading-relaxed text-[var(--text-primary)] [font-family:var(--font-body)]"
						>
							{selectedTask.userStory ||
								"No user story was provided for this task yet."}
						</p>
					</section>

					<section
						class="rounded-[4px] border border-[rgba(7,165,201,0.15)] bg-[var(--bg)] p-4"
					>
						<p
							class="mb-3 text-[0.64rem] uppercase tracking-[0.14em] text-[var(--text-muted)] [font-family:var(--font-mono)]"
						>
							Acceptance Criteria
						</p>

						{#if selectedTask.acceptanceCriteria.length > 0}
							<ol class="space-y-2">
								{#each selectedTask.acceptanceCriteria as criterion, index}
									<li
										class="flex items-start gap-3 rounded-[3px] border border-[rgba(7,165,201,0.12)] bg-[rgba(18,25,42,0.7)] px-3 py-2.5"
									>
										<span
											class="mt-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-[2px] border border-[rgba(7,165,201,0.35)] bg-[rgba(7,165,201,0.12)] text-[0.62rem] text-[var(--accent)] [font-family:var(--font-mono)]"
										>
											{index + 1}
										</span>
										<span
											class="text-[0.88rem] leading-relaxed text-[var(--text-primary)] [font-family:var(--font-body)]"
										>
											{criterion}
										</span>
									</li>
								{/each}
							</ol>
						{:else}
							<p
								class="rounded-[3px] border border-dashed border-[rgba(7,165,201,0.2)] px-3 py-3 text-[0.82rem] text-[var(--text-muted)] [font-family:var(--font-body)]"
							>
								No acceptance criteria listed for this task.
							</p>
						{/if}
					</section>

					{#if showHints && selectedTask.hints.length > 0}
						<section
							class="rounded-[4px] border border-[rgba(255,180,0,0.15)] bg-[rgba(255,180,0,0.06)] p-4"
						>
							<p
								class="mb-3 text-[0.64rem] uppercase tracking-[0.14em] text-[var(--warn)] [font-family:var(--font-mono)]"
							>
								💡 Hints
							</p>
							<ol class="space-y-2">
								{#each selectedTask.hints as hint, index}
									<li
										class="flex items-start gap-3 rounded-[3px] border border-[rgba(255,180,0,0.12)] bg-[rgba(18,25,42,0.7)] px-3 py-2.5"
									>
										<span
											class="mt-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-[2px] border border-[rgba(255,180,0,0.35)] bg-[rgba(255,180,0,0.12)] text-[0.62rem] text-[var(--warn)] [font-family:var(--font-mono)]"
										>
											{index + 1}
										</span>
										<span
											class="text-[0.88rem] leading-relaxed text-[var(--text-primary)] [font-family:var(--font-body)]"
										>
											{hint}
										</span>
									</li>
								{/each}
							</ol>
						</section>
					{/if}
				</div>
			</dialog>
		</div>
	{/if}
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
