<script lang="ts">
  import { User, AlertTriangle, Bot } from 'lucide-svelte';
  import { AI_NAME, AI_AVATAR } from './constants';
  import { formatMessage } from '$lib/ai';
  import type { ChatMessage as Message } from './types';
  
  export let msg: Message;
  export let avatarFailed: boolean;
  
  $: isUser = msg.role === 'user';
  $: isWarning = msg.isWarning;
  
  $: containerClasses = isUser 
    ? 'flex-row-reverse' 
    : 'flex-row';
    
  $: bubbleClasses = (() => {
    let base = 'max-w-[85%] p-3 rounded-lg text-sm ';
    if (isUser) return base + 'bg-cyan-600/20 text-gray-100';
    if (isWarning) return base + 'bg-yellow-600/20 border border-yellow-600/50 text-yellow-200';
    return base + 'bg-slate-900/60 text-gray-300';
  })();
  
  $: iconClasses = (() => {
    let base = 'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ';
    if (isUser) return base + 'bg-cyan-500';
    if (isWarning) return base + 'bg-yellow-600';
    return base + 'bg-slate-700';
  })();
</script>

<div class="flex gap-3 {containerClasses}">
  <div class={iconClasses}>
    {#if isUser}
      <User class="w-3 h-3 text-white" />
    {:else if isWarning}
      <AlertTriangle class="w-3 h-3 text-white" />
    {:else}
      {#if avatarFailed}
        <div class="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
          SZ
        </div>
      {:else}
        <img 
          src={AI_AVATAR} 
          alt="{AI_NAME} avatar" 
          class="w-6 h-6 rounded-full object-cover"
          on:error={() => avatarFailed = true}
        />
      {/if}
    {/if}
  </div>
  
  <div class={bubbleClasses}>
    {@html formatMessage(msg.content)}
    
    {#if isUser && msg.attachedFiles && msg.attachedFiles.length > 0}
      <div class="mt-2 pt-2 border-t border-slate-700/50">
        <div class="text-xs text-gray-500 mb-1">📎 Attached files:</div>
        <div class="flex flex-wrap gap-1">
          {#each msg.attachedFiles as file}
            <div class="flex items-center gap-1 bg-slate-800/50 border border-zinc-700/50 rounded px-2 py-0.5 text-xs">
              <svg class="w-3 h-3 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span class="text-gray-400">{file.name}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>