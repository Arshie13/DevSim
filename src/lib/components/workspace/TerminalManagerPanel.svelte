<script lang="ts">
  import { Plus, Trash } from 'lucide-svelte';

  export let sessions: { id: string; label: string }[] = [];
  export let activeId: string = '';
  export let onSwitch: (id: string) => void;
  export let onAdd: () => void;
  export let onClose: (id: string) => void;

  const MAX_TERMINALS = 3;
  $: canAdd = sessions.length < MAX_TERMINALS;
</script>

<aside
  class="w-44 flex-shrink-0 bg-[#0d1321] border-l border-[rgba(7,165,201,0.1)] flex flex-col"
  style="font-family:'Share Tech Mono',monospace;"
>
  <!-- Header -->
  <div class="px-3 py-2.5 border-b border-[rgba(7,165,201,0.1)] flex items-center justify-between flex-shrink-0">
    <span class="text-[0.8rem] uppercase tracking-widest text-[#8892a0]">Terminals</span>
    <button
      on:click={onAdd}
      disabled={!canAdd}
      title={canAdd ? 'New Terminal' : 'Max 3 terminals'}
      class="w-5 h-5 flex items-center justify-center text-[#8892a0]
             hover:text-[#07a5c9] hover:bg-[rgba(7,165,201,0.08)]
             disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      <Plus class="w-4 h-4" />
    </button>
  </div>

  <!-- Session list -->
  <div class="flex-1 overflow-y-auto py-1">
    {#each sessions as session (session.id)}
      <div
        role="button"
        tabindex="0"
        class="group flex items-center gap-2 px-3 py-2 cursor-pointer select-none transition-colors
               {session.id === activeId
                 ? 'bg-[rgba(7,165,201,0.12)] text-[#07a5c9]'
                 : 'text-[#8892a0] hover:bg-[rgba(7,165,201,0.05)] hover:text-[#c0cdd6]'}"
        on:click={() => onSwitch(session.id)}
        on:keydown={(e) => e.key === 'Enter' && onSwitch(session.id)}
      >
        <!-- Active indicator dot -->
        <span
          class="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all"
          style={session.id === activeId
            ? 'background:#07a5c9;box-shadow:0 0 5px rgba(7,165,201,0.6);'
            : 'background:#4a5568;'}
        ></span>

        <span class="text-[0.9rem] flex-1 truncate">{session.label}</span>

        <!-- Close button -->
        <button
          on:click|stopPropagation={() => onClose(session.id)}
          class="opacity-0 group-hover:opacity-100 transition-opacity
                 w-4 h-4 flex items-center justify-center
                 hover:text-[#ff3860]"
          aria-label="Close {session.label}"
        >
          <Trash class="w-4 h-4" />
        </button>
      </div>
    {/each}

    {#if sessions.length === 0}
      <p class="px-3 py-3 text-[0.65rem] text-[#8892a0] opacity-50">No terminals open</p>
    {/if}
  </div>

  <!-- Footer: terminal count -->
  <div class="px-3 py-2 border-t border-[rgba(7,165,201,0.08)] flex-shrink-0">
    <span class="text-[0.58rem] text-[#8892a0] opacity-60 uppercase tracking-widest">
      {sessions.length}/{MAX_TERMINALS} terminals
    </span>
  </div>
</aside>
