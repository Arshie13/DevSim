<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import Logo from '$components/ui/Logo.svelte';
	import Scrollbar from '$lib/components/ui/Scrollbar.svelte';

	let showTermsDetails = false;

	function continueWithGoogle() {
		signIn('google', { redirectTo: '/auth' });
	}

	function openTermsDetails() {
		showTermsDetails = true;
	}

	function closeTermsDetails() {
		showTermsDetails = false;
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

			<div class="mb-4 rounded-xl border border-[var(--card-border)] bg-[var(--bg-primary)] p-3 text-center text-xs leading-5 text-[var(--text-muted)]">
				<p>
					By signing in, you hereby agree to our
					<button
						type="button"
						class="font-semibold text-[var(--accent)] underline decoration-[var(--accent)] underline-offset-2 transition hover:text-[var(--accent-hover)]"
						onclick={openTermsDetails}
					>
						Terms and Conditions
					</button>.
				</p>
			</div>

			<!-- Google sign-in -->
			<button
				onclick={continueWithGoogle}
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

	{#if showTermsDetails}
		<div class="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-sm sm:py-8">
			<div class="my-auto w-full max-w-xl rounded-2xl border border-[var(--card-border)] bg-[var(--bg-elevated)] p-6 shadow-2xl">
				<div class="flex items-start justify-between gap-4">
					<div>
						<p class="font-label text-[0.65rem] tracking-[0.18em] uppercase text-[var(--accent)]">
							DevSim
						</p>
						<h3 class="mt-2 text-xl font-heading font-bold text-[var(--text-primary)]">
							Terms and Conditions
						</h3>
					</div>
					<button
						type="button"
						onclick={closeTermsDetails}
						class="rounded-full border border-[var(--card-border)] px-3 py-1.5 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
					>
						Close
					</button>
				</div>

				<div class="mt-5 max-h-[60vh] space-y-4 overflow-y-auto pr-1 text-sm leading-6 text-[var(--text-muted)]">
					<p>By signing in, you agree to use DevSim responsibly and to comply with all applicable laws and platform rules.</p>
					<p>DevSim provides educational simulation tools and may update content, features, and policies over time. Your account, activity, and progress data may be used to personalize the learning experience and support product operations.</p>
					<p>You are responsible for your account security, the accuracy of the information you provide, and any actions taken in the platform. Misuse, abuse, or unauthorized access may result in restricted access or account actions.</p>
					<p>We may collect usage and account information to maintain security, improve functionality, and support the service. By continuing, you acknowledge that these terms govern your use of DevSim.</p>
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
