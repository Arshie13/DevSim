<script lang="ts">
  import { page } from "$app/state";
  import type { LandingStats } from "$types";
  import LandingNav from "$components/landing/LandingNav.svelte";
  import HeroSection from "$components/landing/HeroSection.svelte";
  import About from "$components/landing/About.svelte";
  import Features from "$components/landing/Features.svelte";
  import HowItWorks from "$components/landing/HowItWorks.svelte";
  import TechMarquee from "$components/landing/TechMarquee.svelte";
  import Faq from "$components/landing/Faq.svelte";
  import LandingCta       from "$components/landing/LandingCta.svelte";

  interface LandingPageData {
    landingStats: LandingStats;
  }
  let { data }: { data: LandingPageData } = $props();
  const session = $state(page.data.session);
</script>

<svelte:head>
  <title>DevSim — Master Full-Stack Development</title>
</svelte:head>

<div
  class="min-h-screen bg-obsidian-bg text-[var(--text-primary)] antialiased bg-grid-cyber scanlines ambient-glow overflow-x-hidden"
>
  <LandingNav {session} />
  <HeroSection {session} stats={data.landingStats} />
  <About />
  <Features />
  <HowItWorks />
  <TechMarquee />
  <Faq />
  <LandingCta {session} />
</div>
