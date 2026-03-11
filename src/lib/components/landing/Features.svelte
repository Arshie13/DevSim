<script lang="ts">
  const features = [
    {
      num: "01", title: "Integrated Systems",
      desc: "Master how frontend, backend, database, and authentication form cohesive, production-grade architectures — not isolated tutorials.",
      tag: "CORE SKILL", tagClass: "tag-cyan", accentVar: "var(--accent)",
    },
    {
      num: "02", title: "Sprint Simulations",
      desc: "Work on role-based scenarios with real deadlines, task boards, and XP rewards — engineered to replicate actual dev team workflows.",
      tag: "FEATURED", tagClass: "tag-warn", accentVar: "var(--warn)",
    },
    {
      num: "03", title: "AI Code Mentor",
      desc: "Get contextual, non-spoiler guidance from your AI mentor who shapes your thinking without giving away the answer.",
      tag: "AI POWERED", tagClass: "tag-purple", accentVar: "var(--purple)",
    },
  ];
</script>

<section id="features" class="py-24 px-6 border-t border-[rgba(7,165,201,0.05)]">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <span class="tag-cyber tag-cyan inline-block mb-5">// FEATURES</span>
      <h2 class="font-heading font-bold text-[1.8rem] md:text-[2.6rem] mb-4">WHY CHOOSE DEVSIM</h2>
      <p class="text-[var(--text-muted)] font-body">
        Everything you need to become job-ready as a modern full-stack developer
      </p>
    </div>

    <div class="grid md:grid-cols-3 gap-4">
      {#each features as f, i}
        <div
          class="card-cyber p-8 flex flex-col feat-card"
          style="animation-delay: {i * 130}ms;"
        >
          <div
            class="font-heading text-[2.5rem] font-bold opacity-20 mb-5 leading-none"
            style="color: {f.accentVar};"
          >{f.num}</div>
          <span class="tag-cyber {f.tagClass} mb-4 w-fit">{f.tag}</span>
          <h3 class="font-heading font-bold text-[0.95rem] text-[var(--text-primary)] mb-3">{f.title}</h3>
          <p class="text-[0.875rem] text-[var(--text-muted)] leading-relaxed flex-1 font-body">{f.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  @keyframes featIn {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .feat-card {
    animation: featIn 0.5s ease both;
    opacity: 0;
  }
</style>
