<script lang="ts">
  const badges = [
    "React", "Next.js", "NestJS", "Express",
    "PostgreSQL", "MongoDB", "Prisma", "shadcn/ui",
  ];
  const tripled = [...badges, ...badges, ...badges];
</script>

<div class="py-10 overflow-hidden border-y border-[rgba(7,165,201,0.07)]">
  <div class="marquee flex items-center gap-5">
    {#each tripled as badge}
      <span class="tag-cyber tag-cyan whitespace-nowrap flex-shrink-0 cursor-default">{badge}</span>
    {/each}
  </div>
</div>

<style>
  @keyframes marqueeScroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-33.333%); }
  }
  .marquee {
    animation: marqueeScroll 30s linear infinite;
    width: max-content;
    will-change: transform;
  }
  .marquee:hover { animation-play-state: paused; }
</style>
