<script lang="ts">
	import { X } from "lucide-svelte";

	export let show: boolean = false;
	export let title: string = "";
	export let inputPlaceholder: string = "";
	export let message: string = "";
	export let confirmText: string = "Confirm";
	export let showInput: boolean = true;
	export let confirmButtonColor: string = "bg-[#07a5c9]";
	export let inputValue: string = "";
	export let onClose: () => void = () => {};
	export let onConfirm: () => void = () => {};

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
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		role="dialog"
		tabindex="-1"
		on:click={handleBackdropClick}
		on:keydown={handleKeydown}
	>
		<div class="bg-[#1e1e1e] border border-[#27272a] rounded-lg shadow-xl p-4 w-80" role="document">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-[#d0d7dd]">{title}</h3>
				<button on:click={onClose} class="text-[#d0d7dd]/50 hover:text-[#d0d7dd] transition-colors">
					<X class="w-4 h-4" />
				</button>
			</div>

			{#if message}
				<p class="text-sm text-[#d0d7dd]/70 mb-4">{message}</p>
			{/if}

			{#if showInput}
				<input
					type="text"
					bind:value={inputValue}
					placeholder={inputPlaceholder}
					class="w-full px-3 py-2 bg-[#2d3446] border border-[#27272a] rounded text-[#d0d7dd] placeholder-[#d0d7dd]/30 focus:outline-none focus:border-[#07a5c9]"
					autofocus
					on:keydown={handleKeydown}
				/>
			{/if}

			<div class="flex justify-end gap-2 mt-4">
				<button
					on:click={onClose}
					class="px-4 py-2 text-sm text-[#d0d7dd] hover:bg-[#2d3446] rounded transition-colors"
				>
					Cancel
				</button>
				<button
					on:click={onConfirm}
					class="px-4 py-2 text-sm text-white rounded hover:opacity-80 transition-colors {confirmButtonColor}"
				>
					{confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}
