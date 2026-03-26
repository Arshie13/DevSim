<script lang="ts">
  import { X } from 'lucide-svelte';
  import { AI_NAME, AI_AVATAR, COSTS } from './constants';
  import { formatMessage } from '$lib/ai'; // Your existing formatter
  
  export let show: boolean;
  export let message: string;
  export let loading: boolean;
  export let initialCoins: number;
  export let onClose: () => void;
  export let avatarFailed: boolean;
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

{#if show}
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    role="button"
    tabindex="0"
    on:click={onClose}
    on:keydown={handleKeydown}
  >
    <div
      class="bg-[#12192a] border border-[#27272a] rounded-lg max-w-md w-full p-4"
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="dialog"
      aria-modal="true"
      tabindex={1}
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          {#if avatarFailed}
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              SAZ
            </div>
          {:else}
            <img 
              src={AI_AVATAR} 
              alt="{AI_NAME} avatar" 
              class="w-8 h-8 rounded-full object-cover"
              on:error={() => avatarFailed = true}
            />
          {/if}
          <span class="font-medium text-gray-200">{AI_NAME}</span>
        </div>
        <button on:click={onClose} class="text-gray-400 hover:text-gray-200">
          <X class="w-5 h-5" />
        </button>
      </div>

      {#if loading}
        <div class="flex items-center justify-center py-8">
          <div class="flex gap-1">
            <span class="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 0ms;"></span>
            <span class="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 150ms;"></span>
            <span class="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 300ms;"></span>
          </div>
        </div>
      {:else}
        <div class="text-sm text-gray-300 whitespace-pre-wrap">
          {@html formatMessage(message)}
        </div>
        <div class="mt-3 pt-3 border-t border-[#27272a] flex items-center justify-between text-xs text-gray-500">
          <span>Coins spent: {COSTS.QUICK_HINT}</span>
          <span>Coins remaining: {initialCoins}</span>
        </div>
      {/if}
    </div>
  </div>
{/if}
