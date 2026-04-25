<!--
  AchievementsSection.svelte — Grid of achievement families.
  mode="default"  → flat list sorted by completion rank (no category headers)
  mode="category" → grouped by category, sorted within each group by rank
-->
<script lang="ts">
  import type { AchievementCategory, AchievementView } from "$types";
  import AchievementCard from "./AchievementCard.svelte";

  export let achievements: AchievementView[] = [];
  export let mode: "default" | "category" = "category";

  const CATEGORY_ORDER: AchievementCategory[] = ["progress", "exploration", "consistency", "mastery"];
  const CATEGORY_LABEL: Record<AchievementCategory, string> = {
    progress:    "Progress",
    exploration: "Exploration",
    consistency: "Consistency",
    mastery:     "Mastery",
  };

  // Rank 0 = completed, 1 = amateur in-progress, 2 = rookie in-progress, 3 = not started
  function completionRank(a: AchievementView): number {
    if (a.tiers.length > 0 && a.tiers.every((t) => t.unlocked)) return 0;
    const unlocked = a.tiers.filter((t) => t.unlocked);
    if (unlocked.length === 0) return 3;
    const highest = unlocked[unlocked.length - 1].tier;
    return highest === "AMATEUR" ? 1 : 2;
  }

  // Flat sorted list for "default" mode
  $: flatSorted = [...achievements].sort((a, b) => completionRank(a) - completionRank(b));

  // Grouped list for "category" mode
  $: grouped = CATEGORY_ORDER
    .map((cat) => ({
      category: cat,
      items: achievements
        .filter((a) => a.category === cat)
        .sort((a, b) => completionRank(a) - completionRank(b)),
    }))
    .filter((g) => g.items.length > 0);
</script>

<section class="achievements-section">
  {#if achievements.length === 0}
    <p class="text-obsidian-text-primary/50 text-xs font-mono">No achievements found.</p>

  {:else if mode === "default"}
    <div class="card-grid">
      {#each flatSorted as achievement (achievement.id)}
        <AchievementCard {achievement} />
      {/each}
    </div>

  {:else}
    {#each grouped as group (group.category)}
      <div class="category-block">
        <h3 class="category-heading">{CATEGORY_LABEL[group.category]}</h3>
        <div class="card-grid">
          {#each group.items as achievement (achievement.id)}
            <AchievementCard {achievement} />
          {/each}
        </div>
      </div>
    {/each}
  {/if}
</section>

<style>
  .category-block {
    margin-bottom: 1.25rem;
  }
  .category-heading {
    font-family: "Space Mono", monospace;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #A855F7;
    margin-bottom: 0.5rem;
  }
  .card-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  @media (min-width: 1024px) {
    .card-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
