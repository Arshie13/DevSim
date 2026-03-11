<script lang="ts">
  import { goto } from '$app/navigation';
  import { FolderOpen, ArrowLeft } from 'lucide-svelte';

  export let stackName: string;
</script>

<div class="flex flex-col items-center justify-center text-center py-20 px-8 gap-4">
  <!-- Icon -->
  <div class="w-20 h-20 flex items-center justify-center rounded-[4px] mb-1
              bg-[var(--accent)]/5 border border-[var(--card-border)]" aria-hidden="true">
    <FolderOpen class="w-10 h-10 text-[var(--accent)]/40" />
  </div>

  <h3 class="font-heading text-[1.3rem] font-semibold text-[var(--text-primary)] tracking-wide">
    No Scenarios Available
  </h3>

  <p class="font-body text-[0.95rem] text-[var(--text-primary)]/50 leading-relaxed max-w-[380px]">
    There are no scenarios configured for <br />
    <code class="font-label text-[0.85rem] text-[var(--accent)]
               bg-[var(--accent)]/8 border border-[var(--accent)]/20
               px-2 py-0.5 rounded-[2px]">{stackName || 'this stack'}</code>
    yet.<br />Check back later or choose a different stack.
  </p>

  <button
    class="btn-cyber btn-cyber-outline flex items-center gap-2 mt-2"
    on:click={() => goto('/stacks')}
  >
    <ArrowLeft class="w-4 h-4" />
    <span>Go Back to Stack Selection</span>
  </button>
</div>
