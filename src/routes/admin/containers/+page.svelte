<script lang="ts">
  import { onMount } from "svelte";
  import { Loader2, RefreshCw, Boxes, User, Activity, Play, Square } from "lucide-svelte";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import Scrollbar from "$lib/components/ui/Scrollbar.svelte";
  import AdminFilterBar from "$lib/components/admin/AdminFilterBar.svelte";
  import AdminFilterTabs from "$lib/components/admin/AdminFilterTabs.svelte";
  import AdminSearchInput from "$lib/components/admin/AdminSearchInput.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  let message: { type: "success" | "error"; text: string } | null = null;
  let stoppingId: string | null = null;

  // Client-side filters over the already-loaded workspace rows.
  let search = "";
  let presence = "all";
  let docker = "all";

  $: query = search.trim().toLowerCase();

  $: activeCount = data.rows.filter((r) => !r.isInactive).length;
  $: inactiveCount = data.rows.filter((r) => r.isInactive).length;
  $: runningCount = data.rows.filter((r) => r.dockerRunning).length;
  $: stoppedCount = data.rows.filter((r) => !r.dockerRunning).length;

  $: hasFilters = query !== "" || presence !== "all" || docker !== "all";

  $: filteredRows = data.rows.filter((row) => {
    if (presence === "active" && row.isInactive) return false;
    if (presence === "inactive" && !row.isInactive) return false;
    if (docker === "running" && !row.dockerRunning) return false;
    if (docker === "stopped" && row.dockerRunning) return false;
    if (!query) return true;
    return [
      row.user.name,
      row.user.email,
      row.user.username,
      row.stackName,
      row.scenarioName,
      row.workspaceId,
      row.status
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  function clearFilters() {
    search = "";
    presence = "all";
    docker = "all";
  }

  function shortId(id: string) {
    return id.length > 12 ? id.slice(0, 12) + "…" : id;
  }
</script>

<div class="page-container py-6">
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="font-heading text-3xl font-bold tracking-tight text-obsidian-text-primary">
       <Boxes class="inline h-6 w-6 mr-2" />
        Container Overview
      </h1>
      <p class="mt-1 font-body text-md text-obsidian-text-muted">
        Stop containers for inactive users. Presence updates only while a user is on a
        workspace or tutorial page.
      </p>
    </div>

    <button
      type="button"
      on:click={() => invalidateAll()}
      class="btn-cyber btn-cyber-outline !px-3 !py-2 flex items-center gap-2"
    >
      <RefreshCw class="h-4 w-4" />
      Refresh
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

  {#if data.dockerError}
    <div class="mb-4 rounded-card border border-cyber-danger/30 bg-cyber-danger/10 p-3 text-cyber-danger">
      <p class="font-label text-md  ">
        Docker daemon unreachable — states shown as stopped.
      </p>
    </div>
  {/if}

  <AdminFilterBar
    count={filteredRows.length}
    total={data.rows.length}
    noun="workspace"
    active={hasFilters}
    onClear={clearFilters}
  >
    <AdminSearchInput
      bind:value={search}
      label="Search workspaces"
      placeholder="Search user, scenario or workspace…"
    />
    <AdminFilterTabs
      label="Presence filter"
      bind:value={presence}
      options={[
        { value: "all", label: "All", count: data.rows.length },
        { value: "active", label: "Active", count: activeCount },
        { value: "inactive", label: "Inactive", count: inactiveCount }
      ]}
    />
    <AdminFilterTabs
      label="Docker state filter"
      bind:value={docker}
      options={[
        { value: "all", label: "Any Docker", count: data.rows.length },
        { value: "running", label: "Running", count: runningCount },
        { value: "stopped", label: "Stopped", count: stoppedCount }
      ]}
    />
  </AdminFilterBar>

  <div
    class="card-cyber overflow-hidden"
    style="border-color: rgb(var(--accent-rgb) / 0.15)"
  >
    <Scrollbar horizontal>
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-obsidian-accent/15">
            <th class="px-4 py-3 font-label text-sm uppercase tracking-[0.04em] text-obsidian-text-muted">User</th>
            <th class="px-4 py-3 font-label text-sm uppercase tracking-[0.04em] text-obsidian-text-muted">Stack</th>
            <th class="px-4 py-3 font-label text-sm uppercase tracking-[0.04em] text-obsidian-text-muted">Scenario / Level</th>
            <th class="px-4 py-3 font-label text-sm uppercase tracking-[0.04em] text-obsidian-text-muted">Workspace</th>
            <th class="px-4 py-3 font-label text-sm uppercase tracking-[0.04em] text-obsidian-text-muted">Docker</th>
            <th class="px-4 py-3 font-label text-sm uppercase tracking-[0.04em] text-obsidian-text-muted">Presence</th>
            <th class="px-4 py-3 font-label text-sm uppercase tracking-[0.04em] text-obsidian-text-muted">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-obsidian-accent/10">
          {#each filteredRows as row (row.workspaceId)}
            <tr class="hover:bg-obsidian-accent/5">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <User class="h-4 w-4 text-obsidian-text-muted" />
                  <div>
                    <p class="font-mono text-base text-obsidian-text-primary">
                      {row.user.name}
                    </p>
                    <p class="font-mono text-sm text-obsidian-text-muted">
                      {row.user.email}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 font-mono text-base text-obsidian-text-primary">
                {row.stackName ?? '—'}
              </td>
              <td class="px-4 py-3 font-mono text-base text-obsidian-text-primary">
                <div>{row.scenarioName}</div>
                <div class="text-sm text-obsidian-text-muted">Level {row.level}</div>
              </td>
              <td class="px-4 py-3 font-mono text-base text-obsidian-text-primary">
                {row.status}
              </td>
              <td class="px-4 py-3">
                {#if row.dockerRunning}
                  <span class="tag-cyber tag-green inline-flex items-center gap-1.5">
                    <Play class="h-3 w-3" />
                    Running
                  </span>
                  {#if row.dockerState}
                    <span class="ml-2 font-mono text-sm text-obsidian-text-muted">
                      {row.dockerState.replace(/^Up\s+/, '').replace(/^Exited\s+/, '')}
                    </span>
                  {/if}
                {:else}
                  <span
                    class="tag-cyber inline-flex items-center gap-1.5 border border-obsidian-text-muted/20 bg-obsidian-text-muted/10 text-obsidian-text-muted"
                  >
                    <Square class="h-3 w-3" />
                    Stopped
                  </span>
                {/if}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span
                    class="tag-cyber inline-flex items-center gap-1.5 {row.isInactive
                      ? 'border border-cyber-danger/30 bg-cyber-danger/10 text-cyber-danger'
                      : 'tag-green'}"
                  >
                    <Activity class="h-3 w-3" />
                    {row.presenceLabel}
                  </span>
                  <span class="font-mono text-sm text-obsidian-text-muted">
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
                    class="btn-cyber btn-cyber-danger !px-3 !py-1.5 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-cyber-danger/40 disabled:cursor-not-allowed disabled:opacity-40"
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
              <td colspan="7" class="px-4 py-8 text-center font-label text-sm text-obsidian-text-muted">
                {hasFilters
                  ? "No workspaces match the current filters."
                  : "No active containers found."}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </Scrollbar>
  </div>
</div>
