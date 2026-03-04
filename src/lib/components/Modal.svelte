<script lang="ts">
	import { X, FilePlus, FolderPlus, Pencil, Trash2 } from "lucide-svelte";

	export let show: boolean = false;
	export let title: string = "";
	export let inputPlaceholder: string = "";
	export let message: string = "";
	export let confirmText: string = "Confirm";
	export let showInput: boolean = true;
	/** "bg-red-600" signals destructive action — maps to danger style */
	export let confirmButtonColor: string = "bg-[#07a5c9]";
	export let inputValue: string = "";
	export let onClose: () => void = () => {};
	export let onConfirm: () => void = () => {};

	// Derive intent from the confirmButtonColor or title
	$: isDanger = confirmButtonColor.includes("red") || title.toLowerCase().includes("delete");

	// Derive icon from title
	$: icon = title.toLowerCase().includes("delete")
		? Trash2
		: title.toLowerCase().includes("folder")
		  ? FolderPlus
		  : title.toLowerCase().includes("rename")
		    ? Pencil
		    : FilePlus;

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Enter" && showInput) {
			onConfirm();
		} else if (event.key === "Escape") {
			onClose();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}
</script>

{#if show}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center"
		style="background:rgba(0,0,0,0.78);backdrop-filter:blur(5px);"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		on:click={handleBackdropClick}
		on:keydown={handleKeydown}
	>
		<!-- Card -->
		<div
			class="relative w-full flex flex-col"
			style="max-width:420px;background:#12192a;border:1px solid rgba(7,165,201,0.2);border-radius:4px;padding:1.75rem 2rem;box-shadow:0 0 0 1px rgba(7,165,201,0.07),0 0 40px rgba(7,165,201,0.12),0 24px 60px rgba(0,0,0,0.55);"
		>
			<!-- Ambient glow top edge -->
			<div
				class="absolute inset-x-0 top-0 h-px"
				style="background:linear-gradient(90deg,transparent,rgba(7,165,201,0.5),transparent);"
				aria-hidden="true"
			></div>

			<!-- Header row -->
			<div class="flex items-start justify-between gap-3 mb-5">
				<div class="flex items-center gap-3">
					<!-- Icon badge -->
					<div
						class="w-9 h-9 flex items-center justify-center flex-shrink-0"
						style="background:{isDanger ? 'rgba(255,56,96,0.1)' : 'rgba(7,165,201,0.1)'};border:1px solid {isDanger ? 'rgba(255,56,96,0.3)' : 'rgba(7,165,201,0.25)'};border-radius:4px;"
					>
						<svelte:component
							this={icon}
							class="w-4 h-4"
							style="color:{isDanger ? '#ff3860' : '#07a5c9'};filter:drop-shadow(0 0 6px {isDanger ? 'rgba(255,56,96,0.6)' : 'rgba(7,165,201,0.6)'});"
						/>
					</div>
					<!-- Title -->
					<h3
						class="text-[0.9rem] font-bold tracking-wide text-[#d0d7dd]"
						style="font-family:'Orbitron',monospace;"
					>
						{title}
					</h3>
				</div>

				<!-- Close X -->
				<button
					on:click={onClose}
					class="flex-shrink-0 w-7 h-7 flex items-center justify-center text-[#8892a0] hover:text-[#ff3860] transition-colors"
					title="Close"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- Body -->
			<div class="space-y-4">
				<!-- Optional message (used for delete confirmation) -->
				{#if message}
					<p
						class="text-[0.85rem] leading-relaxed"
						style="color:rgba(208,215,221,0.75);font-family:'Rajdhani',sans-serif;"
					>
						{#if isDanger}
							<span class="text-[#ff3860] font-semibold">Warning: </span>
						{/if}
						{message}
					</p>
				{/if}

				<!-- Input field -->
				{#if showInput}
					<div>
						<input
							type="text"
							bind:value={inputValue}
							placeholder={inputPlaceholder}
							on:keydown={handleKeydown}
							class="w-full px-3 py-2 text-[0.82rem] text-[#d0d7dd] placeholder-[#8892a0]/50 bg-[#0a0e1a] outline-none transition-all"
							style="border:1px solid rgba(7,165,201,0.2);border-radius:2px;font-family:'Share Tech Mono',monospace;box-shadow:none;"
							on:focus={(e) => (e.currentTarget.style.borderColor = 'rgba(7,165,201,0.6)', e.currentTarget.style.boxShadow = '0 0 0 2px rgba(7,165,201,0.1)')}
							on:blur={(e) => (e.currentTarget.style.borderColor = 'rgba(7,165,201,0.2)', e.currentTarget.style.boxShadow = 'none')}
						/>
					</div>
				{/if}
			</div>

			<!-- Divider -->
			<div class="mt-5 mb-4" style="border-top:1px solid rgba(7,165,201,0.08);"></div>

			<!-- Actions -->
			<div class="flex items-center justify-end gap-2">
				<!-- Cancel -->
				<button
					on:click={onClose}
					class="px-4 py-2 text-[0.65rem] font-bold uppercase tracking-widest text-[#8892a0] bg-transparent hover:text-[#d0d7dd] hover:bg-[rgba(7,165,201,0.06)] border border-[rgba(40,55,80,0.9)] hover:border-[rgba(7,165,201,0.25)] transition-all"
					style="clip-path:polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px));font-family:'Orbitron',monospace;"
				>
					Cancel
				</button>

				<!-- Confirm -->
				<button
					on:click={onConfirm}
					class="modal-confirm-btn px-4 py-2 text-[0.65rem] font-bold uppercase tracking-widest transition-all active:scale-95 {isDanger ? 'danger' : 'primary'}"
				>
					{confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
  .modal-confirm-btn {
    clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px));
    font-family: 'Orbitron', monospace;
  }
  .modal-confirm-btn.primary {
    background: #07a5c9;
    color: #0a0e1a;
    box-shadow: 0 0 16px rgba(7, 165, 201, 0.45);
  }
  .modal-confirm-btn.primary:hover {
    background: #00f5ff;
    box-shadow: 0 0 26px rgba(0, 245, 255, 0.6);
  }
  .modal-confirm-btn.danger {
    background: #ff3860;
    color: #fff;
    box-shadow: 0 0 16px rgba(255, 56, 96, 0.45);
  }
  .modal-confirm-btn.danger:hover {
    background: #ff6080;
    box-shadow: 0 0 26px rgba(255, 56, 96, 0.65);
  }
</style>

