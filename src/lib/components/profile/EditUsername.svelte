<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Loader2 } from "lucide-svelte";
  import { toast } from "$lib/stores/toast";
  import type { UserData } from "$types";

  export let user: UserData;

  const dispatch = createEventDispatcher<{ update: UserData }>();

  const USERNAME_PATTERN = /^[a-z0-9_-]{3,16}$/;

  let username = user.username ?? "";
  let serverError = "";
  let saving = false;

  $: normalized = username.trim().toLowerCase();
  $: unchanged = normalized === (user.username ?? "").toLowerCase();
  $: invalid = !USERNAME_PATTERN.test(normalized);
  $: clientError =
    normalized !== "" && invalid
      ? "Username must be 3-16 characters: letters, numbers, hyphens and underscores"
      : "";
  $: canSave = !saving && !unchanged && !invalid;

  function onInput() {
    serverError = "";
  }

  async function saveUsername() {
    if (saving || unchanged || invalid) return;
    saving = true;
    serverError = "";
    try {
      const res = await fetch("/api/user/username/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: normalized }),
      });
      const data: { error?: string } | null = await res.json().catch(() => null);
      if (res.status === 409) {
        serverError = "Username already taken";
        return;
      }
      if (res.status === 400) {
        serverError = data?.error ?? "Invalid username";
        return;
      }
      if (!res.ok) {
        toast.error(data?.error ?? "Failed to update username");
        return;
      }
      toast.success("Username updated");
      dispatch("update", { ...user, username: normalized });
    } catch {
      toast.error("Failed to update username");
    } finally {
      saving = false;
    }
  }
</script>

<div class="flex flex-col items-center gap-5">
  <p class="font-body text-xs text-obsidian-text-muted text-center max-w-xs leading-relaxed">
    Your username is your public handle across DevSim. It appears on leaderboards, rival
    profiles and shared links.
  </p>

  <div class="flex flex-col items-center gap-1.5">
    <span
      class="font-label text-xs uppercase tracking-[0.04em] text-obsidian-text-muted"
    >
      Current username
    </span>
    <span class="font-body text-base text-obsidian-text-primary text-center truncate max-w-xs">
      {user.username ?? "Not set"}
    </span>
  </div>

  <form
    class="w-full max-w-xs flex flex-col gap-3"
    on:submit|preventDefault={saveUsername}
  >
    <input
      bind:value={username}
      on:input={onInput}
      type="text"
      autocomplete="off"
      spellcheck="false"
      aria-label="New username"
      placeholder="new_username"
      maxlength="16"
      class="w-full px-3 py-2.5 bg-obsidian-surface border border-obsidian-border/60 rounded-card font-body text-base text-obsidian-text-primary placeholder:text-obsidian-text-muted/50 focus:border-obsidian-accent/60 focus:outline-none transition-colors duration-200"
    />

    <div class="flex justify-end">
      <span
        class="font-label text-xs tracking-[0.04em] {username.length >= 16
          ? 'text-[var(--warn)]'
          : 'text-obsidian-text-muted'}"
      >
        {username.length}/16
      </span>
    </div>

    {#if clientError || serverError}
      <p class="font-body text-sm text-[var(--danger)] text-center" role="alert">
        {clientError || serverError}
      </p>
    {/if}

    <p
      class="font-label text-xs uppercase tracking-[0.04em] text-[var(--warn)] text-center leading-relaxed"
    >
      Renaming breaks previously shared profile links — old /rivals/&lt;name&gt; URLs stop
      working
    </p>

    <button
      type="submit"
      disabled={!canSave}
      class="btn-cyber btn-cyber-solid w-full flex items-center justify-center gap-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
    >
      {#if saving}
        <Loader2 class="w-3.5 h-3.5 animate-spin" />
        Saving...
      {:else}
        Save Username
      {/if}
    </button>
  </form>
</div>
