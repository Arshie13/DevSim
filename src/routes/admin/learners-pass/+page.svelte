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

  interface Config {
    price: number;
    durationDays: number;
  }

  export let data: {
    rewards: Reward[];
    specialUnlockDays: number[];
    dayToScenario: Record<string, string>;
    config: Config;
  };

  let isSubmitting = false;
  let message: { type: "success" | "error"; text: string } | null = null;
  let showConfig = false;

  $: isSpecialDay = (day: number) => data.specialUnlockDays.includes(day);
</script>

<div class="page-container py-6">
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="font-heading text-3xl font-bold tracking-tight text-obsidian-text-primary">
        <Gift class="mr-2 inline h-7 w-7" />
        Learner Pass Manager
      </h1>
      <p class="mt-1 font-body text-md text-obsidian-text-muted">
        Read-only view of the 30-day reward calendar
      </p>
    </div>
    <button
      on:click={() => (showConfig = !showConfig)}
      class="btn-cyber btn-cyber-outline !px-4 !py-2 flex items-center gap-2"
    >
      <Settings class="h-4 w-4" />
      {showConfig ? "Hide Config" : "Pass Config"}
    </button>
  </div>

  {#if message}
    <div
      class="mb-4 rounded-card border p-3 {message.type === 'success'
        ? 'border-cyber-success/30 bg-cyber-success/10 text-cyber-success'
        : 'border-cyber-danger/30 bg-cyber-danger/10 text-cyber-danger'}"
    >
      <p class="font-label text-sm">{message.text}</p>
    </div>
  {/if}

  <div
    class="mb-8 rounded-card border bg-[rgb(var(--gold-rgb)/0.05)] p-3"
    style="border-color: rgb(var(--gold-rgb) / 0.25)"
  >
    <p class="font-body text-md text-obsidian-text-muted">
      The reward ladder is defined in code at
      <span class="font-mono text-obsidian-accent">src/lib/server/learnerPass/schedule.ts</span>
      and was made read-only here on purpose: an unvalidated editor could empty a day's
      payout, point a day at an arbitrary scenario, or set a display type the UI has no
      icon for. Change it in code so the change is reviewed.
    </p>
  </div>

  {#if showConfig}
    <div
      class="card-cyber mb-8"
      style="border-color: rgb(var(--accent-rgb) / 0.15)"
    >
      <div class="card-cyber-body">
        <h2 class="mb-4 font-heading text-xl font-semibold text-obsidian-text-primary">Pass Configuration</h2>
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
            <label class="mb-1 block PLACEHOLDER-SKIP" for="price_cents">Price (cents)</label>
            <input
              id="price_cents" type="number" name="price" value={data.config.price}
              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 font-body text-sm text-obsidian-text-primary focus:border-obsidian-accent/60 focus:outline-none"
            />
          </div>
          <div>
            <label class="mb-1 block PLACEHOLDER-SKIP" for="duration_days">Duration (days)</label>
            <input
              id="duration_days" type="number" name="durationDays" value={data.config.durationDays}
              class="w-full rounded-card border border-obsidian-accent/20 bg-obsidian-surface/60 px-3 py-2 font-body text-sm text-obsidian-text-primary focus:border-obsidian-accent/60 focus:outline-none"
            />
          </div>
          <div class="col-span-2 flex justify-end">
            <button
              type="submit" disabled={isSubmitting}
              class="btn-cyber btn-cyber-solid flex items-center gap-2 disabled:opacity-50"
            >
              {#if isSubmitting}
                <Loader2 class="h-4 w-4 animate-spin" />
              {/if}
              Save Config
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <h2 class="mb-3 font-heading text-xl font-semibold text-obsidian-text-primary">
    30-Day Reward Calendar
  </h2>

  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
    {#each data.rewards as reward}
      <div
        class="card-cyber {isSpecialDay(reward.rewardIndex) ? 'bg-[rgb(var(--gold-rgb)/0.05)]' : ''}"
        style="border-color: rgb(var({isSpecialDay(reward.rewardIndex) ? 'gold' : 'accent'}-rgb) / {isSpecialDay(reward.rewardIndex) ? 0.3 : 0.15})"
      >
        <div class="card-cyber-body !p-4">
          <div class="mb-2 flex items-center justify-between">
            <span class="font-heading text-lg font-bold text-obsidian-text-primary">
              Day {reward.rewardIndex}
            </span>
            {#if isSpecialDay(reward.rewardIndex)}
              <span class="tag-cyber tag-warn">★ Special</span>
            {/if}
          </div>

          <div class="space-y-1 text-base">
            {#if reward.coins > 0}
              <div class="flex items-center gap-1"><Coins class="h-3.5 w-3.5 text-cyber-warn" /> <span class="text-obsidian-text-primary tabular-nums">{reward.coins} coins</span></div>
            {/if}
            {#if reward.xp > 0}
              <div class="flex items-center gap-1"><Zap class="h-3.5 w-3.5 text-cyber-purple" /> <span class="text-obsidian-text-primary tabular-nums">{reward.xp} XP</span></div>
            {/if}
            {#if reward.aiHelps > 0}
              <div class="flex items-center gap-1"><HelpCircle class="h-3.5 w-3.5 text-cyber-cyan" /> <span class="text-obsidian-text-primary tabular-nums">{reward.aiHelps} AI Helps</span></div>
            {/if}
            {#if reward.unlockedScenario.length > 0}
              <div class="flex items-center gap-1"><Lock class="h-3.5 w-3.5 text-cyber-gold" /> <span class="truncate text-obsidian-text-primary">{reward.displayValue}</span></div>
            {/if}
            {#if !reward.coins && !reward.xp && !reward.aiHelps && reward.unlockedScenario.length === 0}
              <span class="italic text-obsidian-text-muted">No rewards set</span>
            {/if}
          </div>

          <p class="mt-2 font-label text-xs text-obsidian-text-muted">
            {reward.displayType}
          </p>
        </div>
      </div>
    {/each}
  </div>
</div>
