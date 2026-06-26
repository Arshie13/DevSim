<script lang="ts">
  import { goto } from "$app/navigation";

  interface ExistingSandbox {
    id: string;
    createdAt: Date;
  }

  let { data }: { data: { sandboxEnabled: boolean; purchased: boolean; existingSandbox: ExistingSandbox | null } } = $props();

  let loading = $state(false);
  let errorMsg = $state("");

  async function launchSandbox() {
    loading = true;
    errorMsg = "";
    try {
      const res = await fetch("/api/docker/container/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "sandbox",
          stackName: "sandbox",
          level: 1,
          stacks: {},
          scenarioId: "",
          projectFolder: "",
          scenarioTitle: "Sandbox",
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        errorMsg = result.error || "Failed to launch sandbox";
        return;
      }

      goto(`/workspace/${result.dbContainerId}`);
    } catch {
      errorMsg = "Network error — try again";
    } finally {
      loading = false;
    }
  }

  function startPurchase() {
    goto("/sandbox/payment");
  }

  function continueSandbox(id: string) {
    goto(`/workspace/${id}`);
  }

  function goBack() {
    goto("/dashboard");
  }
</script>

<div class="p-6">
  <button
    onclick={goBack}
    class="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-4 [font-family:var(--font-mono)] text-sm"
  >
    ← Back to Dashboard
  </button>

  <div class="mb-6">
    <h1 class="[font-family:var(--font-heading)] text-2xl font-medium text-[var(--text-primary)]">
      Sandbox
    </h1>
    <p class="mt-1 [font-family:var(--font-mono)] text-sm text-[var(--text-muted)]">
      Blank workspace with PostgreSQL
    </p>
  </div>

  {#if errorMsg}
    <div class="mb-4 p-3 rounded border border-[rgba(255,68,68,0.3)] bg-[rgba(255,68,68,0.1)] text-[var(--danger)]">
      <p class="[font-family:var(--font-mono)] text-sm">{errorMsg}</p>
    </div>
  {/if}

  {#if !data.sandboxEnabled}
    <div class="rounded border border-[rgba(255,68,68,0.2)] bg-[rgba(10,14,26,0.72)] p-4">
      <p class="[font-family:var(--font-mono)] text-sm text-[var(--text-muted)]">
        Sandbox is currently disabled.
      </p>
    </div>
  {:else if !data.purchased}
    <div class="rounded border border-[rgba(7,165,201,0.2)] bg-[rgba(10,14,26,0.72)] p-4">
      <p class="[font-family:var(--font-mono)] text-sm text-[var(--text-muted)] mb-4">
        Purchase one-time sandbox access to get a blank workspace with PostgreSQL.
      </p>
      <button
        onclick={startPurchase}
        disabled={loading}
        class="rounded bg-[rgba(7,165,201,0.1)] px-4 py-2 font-medium text-[var(--accent)] transition-colors hover:bg-[rgba(7,165,201,0.2)] disabled:opacity-50"
      >
        Purchase Sandbox Access — ₱199
      </button>
    </div>
  {:else if data.existingSandbox}
    <div class="rounded border border-[rgba(7,165,201,0.2)] bg-[rgba(10,14,26,0.72)] p-4 mb-4">
      <p class="[font-family:var(--font-mono)] text-sm text-[var(--text-muted)] mb-2">
        You have an active sandbox workspace (created {new Date(data.existingSandbox.createdAt).toLocaleDateString()}).
      </p>
      <button
        onclick={() => continueSandbox(data.existingSandbox!.id)}
        class="rounded bg-[rgba(7,165,201,0.1)] px-4 py-2 font-medium text-[var(--accent)] transition-colors hover:bg-[rgba(7,165,201,0.2)]"
      >
        Continue Existing Sandbox
      </button>
    </div>
  {:else}
    <div class="rounded border border-[rgba(7,165,201,0.2)] bg-[rgba(10,14,26,0.72)] p-4 mb-4">
      <button
        onclick={launchSandbox}
        disabled={loading}
        class="rounded bg-[rgba(0,229,160,0.1)] px-6 py-3 font-medium text-[var(--success)] transition-colors hover:bg-[rgba(0,229,160,0.2)] disabled:opacity-50"
      >
        {loading ? "Launching..." : "Launch Sandbox"}
      </button>
    </div>

    <div class="rounded border border-[rgba(255,180,0,0.15)] bg-[rgba(255,180,0,0.03)] p-4">
      <p class="[font-family:var(--font-heading)] text-sm font-medium text-[var(--text-primary)] mb-2">Container Details</p>
      <ul class="[font-family:var(--font-mono)] text-xs text-[var(--text-muted)] space-y-1.5 list-disc list-inside">
        <li>Alpine Linux with Node.js, pnpm, bash, and git pre-installed.</li>
        <li>PostgreSQL running inside the container (user: devsim, database: devsim, localhost:5432).</li>
        <li>Memory capped at 512MB.</li>
        <li>Preview ports 3000, 5000, and 5173 are exposed.</li>
        <li>One active sandbox per account.</li>
        <li>Container is ephemeral — data not backed up persists only while running.</li>
      </ul>
    </div>
  {/if}
</div>
