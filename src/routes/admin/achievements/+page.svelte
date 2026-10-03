<!--
  Admin → Achievements.

  Read-only by design: the achievement catalog is code-defined (see
  `src/lib/server/achievements/definitions.ts`), so there is nothing to mutate at
  runtime. This page exists to make the current catalog, its reward constants, and
  its unlock criteria inspectable without opening the source.
-->
<script lang="ts">
  import { ChevronDown, ChevronRight, FileCode2, Trophy } from "lucide-svelte";
  import AdminFilterBar from "$lib/components/admin/AdminFilterBar.svelte";
  import AdminFilterTabs from "$lib/components/admin/AdminFilterTabs.svelte";
  import AdminSearchInput from "$lib/components/admin/AdminSearchInput.svelte";

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

  // Client-side filters over the code-defined catalog.
  let search = "";
  let category = "all";
  let status = "all";

  $: query = search.trim().toLowerCase();
  $: categories = [...new Set(data.families.map((f) => f.category))].sort();
  $: activeFamilies = data.families.filter((f) => !f.retired).length;
  $: retiredFamilies = data.families.filter((f) => f.retired).length;
  $: hasFilters = query !== "" || category !== "all" || status !== "all";

  $: filteredFamilies = data.families.filter((family) => {
    if (status === "active" && family.retired) return false;
    if (status === "retired" && !family.retired) return false;
    if (category !== "all" && family.category !== category) return false;
    if (!query) return true;
    return [
      family.name,
      family.key,
      family.description,
      family.category,
      ...family.tiers.map((t) => t.tier),
      ...family.tiers.map((t) => t.description),
      ...family.tiers.map((t) => t.criteria)
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  $: visibleTiers = filteredFamilies.reduce((sum, f) => sum + f.tiers.length, 0);

  function clearFilters() {
    search = "";
    category = "all";
    status = "all";
  }

  function toggle(key: string) {
    expanded = expanded === key ? null : key;
  }

  function getCategoryColor(cat: string) {
    const colors: Record<string, string> = {
      progress: "text-cyber-cyan",
      exploration: "text-cyber-success",
      consistency: "text-cyber-warn",
      mastery: "text-cyber-purple",
    };
    return colors[cat] || "text-obsidian-text-muted";
  }
</script>

<div class="page-container py-6">
  <div class="mb-8">
    <h1 class="font-heading text-3xl font-bold tracking-tight text-obsidian-text-primary">
     <Trophy class="inline h-6 w-6 mr-2" />
      Achievement Catalog
    </h1>
    <p class="mt-1 font-body text-md text-obsidian-text-muted">
      Read-only · {data.families.length} families · {data.totalTiers} tiers
    </p>
  </div>

  <div
    class="mb-4 flex items-start gap-2 rounded-card border border-cyber-warn/25 bg-cyber-warn/5 p-3"
    style="border-color: rgb(var(--warn-rgb) / 0.25)"
  >
    <FileCode2 class="mt-0.5 h-4 w-4 shrink-0 text-cyber-warn" />
    <p class="font-body text-md text-obsidian-text-muted">
      Definitions live in
      <code class="font-mono text-obsidian-accent">src/lib/server/achievements/definitions.ts</code>.
      Edit that file and deploy — there is no supported runtime mutation path.
      Keys are permanent identities referenced by existing unlock rows, so to retire an
      achievement set <code class="font-mono text-obsidian-accent">retired: true</code>; never rename or delete a key.
    </p>
  </div>

  <AdminFilterBar
    count={filteredFamilies.length}
    total={data.families.length}
    noun="family"
    active={hasFilters}
    onClear={clearFilters}
  >
    <AdminSearchInput
      bind:value={search}
      label="Search achievements"
      placeholder="Search family, tier or criteria…"
    />
    {#if categories.length > 1}
      <AdminFilterTabs
        label="Category filter"
        bind:value={category}
        options={[
          { value: "all", label: "All categories" },
          ...categories.map((c) => ({
            value: c,
            label: c,
            count: data.families.filter((f) => f.category === c).length
          }))
        ]}
      />
    {/if}
    <AdminFilterTabs
      label="Status filter"
      bind:value={status}
      options={[
        { value: "all", label: "All", count: data.families.length },
        { value: "active", label: "Active", count: activeFamilies },
        { value: "retired", label: "Retired", count: retiredFamilies }
      ]}
    />
  </AdminFilterBar>

  <p class="mb-3 font-mono text-sm tabular-nums text-obsidian-text-muted">
    {filteredFamilies.length} famil{filteredFamilies.length === 1 ? "y" : "ies"} ·
    {visibleTiers} tier{visibleTiers === 1 ? "" : "s"} shown
  </p>

  <div class="space-y-5">
    {#each filteredFamilies as family (family.key)}
      <div
        class="card-cyber"
        style="border-color: rgb(var(--accent-rgb) / 0.15)"
      >
        <button
          type="button"
          on:click={() => toggle(family.key)}
          class="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-obsidian-accent/5"
        >
          <div class="flex items-center gap-3">
            {#if expanded === family.key}
              <ChevronDown class="h-4 w-4 shrink-0 text-obsidian-text-muted" />
            {:else}
              <ChevronRight class="h-4 w-4 shrink-0 text-obsidian-text-muted" />
            {/if}
            <span class="text-xl" aria-hidden="true">{family.icon}</span>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-heading text-xl font-semibold text-obsidian-text-primary">
                  {family.name}
                </span>
                <span class="font-mono text-sm text-obsidian-text-muted">
                  {family.key}
                </span>
                {#if family.retired}
                  <span class="tag-cyber border border-obsidian-text-muted/20 bg-obsidian-text-muted/10 text-obsidian-text-muted">
                    retired
                  </span>
                {/if}
              </div>
              <p class="text-sm text-obsidian-text-muted">{family.description}</p>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-3">
            <span class="font-label text-sm uppercase {getCategoryColor(family.category)}">
              {family.category}
            </span>
            <span class="font-mono text-sm tabular-nums text-obsidian-text-muted">
              {family.tiers.length} tier{family.tiers.length === 1 ? "" : "s"}
            </span>
          </div>
        </button>

        {#if expanded === family.key}
          <div class="space-y-2 border-t border-[var(--card-border)] p-5">
            {#each family.tiers as tier (tier.tier)}
              <div class="rounded-card bg-obsidian-surface/40 p-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-heading text-md font-bold uppercase text-obsidian-accent">
                    {tier.tier}
                  </span>
                  <span class="font-mono text-sm tabular-nums text-obsidian-text-muted">
                    {tier.xpReward} XP / {tier.coinReward} coins
                  </span>
                </div>
                <p class="mt-1 text-sm text-obsidian-text-muted">{tier.description}</p>
                <pre class="mt-1 overflow-x-auto rounded-chrome bg-obsidian-bg/60 p-2 font-mono text-sm leading-relaxed text-obsidian-text-primary">{tier.criteria}</pre>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <div class="card-cyber" style="border-color: rgb(var(--accent-rgb) / 0.15)">
        <div class="card-cyber-body text-center font-body text-md text-obsidian-text-muted">
          No achievements match the current filters.
        </div>
      </div>
    {/each}
  </div>
</div>
