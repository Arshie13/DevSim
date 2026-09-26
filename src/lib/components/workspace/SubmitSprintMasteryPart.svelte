<script lang="ts">
  export let masteryReflection = '';
  export let error = '';
</script>

<div class="mt-3 rounded-card border border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--bg-rgb)/0.72)] px-4 py-3">
  <p class="mb-2 font-body text-sm text-[var(--text-muted)]">
    Explain what you changed and why it works. This is required to unlock the next level.
  </p>
  <textarea
    bind:value={masteryReflection}
    data-tour="mastery-reflection-input"
    rows="4"
    placeholder="Example: I updated the API validation to reject empty titles, then adjusted the frontend form and DB migration so the same constraint is enforced end-to-end..."
    class="w-full resize-y rounded-card border border-[rgb(var(--text-muted-rgb)/0.38)] bg-[rgb(var(--bg-rgb)/0.95)] px-3 py-2 font-body text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[rgb(var(--accent-rgb)/0.6)]"
  ></textarea>
  <p class="mt-1 text-right font-label text-xs tabular-nums text-[var(--text-muted)]">
    {masteryReflection.trim().length} characters
  </p>
  {#if error}
    <p class="mt-2 rounded-card border border-[rgb(var(--danger-rgb)/0.35)] bg-[rgb(var(--danger-rgb)/0.07)] px-3 py-2 font-body text-sm text-[var(--danger)]">
      ⚠ {error}
    </p>
  {/if}
</div>
