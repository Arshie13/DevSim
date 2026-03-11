<script lang="ts">
  import { FileCode, Shell, Globe, LayoutDashboard } from 'lucide-svelte';

  /** The currently active tab. */
  export let activeTab: 'editor' | 'terminal' | 'preview' | 'board';

  /** Fired when the user selects a tab. */
  export let onTabChange: (tab: 'editor' | 'terminal' | 'preview' | 'board') => void;

  const LEFT_TABS = [
    { id: 'editor'   as const, icon: FileCode,       label: 'Editor'   },
    { id: 'terminal' as const, icon: Shell,           label: 'Terminal' },
    { id: 'preview'  as const, icon: Globe,           label: 'Preview'  },
    { id: 'board' as const, icon: LayoutDashboard, label: 'Board' },
  ];
</script>

<!-- Per UIUX spec: active tab gets border-top accent + bg var(--bg) -->
<!-- Board tab is pushed to the far right via flex-1 spacer -->
<div class="bg-[#0a0e1a] border-b border-[rgba(7,165,201,0.1)] flex items-end">
  {#each LEFT_TABS as tab}
    <button
      on:click={() => onTabChange(tab.id)}
      class="relative px-5 py-2.5 flex items-center gap-2 text-[0.75rem] sm:text-[0.85rem] uppercase tracking-wider border-t-2 transition-all whitespace-nowrap
        {activeTab === tab.id
          ? 'border-[#07a5c9] text-[#07a5c9] bg-[#12192a]'
          : 'border-transparent text-[#8892a0] hover:text-[#d0d7dd] hover:bg-[rgba(7,165,201,0.04)]'}"
      style="font-family: 'Space Mono', monospace;"
    >
      <svelte:component this={tab.icon} class="w-4 h-4 flex-shrink-0" />
      <span class="hidden sm:inline">{tab.label}</span>
    </button>
  {/each}
</div>
