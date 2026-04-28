<script lang="ts">
  const items = [
    { label: "PROJECT-BASED", desc: "Every session is a real scenario — no random exercises or isolated theory modules." },
    { label: "MULTI-STACK",   desc: "Explore multiple stacks to practice and improve your web development skills" },
    { label: "XP SYSTEM",     desc: "Earn XP, unlock achievements, and track growth across every sprint you complete." },
  ];
</script>

<section id="about" class="py-24 px-6 border-t border-[rgba(7,165,201,0.05)]">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-16">
      <span class="tag-cyber tag-cyan inline-block mb-5">// ABOUT</span>
      <h2 class="font-heading font-bold text-[1.8rem] md:text-[2.6rem] mb-4">
        LEARNING BY <span class="text-[var(--accent)]">DOING.</span>
      </h2>
      <p class="text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed font-body">
        DevSim empowers aspiring developers with the skills to succeed in the real world —
        through sprint simulations that integrate all aspects of full-stack development.
      </p>
    </div>

    <div class="grid sm:grid-cols-3 gap-4">
      {#each items as item}
        <div class="card-cyber p-6">
          <div class="font-heading text-[var(--accent)] text-[0.7rem] tracking-widest font-bold mb-3 flex items-center gap-2">
            <span>◈</span>
            <span>{item.label}</span>
          </div>
          <p class="text-[0.85rem] text-[var(--text-muted)] leading-relaxed font-body">{item.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
