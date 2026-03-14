<script lang="ts">
  const faqs = [
    {
      q: "What is DevSim?",
      a: "DevSim is an interactive project-based simulation platform that helps aspiring developers master full-stack web development through realistic, hands-on sprint projects.",
    },
    {
      q: "How is DevSim different from other learning platforms?",
      a: "Unlike platforms that teach technologies in isolation, DevSim focuses on integrated systems — how frontend, backend, database, and auth work together as real full-stack applications.",
    },
    {
      q: "Who is DevSim designed for?",
      a: "DevSim is built for aspiring and intermediate developers who want to move beyond tutorials and build actual project experience with modern, production-grade tech stacks.",
    },
    {
      q: "Is DevSim free to use?",
      a: "DevSim offers a free tier to get you started. Create an account to unlock all tech stack combinations, advanced scenarios, and the full AI mentor experience.",
    },
  ];
</script>

<section id="faq" class="py-24 px-6 border-t border-[rgba(7,165,201,0.05)]">
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-16">
      <span class="tag-cyber tag-cyan inline-block mb-5">// FAQ</span>
      <h2 class="font-heading font-bold text-[1.8rem] md:text-[2.6rem]">FREQUENTLY ASKED</h2>
    </div>

    <div class="space-y-3">
      {#each faqs as faq}
        <details class="card-cyber group">
          <summary class="px-6 py-5 cursor-pointer list-none flex justify-between items-center gap-4">
            <span class="font-heading font-bold text-[0.9rem] text-[var(--text-primary)]">{faq.q}</span>
            <span
              class="flex-shrink-0 w-6 h-6 border border-[var(--accent)] text-[var(--accent)] flex items-center justify-center text-sm group-open:rotate-45 transition-transform duration-200"
              style="clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px));"
            >+</span>
          </summary>
          <p
            class="px-6 pb-6 text-[0.875rem] text-[var(--text-muted)] leading-relaxed border-t border-[rgba(7,165,201,0.08)] pt-4 font-body faq-answer"
          >{faq.a}</p>
        </details>
      {/each}
    </div>
  </div>
</section>

<style>
  @keyframes faqOpen {
    from { opacity: 0; transform: translateY(-5px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  details[open] .faq-answer {
    animation: faqOpen 0.22s ease forwards;
  }
</style>
