<script lang="ts">
    import { signIn } from '@auth/sveltekit/client';
</script>

<section
	class="min-h-screen flex items-center justify-center text-zinc-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 relative overflow-hidden"
	style="font-family: 'Poppins', 'Segoe UI', Roboto, system-ui, -apple-system, 'Helvetica Neue', Arial;"
>
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div
			class="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
		>
		</div>
		<div
			class="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
			style="animation-delay: 1s;"
		>
		</div>
	</div>

	<div class="w-full flex justify-center px-4 relative z-10">
		<div
			class="relative bg-slate-900/90 backdrop-blur-md p-12 rounded-2xl shadow-2xl border border-zinc-700/50"
			style="width: 32rem; max-width: 100%;"
		>
			<div class="flex justify-center mb-8">
				<img
					src="/images/DevSim.svg"
					alt="DevSim logo"
					class="h-80 w-auto max-h-80 object-contain"
				/>
			</div>

			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold mb-2">
					Welcome to <span
						class="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
						>DevSim</span
					>
				</h1>
				<p class="text-zinc-400">Sign up to start your learning journey!</p>
			</div>

			<div class="mt-6">
			<button
				onclick={() => signIn("google", { redirectTo: "/pretest" })}
				type="button"
				class="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-lg font-semibold shadow-lg shadow-blue-500/25 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30"
			>
				Sign up with Google
			</button>
			</div>
		</div>
	</div>
</section>

<style>
	@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap");

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.3;
		}
		50% {
			opacity: 0.6;
		}
	}

	.animate-pulse {
		animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
