<script lang="ts">
  import { onMount } from "svelte";

  let { session }: { session: any } = $props();

  const terminalLines = [
    { text: "$ npm install", type: "cmd" },
    { text: "added 847 packages in 4.2s", type: "out" },
    { text: "", type: "blank" },
    { text: "$ npm run dev", type: "cmd" },
    { text: "", type: "blank" },
    { text: "  ▲ Next.js 15.1.0", type: "out" },
    { text: "  - Local:   http://localhost:3000", type: "url" },
    { text: "  - Network: http://192.168.1.10:3000", type: "url" },
    { text: "", type: "blank" },
    { text: "  ✓ Starting...", type: "success" },
    { text: "  ✓ Ready in 1.3s", type: "success" },
    { text: "", type: "blank" },
    { text: "  ◈ XP +250  ·  SPRINT COMPLETE", type: "xp" },
  ];

  const stats = [
    { value: "500+", label: "ACTIVE DEVS" },
    { value: "12+",  label: "TECH STACKS" },
    { value: "50+",  label: "SCENARIOS" },
    { value: "4.9★", label: "USER RATING" },
  ];

  let visibleLines = $state(0);
  let cursorVisible = $state(true);

  onMount(() => {
    let i = 0;
    const lineTimer = setInterval(() => {
      if (i <= terminalLines.length) { visibleLines = i; i++; }
      else clearInterval(lineTimer);
    }, 360);
    const cursorTimer = setInterval(() => { cursorVisible = !cursorVisible; }, 530);
    return () => { clearInterval(lineTimer); clearInterval(cursorTimer); };
  });
</script>

<section class="relative min-h-screen flex items-center pt-24 pb-20 px-6 overflow-hidden">

  <!-- Floating orbs -->
  <div class="absolute pointer-events-none orb-1"
    style="top:12%;left:-10%;width:600px;height:600px;background:rgba(7,165,201,0.10);border-radius:50%;filter:blur(150px);"></div>
  <div class="absolute pointer-events-none orb-2"
    style="bottom:8%;right:-8%;width:500px;height:500px;background:rgba(168,85,247,0.08);border-radius:50%;filter:blur(130px);"></div>
  <div class="absolute pointer-events-none orb-3"
    style="top:60%;left:40%;width:300px;height:300px;background:rgba(0,229,160,0.04);border-radius:50%;filter:blur(100px);"></div>

  <div class="relative z-10 max-w-7xl mx-auto w-full">
    <div class="grid lg:grid-cols-2 gap-16 items-center">

      <!-- ◈ Left: Hero text -->
      <div>
        <!-- Platform badge -->
        <div class="inline-flex items-center gap-2 mb-8 px-4 py-2 border border-[var(--card-border)] bg-[var(--accent-dim)]">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent)] dot-pulse"></span>
          <span class="font-label text-[0.65rem] tracking-[0.15em] text-[var(--accent)] uppercase">
            Interactive Simulation Platform · Est. 2026
          </span>
        </div>

        <!-- Headline -->
        <h1 class="font-heading font-bold leading-[1.02] mb-6" style="font-size: clamp(2.8rem, 5.5vw, 4.4rem);">
          <span class="block text-[var(--text-primary)] hero-reveal" style="animation-delay:0ms">MASTER</span>
          <span class="block hero-grad hero-reveal" style="animation-delay:80ms">FULL-STACK</span>
          <span class="block text-[var(--text-primary)] hero-reveal" style="animation-delay:160ms">DEVELOPMENT</span>
        </h1>

        <!-- Subtext -->
        <p class="text-[1rem] text-[var(--text-muted)] mb-10 max-w-xl leading-relaxed font-body hero-reveal"
          style="animation-delay:280ms">
          Learn through realistic, sprint-based project simulations that integrate
          frontend, backend, database, and authentication — the way real engineering teams work.
        </p>

        <!-- CTAs -->
        <div class="flex flex-wrap gap-4 hero-reveal" style="animation-delay:360ms">
          <a href={session ? "/dashboard" : "/pretest"} class="btn-cyber btn-cyber-solid group !text-sm !py-3 !px-8">
            START SIMULATION
            <span class="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
          </a>
          <a href="#features" class="btn-cyber btn-cyber-outline !text-sm !py-3 !px-8">
            EXPLORE FEATURES
          </a>
        </div>

        <!-- Stats strip -->
        <div class="mt-4 pt-8 border-t border-[rgba(7,165,201,0.10)] flex flex-wrap gap-8 hero-reveal"
          style="animation-delay:480ms">
          {#each stats as s}
            <div>
              <div class="font-heading text-[1.6rem] font-bold text-[var(--accent)]">{s.value}</div>
              <div class="font-label text-[0.6rem] tracking-widest text-[var(--text-muted)] mt-0.5">{s.label}</div>
            </div>
          {/each}
        </div>
      </div>

      <!-- ◈ Right: Terminal widget (redesigned — no macOS dots) -->
      <div class="hidden lg:block">
        <div class="term-float">
          <div class="relative overflow-hidden"
            style="background:#05070F; border:1px solid rgba(7,165,201,0.28); border-radius:4px;
                   box-shadow: 0 0 60px rgba(7,165,201,0.12), 0 24px 60px rgba(0,0,0,0.5);">

            <!-- Top accent shimmer -->
            <div class="absolute top-0 left-0 right-0 h-px"
              style="background: linear-gradient(90deg, transparent, var(--accent), transparent);"></div>

            <!-- Shell-style header bar (no macOS dots) -->
            <div class="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(7,165,201,0.10)]"
              style="background: rgba(7,165,201,0.03);">
              <div class="flex items-center gap-2.5">
                <!-- Accent bar instead of traffic-light dots -->
                <div class="w-0.5 h-4 bg-[var(--accent)] opacity-80 flex-shrink-0 rounded-full"></div>
                <span class="font-label text-[0.6rem] tracking-wide">
                  <span class="text-[var(--success)]">devsim@workspace</span><span
                    class="text-[var(--text-muted)]">:</span><span
                    class="text-[var(--accent)]">~/projects/nextjs-app</span><span
                    class="text-[var(--text-muted)]"> ⎇ main</span>
                </span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[var(--success)] dot-pulse"></span>
                <span class="font-label text-[0.52rem] tracking-widest text-[var(--success)]">LIVE</span>
              </div>
            </div>

            <!-- Terminal output -->
            <div class="p-5 min-h-[300px] font-label text-[0.72rem] leading-[1.75]">
              {#each terminalLines.slice(0, visibleLines) as line}
                <div class="term-line
                  {line.type === 'cmd'     ? 'text-[var(--success)]'     :
                   line.type === 'success' ? 'text-[var(--accent)]'      :
                   line.type === 'url'     ? 'text-[var(--cyan-bright)]' :
                   line.type === 'xp'     ? 'text-[var(--warn)] font-bold' :
                                            'text-[var(--text-muted)]'}">
                  {line.text || "\u00A0"}
                </div>
              {/each}
              {#if visibleLines <= terminalLines.length}
                <span class="text-[var(--accent)]"
                  style="opacity:{cursorVisible ? 1 : 0}; transition: opacity 0.05s;">█</span>
              {/if}
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Scroll cue -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 scroll-cue pointer-events-none">
    <span class="font-label text-[0.55rem] tracking-[0.4em] text-[var(--text-muted)]">SCROLL</span>
    <div class="w-px h-8 bg-gradient-to-b from-[var(--accent)] to-transparent"></div>
  </div>

</section>

<style>
  .hero-grad {
    background: linear-gradient(90deg, #ffffff 0%, var(--accent) 45%, var(--cyan-bright) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @keyframes heroReveal {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .hero-reveal { animation: heroReveal 0.55s ease both; opacity: 0; }

  @keyframes orb1 { from { transform: translate(0,0); } to { transform: translate(28px,22px); } }
  @keyframes orb2 { from { transform: translate(0,0); } to { transform: translate(-22px,28px); } }
  @keyframes orb3 { from { transform: translate(0,0); } to { transform: translate(18px,-20px); } }
  .orb-1 { animation: orb1 9s ease-in-out infinite alternate; }
  .orb-2 { animation: orb2 11s ease-in-out infinite alternate; }
  .orb-3 { animation: orb3 13s ease-in-out infinite alternate; }

  @keyframes termFloat { from { transform: translateY(0); } to { transform: translateY(-14px); } }
  .term-float { animation: termFloat 7s ease-in-out infinite alternate; }

  @keyframes termLineIn {
    from { opacity: 0; transform: translateX(-4px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .term-line { animation: termLineIn 0.15s ease forwards; }

  @keyframes scrollCue {
    0%, 100% { opacity: 0.7;  transform: translateX(-50%) translateY(0); }
    50%       { opacity: 0.25; transform: translateX(-50%) translateY(10px); }
  }
  .scroll-cue { animation: scrollCue 2.5s ease-in-out infinite; }

  @keyframes pulseDot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.35; transform: scale(0.7); }
  }
  .dot-pulse { animation: pulseDot 2s ease-in-out infinite; display: inline-block; }
</style>
