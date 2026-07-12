<script lang="ts">
  import { enhance } from "$app/forms";
  import { Loader2, Plus, Trash2, Edit3, ChevronDown, ChevronRight, Code } from "lucide-svelte";

  interface Tier {
    id: string;
    tier: string;
    description: string;
    icon: string | null;
    criteria: unknown;
    xpReward: number;
    coinReward: number;
  }

  interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    xpReward: number;
    coinReward: number;
    tiers: Tier[];
  }

  export let data: {
    achievements: Achievement[];
  };

  let isSubmitting = false;
  let message: { type: "success" | "error"; text: string } | null = null;
  let showCreateForm = false;
  let expandedAchievement: string | null = null;
  let editingTierId: string | null = null;
  let editingAchievementId: string | null = null;

  function toggleExpand(id: string) {
    expandedAchievement = expandedAchievement === id ? null : id;
  }

  function toggleEditAchievement(id: string | null) {
    editingAchievementId = editingAchievementId === id ? id : null;
  }

  function toggleEditTier(id: string | null) {
    editingTierId = editingTierId === id ? id : null;
  }

  function getCategoryColor(cat: string) {
    const colors: Record<string, string> = {
      progress: 'text-blue-400',
      exploration: 'text-green-400',
      consistency: 'text-orange-400',
      mastery: 'text-purple-400'
    };
    return colors[cat] || 'text-[var(--text-muted)]';
  }

  const CATEGORIES = ['progress', 'exploration', 'consistency', 'mastery'];
  const TIER_NAMES = ['ROOKIE', 'AMATEUR', 'PRO'];
  let newTierCount = 3;

  const CRITERIA_TYPES = [
    { id: 'scenarios_in_stack', label: 'Scenarios in Stack', valueField: 'count', valueLabel: 'Count' },
    { id: 'levels_completed', label: 'Levels Completed', valueField: 'count', valueLabel: 'Count' },
    { id: 'tasks_completed', label: 'Tasks Completed', valueField: 'count', valueLabel: 'Count' },
    { id: 'distinct_stacks', label: 'Distinct Stacks', valueField: 'count', valueLabel: 'Count' },
    { id: 'scenarios_completed', label: 'Scenarios Completed', valueField: 'count', valueLabel: 'Count' },
    { id: 'login_streak', label: 'Login Streak', valueField: 'days', valueLabel: 'Days' },
    { id: 'file_edits', label: 'File Edits', valueField: 'count', valueLabel: 'Count' },
    { id: 'xp_total', label: 'XP Total', valueField: 'xp', valueLabel: 'XP' },
    { id: 'coins_earned', label: 'Coins Earned', valueField: 'coins', valueLabel: 'Coins' },
    { id: 'trivia_correct', label: 'Trivia Correct', valueField: 'count', valueLabel: 'Count' },
    { id: 'tutorial_completed', label: 'Tutorial Completed', valueField: '', valueLabel: '' },
  ];

  const CRITERIA_TYPE_MAP = Object.fromEntries(CRITERIA_TYPES.map(t => [t.id, t]));

  // Track which tiers use raw JSON mode in the create form
  let useRawJson: boolean[] = [false, false, false];
  let tierTypes: string[] = ['scenarios_in_stack', 'scenarios_in_stack', 'scenarios_in_stack'];
  let tierValues: number[] = [1, 1, 1];
  let editUseRawJson = false;
  let editTierType = 'scenarios_in_stack';
  let editTierValue = 1;

  $: if (editingTierId) {
    const tiers = data.achievements.flatMap(a => a.tiers);
    const t = tiers.find(t => t.id === editingTierId);
    if (t) {
      const meta = getCriteriaMeta(t.criteria);
      editTierType = meta.type || 'scenarios_in_stack';
      editTierValue = meta.value || 1;
      editUseRawJson = false;
    }
  }

  function buildCriteriaJson(type: string, value: number): string {
    const meta = CRITERIA_TYPE_MAP[type];
    if (!meta || !meta.valueField) return JSON.stringify({ type });
    return JSON.stringify({ type, [meta.valueField]: value });
  }

  function getCriteriaMeta(criteria: unknown): { type: string; valueLabel: string; value: number } {
    const c = criteria as Record<string, unknown> ?? {};
    const type = (c.type as string) || '';
    const meta = CRITERIA_TYPE_MAP[type];
    if (!meta || !meta.valueField) {
      return { type, valueLabel: '', value: 0 };
    }
    return { type, valueLabel: meta.valueLabel, value: (c[meta.valueField] as number) || 0 };
  }

  $: criteriaDisplay = (criteria: unknown) => {
    const m = getCriteriaMeta(criteria);
    return m.type ? `${m.type}${m.valueLabel ? `: ${m.value} ${m.valueLabel}` : ''}` : JSON.stringify(criteria);
  };
</script>

<div class="p-6">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="[font-family:var(--font-heading)] text-2xl font-medium text-[var(--text-primary)]">
        Achievement Handler
      </h1>
      <p class="mt-1 [font-family:var(--font-mono)] text-sm text-[var(--text-muted)]">
        Create, edit, and manage achievements and their tiers
      </p>
    </div>
    <button
      on:click={() => (showCreateForm = !showCreateForm)}
      class="flex items-center gap-2 rounded bg-[rgba(7,165,201,0.1)] px-4 py-2 text-sm text-[var(--accent)] hover:bg-[rgba(7,165,201,0.2)]"
    >
      <Plus class="h-4 w-4" />
      New Achievement
    </button>
  </div>

  {#if message}
    <div
      class="mb-4 p-3 rounded border {message.type === 'success'
        ? 'border-[rgba(0,229,160,0.3)] bg-[rgba(0,229,160,0.1)] text-[var(--success)]'
        : 'border-[rgba(255,68,68,0.3)] bg-[rgba(255,68,68,0.1)] text-[var(--danger)]'}"
    >
      <p class="[font-family:var(--font-mono)] text-sm">{message.text}</p>
    </div>
  {/if}

  {#if showCreateForm}
    <div class="mb-6 rounded border border-[rgba(7,165,201,0.2)] bg-[rgba(10,14,26,0.72)] p-4">
      <h2 class="[font-family:var(--font-heading)] text-lg text-[var(--text-primary)] mb-4">Create Achievement</h2>
      <form
        method="POST"
        action="?/createAchievement"
        use:enhance={() => {
          isSubmitting = true;
          return async ({ result, update }) => {
            isSubmitting = false;
            if (result.type === "success") {
              message = { type: "success", text: "Achievement created" };
              showCreateForm = false;
            } else if (result.type === "failure") {
              message = { type: "error", text: (result.data?.message as string) || "Failed to create" };
            }
            await update({ reset: false });
            setTimeout(() => (message = null), 3000);
          };
        }}
        class="space-y-4"
      >
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1">Name</label>
            <input type="text" name="name" required
              class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)]" />
          </div>
          <div>
            <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1">Icon (emoji)</label>
            <input type="text" name="icon" value="🏅"
              class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)]" />
          </div>
          <div class="col-span-2">
            <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1">Description</label>
            <input type="text" name="description" required
              class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)]" />
          </div>
          <div>
            <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1">Category</label>
            <select name="category"
              class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              {#each CATEGORIES as cat}
                <option value={cat}>{cat}</option>
              {/each}
            </select>
          </div>
        </div>

        <div>
          <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-2">Tiers</label>
          {#each Array(newTierCount) as _, i}
            <div class="mb-3 p-3 rounded border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
              <span class="text-xs font-mono text-[var(--accent)] mb-2 block">Tier {i + 1}: {TIER_NAMES[i] || 'CUSTOM'}</span>
              <input type="hidden" name="tier_{i}_tier" value={TIER_NAMES[i] || 'ROOKIE'} />
              <div class="grid grid-cols-2 gap-2">
                <div class="col-span-2">
                  <label class="text-[var(--text-muted)] text-xs">Description</label>
                  <input type="text" name="tier_{i}_description" required
                    class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                </div>
                <div class="col-span-2">
                  <div class="flex items-center justify-between mb-1">
                    <label class="text-[var(--text-muted)] text-xs">Criteria</label>
                    <button type="button" on:click={() => (useRawJson[i] = !useRawJson[i])}
                      class="flex items-center gap-1 text-[0.55rem] text-[var(--accent)] hover:text-[var(--text-primary)]"
                    >
                      <Code class="h-3 w-3" />
                      {useRawJson[i] ? 'Simple Mode' : 'Raw JSON'}
                    </button>
                  </div>
                  {#if useRawJson[i]}
                    <textarea name="tier_{i}_criteria" rows="2"
                      class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)] font-mono"
                    >{JSON.stringify({type:"scenarios_in_stack", count:1})}</textarea>
                  {:else}
                    <input type="hidden" name="tier_{i}_criteria" value={buildCriteriaJson(tierTypes[i], tierValues[i])} />
                    <div class="flex gap-2">
                      <select bind:value={tierTypes[i]}
                        class="flex-1 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]"
                      >
                        {#each CRITERIA_TYPES as ct}
                          <option value={ct.id}>{ct.label}</option>
                        {/each}
                      </select>
                      {#if tierTypes[i] !== 'tutorial_completed'}
                        <input type="number" bind:value={tierValues[i]} min="1"
                          class="w-24 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                      {/if}
                    </div>
                  {/if}
                </div>
                <div>
                  <label class="text-[var(--text-muted)] text-xs">XP Reward</label>
                  <input type="number" name="tier_{i}_xp" value="100"
                    class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                </div>
                <div>
                  <label class="text-[var(--text-muted)] text-xs">Coin Reward</label>
                  <input type="number" name="tier_{i}_coins" value="50"
                    class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                </div>
              </div>
            </div>
          {/each}
        </div>

        <div class="flex justify-end gap-2">
          <button type="button" on:click={() => (showCreateForm = false)}
            class="rounded bg-[rgba(136,146,160,0.15)] px-4 py-2 text-sm text-[var(--text-muted)]"
          >Cancel</button>
          <button type="submit" disabled={isSubmitting}
            class="flex items-center gap-2 rounded bg-[rgba(0,229,160,0.15)] px-4 py-2 text-sm text-[var(--success)] hover:bg-[rgba(0,229,160,0.25)] disabled:opacity-50"
          >
            {#if isSubmitting}<Loader2 class="h-4 w-4 animate-spin" />{/if}
            Create
          </button>
        </div>
      </form>
    </div>
  {/if}

  <div class="space-y-3">
    {#each data.achievements as achievement}
      <div class="rounded border border-[rgba(7,165,201,0.15)] bg-[rgba(10,14,26,0.72)]">
        {#if editingAchievementId === achievement.id}
          <div class="p-4">
            <form
              method="POST"
              action="?/updateAchievement"
              use:enhance={() => {
                isSubmitting = true;
                return async ({ result, update }) => {
                  isSubmitting = false;
                  editingAchievementId = null;
                  if (result.type === "success") {
                    message = { type: "success", text: "Achievement updated" };
                  } else if (result.type === "failure") {
                    message = { type: "error", text: (result.data?.message as string) || "Failed to update" };
                  }
                  await update({ reset: false });
                  setTimeout(() => (message = null), 3000);
                };
              }}
              class="space-y-3"
            >
              <input type="hidden" name="id" value={achievement.id} />
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1">Name</label>
                  <input type="text" name="name" value={achievement.name} required
                    class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)]" />
                </div>
                <div>
                  <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1">Icon</label>
                  <input type="text" name="icon" value={achievement.icon}
                    class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)]" />
                </div>
                <div class="col-span-2">
                  <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1">Description</label>
                  <input type="text" name="description" value={achievement.description} required
                    class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)]" />
                </div>
                <div>
                  <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1">Category</label>
                  <select name="category"
                    class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)]"
                  >
                    {#each CATEGORIES as cat}
                      <option value={cat} selected={achievement.category === cat}>{cat}</option>
                    {/each}
                  </select>
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <button type="button" on:click={() => toggleEditAchievement(null)}
                  class="rounded bg-[rgba(136,146,160,0.15)] px-3 py-1 text-xs text-[var(--text-muted)]"
                >Cancel</button>
                <button type="submit" disabled={isSubmitting}
                  class="flex items-center gap-1 rounded bg-[rgba(0,229,160,0.15)] px-3 py-1 text-xs text-[var(--success)] hover:bg-[rgba(0,229,160,0.25)] disabled:opacity-50"
                >
                  {#if isSubmitting}<Loader2 class="h-3 w-3 animate-spin" />{/if}
                  Save
                </button>
              </div>
            </form>
          </div>
        {:else}
          <div class="flex items-center justify-between p-4">
            <div class="flex items-center gap-3 flex-1 min-w-0" role="button" tabindex="0" on:click={() => toggleExpand(achievement.id)} on:keydown={(e) => e.key === 'Enter' && toggleExpand(achievement.id)}>
              <span class="text-xl">{achievement.icon}</span>
              <div class="min-w-0">
                <h3 class="[font-family:var(--font-heading)] text-base text-[var(--text-primary)]">{achievement.name}</h3>
                <p class="text-xs text-[var(--text-muted)] truncate">{achievement.description}</p>
              </div>
              <span class="text-xs font-mono uppercase {getCategoryColor(achievement.category)}">{achievement.category}</span>
              <span class="text-xs text-[var(--text-muted)]">{achievement.tiers.length} tier{achievement.tiers.length !== 1 ? 's' : ''}</span>
              {#if expandedAchievement === achievement.id}<ChevronDown class="h-4 w-4 text-[var(--text-muted)]" />{:else}<ChevronRight class="h-4 w-4 text-[var(--text-muted)]" />{/if}
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button on:click={() => toggleEditAchievement(achievement.id)}
                class="rounded bg-[rgba(7,165,201,0.1)] p-1.5 text-[var(--accent)] hover:bg-[rgba(7,165,201,0.2)]"
              ><Edit3 class="h-4 w-4" /></button>
              <form method="POST" action="?/deleteAchievement" use:enhance>
                <input type="hidden" name="id" value={achievement.id} />
                <button type="submit" class="rounded bg-[rgba(255,68,68,0.1)] p-1.5 text-[var(--danger)] hover:bg-[rgba(255,68,68,0.2)]"
                  on:click={() => confirm('Delete this achievement? This cannot be undone.')}
                ><Trash2 class="h-4 w-4" /></button>
              </form>
            </div>
          </div>
        {/if}

        {#if expandedAchievement === achievement.id}
          <div class="border-t border-[rgba(255,255,255,0.06)] px-4 py-3">
            <h4 class="[font-family:var(--font-mono)] text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Tiers</h4>
            <div class="space-y-2">
              {#each achievement.tiers as tier}
                <div class="rounded border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
                  {#if editingTierId === tier.id}
                    <form
                      method="POST"
                      action="?/updateTier"
                      use:enhance={() => {
                        isSubmitting = true;
                        return async ({ result, update }) => {
                          isSubmitting = false;
                          editingTierId = null;
                          if (result.type === "success") {
                            message = { type: "success", text: "Tier updated" };
                          } else if (result.type === "failure") {
                            message = { type: "error", text: (result.data?.message as string) || "Failed to update tier" };
                          }
                          await update({ reset: false });
                          setTimeout(() => (message = null), 3000);
                        };
                      }}
                      class="space-y-2"
                    >
                      <input type="hidden" name="id" value={tier.id} />
                      <div class="grid grid-cols-2 gap-2">
                        <div class="col-span-2">
                          <label class="text-[var(--text-muted)] text-xs">Description</label>
                          <input type="text" name="description" value={tier.description}
                            class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                        </div>
                        <div>
                          <label class="text-[var(--text-muted)] text-xs">Icon</label>
                          <input type="text" name="icon" value={tier.icon || ''}
                            class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                        </div>
                        <div>
                          <label class="text-[var(--text-muted)] text-xs">XP / Coins</label>
                          <div class="flex gap-1">
                            <input type="number" name="xpReward" value={tier.xpReward}
                              class="w-1/2 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                            <input type="number" name="coinReward" value={tier.coinReward}
                              class="w-1/2 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                          </div>
                        </div>
                        <div class="col-span-2">
                          <div class="flex items-center justify-between mb-1">
                            <label class="text-[var(--text-muted)] text-xs">Criteria</label>
                            <button type="button" on:click={() => (editUseRawJson = !editUseRawJson)}
                              class="flex items-center gap-1 text-[0.55rem] text-[var(--accent)] hover:text-[var(--text-primary)]"
                            >
                              <Code class="h-3 w-3" />
                              {editUseRawJson ? 'Simple Mode' : 'Raw JSON'}
                            </button>
                          </div>
                          {#if editUseRawJson}
                            <textarea name="criteria" rows="3"
                              class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)] font-mono"
                            >{JSON.stringify(tier.criteria, null, 2)}</textarea>
                          {:else}
                            <input type="hidden" name="criteria" value={buildCriteriaJson(editTierType, editTierValue)} />
                            <div class="flex gap-2">
                              <select bind:value={editTierType}
                                class="flex-1 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]"
                              >
                                {#each CRITERIA_TYPES as ct}
                                  <option value={ct.id}>{ct.label}</option>
                                {/each}
                              </select>
                              {#if editTierType !== 'tutorial_completed'}
                                <input type="number" bind:value={editTierValue} min="1"
                                  class="w-24 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
                              {/if}
                            </div>
                          {/if}
                        </div>
                      </div>
                      <div class="flex justify-end gap-2">
                        <button type="button" on:click={() => toggleEditTier(null)}
                          class="rounded bg-[rgba(136,146,160,0.15)] px-2 py-1 text-xs text-[var(--text-muted)]"
                        >Cancel</button>
                        <button type="submit" disabled={isSubmitting}
                          class="flex items-center gap-1 rounded bg-[rgba(0,229,160,0.15)] px-2 py-1 text-xs text-[var(--success)] disabled:opacity-50"
                        >
                          {#if isSubmitting}<Loader2 class="h-3 w-3 animate-spin" />{/if}
                          Save
                        </button>
                      </div>
                    </form>
                  {:else}
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="[font-family:var(--font-heading)] text-sm text-[var(--accent)] font-bold uppercase">{tier.tier}</span>
                        <span class="text-xs text-[var(--text-muted)]">{tier.description}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-[var(--text-muted)] font-mono">{tier.xpReward}XP / {tier.coinReward} coins</span>
                        <button on:click={() => toggleEditTier(tier.id)}
                          class="rounded bg-[rgba(7,165,201,0.1)] p-1 text-[var(--accent)] hover:bg-[rgba(7,165,201,0.2)]"
                        ><Edit3 class="h-3 w-3" /></button>
                      </div>
                    </div>
                    <div class="mt-1">
                      <span class="text-[0.6rem] text-[var(--text-muted)] font-mono">{criteriaDisplay(tier.criteria)}</span>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
