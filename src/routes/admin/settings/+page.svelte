<script lang="ts">
  import { onMount } from "svelte";
  import { Loader2, Trash2, AlertTriangle, Crown, Lock } from "lucide-svelte";
  import { enhance } from "$app/forms";

  type SettingKey = "mastery_checkpoint_enabled";

  interface ScenarioItem {
    id: string;
    name: string;
    description: string;
    paywall: boolean;
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

<div class="p-6">
  <div class="mb-6">
    <h1
      class="[font-family:var(--font-heading)] text-2xl font-medium text-[var(--text-primary)]"
    >
      Application Settings
    </h1>
    <p
      class="mt-1 [font-family:var(--font-mono)] text-sm text-[var(--text-muted)]"
    >
      Manage global application configuration
    </p>
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

  <div class="space-y-4">
    <!-- Mastery Checkpoint Toggle -->
    <div
      class="rounded border border-[rgba(7,165,201,0.2)] bg-[rgba(10,14,26,0.72)] p-4"
    >
      <div class="flex items-center justify-between">
        <div>
          <h2
            class="[font-family:var(--font-heading)] text-lg text-[var(--text-primary)]"
          >
            Mastery Checkpoint
          </h2>
          <p
            class="mt-1 [font-family:var(--font-mono)] text-sm text-[var(--text-muted)]"
          >
            When enabled, users must complete the mastery checkpoint to progress
            to the next level.
          </p>
        </div>

        <button
          type="button"
          on:click={() => toggleSetting("mastery_checkpoint_enabled")}
          disabled={isLoading}
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[rgba(7,165,201,0.5)] focus:ring-offset-2 disabled:opacity-50 {settings.mastery_checkpoint_enabled
            ? 'bg-[rgba(0,229,160,0.3)]'
            : 'bg-[rgba(136,146,160,0.3)]'}"
          role="switch"
          aria-checked={settings.mastery_checkpoint_enabled}
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {settings.mastery_checkpoint_enabled
              ? 'translate-x-6'
              : 'translate-x-1'}"
          ></span>
          {#if isLoading}
            <div class="absolute inset-0 flex items-center justify-center">
              <Loader2 class="h-4 w-4 animate-spin text-[var(--accent)]" />
            </div>
          {/if}
        </button>
      </div>

      <div class="mt-3 flex items-center gap-2">
        <span
          class="[font-family:var(--font-mono)] text-xs uppercase tracking-[0.1em] {settings.mastery_checkpoint_enabled
            ? 'text-[var(--success)]'
            : 'text-[var(--text-muted)]'}"
        >
          {settings.mastery_checkpoint_enabled ? "ENABLED" : "DISABLED"}
        </span>
      </div>
    </div>

    <!-- Scenario Paywall -->
    <div
      class="rounded border border-[rgba(7,165,201,0.2)] bg-[rgba(10,14,26,0.72)] p-4"
    >
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2
            class="flex items-center gap-2 [font-family:var(--font-heading)] text-lg text-[var(--text-primary)]"
          >
            <Lock class="h-5 w-5" />
            Scenario Paywall
          </h2>
          <p
            class="mt-1 [font-family:var(--font-mono)] text-sm text-[var(--text-muted)]"
          >
            Lock individual scenarios behind the Learner Pass. Users must have an active Learner Pass and project access to launch locked scenarios.
          </p>
        </div>
      </div>

      <div class="space-y-2">
        {#each scenarios as scenario}
          <div
            class="flex items-center justify-between rounded border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2"
          >
            <div class="min-w-0 flex-1">
              <p class="[font-family:var(--font-mono)] text-sm text-[var(--text-primary)] truncate">
                {scenario.name}
              </p>
              <p class="[font-family:var(--font-mono)] text-[0.65rem] text-[var(--text-muted)] mt-0.5">
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
                      s.id === scenario.id ? { ...s, paywall: !s.paywall } : s
                    );
                    message = { type: "success", text: `Paywall ${!scenario.paywall ? 'enabled' : 'disabled'} for ${scenario.name}` };
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
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[rgba(7,165,201,0.5)] focus:ring-offset-2 disabled:opacity-50 {scenario.paywall
                  ? 'bg-[rgba(0,229,160,0.3)]'
                  : 'bg-[rgba(136,146,160,0.3)]'}"
                role="switch"
                aria-checked={scenario.paywall}
                aria-label="Toggle paywall for {scenario.name}"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {scenario.paywall
                    ? 'translate-x-6'
                    : 'translate-x-1'}"
                ></span>
              </button>
            </form>
          </div>
        {/each}
      </div>
    </div>

    <!-- Docker Reset -->
    <div
      class="rounded border border-[rgba(255,68,68,0.2)] bg-[rgba(10,14,26,0.72)] p-4"
    >
      <div class="flex items-center justify-between">
        <div>
          <h2
            class="flex items-center gap-2 [font-family:var(--font-heading)] text-lg text-[var(--danger)]"
          >
            <Trash2 class="h-5 w-5" />
            Reset Docker Containers
          </h2>
          <p
            class="mt-1 [font-family:var(--font-mono)] text-sm text-[var(--text-muted)]"
          >
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
            class="flex items-center gap-2 rounded bg-[rgba(255,68,68,0.1)] px-4 py-2 font-medium text-[var(--danger)] transition-colors hover:bg-[rgba(255,68,68,0.2)] focus:outline-none focus:ring-2 focus:ring-[rgba(255,68,68,0.5)] disabled:opacity-50"
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

    <!-- Season Management -->
    {#if data.currentSeason}
      <div
        class="rounded border border-[rgba(7,165,201,0.2)] bg-[rgba(10,14,26,0.72)] p-4"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2
              class="flex items-center gap-2 [font-family:var(--font-heading)] text-lg text-[var(--accent)]"
            >
              <Crown class="h-5 w-5" />
              Current Season
            </h2>
            <p class="mt-1 [font-family:var(--font-mono)] text-sm text-[var(--text-muted)]">
              {data.currentSeason.name}
            </p>
            <p class="[font-family:var(--font-mono)] text-xs text-[var(--text-muted)]">
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
              class="flex items-center gap-2 rounded bg-[rgba(7,165,201,0.1)] px-4 py-2 font-medium text-[var(--accent)] transition-colors hover:bg-[rgba(7,165,201,0.2)] focus:outline-none focus:ring-2 focus:ring-[rgba(7,165,201,0.5)] disabled:opacity-50"
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
    {/if}
   </div>
  </div>
</div>
