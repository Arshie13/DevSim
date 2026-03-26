<script lang="ts">
  import { Coins, Bot } from 'lucide-svelte';
  import { AI_NAME, AI_AVATAR, COSTS } from './constants';
  
  export let currentCoins: number;
  export let onRequestHint: () => void;
  export let quickHintLoading: boolean;
  export let disabled: boolean;
  export let avatarFailed: boolean;
  
  $: hasEnoughCoins = currentCoins >= COSTS.CHAT_HINT;
</script>

<div class="p-4 border-b border-zinc-800">
  <!-- SAZ Profile Header -->
  <div class="flex items-center gap-3 mb-4">
    {#if avatarFailed}
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
        SAZ
      </div>
    {:else}
      <img 
        src={AI_AVATAR} 
        alt="{AI_NAME} avatar" 
        class="w-10 h-10 rounded-full object-cover shadow-lg"
        on:error={() => avatarFailed = true}
      />
    {/if}
    <div class="flex-1 flex items-center justify-between">
      <div>
        <p class="text-sm font-semibold text-gray-200">{AI_NAME}</p>
        <p class="text-xs text-gray-400">AI Coding Assistant</p>
      </div>
      <div class="flex items-center gap-1 bg-yellow-600/20 px-2 py-1 rounded-lg">
        <Coins class="w-3 h-3 text-yellow-500" />
        <span class="text-xs font-medium text-yellow-500">{currentCoins}</span>
      </div>
    </div>
  </div>
  
  <button
    on:click={onRequestHint}
    disabled={quickHintLoading || disabled}
    class="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg transition-all text-sm font-medium text-white"
  >
    <Bot class="w-4 h-4" />
    Ask AI
  </button>

  {#if !hasEnoughCoins}
    <p class="text-xs text-yellow-500 text-center mt-2">
      ⚠️ Not enough coins ({currentCoins}/{COSTS.CHAT_HINT})
    </p>
  {:else}
    <p class="text-xs text-gray-500 text-center mt-2">
      💰 Chat: {COSTS.CHAT_HINT} coins ({COSTS.PER_ATTACHED_FILE} coins per attached file)
    </p>
  {/if}
</div>