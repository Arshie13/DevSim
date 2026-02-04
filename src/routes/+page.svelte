<script lang="ts">
	import { signIn, signOut } from "@auth/sveltekit/client";
	import { page } from "$app/state";

	const session = $state(page.data.session);

	let features = [
		{
			title: "Integrated Systems",
			desc: "Learn how frontend, backend, database, and authentication components work together as cohesive systems.",
			icon: "🔗",
		},
		{
			title: "Realistic Practice",
			desc: "Engage in project-based simulations that mimic real-world scenarios to master full-stack development.",
			icon: "💼",
		},
		{
			title: "Hands-on Learning",
			desc: "Move beyond theory with interactive challenges that teach technologies in an integrated, practical way.",
			icon: "⚡",
		},
	];
</script>

<section
	class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-zinc-100 antialiased"
	style="font-family: 'Poppins', 'Segoe UI', Roboto, system-ui, -apple-system, 'Helvetica Neue', Arial;"
>
	<nav
		class="fixed top-0 left-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-zinc-700/50 z-50"
	>
		<div class="max-w-7xl mx-auto px-6 py-4">
			<div class="flex justify-between items-center">
				<div
					class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
				>
					DevSim
				</div>
				<div class="flex items-center gap-8">
					<ul class="hidden md:flex items-center gap-8 text-sm font-medium">
						<li>
							<a href="/" class="hover:text-blue-400 transition-colors">Home</a>
						</li>
						<li>
							<a href="#about" class="hover:text-blue-400 transition-colors"
								>About</a
							>
						</li>
						<li>
							<a href="#features" class="hover:text-blue-400 transition-colors"
								>Features</a
							>
						</li>
						<li>
							<a href="#faq" class="hover:text-blue-400 transition-colors"
								>FAQ</a
							>
						</li>
					</ul>
					<div class="flex items-center gap-3">
						{#if !session}
							<a
								href="/login"
								class="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
							>
								Get Started
							</a>
						{:else}
							<a
								href="/dashboard"
								class="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
							>
								Go to Dashboard
							</a>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</nav>

	<section class="relative pt-32 pb-20 px-6 overflow-hidden">
		<div class="absolute inset-0 overflow-hidden pointer-events-none">
			<div
				class="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
			></div>
			<div
				class="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
				style="animation-delay: 1s;"
			></div>
		</div>

		<div class="relative max-w-7xl mx-auto">
			<div class="text-center max-w-4xl mx-auto">
				<div
					class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8"
				>
					<span class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
					Interactive Web Development Platform
				</div>

				<h1
					class="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
				>
					Master <span
						class="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent"
						>Full-Stack</span
					><br />
					Development
				</h1>

				<p
					class="text-xl md:text-2xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed"
				>
					Learn through realistic, hands-on simulations that integrate frontend,
					backend, and database technologies
				</p>

				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<a
						href="/get-started"
						class="group px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-lg shadow-xl shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40"
					>
						Start Learning Free
						<span
							class="inline-block ml-2 group-hover:translate-x-1 transition-transform"
							>→</span
						>
					</a>
					<a
						href="#features"
						class="px-8 py-4 rounded-xl bg-slate-800 border border-zinc-700 hover:border-zinc-600 text-white font-semibold text-lg transition-all hover:bg-slate-700"
					>
						Explore Features
					</a>
				</div>
			</div>
		</div>
	</section>

	<section id="about" class="py-24 px-6 bg-slate-800/50">
		<div class="max-w-5xl mx-auto text-center">
			<h2 class="text-4xl md:text-5xl font-bold mb-6">
				Learning by <span
					class="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
					>Doing</span
				>
			</h2>
			<p class="text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto">
				DevSim empowers aspiring developers with the skills they need to succeed
				in the real world. Our realistic, hands-on simulations integrate all
				aspects of full-stack development, preparing you for actual software
				engineering challenges.
			</p>
		</div>
	</section>

	<section id="features" class="py-24 px-6">
		<div class="max-w-7xl mx-auto">
			<div class="text-center mb-16">
				<h2 class="text-4xl md:text-5xl font-bold mb-4">Why Choose DevSim</h2>
				<p class="text-xl text-zinc-400">
					Everything you need to become a full-stack developer
				</p>
			</div>

			<div class="grid md:grid-cols-3 gap-6">
				{#each features as feature}
					<div
						class="group p-8 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-zinc-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
					>
						<div class="text-5xl mb-4">{feature.icon}</div>
						<h3
							class="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors"
						>
							{feature.title}
						</h3>
						<p class="text-zinc-400 leading-relaxed">
							{feature.desc}
						</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section id="faq" class="py-24 px-6 bg-slate-800/50">
		<div class="max-w-4xl mx-auto">
			<h2 class="text-4xl md:text-5xl font-bold text-center mb-16">
				Frequently Asked Questions
			</h2>

			<div class="space-y-4">
				<details
					class="group p-6 rounded-xl bg-slate-900 border border-zinc-700 hover:border-zinc-600 transition-colors"
				>
					<summary
						class="text-xl font-semibold cursor-pointer list-none flex justify-between items-center"
					>
						What is DevSim?
						<span
							class="text-zinc-500 group-open:rotate-180 transition-transform"
							>▼</span
						>
					</summary>
					<p class="mt-4 text-zinc-400 leading-relaxed">
						DevSim is an interactive project-based simulation platform designed
						to help aspiring software developers master full-stack web
						development through realistic, hands-on practice.
					</p>
				</details>

				<details
					class="group p-6 rounded-xl bg-slate-900 border border-zinc-700 hover:border-zinc-600 transition-colors"
				>
					<summary
						class="text-xl font-semibold cursor-pointer list-none flex justify-between items-center"
					>
						How is DevSim different from other platforms?
						<span
							class="text-zinc-500 group-open:rotate-180 transition-transform"
							>▼</span
						>
					</summary>
					<p class="mt-4 text-zinc-400 leading-relaxed">
						Unlike traditional learning platforms that teach technologies in
						isolation, DevSim focuses on teaching how frontend, backend,
						database, and authentication components work together as integrated
						systems.
					</p>
				</details>

				<details
					class="group p-6 rounded-xl bg-slate-900 border border-zinc-700 hover:border-zinc-600 transition-colors"
				>
					<summary
						class="text-xl font-semibold cursor-pointer list-none flex justify-between items-center"
					>
						Who is DevSim for?
						<span
							class="text-zinc-500 group-open:rotate-180 transition-transform"
							>▼</span
						>
					</summary>
					<p class="mt-4 text-zinc-400 leading-relaxed">
						DevSim is for aspiring software developers who want to learn how to
						build and integrate full-stack systems through hands-on simulations.
					</p>
				</details>
			</div>
		</div>
	</section>

	<section class="py-24 px-6">
		<div class="max-w-4xl mx-auto">
			<div
				class="relative p-12 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 overflow-hidden"
			>
				<div
					class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20"
				></div>

				<div class="relative text-center">
					<h2 class="text-4xl md:text-5xl font-bold text-white mb-4">
						Ready to Start Building?
					</h2>
					<p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
						Join thousands of developers mastering full-stack development
						through hands-on simulations
					</p>
					<a
						href="/get-started"
						class="inline-block px-10 py-4 rounded-xl bg-white text-blue-600 font-bold text-lg shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
					>
						Get Started Now
					</a>
				</div>
			</div>
		</div>
	</section>

	<footer class="border-t border-zinc-800 bg-slate-900 py-12 px-6">
		<div class="max-w-7xl mx-auto">
			<div class="flex flex-col md:flex-row justify-between items-center gap-6">
				<div
					class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
				>
					DevSim
				</div>
				<p class="text-zinc-500">&copy; 2026 DevSim. All rights reserved.</p>
				<ul class="flex gap-8 text-sm text-zinc-400">
					<li>
						<a href="/" class="hover:text-white transition-colors"
							>Privacy Policy</a
						>
					</li>
					<li>
						<a href="/" class="hover:text-white transition-colors"
							>Terms of Service</a
						>
					</li>
					<li>
						<a href="/" class="hover:text-white transition-colors">Contact</a>
					</li>
				</ul>
			</div>
		</div>
	</footer>
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
