<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { CheckCircle2 } from 'lucide-svelte';

  /** Success popup shown after any purchase/exchange completes. */
  export let open = false;
  export let title = 'PURCHASE COMPLETE';
  export let closeLabel = 'Close';
  export let onClose: () => void = () => {};
</script>

{#if open}
  <div
    class="fixed inset-0 z-[100] bg-obsidian-bg/80 backdrop-blur-sm flex items-center justify-center p-6"
    transition:fade={{ duration: 200 }}
  >
    <div
      class="w-full max-w-sm bg-obsidian-bg-light border border-cyber-cyan/30 rounded-card p-8 text-center shadow-[0_0_40px_rgba(7,165,201,0.15)]"
      transition:fly={{ y: 20, duration: 300 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchase-success-title"
    >
      <div class="w-16 h-16 mx-auto mb-5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center">
        <CheckCircle2 class="w-8 h-8 text-cyber-cyan" />
      </div>

      <h3 id="purchase-success-title" class="text-xl font-orbitron font-bold text-obsidian-text-muted mb-2 tracking-wider">
        {title}
      </h3>

      <div class="text-base font-rajdhani text-obsidian-text-primary/70 mb-6">
        <slot />
      </div>

      <button
        on:click={onClose}
        class="btn-cyber btn-cyber-solid w-full !py-3 font-orbitron font-bold uppercase tracking-wider"
      >
        {closeLabel}
      </button>
    </div>
  </div>
{/if}

<svelte:window
  on:keydown={(e) => {
    if (e.key === 'Escape' && open) onClose();
  }}
/>
