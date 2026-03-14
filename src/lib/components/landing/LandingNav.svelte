<script lang="ts">
  import { onMount } from "svelte";

  let { session }: { session: any } = $props();

  const navLinks = [
    { href: "#about",        label: "ABOUT",        id: "about" },
    { href: "#features",     label: "FEATURES",     id: "features" },
    { href: "#how-it-works", label: "HOW IT WORKS", id: "how-it-works" },
    { href: "#faq",          label: "FAQ",           id: "faq" },
  ];

  let activeSection = $state("");

  onMount(() => {
    const els = navLinks
      .map(l => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) activeSection = entry.target.id;
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );

    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  });
</script>

<nav
  class="fixed top-0 left-0 w-full z-50 border-b border-[var(--card-border)]"
  style="background: rgba(10,14,26,0.90); backdrop-filter: blur(18px);"
>
  <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-8">

    <!-- Logo + tagline -->
    <a href="/" class="flex-shrink-0 group">
      <div class="nav-logo font-heading text-xl font-bold tracking-widest leading-none">DEVSIM</div>
    </a>

    <!-- Center nav links -->
    <ul class="hidden md:flex items-center gap-8 flex-1 justify-center">
      {#each navLinks as link}
        <li class="relative pb-1">
          <a
            href={link.href}
            class="font-label text-[0.68rem] tracking-widest transition-colors duration-200
              {activeSection === link.id
                ? 'text-[var(--accent)]'
                : 'text-[var(--text-muted)] hover:text-[var(--accent)]'}"
          >{link.label}</a>
          {#if activeSection === link.id}
            <span class="active-bar absolute bottom-0 left-0 right-0 h-px bg-[var(--accent)]"></span>
          {/if}
        </li>
      {/each}
    </ul>

    <!-- CTA -->
    {#if !session}
      <a href="/login" class="btn-cyber btn-cyber-solid flex-shrink-0">GET STARTED</a>
    {:else}
      <a href="/dashboard" class="btn-cyber btn-cyber-solid flex-shrink-0">DASHBOARD →</a>
    {/if}

  </div>
</nav>

<style>
  .nav-logo {
    background: linear-gradient(90deg, #fff 0%, var(--accent) 50%, var(--cyan-bright) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @keyframes activeBar {
    from { transform: scaleX(0); transform-origin: left; }
    to   { transform: scaleX(1); transform-origin: left; }
  }

  .active-bar {
    animation: activeBar 0.25s ease forwards;
    transform-origin: left;
  }
</style>
