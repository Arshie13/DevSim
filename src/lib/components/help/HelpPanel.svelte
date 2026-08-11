<script lang="ts">
	import { X, HelpCircle, ChevronRight, AlertTriangle, Send, CheckCircle, Minus } from 'lucide-svelte';
	import { errorCatalog, errorCategoryOrder, type HelpEntry } from '$lib/help/errorCatalog';
	import { toast } from '$lib/stores/toast';
	import type { Limitation } from '$lib/types';

	interface Props {
		onClose: () => void;
		onMinimize?: () => void;
		onAction?: (handler: string) => void;
		containerId?: string;
		prefillCategory?: string;
		prefillDescription?: string;
		limitations?: Limitation[];
		startOnLimitations?: boolean;
		minimized?: boolean;
	}

	let {
		onClose,
		onMinimize,
		onAction = () => {},
		containerId = '',
		prefillCategory = '',
		prefillDescription = '',
		limitations = [],
		startOnLimitations = false,
		minimized = false
	}: Props = $props();

	const defaultLimitations: Limitation[] = [
		{ text: 'The Docker container is isolated from your host machine and may not reflect your local OS or installed tooling.', image: '/images/limitations/1-isolation.png' },
		{ text: 'File changes are scoped to the container filesystem and might not persist outside the container unless explicitly downloaded.', image: '/images/limitations/2-filesystem.png' },
		{ text: 'Network behavior may differ from a full local setup due to port forwarding and container networking.', image: '/images/limitations/3-networking.png' },
		{ text: 'Some native or GUI-dependent tools may not work inside the simulated container environment.', image: '/images/limitations/4-gui-tools.png' },
		{ text: 'Performance and timing can vary from a standard local development machine.', image: '/images/limitations/5-performance.png' },
		{ text: 'Hot reloading and file watching may not detect changes reliably due to Docker\'s filesystem event propagation.', image: '/images/limitations/6-hot-reload.png' },
		{ text: 'Git credentials, SSH keys, and other host authentication are not available inside the container unless explicitly configured.', image: '/images/limitations/7-auth.png' },
		{ text: 'Container disk space is limited and can fill up quickly with dependencies, caches, or build artifacts.', image: '/images/limitations/8-disk-space.png' },
		{ text: 'The container may be stopped or reset due to inactivity timeouts, causing loss of unsaved work.', image: '/images/limitations/9-timeout.png' },
		{ text: 'The terminal session may disconnect due to network fluctuations, interrupting running processes.', image: '/images/limitations/10-disconnect.png' }
	];

	const displayLimitations = $derived(limitations.length > 0 ? limitations : defaultLimitations);

	let selectedCategory = $state('');
	let selectedError = $state<HelpEntry | null>(null);
	let showLimitations = $state(false);
	let showRequestForm = $state(false);
	let selectedImage = $state<string | null>(null);

	$effect(() => {
		showLimitations = startOnLimitations;
	});

	// Help request form state
	let requestSubject = $state('');
	let requestDescription = $state('');
	let requestCategory = $state('');
	let isSending = $state(false);
	let requestSent = $state(false);

	$effect(() => {
		if (prefillCategory) requestCategory = prefillCategory;
		if (prefillDescription) requestDescription = prefillDescription;
	});

	let selectedCategoryEntries = $derived(errorCatalog.filter((e) => e.category === selectedCategory));

	const categoryNames = errorCategoryOrder;

	function openImageLightbox(src: string) {
		selectedImage = src;
	}

	function closeImageLightbox() {
		selectedImage = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && selectedImage) {
			closeImageLightbox();
		}
	}

	function selectError(entry: HelpEntry) {
		selectedError = entry;
		showLimitations = false;
		showRequestForm = false;
	}

	function backToCategories() {
		selectedError = null;
		showLimitations = false;
		showRequestForm = false;
		selectedCategory = '';
	}

	function openRequestForm(category?: string) {
		showRequestForm = true;
		showLimitations = false;
		selectedError = null;
		if (category) requestCategory = category;
		if (!requestSubject && prefillDescription) {
			requestSubject = prefillDescription.slice(0, 80);
		}
	}

	async function sendHelpRequest() {
		if (!requestSubject.trim() || !requestDescription.trim()) return;
		isSending = true;
		try {
			const res = await fetch('/api/help/request', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					category: requestCategory || null,
					subject: requestSubject.trim(),
					description: requestDescription.trim(),
					context: {
						url: typeof window !== 'undefined' ? window.location.href : '',
						containerId: containerId || null,
						userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
					}
				})
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || 'Failed to send request');
			}
			const data = await res.json();
			requestSent = true;
			if (!data.emailSent) {
				toast.warn('Request saved but email delivery failed. Our team will still see it in the system.');
			}
		} catch (err) {
			toast.error('Failed to send help request. Please try again.');
			console.error('Help request failed:', err);
		} finally {
			isSending = false;
		}
	}

	function handleAction(handler: string) {
		onAction(handler);
	}

	function handleClose() {
		onClose();
	}

	function handleMinimize() {
		if (onMinimize) onMinimize();
	}
</script>

<div class="help-overlay" class:help-hidden={minimized} onclick={handleClose} role="presentation"></div>

<div class="help-panel" class:help-hidden={minimized} onkeydown={handleKeydown}>
	<!-- Header -->
	<div class="panel-header">
		<div class="flex items-center gap-3">
			<HelpCircle class="w-5 h-5 text-[#07a5c9]" />
			<h2 class="text-sm font-bold text-gray-100" style="font-family:'Orbitron',monospace;">HELP &amp; TROUBLESHOOTING</h2>
		</div>
		<div class="flex items-center gap-1">
			{#if onMinimize}
				<button
					onclick={handleMinimize}
					class="text-gray-400 hover:text-gray-200 p-1 rounded hover:bg-slate-800 transition-colors"
					aria-label="Minimize help"
					title="Minimize (preserves your place)"
				>
					<Minus class="w-4 h-4" />
				</button>
			{/if}
			<button
				onclick={handleClose}
				class="text-gray-400 hover:text-gray-200 p-1 rounded hover:bg-slate-800 transition-colors"
				aria-label="Close help"
				title="Close"
			>
				<X class="w-4 h-4" />
			</button>
		</div>
	</div>

	{#if requestSent}
		<!-- Success state -->
		<div class="p-8 flex flex-col items-center justify-center h-full text-center">
			<CheckCircle class="w-14 h-14 text-[#00e5a0] mb-4" />
			<h3 class="text-base font-bold text-gray-100 mb-2">Help Request Sent</h3>
			<p class="text-sm text-gray-400 leading-relaxed max-w-sm">
				We've received your request and will get back to you via email. Our team reviews all requests and typically responds within 24 hours.
			</p>
			<button
				onclick={() => { requestSent = false; showRequestForm = false; requestSubject = ''; requestDescription = ''; }}
				class="mt-5 px-5 py-2 text-sm bg-[#07a5c9] text-[#0a0e1a] font-bold hover:bg-[#00f5ff] transition-all"
				style="clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));font-family:'Orbitron',monospace;"
			>
				Done
			</button>
		</div>
	{:else if showRequestForm}
		<!-- Help Request Form -->
		<div class="panel-body">
			<button
				onclick={backToCategories}
				class="flex items-center gap-1 text-xs text-[#07a5c9] hover:text-[#00f5ff] mb-4 transition-colors"
			>
				<ChevronRight class="w-3 h-3 rotate-180" />
				Back to Help Center
			</button>

			<h3 class="text-base font-bold text-gray-100 mb-1">Request Help</h3>
			<p class="text-sm text-gray-400 mb-5 leading-relaxed">Describe your issue and we'll send it to the DevSim support team.</p>

			<div class="space-y-4">
				<div>
					<label class="block text-xs text-gray-400 mb-1.5" for="help-subject">What were you trying to do?</label>
					<input
						id="help-subject"
						type="text"
						bind:value={requestSubject}
						placeholder="E.g., Submitting a sprint, running tests..."
						class="w-full bg-slate-900/50 border border-slate-700 rounded px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#07a5c9] transition-colors"
					/>
				</div>

				<div>
					<label class="block text-xs text-gray-400 mb-1.5" for="help-description">Describe the issue</label>
					<textarea
						id="help-description"
						bind:value={requestDescription}
						placeholder="What went wrong? What error did you see? What steps did you take?"
						rows={5}
						class="w-full bg-slate-900/50 border border-slate-700 rounded px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#07a5c9] transition-colors resize-none"
					></textarea>
				</div>

				<div>
					<label class="block text-xs text-gray-400 mb-1.5" for="help-category">Category</label>
					<select
						id="help-category"
						bind:value={requestCategory}
						class="w-full bg-slate-900/50 border border-slate-700 rounded px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#07a5c9] transition-colors"
					>
						<option value="">Uncategorized</option>
						{#each categoryNames as cat}
							<option value={cat}>{cat}</option>
						{/each}
					</select>
				</div>

				<div class="bg-slate-900/30 border border-slate-700/50 rounded p-3">
					<p class="text-xs text-gray-500 mb-1.5">We'll automatically include:</p>
					<ul class="text-xs text-gray-500 space-y-1">
						<li>✓ Current page URL</li>
						<li>✓ Browser &amp; OS info</li>
						{#if containerId}
							<li>✓ Container ID</li>
						{/if}
					</ul>
				</div>

				<div class="flex gap-2 pt-1">
					<button
						onclick={backToCategories}
						class="flex-1 px-4 py-2.5 text-sm text-gray-400 border border-slate-700 hover:bg-slate-800 transition-colors"
						style="clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));"
					>
						Cancel
					</button>
					<button
						onclick={sendHelpRequest}
						disabled={isSending || !requestSubject.trim() || !requestDescription.trim()}
						class="flex-1 px-4 py-2.5 text-sm font-bold flex items-center justify-center gap-2 bg-[#07a5c9] text-[#0a0e1a] hover:bg-[#00f5ff] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
						style="clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));font-family:'Orbitron',monospace;"
					>
						{#if isSending}
							<span class="animate-spin w-3.5 h-3.5 border-2 border-[#0a0e1a] border-t-transparent rounded-full"></span>
							Sending...
						{:else}
							<Send class="w-3.5 h-3.5" />
							Send Help Request
						{/if}
					</button>
				</div>
			</div>
		</div>
	{:else if showLimitations}
		<!-- Known Limitations -->
		<div class="panel-body">
			<button
				onclick={backToCategories}
				class="flex items-center gap-1 text-xs text-[#07a5c9] hover:text-[#00f5ff] mb-4 transition-colors"
			>
				<ChevronRight class="w-3 h-3 rotate-180" />
				Back to Help Center
			</button>

			<h3 class="text-base font-bold text-gray-100 mb-3">
				<AlertTriangle class="w-4 h-4 inline text-[#ffb400] mr-1.5" />
				Known Limitations
			</h3>
			<p class="text-sm text-gray-400 mb-4 leading-relaxed">
				These are inherent limitations of the Docker-based workspace environment. Most issues you encounter will fall into one of these categories.
			</p>
			<ul class="space-y-4">
				{#each displayLimitations as limit, i}
					<li class="text-sm text-gray-300 leading-relaxed">
						<div class="flex gap-3">
							<span class="text-[#07a5c9] font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
							<div class="flex-1 min-w-0">
								<span>{limit.text}</span>
								{#if limit.image}
									<button
										onclick={() => openImageLightbox(limit.image!)}
										class="mt-3 rounded-lg overflow-hidden border border-slate-700/50 bg-slate-900/30 block w-full text-left cursor-pointer hover:border-[#07a5c9]/30 transition-colors"
									>
										<img
											src={limit.image}
											alt={`Screenshot illustrating: ${limit.text}`}
											class="w-full h-auto object-cover max-h-48"
											loading="lazy"
										/>
									</button>
								{/if}
							</div>
						</div>
					</li>
				{/each}
			</ul>

			<div class="mt-5 pt-4 border-t border-slate-700/50">
				<button
					onclick={() => openRequestForm()}
					class="w-full px-4 py-2.5 text-sm font-bold bg-[#07a5c9] text-[#0a0e1a] hover:bg-[#00f5ff] transition-all"
					style="clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));font-family:'Orbitron',monospace;"
				>
					<Send class="w-3.5 h-3.5 inline mr-1.5" />
					Still need help? Send a request
				</button>
			</div>
		</div>
	{:else if selectedError}
		{@const error = selectedError}
		<!-- Error Detail View -->
		<div class="panel-body">
			<button
				onclick={backToCategories}
				class="flex items-center gap-1 text-xs text-[#07a5c9] hover:text-[#00f5ff] mb-4 transition-colors"
			>
				<ChevronRight class="w-3 h-3 rotate-180" />
				Back to Common Issues
			</button>

			<span class="text-[0.65rem] px-2 py-0.5 border border-[rgba(7,165,201,0.3)] text-[#07a5c9] font-mono uppercase tracking-wide mb-2 inline-block">
				{error.category}
			</span>
			<h3 class="text-base font-bold text-gray-100 mb-2">{error.title}</h3>
			<p class="text-sm text-gray-400 mb-5 leading-relaxed">{error.description}</p>

			{#if error.image}
				<button
					onclick={() => openImageLightbox(error.image!)}
					class="mb-5 rounded-lg overflow-hidden border border-slate-700/50 bg-slate-900/30 block w-full text-left cursor-pointer hover:border-[#07a5c9]/30 transition-colors"
				>
					<img
						src={error.image}
						alt={`Screenshot illustrating: ${error.title}`}
						class="w-full h-auto object-cover max-h-48"
						loading="lazy"
					/>
				</button>
			{/if}

			<div class="mb-5">
				<h4 class="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">Steps to Resolve</h4>
				<ol class="space-y-2.5">
					{#each error.steps as step, i}
						<li class="flex gap-3 text-sm text-gray-300 leading-relaxed">
							<span class="text-[#07a5c9] font-bold flex-shrink-0">{i + 1}.</span>
							<span>{step}</span>
						</li>
					{/each}
				</ol>
			</div>

			{#if error.actions && error.actions.length > 0}
				<div class="flex flex-wrap gap-2 mb-5">
					{#each error.actions as action}
						<button
							onclick={() => handleAction(action.handler)}
							class="px-4 py-2 text-xs font-bold bg-[#07a5c9] text-[#0a0e1a] hover:bg-[#00f5ff] transition-all"
							style="clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));font-family:'Orbitron',monospace;"
						>
							{action.label}
						</button>
					{/each}
				</div>
			{/if}

			<div class="pt-4 border-t border-slate-700/50">
				<button
					onclick={() => openRequestForm(error.category)}
					class="w-full px-4 py-2.5 text-sm font-bold border border-[#07a5c9] text-[#07a5c9] hover:bg-[rgba(7,165,201,0.08)] transition-all"
					style="clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));font-family:'Orbitron',monospace;"
				>
					<Send class="w-3.5 h-3.5 inline mr-1.5" />
					This didn't help — Send a help request
				</button>
			</div>
		</div>
	{:else}
		<!-- Main Help Center View -->
		<div class="panel-body">
			{#if selectedCategory}
				<button
					onclick={() => { selectedCategory = ''; }}
					class="flex items-center gap-1 text-xs text-[#07a5c9] hover:text-[#00f5ff] mb-4 transition-colors"
				>
					<ChevronRight class="w-3 h-3 rotate-180" />
					Back to Common Issues
				</button>
				<span class="text-[0.65rem] text-[#07a5c9] font-mono uppercase tracking-wide block mb-3">{selectedCategory}</span>
				<div class="space-y-1">
					{#each selectedCategoryEntries as entry}
						<button
							onclick={() => selectError(entry)}
							class="w-full text-left flex items-center justify-between p-2.5 bg-slate-900/30 border border-slate-700/50 hover:border-[#07a5c9]/30 hover:bg-slate-800/50 transition-colors"
						>
							<span class="text-sm text-gray-200">{entry.title}</span>
							<ChevronRight class="w-4 h-4 text-gray-500 flex-shrink-0" />
						</button>
					{/each}
				</div>
			{:else}
				<p class="text-[0.65rem] uppercase tracking-widest text-[#8892a0] mb-3" style="font-family:'Space Mono',monospace;">// Common Issues</p>
				<div class="space-y-1 mb-6">
					{#each categoryNames as cat}
						<button
							onclick={() => { selectedCategory = cat; }}
							class="w-full text-left px-3 py-2.5 text-sm text-gray-300 hover:text-[#07a5c9] hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 transition-colors flex items-center justify-between"
						>
							<span>{cat}</span>
							<ChevronRight class="w-3.5 h-3.5 text-gray-600" />
						</button>
					{/each}
				</div>

				<button
					onclick={() => (showLimitations = true)}
					class="w-full flex items-center justify-between px-3 py-2.5 text-sm text-[#ffb400] hover:bg-slate-800/50 border border-[rgba(255,180,0,0.2)] transition-colors mb-5"
				>
					<span class="flex items-center gap-2">
						<AlertTriangle class="w-4 h-4" />
						Known Limitations
					</span>
					<ChevronRight class="w-3.5 h-3.5" />
				</button>

				<div class="pt-4 border-t border-slate-700/50">
					<button
						onclick={() => openRequestForm()}
						class="w-full px-4 py-2.5 text-sm font-bold bg-[#07a5c9] text-[#0a0e1a] hover:bg-[#00f5ff] transition-all"
						style="clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));font-family:'Orbitron',monospace;"
					>
						<Send class="w-3.5 h-3.5 inline mr-1.5" />
						Send Help Request
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if selectedImage}
	<div
		class="image-lightbox-overlay"
		onclick={closeImageLightbox}
		onkeydown={handleKeydown}
		role="presentation"
	>
		<div class="image-lightbox-content" onclick={(e) => e.stopPropagation()}>
			<button
				onclick={closeImageLightbox}
				class="image-lightbox-close"
				aria-label="Close image preview"
			>
				<X class="w-5 h-5" />
			</button>
			<img
				src={selectedImage}
				alt="Full size preview"
				class="image-lightbox-img"
			/>
		</div>
	</div>
{/if}

<style>
	.help-overlay {
		position: fixed;
		inset: 0;
		z-index: 99;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(2px);
	}

	.help-panel {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: 480px;
		max-width: calc(100vw - 2rem);
		z-index: 100;
		background: #0f172a;
		border-left: 1px solid rgba(7, 165, 201, 0.15);
		box-shadow: -4px 0 24px rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.panel-header {
		background: linear-gradient(90deg, rgba(7, 165, 201, 0.15), rgba(7, 165, 201, 0.05));
		border-bottom: 1px solid rgba(7, 165, 201, 0.15);
		padding: 0.85rem 1.25rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-shrink: 0;
	}

	.panel-body {
		flex: 1;
		overflow-y: auto;
		padding: 1.25rem;
	}

	.panel-body::-webkit-scrollbar {
		width: 4px;
	}

	.panel-body::-webkit-scrollbar-track {
		background: transparent;
	}

	.panel-body::-webkit-scrollbar-thumb {
		background: #27272a;
		border-radius: 2px;
	}

	.panel-body::-webkit-scrollbar-thumb:hover {
		background: #3f3f46;
	}

	/* Hidden when minimized — preserves component state */
	.help-hidden {
		display: none !important;
	}

	/* ── Image Lightbox ─────────────────────────────────────────────────────── */
	.image-lightbox-overlay {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background: rgba(0, 0, 0, 0.92);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		cursor: pointer;
	}

	.image-lightbox-content {
		position: relative;
		max-width: 90vw;
		max-height: 90vh;
		cursor: default;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.image-lightbox-img {
		max-width: 100%;
		max-height: 85vh;
		object-fit: contain;
		border-radius: 8px;
		box-shadow: 0 0 60px rgba(0, 0, 0, 0.6);
		border: 1px solid rgba(7, 165, 201, 0.2);
	}

	.image-lightbox-close {
		position: absolute;
		top: -2.5rem;
		right: 0;
		background: rgba(15, 23, 42, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: #fff;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.image-lightbox-close:hover {
		background: rgba(7, 165, 201, 0.2);
		border-color: rgba(7, 165, 201, 0.4);
	}
</style>
