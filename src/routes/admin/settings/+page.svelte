<script lang="ts">
  import { onMount } from "svelte";
  import { Loader2, Trash2, AlertTriangle, Crown, Lock, Settings } from "lucide-svelte";
  import { enhance } from "$app/forms";

  type SettingKey = "mastery_checkpoint_enabled";

  interface ScenarioItem {
    id: string;
    name: string;
    description: string;
    isPaywalled: boolean;
    stackName: string;
  }

  interface Settings {
    mastery_checkpoint_enabled: boolean;
  }

  export let data: {
    user: { name: string; email: string } | null;
    settings: Settings;
    scenarios: ScenarioItem[];
    currentSeason?: { name: string; endDate: string };
  };

  let settings = data.settings;
  let scenarios = data.scenarios;
  let isLoading = false;
  let isResettingDocker = false;
  let togglingScenario: string | null = null;
  let message: { type: "success" | "error"; text: string } | null = null;

  async function toggleSetting(key: SettingKey) {
    isLoading = true;
    message = null;

    try {
      const newValue = !settings[key];

      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: newValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to update setting");
      }

      settings = { ...settings, [key]: newValue };
      message = { type: "success", text: "Setting updated successfully" };
    } catch (error) {
      console.error("Error updating setting:", error);
      message = { type: "error", text: "Failed to update setting" };
    } finally {
      isLoading = false;
      setTimeout(() => (message = null), 3000);
    }
  }
</script>

<div class="page-container py-6">
  <div class="mb-8">
    <h1 class="font-heading text-3xl font-bold tracking-tight text-obsidian-text-primary">
     <Settings class="inline h-6 w-6 mr-2" />
      Application Settings
    </h1>
    <p class="mt-1 font-body text-md text-obsidian-text-muted">
      Manage global application configuration
    </p>
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

  <div class="space-y-5">
    <!-- Mastery Checkpoint Toggle -->
    <div
      class="card-cyber"
      style="border-color: rgb(var(--accent-rgb) / 0.15)"
    >
      <div class="card-cyber-body">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-heading text-xl font-semibold text-obsidian-text-primary">
              Mastery Checkpoint
            </h2>
            <p class="mt-1 font-body text-md text-obsidian-text-muted">
              When enabled, users must complete the mastery checkpoint to progress
              to the next level.
            </p>
          </div>

          <button
            type="button"
            on:click={() => toggleSetting("mastery_checkpoint_enabled")}
            disabled={isLoading}
            class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-obsidian-accent/50 disabled:opacity-50 {settings.mastery_checkpoint_enabled
              ? 'bg-cyber-success/30'
              : 'bg-obsidian-text-muted/30'}"
            role="switch"
            aria-checked={settings.mastery_checkpoint_enabled}
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-[var(--text-bright)] transition-transform {settings.mastery_checkpoint_enabled
                ? 'translate-x-6'
                : 'translate-x-1'}"
            ></span>
            {#if isLoading}
              <div class="absolute inset-0 flex items-center justify-center">
                <Loader2 class="h-4 w-4 animate-spin text-obsidian-accent" />
              </div>
            {/if}
          </button>
        </div>

        <div class="mt-3 flex items-center gap-2">
          <span
            class="font-label text-sm uppercase tracking-[0.04em] {settings.mastery_checkpoint_enabled
              ? 'text-cyber-success'
              : 'text-obsidian-text-muted'}"
          >
            {settings.mastery_checkpoint_enabled ? "ENABLED" : "DISABLED"}
          </span>
        </div>
      </div>
    </div>

    <!-- Scenario Paywall -->
    <div
      class="card-cyber"
      style="border-color: rgb(var(--accent-rgb) / 0.15)"
    >
      <div class="card-cyber-body">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="flex items-center gap-2 font-heading text-xl font-semibold text-obsidian-text-primary">
              <Lock class="h-5 w-5" />
              Scenario Paywall
            </h2>
            <p class="mt-1 font-body text-md text-obsidian-text-muted">
              Lock individual scenarios behind the Learner Pass. Users must have an active Learner Pass and project access to launch locked scenarios.
            </p>
          </div>
        </div>

        <div class="space-y-2">
          {#each scenarios as scenario}
            <div
              class="flex items-center justify-between rounded-card border border-[var(--card-border)] bg-obsidian-surface/40 px-3 py-2"
            >
              <div class="min-w-0 flex-1">
                <p class="truncate font-body text-base text-obsidian-text-primary">
                  {scenario.name}
                </p>
                <p class="mt-0.5 font-label text-sm text-obsidian-text-muted">
                  {scenario.stackName}
                </p>
              </div>

              <form
                method="POST"
                action="?/toggleScenarioPaywall"
                use:enhance={() => {
                  togglingScenario = scenario.id;
                  return async ({ result, update }) => {
                    togglingScenario = null;
                    if (result.type === "success") {
                      scenarios = scenarios.map(s =>
                        s.id === scenario.id ? { ...s, isPaywalled: !s.isPaywalled } : s
                      );
                      message = { type: "success", text: `Paywall ${!scenario.isPaywalled ? 'enabled' : 'disabled'} for ${scenario.name}` };
                    } else if (result.type === "failure") {
                      message = { type: "error", text: (result.data?.message as string) || "Failed to update scenario paywall" };
                    }
                    await update({ reset: false });
                    setTimeout(() => (message = null), 3000);
                  };
                }}
              >
                <input type="hidden" name="scenarioId" value={scenario.id} />
                <button
                  type="submit"
                  disabled={togglingScenario === scenario.id}
                  class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-obsidian-accent/50 disabled:opacity-50 {scenario.isPaywalled
                    ? 'bg-cyber-success/30'
                    : 'bg-obsidian-text-muted/30'}"
                  role="switch"
                  aria-checked={scenario.isPaywalled}
                  aria-label="Toggle paywall for {scenario.name}"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-[var(--text-bright)] transition-transform {scenario.isPaywalled
                      ? 'translate-x-6'
                      : 'translate-x-1'}"
                  ></span>
                </button>
              </form>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Docker Reset -->
    <div
      class="card-cyber"
      style="border-color: rgb(var(--danger-rgb) / 0.15)"
    >
      <div class="card-cyber-body">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="flex items-center gap-2 font-heading text-lg font-semibold text-cyber-danger">
              <Trash2 class="h-5 w-5" />
              Reset Docker Containers
            </h2>
            <p class="mt-1 font-body text-md text-obsidian-text-muted">
              Stop and remove all active DevSim Docker containers and clear the
              database workspaces. Avoid using this if users are active.
            </p>
          </div>

          <form
            method="POST"
            action="?/resetDocker"
            use:enhance={() => {
              isResettingDocker = true;
              return async ({ result, update }) => {
                isResettingDocker = false;
                if (result.type === "success") {
                  message = {
                    type: "success",
                    text: "Docker containers reset successfully",
                  };
                } else if (result.type === "failure") {
                  message = {
                    type: "error",
                    text:
                      (result.data?.message as string) ||
                      "Failed to reset Docker containers",
                  };
                } else if (result.type === "redirect") {
                  update();
                }
                await update({ reset: false });
                setTimeout(() => (message = null), 3000);
              };
            }}
          >
            <button
              type="submit"
              disabled={isResettingDocker}
              class=" text-sm btn-cyber btn-cyber-danger flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyber-danger/40 disabled:opacity-50"
            >
              {#if isResettingDocker}
                <Loader2 class="h-4 w-4 animate-spin" />
                Resetting...
              {:else}
                <AlertTriangle class="h-4 w-4" />
                Reset All Containers
              {/if}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Season Management -->
    {#if data.currentSeason}
      <div
        class="card-cyber"
        style="border-color: rgb(var(--accent-rgb) / 0.15)"
      >
        <div class="card-cyber-body">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="flex items-center gap-2 font-heading text-lg font-semibold text-obsidian-accent">
                <Crown class="h-5 w-5" />
                Current Season
              </h2>
              <p class="mt-1 font-body text-sm text-obsidian-text-muted">
                {data.currentSeason.name}
              </p>
              <p class="font-mono text-xs tabular-nums text-obsidian-text-muted">
                Ends: {new Date(data.currentSeason.endDate).toLocaleDateString()}
              </p>
            </div>

            <form
              method="POST"
              action="?/forceNewSeason"
              use:enhance={() => {
                isLoading = true;
                return async ({ result, update }) => {
                  isLoading = false;
                  if (result.type === "success") {
                    message = {
                      type: "success",
                      text: "New season started successfully!"
                    };
                    // Refresh page data to show new season
                    update();
                  } else if (result.type === "failure") {
                    message = {
                      type: "error",
                      text:
                        (result.data?.message as string) ||
                        "Failed to start new season",
                    };
                  }
                  setTimeout(() => (message = null), 5000);
                };
              }}
            >
              <button
                type="submit"
                disabled={isLoading}
                class="btn-cyber btn-cyber-outline flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-obsidian-accent/40 disabled:opacity-50"
              >
                {#if isLoading}
                  <Loader2 class="h-4 w-4 animate-spin" />
                  Starting...
                {:else}
                  <Crown class="h-4 w-4" />
                  Start Next Season
                {/if}
              </button>
            </form>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
