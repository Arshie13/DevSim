<script lang="ts">
  import { enhance } from "$app/forms";
  import { Loader2, Settings, Gift, Coins, Zap, HelpCircle, Lock } from "lucide-svelte";

  interface Reward {
    id: string;
    rewardIndex: number;
    coins: number;
    xp: number;
    aiHelps: number;
    unlockedScenario: string[];
    displayType: string;
    displayValue: string;
  }

  interface Scenario {
    id: string;
    name: string;
  }

  interface Config {
    price: number;
    durationDays: number;
    specialUnlockDays: number[];
    dayToScenario: Record<string, string>;
  }

  export let data: {
    rewards: Reward[];
    scenarios: Scenario[];
    config: Config;
  };

  let editingRewardId: string | null = null;
  let isSubmitting = false;
  let message: { type: "success" | "error"; text: string } | null = null;
  let showConfig = false;

  function editReward(rewardId: string) {
    editingRewardId = editingRewardId === rewardId ? null : rewardId;
  }

  function getDisplayIcon(type: string) {
    if (type === "coins") return Coins;
    if (type === "help") return HelpCircle;
    if (type === "scenario_unlock") return Lock;
    return Gift;
  }

  $: isSpecialDay = (day: number) => data.config.specialUnlockDays.includes(day);
</script>

<div class="p-6">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="[font-family:var(--font-heading)] text-2xl font-medium text-[var(--text-primary)]">
        <Gift class="inline h-6 w-6 mr-2" />
        Learner Pass Manager
      </h1>
      <p class="mt-1 [font-family:var(--font-mono)] text-sm text-[var(--text-muted)]">
        Manage the 30-day reward calendar and pass configuration
      </p>
    </div>
    <button
      on:click={() => (showConfig = !showConfig)}
      class="flex items-center gap-2 rounded bg-[rgba(7,165,201,0.1)] px-4 py-2 text-sm text-[var(--accent)] hover:bg-[rgba(7,165,201,0.2)]"
    >
      <Settings class="h-4 w-4" />
      {showConfig ? "Hide Config" : "Pass Config"}
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

  {#if showConfig}
    <div class="mb-6 rounded border border-[rgba(7,165,201,0.2)] bg-[rgba(10,14,26,0.72)] p-4">
      <h2 class="[font-family:var(--font-heading)] text-lg text-[var(--text-primary)] mb-4">Pass Configuration</h2>
      <form
        method="POST"
        action="?/updateConfig"
        use:enhance={() => {
          isSubmitting = true;
          return async ({ result, update }) => {
            isSubmitting = false;
            if (result.type === "success") {
              message = { type: "success", text: "Configuration updated" };
            } else if (result.type === "failure") {
              message = { type: "error", text: (result.data?.message as string) || "Failed to update config" };
            }
            await update({ reset: false });
            setTimeout(() => (message = null), 3000);
          };
        }}
        class="grid grid-cols-2 gap-4"
      >
        <div>
          <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1">Price (cents)</label>
          <input
            type="number" name="price" value={data.config.price}
            class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)]"
          />
        </div>
        <div>
          <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1">Duration (days)</label>
          <input
            type="number" name="durationDays" value={data.config.durationDays}
            class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)]"
          />
        </div>
        <div>
          <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1">Special Unlock Days (JSON array)</label>
          <input
            type="text" name="specialUnlockDays" value={JSON.stringify(data.config.specialUnlockDays)}
            class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)] font-mono"
          />
        </div>
        <div>
          <label class="block [font-family:var(--font-mono)] text-xs text-[var(--text-muted)] mb-1">Day → Scenario (JSON object)</label>
          <input
            type="text" name="dayToScenario" value={JSON.stringify(data.config.dayToScenario)}
            class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--text-primary)] font-mono"
          />
        </div>
        <div class="col-span-2 flex justify-end">
          <button
            type="submit" disabled={isSubmitting}
            class="flex items-center gap-2 rounded bg-[rgba(7,165,201,0.1)] px-4 py-2 text-sm text-[var(--accent)] hover:bg-[rgba(7,165,201,0.2)] disabled:opacity-50"
          >
            {#if isSubmitting}
              <Loader2 class="h-4 w-4 animate-spin" />
            {/if}
            Save Config
          </button>
        </div>
      </form>
    </div>
  {/if}

  <h2 class="[font-family:var(--font-heading)] text-lg text-[var(--text-primary)] mb-3">
    30-Day Reward Calendar
  </h2>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
    {#each data.rewards as reward}
      <div
        class="rounded border {isSpecialDay(reward.rewardIndex)
          ? 'border-[rgba(255,215,0,0.3)] bg-[rgba(255,215,0,0.05)]'
          : 'border-[rgba(7,165,201,0.15)] bg-[rgba(10,14,26,0.72)]'} p-3"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="[font-family:var(--font-heading)] text-lg text-[var(--text-primary)] font-bold">
            Day {reward.rewardIndex}
          </span>
          {#if isSpecialDay(reward.rewardIndex)}
            <span class="text-xs text-yellow-400 font-mono">★ SPECIAL</span>
          {/if}
        </div>

        {#if editingRewardId === reward.id}
          <form
            method="POST"
            action="?/updateReward"
            use:enhance={() => {
              isSubmitting = true;
              return async ({ result, update }) => {
                isSubmitting = false;
                editingRewardId = null;
                if (result.type === "success") {
                  message = { type: "success", text: `Day ${reward.rewardIndex} updated` };
                } else if (result.type === "failure") {
                  message = { type: "error", text: (result.data?.message as string) || "Failed to update" };
                }
                await update({ reset: false });
                setTimeout(() => (message = null), 3000);
              };
            }}
          >
            <input type="hidden" name="rewardId" value={reward.id} />
            <div class="space-y-2 text-sm">
              <div>
                <label class="text-[var(--text-muted)] text-xs">Coins</label>
                <input type="number" name="coins" value={reward.coins}
                  class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
              </div>
              <div>
                <label class="text-[var(--text-muted)] text-xs">XP</label>
                <input type="number" name="xp" value={reward.xp}
                  class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
              </div>
              <div>
                <label class="text-[var(--text-muted)] text-xs">AI Helps</label>
                <input type="number" name="aiHelps" value={reward.aiHelps}
                  class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
              </div>
              <div>
                <label class="text-[var(--text-muted)] text-xs">Display Type</label>
                <select name="displayType" value={reward.displayType}
                  class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]"
                >
                  <option value="coins">coins</option>
                  <option value="help">help</option>
                  <option value="scenario_unlock">scenario_unlock</option>
                </select>
              </div>
              <div>
                <label class="text-[var(--text-muted)] text-xs">Display Value</label>
                <input type="text" name="displayValue" value={reward.displayValue}
                  class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]" />
              </div>
              <div>
                <label class="text-[var(--text-muted)] text-xs">Unlock Scenario</label>
                <select name="unlockedScenario"
                  class="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)]"
                >
                  <option value="">— None —</option>
                  {#each data.scenarios as s}
                    <option value={s.id} selected={reward.unlockedScenario.includes(s.id)}>{s.name}</option>
                  {/each}
                </select>
              </div>
            </div>
            <div class="flex gap-2 mt-2">
              <button type="submit" disabled={isSubmitting}
                class="flex-1 rounded bg-[rgba(0,229,160,0.15)] py-1 text-xs text-[var(--success)] hover:bg-[rgba(0,229,160,0.25)] disabled:opacity-50"
              >
                {#if isSubmitting}<Loader2 class="h-3 w-3 animate-spin inline" />{/if}
                Save
              </button>
              <button type="button" on:click={() => (editingRewardId = null)}
                class="rounded bg-[rgba(136,146,160,0.15)] px-3 py-1 text-xs text-[var(--text-muted)] hover:bg-[rgba(136,146,160,0.25)]"
              >
                Cancel
              </button>
            </div>
          </form>
        {:else}
          <div class="space-y-1 text-sm">
            {#if reward.coins > 0}
              <div class="flex items-center gap-1"><Coins class="h-3.5 w-3.5 text-yellow-400" /> <span class="text-[var(--text-primary)]">{reward.coins} coins</span></div>
            {/if}
            {#if reward.xp > 0}
              <div class="flex items-center gap-1"><Zap class="h-3.5 w-3.5 text-purple-400" /> <span class="text-[var(--text-primary)]">{reward.xp} XP</span></div>
            {/if}
            {#if reward.aiHelps > 0}
              <div class="flex items-center gap-1"><HelpCircle class="h-3.5 w-3.5 text-cyan-400" /> <span class="text-[var(--text-primary)]">{reward.aiHelps} AI Helps</span></div>
            {/if}
            {#if reward.unlockedScenario.length > 0}
              <div class="flex items-center gap-1"><Lock class="h-3.5 w-3.5 text-yellow-400" /> <span class="text-[var(--text-primary)] truncate">{reward.displayValue}</span></div>
            {/if}
            {#if !reward.coins && !reward.xp && !reward.aiHelps && reward.unlockedScenario.length === 0}
              <span class="text-[var(--text-muted)] italic">No rewards set</span>
            {/if}
          </div>
          <button
            on:click={() => editReward(reward.id)}
            class="mt-2 w-full rounded bg-[rgba(7,165,201,0.1)] py-1 text-xs text-[var(--accent)] hover:bg-[rgba(7,165,201,0.2)]"
          >
            Edit
          </button>
        {/if}
      </div>
    {/each}
  </div>
</div>
