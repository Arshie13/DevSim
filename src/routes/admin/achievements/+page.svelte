<!--
  Admin → Achievements.

  Read-only by design: the achievement catalog is code-defined (see
  `src/lib/server/achievements/definitions.ts`), so there is nothing to mutate at
  runtime. This page exists to make the current catalog, its reward constants, and
  its unlock criteria inspectable without opening the source.
-->
<script lang="ts">
  import { ChevronDown, ChevronRight, FileCode2 } from "lucide-svelte";

  interface Tier {
    tier: string;
    description: string;
    criteria: string;
    xpReward: number;
    coinReward: number;
  }

  interface Family {
    key: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    retired: boolean;
    tiers: Tier[];
  }

  export let data: { families: Family[]; totalTiers: number };

  let expanded: string | null = null;

  function toggle(key: string) {
    expanded = expanded === key ? null : key;
  }

  function getCategoryColor(cat: string) {
    const colors: Record<string, string> = {
      progress: "text-blue-400",
      exploration: "text-green-400",
      consistency: "text-orange-400",
      mastery: "text-purple-400",
    };
    return colors[cat] || "text-[var(--text-muted)]";
  }
</script>

<div class="p-6">
  <div class="mb-6">
    <h1 class="[font-family:var(--font-heading)] text-2xl font-medium text-[var(--text-primary)]">
      Achievement Catalog
    </h1>
    <p class="mt-1 [font-family:var(--font-mono)] text-sm text-[var(--text-muted)]">
      Read-only · {data.families.length} families · {data.totalTiers} tiers
    </p>
  </div>

  <div class="mb-4 flex items-start gap-2 rounded border border-[rgba(255,200,0,0.25)] bg-[rgba(255,200,0,0.06)] p-3">
    <FileCode2 class="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
    <p class="[font-family:var(--font-mono)] text-xs leading-relaxed text-[var(--text-muted)]">
      Definitions live in
      <code class="text-[var(--accent)]">src/lib/server/achievements/definitions.ts</code>.
      Edit that file and deploy — there is no supported runtime mutation path.
      Keys are permanent identities referenced by existing unlock rows, so to retire an
      achievement set <code>retired: true</code>; never rename or delete a key.
    </p>
  </div>

  <div class="space-y-2">
    {#each data.families as family (family.key)}
      <div class="rounded border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]">
        <button
          type="button"
          on:click={() => toggle(family.key)}
          class="flex w-full items-center justify-between p-3 text-left hover:bg-[rgba(255,255,255,0.03)]"
        >
          <div class="flex items-center gap-3">
            {#if expanded === family.key}
              <ChevronDown class="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            {:else}
              <ChevronRight class="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            {/if}
            <span class="text-lg" aria-hidden="true">{family.icon}</span>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="[font-family:var(--font-heading)] text-sm font-medium text-[var(--text-primary)]">
                  {family.name}
                </span>
                <span class="[font-family:var(--font-mono)] text-[0.6rem] text-[var(--text-muted)]">
                  {family.key}
                </span>
                {#if family.retired}
                  <span class="rounded bg-[rgba(255,255,255,0.08)] px-1.5 py-0.5 [font-family:var(--font-mono)] text-[0.55rem] uppercase text-[var(--text-muted)]">
                    retired
                  </span>
                {/if}
              </div>
              <p class="text-xs text-[var(--text-muted)]">{family.description}</p>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-3">
            <span class="[font-family:var(--font-mono)] text-xs uppercase {getCategoryColor(family.category)}">
              {family.category}
            </span>
            <span class="[font-family:var(--font-mono)] text-xs text-[var(--text-muted)]">
              {family.tiers.length} tier{family.tiers.length === 1 ? "" : "s"}
            </span>
          </div>
        </button>

        {#if expanded === family.key}
          <div class="space-y-2 border-t border-[rgba(255,255,255,0.08)] p-3">
            {#each family.tiers as tier (tier.tier)}
              <div class="rounded bg-[rgba(255,255,255,0.02)] p-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="[font-family:var(--font-heading)] text-sm font-bold uppercase text-[var(--accent)]">
                    {tier.tier}
                  </span>
                  <span class="[font-family:var(--font-mono)] text-xs text-[var(--text-muted)]">
                    {tier.xpReward} XP / {tier.coinReward} coins
                  </span>
                </div>
                <p class="mt-1 text-xs text-[var(--text-muted)]">{tier.description}</p>
                <pre class="mt-1 overflow-x-auto rounded bg-[rgba(0,0,0,0.25)] p-2 [font-family:var(--font-mono)] text-[0.65rem] leading-relaxed text-[var(--text-primary)]">{tier.criteria}</pre>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
