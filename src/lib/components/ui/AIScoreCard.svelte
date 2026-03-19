<script lang="ts">
  export let stars = 1;
  export let score = 50;
  export let feedback = '';
  export let improvements = '';
  export let nextTime = '';

  let open = false;

  $: scoreClass = score >= 75 ? 'text-[var(--success)]' : score >= 50 ? 'text-[var(--warn)]' : 'text-[var(--danger)]';
</script>

<div class="overflow-hidden rounded-[6px] border border-[rgba(7,165,201,0.25)] bg-[rgba(10,14,26,0.9)]">
  <div class="flex items-center justify-between px-4 py-3">
    <div class="flex items-center gap-2">
      {#each [1, 2, 3] as star}
        <span class="text-xl {star <= stars ? 'text-[var(--warn)]' : 'text-[var(--surface)]'}">
          {star <= stars ? '★' : '☆'}
        </span>
      {/each}
      <span class="ml-1 [font-family:var(--font-mono)] text-sm font-bold {scoreClass}">
        {score}<span class="font-normal text-[var(--text-muted)]">/100</span>
      </span>
    </div>
    <button
      on:click={() => (open = !open)}
      class="flex items-center gap-1 [font-family:var(--font-mono)] text-[0.7rem] text-[var(--accent)] transition-colors hover:text-[var(--cyan-bright)]"
    >
      {open ? 'Hide' : 'View'} feedback
      <span class="transition-transform duration-200 {open ? 'rotate-180' : ''}">▾</span>
    </button>
  </div>

  {#if open}
    <div class="space-y-3 max-h-[200px] overflow-y-auto border-t border-[rgba(7,165,201,0.15)] px-4 py-3 text-left scrollbar-thin">
      <p class="[font-family:var(--font-mono)] text-[0.78rem] leading-relaxed text-[var(--text-muted)]">
        {feedback}
      </p>

      {#if improvements}
        <div>
          <p class="mb-1 flex items-center gap-1 [font-family:var(--font-mono)] text-[0.65rem] tracking-[0.12em] uppercase text-[var(--warn)]">
            <span>🔧</span> What to Improve
          </p>
          <div class="whitespace-pre-line rounded border border-[rgba(255,180,0,0.18)] bg-[var(--bg)] px-3 py-2 [font-family:var(--font-body)] text-[0.75rem] leading-relaxed text-[var(--text-primary)]">
            {improvements}
          </div>
        </div>
      {/if}

      {#if nextTime}
        <div>
          <p class="mb-1 flex items-center gap-1 [font-family:var(--font-mono)] text-[0.65rem] tracking-[0.12em] uppercase text-[var(--success)]">
            <span>💡</span> Next Time
          </p>
          <div class="whitespace-pre-line rounded border border-[rgba(0,229,160,0.18)] bg-[var(--bg)] px-3 py-2 [font-family:var(--font-body)] text-[0.75rem] leading-relaxed text-[var(--text-primary)]">
            {nextTime}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
