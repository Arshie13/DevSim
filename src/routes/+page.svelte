<script>
	let features = [
		{ title: 'Integrated Systems', desc: 'Learn how frontend, backend, database, and authentication components work together as cohesive systems.' },
		{ title: 'Realistic Practice', desc: 'Engage in project-based simulations that mimic real-world scenarios to master full-stack development.' },
		{ title: 'Hands-on Learning', desc: 'Move beyond theory with interactive challenges that teach technologies in an integrated, practical way.' }
	];

	let currentFeature = 0;
	function nextFeature() {
		currentFeature = (currentFeature + 1) % features.length;
	}
	function prevFeature() {
		currentFeature = (currentFeature - 1 + features.length) % features.length;
	}
</script>

<section class="relative min-h-screen bg-slate-800 text-zinc-100 antialiased pt-20" style="font-family: 'Inter', 'Geist Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
	<nav class="fixed top-0 left-0 w-full bg-slate-900 border-b border-zinc-800 text-zinc-100 shadow-md z-50">
		<div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
			<div class="text-xl font-bold">DevSim</div>
			<ul class="flex items-center gap-6 text-sm">
				<li><a href="#" class="hover:text-zinc-400">Home</a></li>
				<li><a href="#about" class="hover:text-zinc-400">About Us</a></li>
				<li><a href="#features" class="hover:text-zinc-400">Features</a></li>
				<li><a href="#faq" class="hover:text-zinc-400">FAQ</a></li>
				<li><a href="/login" class="px-4 py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600">Sign Up</a></li>
				<li><a href="#login" class="px-4 py-2 rounded-md bg-zinc-200 text-zinc-950 font-medium hover:brightness-105">Have an account?</a></li>
			</ul>
		</div>
	</nav>

	<div class="absolute inset-0 pointer-events-none overflow-hidden">
		<div class="absolute -left-40 -top-24 w-96 h-72 bg-gradient-to-r from-slate-800/40 to-zinc-800/10 blur-3xl transform -rotate-12 opacity-40"></div>
		<div class="absolute right-6 bottom-6 w-72 h-44 rounded-lg bg-slate-800/60 border border-zinc-800 transform rotate-6 opacity-30"></div>
	</div>

	<div class="relative max-w-6xl mx-auto px-6 py-16">
		<header class="text-center mb-16">
			<img src="/images/DevSim.svg" alt="DevSim Logo" class="mx-auto w-auto max-h-64">
			<p class="mt-4 text-zinc-400 max-w-3xl mx-auto text-lg">An interactive project-based simulation platform designed to help aspiring software developers master full-stack web development through realistic, hands-on practice.</p>
		</header>

		<section id="about" class="text-center py-12 bg-slate-900 rounded-lg border border-zinc-800 mb-16">
			<h2 class="text-3xl font-bold text-zinc-100">About Us</h2>
			<p class="mt-4 text-zinc-400 max-w-4xl mx-auto">At DevSim, we believe in learning by doing. Our mission is to empower aspiring developers with the skills they need to succeed in the real world by providing realistic, hands-on simulations that integrate all aspects of full-stack development.</p>
		</section>

		<section id="features" class="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
			{#each features as f}
				<article class="p-6 rounded-lg bg-slate-900 border border-zinc-800 hover:scale-[1.02] transition-transform duration-150">
					<h3 class="text-xl font-semibold text-zinc-100">{f.title}</h3>
					<p class="mt-3 text-zinc-400 text-sm">{f.desc}</p>
				</article>
			{/each}
		</section>


		<section id="faq" class="text-center py-12 bg-slate-900 rounded-lg border border-zinc-800 mb-16">
			<h2 class="text-3xl font-bold text-zinc-100">Frequently Asked Questions</h2>
			<div class="mt-8 text-left max-w-4xl mx-auto">
				<div class="mb-6">
					<h3 class="text-lg font-semibold text-zinc-100">What is DevSim?</h3>
					<p class="text-zinc-400">DevSim is an interactive project-based simulation platform designed to help aspiring software developers master full-stack web development through realistic, hands-on practice.</p>
				</div>
				<div class="mb-6">
					<h3 class="text-lg font-semibold text-zinc-100">How is DevSim different from other platforms?</h3>
					<p class="text-zinc-400">Unlike traditional learning platforms that teach technologies in isolation, DevSim focuses on teaching how frontend, backend, database, and authentication components work together as integrated systems.</p>
				</div>
				<div class="mb-6">
					<h3 class="text-lg font-semibold text-zinc-100">Who is DevSim for?</h3>
					<p class="text-zinc-400">DevSim is for aspiring software developers who want to learn how to build and integrate full-stack systems through hands-on simulations.</p>
				</div>
			</div>
		</section>

		<section class="text-center py-12 bg-slate-900 rounded-lg border border-zinc-800">
			<h2 class="text-3xl font-bold text-zinc-100">Ready to start learning different tech stacks?</h2>
			<p class="mt-4 text-zinc-400">Join DevSim today and start mastering full-stack development through hands-on simulations.</p>
			<div class="mt-6">
				<a href="/get-started" class="px-8 py-3 rounded-md bg-zinc-200 text-zinc-950 font-medium shadow hover:brightness-105 hover:scale-105 transition-transform">Get Started</a>
			</div>
		</section>
	</div>

	<footer class="bg-slate-900 text-zinc-400 py-6">
		<div class="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center">
			<p>&copy; 2026 DevSim. All rights reserved.</p>
			<ul class="flex items-center gap-4 text-sm">
				<li><a href="#" class="hover:text-zinc-100">Privacy Policy</a></li>
				<li><a href="#" class="hover:text-zinc-100">Terms of Service</a></li>
				<li><a href="#" class="hover:text-zinc-100">Contact</a></li>
			</ul>
		</div>
	</footer>
</section>

<style>
	:global(.logo) {
		letter-spacing: -0.02em;
	}
	:global(.btn-accent) {
		box-shadow: 0 8px 30px rgba(228, 228, 231, 0.06);
	}
	:global(.glow) {
		box-shadow: inset 0 1px 0 rgba(39, 39, 42, 0.12), 0 6px 30px rgba(2, 6, 23, 0.6);
	}
	@media (max-width: 520px) {
		:global(.logo) {
			font-size: 1.6rem;
		}
	}
</style>