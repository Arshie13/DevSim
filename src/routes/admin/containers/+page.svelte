<script lang="ts">
  import { onMount } from "svelte";
  import { Loader2, RefreshCw, Container, User, Monitor, Activity, Play, Square } from "lucide-svelte";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import type { PageData } from "./$types";

  export let data: PageData;

  let message: { type: "success" | "error"; text: string } | null = null;
  let stoppingId: string | null = null;

  function shortId(id: string) {
    return id.length > 12 ? id.slice(0, 12) + "…" : id;
  }
</script>

<div class="p-6">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1
        class="[font-family:var(--font-heading)] text-2xl font-medium text-[var(--text-primary)]"
      >
        Container Overview
      </h1>
      <p class="mt-1 [font-family:var(--font-mono)] text-sm text-[var(--text-muted)]">
        Stop containers for inactive users. Presence updates only while a user is on a
        workspace or tutorial page.
      </p>
    </div>

    <button
      type="button"
      on:click={() => invalidateAll()}
      class="flex items-center gap-2 rounded border border-[rgba(7,165,201,0.2)] bg-[rgba(10,14,26,0.72)] px-3 py-2 [font-family:var(--font-mono)] text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] hover:border-[rgba(7,165,201,0.4)]"
    >
      <RefreshCw class="h-4 w-4" />
      Refresh
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

  {#if data.dockerError}
    <div
      class="mb-4 p-3 rounded border border-[rgba(255,68,68,0.3)] bg-[rgba(255,68,68,0.1)] text-[var(--danger)]"
    >
      <p class="[font-family:var(--font-mono)] text-sm">
        Docker daemon unreachable — states shown as stopped.
      </p>
    </div>
  {/if}

  <div class="rounded border border-[rgba(7,165,201,0.12)] bg-[rgba(10,14,26,0.72)] overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-[rgba(7,165,201,0.12)]">
            <th class="px-4 py-3 [font-family:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--text-muted)]">User</th>
            <th class="px-4 py-3 [font-family:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--text-muted)]">Stack</th>
            <th class="px-4 py-3 [font-family:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--text-muted)]">Scenario / Level</th>
            <th class="px-4 py-3 [font-family:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--text-muted)]">Workspace</th>
            <th class="px-4 py-3 [font-family:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--text-muted)]">Docker</th>
            <th class="px-4 py-3 [font-family:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--text-muted)]">Presence</th>
            <th class="px-4 py-3 [font-family:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--text-muted)]">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[rgba(7,165,201,0.08)]">
          {#each data.rows as row}
            <tr class="hover:bg-[rgba(7,165,201,0.04)]">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <User class="h-4 w-4 text-[var(--text-muted)]" />
                  <div>
                    <p class="[font-family:var(--font-mono)] text-sm text-[var(--text-primary)]">
                      {row.user.name}
                    </p>
                    <p class="[font-family:var(--font-mono)] text-xs text-[var(--text-muted)]">
                      {row.user.email}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 [font-family:var(--font-mono)] text-sm text-[var(--text-primary)]">
                {row.stackName ?? '—'}
              </td>
              <td class="px-4 py-3 [font-family:var(--font-mono)] text-sm text-[var(--text-primary)]">
                <div>{row.scenarioName}</div>
                <div class="text-xs text-[var(--text-muted)]">Level {row.level}</div>
              </td>
              <td class="px-4 py-3 [font-family:var(--font-mono)] text-sm text-[var(--text-primary)]">
                {row.status}
              </td>
              <td class="px-4 py-3">
                {#if row.dockerRunning}
                  <span class="inline-flex items-center gap-1.5 rounded-full border border-[rgba(0,229,160,0.3)] bg-[rgba(0,229,160,0.1)] px-2 py-0.5 [font-family:var(--font-mono)] text-xs text-[var(--success)]">
                    <Play class="h-3 w-3" />
                    Running
                  </span>
                  {#if row.dockerState}
                    <span class="ml-2 [font-family:var(--font-mono)] text-xs text-[var(--text-muted)]">
                      {row.dockerState.replace(/^Up\s+/, '').replace(/^Exited\s+/, '')}
                    </span>
                  {/if}
                {:else}
                  <span class="inline-flex items-center gap-1.5 rounded-full border border-[rgba(136,146,160,0.2)] bg-[rgba(136,146,160,0.08)] px-2 py-0.5 [font-family:var(--font-mono)] text-xs text-[var(--text-muted)]">
                    <Square class="h-3 w-3" />
                    Stopped
                  </span>
                {/if}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 [font-family:var(--font-mono)] text-xs {row.isInactive
                      ? 'border-[rgba(255,68,68,0.3)] bg-[rgba(255,68,68,0.1)] text-[var(--danger)]'
                      : 'border-[rgba(0,229,160,0.3)] bg-[rgba(0,229,160,0.1)] text-[var(--success)]'}"
                  >
                    <Activity class="h-3 w-3" />
                    {row.presenceLabel}
                  </span>
                  <span class="[font-family:var(--font-mono)] text-xs text-[var(--text-muted)]">
                    {row.lastSeenLabel}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <form
                  method="POST"
                  action="?/stopContainer"
                  use:enhance={() => {
                    stoppingId = row.containerId;
                    message = null;
                    return async ({ result, update }) => {
                      stoppingId = null;
                      if (result.type === "success") {
                        message = { type: "success", text: "Container stopped successfully" };
                      } else if (result.type === "failure") {
                        message = { type: "error", text: (result.data?.message as string) || "Failed to stop container" };
                      }
                      await invalidateAll();
                      setTimeout(() => (message = null), 3000);
                    };
                  }}
                >
                  <input type="hidden" name="containerId" value={row.containerId} />
                  <button
                    type="submit"
                    disabled={!row.dockerRunning || !row.isInactive || stoppingId === row.containerId}
                    class="flex items-center gap-1.5 rounded border border-[rgba(255,68,68,0.2)] bg-[rgba(255,68,68,0.08)] px-3 py-1.5 [font-family:var(--font-mono)] text-xs font-medium text-[var(--danger)] transition-colors hover:bg-[rgba(255,68,68,0.18)] focus:outline-none focus:ring-2 focus:ring-[rgba(255,68,68,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
                    title={!row.dockerRunning
                      ? 'Container is not running'
                      : !row.isInactive
                        ? 'User is active'
                        : undefined}
                  >
                    {#if stoppingId === row.containerId}
                      <Loader2 class="h-3.5 w-3.5 animate-spin" />
                      Stopping…
                    {:else}
                      <Square class="h-3.5 w-3.5" />
                      Stop
                    {/if}
                  </button>
                </form>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="7" class="px-4 py-8 text-center [font-family:var(--font-mono)] text-sm text-[var(--text-muted)]">
                No active containers found.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
