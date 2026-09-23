<script lang="ts">
  export let impactedLayers: string[] = [];
  export let expectedLayerCount = 1;
  export let error = '';

  const layerOptions = ['frontend', 'backend', 'database', 'infra/testing'];

  function toggleLayer(layer: string) {
    if (impactedLayers.includes(layer)) {
      impactedLayers = impactedLayers.filter((item) => item !== layer);
      return;
    }
    impactedLayers = [...impactedLayers, layer];
  }
</script>

<div class="mt-3 rounded-card border border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--bg-rgb)/0.72)] px-4 py-3">
  <p class="mb-2 font-label text-xs tabular-nums text-[var(--text-muted)]">
    Select at least {expectedLayerCount} layer{expectedLayerCount > 1 ? 's' : ''} for this sprint.
  </p>
  <div class="flex flex-wrap gap-2">
    {#each layerOptions as layer}
      <button
        type="button"
        data-tour="impacted-layer-{layer}"
        on:click={() => toggleLayer(layer)}
        class="rounded-card border px-3 py-1.5 font-label text-xs uppercase tracking-[0.06em] transition-colors {impactedLayers.includes(layer) ? 'border-[rgb(var(--success-rgb)/0.45)] bg-[rgb(var(--success-rgb)/0.14)] text-[var(--success)]' : 'border-[rgb(var(--text-muted-rgb)/0.35)] bg-[rgb(var(--bg-rgb)/0.8)] text-[var(--text-muted)]'}"
      >
        {impactedLayers.includes(layer) ? '✓ ' : ''}{layer}
      </button>
    {/each}
  </div>
  {#if error}
    <p class="mt-2 rounded-card border border-[rgb(var(--danger-rgb)/0.35)] bg-[rgb(var(--danger-rgb)/0.07)] px-3 py-2 font-body text-sm text-[var(--danger)]">
      ⚠ {error}
    </p>
  {/if}
</div>
