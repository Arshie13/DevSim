<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import Logo from '$components/ui/Logo.svelte';
	import Scrollbar from '$lib/components/ui/Scrollbar.svelte';

	let showTerms = false;
	let acceptedTerms = false;

	function openTermsScreen() {
		showTerms = true;
		acceptedTerms = false;
	}

	function closeTermsScreen() {
		showTerms = false;
		acceptedTerms = false;
	}

	function continueWithGoogle() {
		if (!acceptedTerms) return;
		signIn('google', { redirectTo: '/dashboard' });
	}
</script>

<svelte:head>
	<title>Sign in | DevSim</title>
</svelte:head>

<section
	class="relative min-h-screen flex items-center justify-center overflow-hidden px-6 py-12
	       bg-obsidian-bg text-[var(--text-primary)] antialiased bg-grid-cyber scanlines ambient-glow"
>
	<!-- Floating orbs (mirrors the landing hero) -->
	<div
		class="absolute pointer-events-none orb-1"
		style="top:8%;left:-8%;width:520px;height:520px;background:rgba(7,165,201,0.10);border-radius:50%;filter:blur(150px);"
	></div>
	<div
		class="absolute pointer-events-none orb-2"
		style="bottom:6%;right:-8%;width:460px;height:460px;background:rgba(168,85,247,0.08);border-radius:50%;filter:blur(130px);"
	></div>

	<!-- Auth card -->
	<div class="relative z-10 w-full max-w-md card-cyber login-reveal">
		<div class="px-8 py-10 sm:px-10">
			<!-- Platform badge -->
			<div
				class="inline-flex items-center gap-2 mb-8 px-4 py-2 border border-[var(--card-border)] bg-[var(--accent-dim)]"
			>
				<span class="w-1.5 h-1.5 rounded-full bg-[var(--accent)] dot-pulse"></span>
				<span class="font-label text-[0.6rem] tracking-[0.15em] text-[var(--accent)] uppercase">
					Secure Access · DevSim
				</span>
			</div>

			<!-- Logo -->
			<div class="flex justify-center mb-8">
				<Logo stacked markClass="w-24 h-24" textClass="text-2xl" subtitle="Developer Simulation" />
			</div>

			<!-- Heading -->
			<div class="text-center mb-8">
				<h1 class="font-heading font-bold text-2xl leading-tight text-[var(--text-primary)]">
					Welcome, developer.
				</h1>
				<p class="mt-3 font-body text-sm text-[var(--text-muted)]">
					Sign up to start your learning journey.
				</p>
			</div>

			<!-- Google sign-in -->
			<button
				onclick={openTermsScreen}
				type="button"
				class="btn-cyber btn-cyber-solid group w-full !py-3.5 flex items-center justify-center gap-3"
			>
				<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
					<path
						d="M23.06 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h6.2a5.3 5.3 0 0 1-2.3 3.48v2.9h3.72c2.18-2 3.44-4.96 3.44-8.64z"
					/>
					<path
						d="M12 24c3.1 0 5.7-1.03 7.6-2.78l-3.72-2.9c-1.03.7-2.35 1.1-3.88 1.1-2.98 0-5.5-2.01-6.4-4.72H1.75v2.98A11.99 11.99 0 0 0 12 24z"
					/>
					<path d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6V7.13H1.75a12 12 0 0 0 0 10.55L5.6 14.7z" />
					<path
						d="M12 4.75c1.68 0 3.19.58 4.38 1.72l3.28-3.28C17.7 1.2 15.1 0 12 0 7.35 0 3.34 2.66 1.75 6.55l3.85 2.98C6.5 6.76 9.02 4.75 12 4.75z"
					/>
				</svg>
				Sign up with Google
				<span class="inline-block group-hover:translate-x-1 transition-transform duration-200">→</span>
			</button>

			<!-- Footer note -->
			<p class="mt-6 text-center font-label text-[0.6rem] tracking-widest text-[var(--text-muted)] uppercase">
				Interactive Simulation Platform
			</p>
		</div>
	</div>

	{#if showTerms}
		<div class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-sm sm:py-8">
			<div class="my-auto w-full max-w-lg rounded-2xl border border-[var(--card-border)] bg-[var(--bg-elevated)] p-6 shadow-2xl">
				<div class="flex items-start justify-between gap-4">
					<div>
						<p class="font-label text-[0.65rem] tracking-[0.18em] uppercase text-[var(--accent)]">
							Before you continue
						</p>
						<h2 class="mt-2 text-2xl font-heading font-bold text-[var(--text-primary)]">
							Terms & Conditions
						</h2>
					</div>
					<button
						type="button"
						onclick={closeTermsScreen}
						class="rounded-full border border-[var(--card-border)] px-3 py-1.5 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
					>
						Close
					</button>
				</div>

				<Scrollbar className="mt-5 max-h-[40vh] rounded-xl border border-[var(--card-border)] bg-[var(--bg-primary)] p-4 text-sm leading-7 text-[var(--text-muted)] sm:max-h-72">
					<p>
						By creating an account with DevSim, you agree to use the platform for educational and
						training purposes only. You are responsible for maintaining the security of your account,
						representing accurate information, and complying with all applicable laws and platform
						rules while using the simulation environment.
					</p>
					<p class="mt-4">
						Your activity, progress, and learning data may be stored and used to personalize the
						experience, track assessment outcomes, and support platform operations. We do not sell or
						share personal data outside of the services needed to operate DevSim and provide the
						educational experience.
					</p>
					<p class="mt-4">
						DevSim may update course content, features, and policy details over time. Continued use of
						the platform after changes are posted indicates your acceptance of those updates.
					</p>
				</Scrollbar>

				<label class="mt-5 flex items-start gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-primary)]">
					<input bind:checked={acceptedTerms} type="checkbox" class="mt-1 h-4 w-4 accent-[var(--accent)]" />
					<span>
						I agree to the DevSim Terms and Conditions and consent to creating an account.
					</span>
				</label>

				<div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
					<button type="button" onclick={closeTermsScreen} class="btn-cyber w-full sm:w-auto">
						Cancel
					</button>
					<button
						type="button"
						onclick={continueWithGoogle}
						disabled={!acceptedTerms}
						class="btn-cyber btn-cyber-solid w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-50"
					>
						Continue with Google
					</button>
				</div>
			</div>
		</div>
	{/if}
</section>

<style>
	@keyframes loginReveal {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.login-reveal {
		animation: loginReveal 0.55s ease both;
	}

	@keyframes orb1 {
		from {
			transform: translate(0, 0);
		}
		to {
			transform: translate(28px, 22px);
		}
	}
	@keyframes orb2 {
		from {
			transform: translate(0, 0);
		}
		to {
			transform: translate(-22px, 28px);
		}
	}
	.orb-1 {
		animation: orb1 9s ease-in-out infinite alternate;
	}
	.orb-2 {
		animation: orb2 11s ease-in-out infinite alternate;
	}

	@keyframes pulseDot {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.35;
			transform: scale(0.7);
		}
	}
	.dot-pulse {
		animation: pulseDot 2s ease-in-out infinite;
		display: inline-block;
	}
</style>
