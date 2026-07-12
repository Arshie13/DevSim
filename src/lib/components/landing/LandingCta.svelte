<script lang="ts">
  import Logo from "$components/ui/Logo.svelte";

  let { session }: { session: any } = $props();
</script>

<!-- ◈ CTA -->
<section class="py-24 px-6 border-t border-[rgba(7,165,201,0.05)]">
  <div class="max-w-4xl mx-auto">
    <div class="card-cyber p-12 text-center relative overflow-hidden">
      <!-- Radial bg wash -->
      <div class="absolute inset-0 pointer-events-none"
        style="background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(7,165,201,0.06) 0%, transparent 70%);"></div>
      <!-- Top shimmer line -->
      <div class="absolute top-0 left-0 right-0 h-px"
        style="background: linear-gradient(90deg, transparent, var(--accent), transparent);"></div>
      <!-- Corner brackets -->
      <div class="absolute top-5 right-5 w-7 h-7 border-t-2 border-r-2 border-[var(--accent)] opacity-40"></div>
      <div class="absolute bottom-5 left-5 w-7 h-7 border-b-2 border-l-2 border-[var(--accent)] opacity-40"></div>

      <div class="relative z-10">
        <span class="tag-cyber tag-cyan inline-block mb-6">// START NOW</span>
        <h2 class="font-heading font-bold text-[1.8rem] md:text-[2.8rem] text-[var(--text-primary)] mb-4">
          READY TO BUILD<br />REAL SYSTEMS?
        </h2>
        <p class="text-[var(--text-muted)] mb-10 max-w-xl mx-auto leading-relaxed font-body">
          Join hundreds of developers mastering full-stack development through
          hands-on sprint simulations.
        </p>
        <a
          href={session ? "/dashboard" : "/login"}
          class="btn-cyber btn-cyber-solid !text-sm !py-4 !px-12"
        >
          {session ? "GO TO DASHBOARD →" : "GET STARTED FREE →"}
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ◈ Footer -->
<footer class="border-t border-[rgba(7,165,201,0.08)] py-12 px-6">
  <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
    <a href="/" class="flex-shrink-0">
      <Logo markClass="w-7 h-7" textClass="text-xl" />
    </a>
    <p class="font-label text-[0.65rem] tracking-widest text-[var(--text-muted)]">
      &copy; 2026 DEVSIM. ALL RIGHTS RESERVED.
    </p>
    <ul class="flex gap-8">
      {#each [["#", "PRIVACY"], ["#", "TERMS"], ["#", "CONTACT"]] as [href, label]}
        <li>
          <a
            {href}
            class="font-label text-[0.65rem] tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >{label}</a>
        </li>
      {/each}
    </ul>
  </div>
</footer>
