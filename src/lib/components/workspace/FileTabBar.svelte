<script lang="ts" context="module">
  export interface FileTab {
    id: string;       // full file path — used as unique key
    filename: string; // display name (basename)
    isDirty: boolean; // unsaved changes?
  }
</script>

<script lang="ts">
  import { X } from 'lucide-svelte';

  export let tabs: FileTab[] = [];
  export let activeTabId: string = '';
  export let onTabClick: (id: string) => void;
  export let onTabClose: (id: string) => void;

  function extColor(filename: string): string {
    const ext = filename.split('.').pop() ?? '';
    if (['ts', 'tsx'].includes(ext)) return '#3b82f6';
    if (['js', 'jsx'].includes(ext)) return '#ffb400';
    if (['css', 'scss'].includes(ext)) return '#a855f7';
    if (['html', 'svelte'].includes(ext)) return '#ff6b35';
    if (['json'].includes(ext)) return '#f59e0b';
    if (['md', 'mdx'].includes(ext)) return '#10b981';
    return '#07a5c9';
  }
</script>

<!-- Horizontally scrollable tab strip — hides scrollbar visually -->
<div
  class="flex overflow-x-auto flex-shrink-0"
  style="scrollbar-width:none;-ms-overflow-style:none;"
>
  {#each tabs as tab (tab.id)}
    {@const isActive = tab.id === activeTabId}
    {@const color = extColor(tab.filename)}

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      role="tab"
      tabindex="0"
      class="group relative flex items-center gap-1.5 px-3 py-[7px] border-r border-[rgba(7,165,201,0.08)]
             cursor-pointer flex-shrink-0 max-w-[160px] select-none transition-colors
             {isActive
               ? 'bg-[#12192a] text-[#d0d7dd] border-t-2 border-t-[#07a5c9]'
               : 'bg-[#0a0e1a] text-[#8892a0] border-t-2 border-t-transparent hover:bg-[rgba(7,165,201,0.04)] hover:text-[#c0cdd6]'}"
      on:click={() => onTabClick(tab.id)}
      on:keydown={(e) => e.key === 'Enter' && onTabClick(tab.id)}
      title={tab.id}
    >
      <!-- Language colour dot -->
      <span
        class="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all"
        style="background:{color};{isActive ? `box-shadow:0 0 5px ${color}80;` : 'opacity:0.55;'}"
      ></span>

      <!-- Filename (truncated) -->
      <span class="text-[0.7rem] font-mono truncate leading-none min-w-0 flex-1">{tab.filename}</span>

      <!-- Dirty indicator / Close button slot -->
      <span class="flex-shrink-0 flex items-center justify-center w-3.5 h-3.5 relative">
        <!-- Dirty dot — visible at rest, hidden on hover -->
        {#if tab.isDirty}
          <span
            class="group-hover:opacity-0 transition-opacity absolute text-[#07a5c9] text-[10px] leading-none pointer-events-none"
          >●</span>
        {/if}

        <!-- Close button — visible on hover, always visible on active tab -->
        <button
          class="transition-opacity flex items-center justify-center w-full h-full rounded
                 hover:bg-[rgba(255,255,255,0.1)] hover:text-white
                 {isActive || tab.isDirty ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'}"
          on:click|stopPropagation={() => onTabClose(tab.id)}
          aria-label="Close {tab.filename}"
        >
          <X class="w-2.5 h-2.5" />
        </button>
      </span>
    </div>
  {/each}
</div>
