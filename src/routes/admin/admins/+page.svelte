<!--
  Admin → Admins (SUPERADMIN only).

  Lets a superadmin grant or revoke the ADMIN role. The nav entry and this page
  are both gated on the SUPERADMIN role server-side; hiding the link is only
  cosmetic. SUPERADMIN accounts cannot be demoted here.
-->
<script lang="ts">
  import { enhance } from "$app/forms";
  import { ShieldCheck, Search, UserPlus, UserMinus, Loader2, Crown } from "lucide-svelte";
  import AdminFilterBar from "$lib/components/admin/AdminFilterBar.svelte";
  import AdminFilterTabs from "$lib/components/admin/AdminFilterTabs.svelte";
  import AdminSearchInput from "$lib/components/admin/AdminSearchInput.svelte";

  interface AdminRow {
    id: string;
    name: string;
    email: string;
    username: string;
    image: string | null;
    role: string;
  }

  interface CandidateRow {
    id: string;
    name: string;
    email: string;
    username: string;
    image: string | null;
  }

  export let data: { admins: AdminRow[]; candidates: CandidateRow[]; q: string };
  export let form: { success?: boolean; message?: string } | null = null;

  let pendingId: string | null = null;

  // Client-side filters for the "Current admins" list (the promote search above
  // round-trips to the server via ?q= because it queries the whole user table).
  let adminSearch = "";
  let roleFilter = "all";

  $: adminQuery = adminSearch.trim().toLowerCase();
  $: superAdminCount = data.admins.filter((a) => a.role === "SUPERADMIN").length;
  $: plainAdminCount = data.admins.length - superAdminCount;
  $: hasAdminFilters = adminQuery !== "" || roleFilter !== "all";
  $: filteredAdmins = data.admins.filter((admin) => {
    if (roleFilter === "ADMIN" && admin.role !== "ADMIN") return false;
    if (roleFilter === "SUPERADMIN" && admin.role !== "SUPERADMIN") return false;
    if (!adminQuery) return true;
    return [admin.name, admin.email, admin.username]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(adminQuery));
  });

  function clearAdminFilters() {
    adminSearch = "";
    roleFilter = "all";
  }

  function initial(name: string, username: string) {
    return (name || username || "?").charAt(0).toUpperCase();
  }

  $: message = form?.message
    ? { ok: form.success === true, text: form.message }
    : null;
</script>

<div class="page-container py-6">
  <div class="mb-8">
    <h1 class="font-heading text-3xl font-bold tracking-tight text-obsidian-text-primary">
      <ShieldCheck class="inline h-6 w-6 mr-2" />
      Admin Management
    </h1>
    <p class="mt-1 font-body text-md text-obsidian-text-muted">
      Promote users to admin or revoke existing admins. Visible to superadmins only.
    </p>
  </div>

  {#if message}
    <div
      class="mb-4 rounded-card border p-3 {message.ok
        ? 'border-cyber-success/30 bg-cyber-success/10 text-cyber-success'
        : 'border-cyber-danger/30 bg-cyber-danger/10 text-cyber-danger'}"
    >
      <p class="font-label text-sm">{message.text}</p>
    </div>
  {/if}

  <div class="space-y-5">
    <!-- Promote a user -->
    <div class="card-cyber" style="border-color: rgb(var(--accent-rgb) / 0.15)">
      <div class="card-cyber-body">
        <h2 class="flex items-center gap-2 font-heading text-xl font-semibold text-obsidian-text-primary">
          <UserPlus class="h-5 w-5" />
          Promote a user
        </h2>
        <p class="mt-1 font-body text-md text-obsidian-text-muted">
          Search by name, username or email, then grant the admin role.
        </p>

        <form method="GET" action="/admin/admins" class="mt-4 flex items-center gap-2">
          <div class="relative flex-1">
            <Search
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-obsidian-text-muted"
            />
            <input
              type="search"
              name="q"
              value={data.q}
              placeholder="Search users…"
              autocomplete="off"
              class="w-full rounded-card border border-[var(--card-border)] bg-obsidian-surface/40 py-2 pl-9 pr-3 font-body text-base text-obsidian-text-primary placeholder:text-obsidian-text-muted focus:border-obsidian-accent/50 focus:outline-none"
            />
          </div>
          <button type="submit" class="btn-cyber btn-cyber-outline">Search</button>
        </form>

        {#if data.q.length >= 2}
          <div class="mt-4 space-y-2">
            {#if data.candidates.length === 0}
              <p class="font-body text-sm text-obsidian-text-muted">
                No non-admin users match “{data.q}”.
              </p>
            {:else}
              {#each data.candidates as user (user.id)}
                <div
                  class="flex items-center justify-between gap-3 rounded-card border border-[var(--card-border)] bg-obsidian-surface/40 px-3 py-2"
                >
                  <div class="flex min-w-0 items-center gap-3">
                    {#if user.image}
                      <img
                        src={user.image}
                        alt=""
                        class="h-9 w-9 shrink-0 rounded-full border border-[var(--card-border)] object-cover"
                      />
                    {:else}
                      <span
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--card-border)] bg-obsidian-bg font-heading text-sm font-semibold text-obsidian-accent"
                      >
                        {initial(user.name, user.username)}
                      </span>
                    {/if}
                    <div class="min-w-0">
                      <p class="truncate font-body text-base text-obsidian-text-primary">
                        {user.name || user.username}
                      </p>
                      <p class="truncate font-mono text-sm text-obsidian-text-muted">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <form
                    method="POST"
                    action="?/promote"
                    use:enhance={() => {
                      pendingId = user.id;
                      return async ({ update }) => {
                        await update();
                        pendingId = null;
                      };
                    }}
                  >
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      class="btn-cyber btn-cyber-solid flex items-center gap-2 px-3 py-1.5"
                      disabled={pendingId === user.id}
                    >
                      {#if pendingId === user.id}
                        <Loader2 class="h-4 w-4 animate-spin" />
                      {:else}
                        <UserPlus class="h-4 w-4" />
                      {/if}
                      Promote
                    </button>
                  </form>
                </div>
              {/each}
            {/if}
          </div>
        {:else if data.q.length > 0}
          <p class="mt-4 font-body text-sm text-obsidian-text-muted">
            Type at least 2 characters to search.
          </p>
        {/if}
      </div>
    </div>

    <!-- Current admins -->
    <div class="card-cyber" style="border-color: rgb(var(--accent-rgb) / 0.15)">
      <div class="card-cyber-body">
        <h2 class="flex items-center gap-2 font-heading text-xl font-semibold text-obsidian-text-primary">
          <ShieldCheck class="h-5 w-5" />
          Current admins
        </h2>
        <p class="mt-1 font-body text-md text-obsidian-text-muted">
          {data.admins.length} admin{data.admins.length === 1 ? "" : "s"}.
          Superadmins can’t be revoked here.
        </p>

        <div class="mt-4">
          <AdminFilterBar
            count={filteredAdmins.length}
            total={data.admins.length}
            noun="admin"
            active={hasAdminFilters}
            onClear={clearAdminFilters}
          >
            <AdminSearchInput
              bind:value={adminSearch}
              label="Search admins"
              placeholder="Search name or email…"
            />
            <AdminFilterTabs
              label="Role filter"
              bind:value={roleFilter}
              options={[
                { value: "all", label: "All", count: data.admins.length },
                { value: "ADMIN", label: "Admins", count: plainAdminCount },
                { value: "SUPERADMIN", label: "Superadmins", count: superAdminCount }
              ]}
            />
          </AdminFilterBar>
        </div>

        <div class="mt-4 space-y-2">
          {#each filteredAdmins as user (user.id)}
            <div
              class="flex items-center justify-between gap-3 rounded-card border border-[var(--card-border)] bg-obsidian-surface/40 px-3 py-2"
            >
              <div class="flex min-w-0 items-center gap-3">
                {#if user.image}
                  <img
                    src={user.image}
                    alt=""
                    class="h-9 w-9 shrink-0 rounded-full border border-[var(--card-border)] object-cover"
                  />
                {:else}
                  <span
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--card-border)] bg-obsidian-bg font-heading text-sm font-semibold text-obsidian-accent"
                  >
                    {initial(user.name, user.username)}
                  </span>
                {/if}
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="truncate font-body text-base text-obsidian-text-primary">
                      {user.name || user.username}
                    </p>
                    {#if user.role === "SUPERADMIN"}
                      <span class="tag-cyber tag-purple flex items-center gap-1">
                        <Crown class="h-3 w-3" />
                        Superadmin
                      </span>
                    {:else}
                      <span class="tag-cyber tag-cyan">Admin</span>
                    {/if}
                  </div>
                  <p class="truncate font-mono text-sm text-obsidian-text-muted">
                    {user.email}
                  </p>
                </div>
              </div>

              {#if user.role !== "SUPERADMIN"}
                <form
                  method="POST"
                  action="?/revoke"
                  use:enhance={() => {
                    pendingId = user.id;
                    return async ({ update }) => {
                      await update();
                      pendingId = null;
                    };
                  }}
                >
                  <input type="hidden" name="userId" value={user.id} />
                  <button
                    type="submit"
                    class="btn-cyber btn-cyber-danger flex items-center gap-2 px-3 py-1.5"
                    disabled={pendingId === user.id}
                  >
                    {#if pendingId === user.id}
                      <Loader2 class="h-4 w-4 animate-spin" />
                    {:else}
                      <UserMinus class="h-4 w-4" />
                    {/if}
                    Revoke
                  </button>
                </form>
              {/if}
            </div>
          {:else}
            <p class="font-body text-sm text-obsidian-text-muted">
              {hasAdminFilters
                ? "No admins match the current filters."
                : "No admins yet."}
            </p>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
