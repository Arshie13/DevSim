<script lang="ts">
  const steps = [
    { num: "01", title: "Choose Your Stack",     desc: "Select frontend, backend, database and service technologies to compose your full-stack combination." },
    { num: "02", title: "Receive Your Mission",  desc: "Get assigned a realistic scenario: company role, project brief, sprint backlog, and a deadline." },
    { num: "03", title: "Build & Ship",          desc: "Code in the integrated browser IDE with terminal, live preview, and contextual AI hints — zero setup." },
    { num: "04", title: "Earn XP & Level Up",    desc: "Submit sprints to earn XP, unlock achievements, and rise on the global developer leaderboard." },
  ];
</script>

<section id="how-it-works" class="py-24 px-6 border-t border-[rgba(7,165,201,0.05)]">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-16">
      <span class="tag-cyber tag-cyan inline-block mb-5">// HOW IT WORKS</span>
      <h2 class="font-heading font-bold text-[1.8rem] md:text-[2.6rem]">
        FROM ZERO TO SPRINT IN FOUR STEPS
      </h2>
    </div>

    <div class="grid sm:grid-cols-2 gap-4">
      {#each steps as step}
        <div class="card-cyber p-6 flex gap-5 items-start">
          <div
            class="font-heading text-[2.4rem] font-bold text-[var(--accent)] opacity-20 leading-none flex-shrink-0 select-none"
          >{step.num}</div>
          <div>
            <h3 class="font-heading font-bold text-[0.9rem] text-[var(--text-primary)] mb-2">{step.title}</h3>
            <p class="text-[0.825rem] text-[var(--text-muted)] leading-relaxed font-body">{step.desc}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
