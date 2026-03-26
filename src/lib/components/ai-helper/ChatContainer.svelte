<script lang="ts">
  import { Bot } from 'lucide-svelte';
  import { AI_NAME, AI_AVATAR } from './constants';
  import ChatMessage from './ChatMessage.svelte';
  import type { ChatMessage as Message } from './types';
  
  export let messages: Message[];
  export let isLoading: boolean;
  export let avatarFailed: boolean;
  export let chatContainer: HTMLDivElement;
  export let onScroll: () => void;
</script>

<div 
  bind:this={chatContainer} 
  class="flex-1 p-4 space-y-4 overflow-y-auto min-h-0" 
  on:scroll={onScroll}
  style="flex: 1 1 auto; height: 100%;"
>
  {#if messages.length === 0}
    <div class="flex flex-col items-center justify-center py-8">
      {#if avatarFailed}
        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl mb-3 shadow-lg mx-auto">
          SAZ
        </div>
      {:else}
        <img 
          src={AI_AVATAR} 
          alt="{AI_NAME} avatar" 
          class="w-16 h-16 rounded-full object-cover mb-3 shadow-lg mx-auto"
          on:error={() => avatarFailed = true}
        />
      {/if}
      <p class="text-sm text-gray-200">Hi! I'm {AI_NAME}, your coding assistant!</p>
      <p class="text-xs text-gray-400 mt-1">Ask me for hints or help with your tasks</p>
    </div>
  {:else}
    {#each messages as msg}
      <ChatMessage {msg} bind:avatarFailed />
    {/each}

    {#if isLoading}
      <div class="flex gap-3">
        <div class="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
          <Bot class="w-3 h-3 text-cyan-500" />
        </div>
        <div class="bg-slate-900/60 p-3 rounded-lg">
          <div class="flex gap-1">
            <span class="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 0ms;"></span>
            <span class="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 150ms;"></span>
            <span class="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style="animation-delay: 300ms;"></span>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>