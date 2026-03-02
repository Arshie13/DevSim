<script lang="ts">
  import { FileCode, Shell, Globe } from 'lucide-svelte';

  /** The currently active tab. */
  export let activeTab: 'editor' | 'terminal' | 'preview';

  /** Fired when the user selects a tab. */
  export let onTabChange: (tab: 'editor' | 'terminal' | 'preview') => void;
</script>

<div class="bg-[#12192a] border-b border-[#27272a] flex">
  <button
    on:click={() => onTabChange('editor')}
    class="px-4 py-2 flex items-center gap-2 border-b-2 transition-all {activeTab === 'editor'
      ? 'border-[#07a5c9] text-[#d0d7dd] bg-[#2d3446]'
      : 'border-transparent text-[#d0d7dd]/40 hover:text-[#d0d7dd]'}"
  >
    <FileCode class="w-4 h-4" />
    Editor
  </button>
  <button
    on:click={() => onTabChange('terminal')}
    class="px-4 py-2 flex items-center gap-2 border-b-2 transition-all {activeTab === 'terminal'
      ? 'border-[#07a5c9] text-[#d0d7dd] bg-[#2d3446]'
      : 'border-transparent text-[#d0d7dd]/40 hover:text-[#d0d7dd]'}"
  >
    <Shell class="w-4 h-4" />
    Terminal
  </button>
  <button
    on:click={() => onTabChange('preview')}
    class="px-4 py-2 flex items-center gap-2 border-b-2 transition-all {activeTab === 'preview'
      ? 'border-[#07a5c9] text-[#d0d7dd] bg-[#2d3446]'
      : 'border-transparent text-[#d0d7dd]/40 hover:text-[#d0d7dd]'}"
  >
    <Globe class="w-4 h-4" />
    Preview
  </button>
</div>
