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
    <p class="text-obsidian-text-muted font-label text-xs uppercase">No achievements found.</p>

  {:else if mode === "default"}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {#each flatSorted as achievement (achievement.id)}
        <AchievementCard {achievement} />
      {/each}
    </div>

  {:else}
    {#each grouped as group (group.category)}
      <div class="mb-8">
        <h3 class="font-label text-xs uppercase tracking-[0.1em] text-[var(--purple)] mb-2">{CATEGORY_LABEL[group.category]}</h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {#each group.items as achievement (achievement.id)}
            <AchievementCard {achievement} />
          {/each}
        </div>
      </div>
    {/each}
  {/if}
</section>
