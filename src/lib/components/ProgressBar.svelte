<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let currentXp: number = 0;
  export let xpToNextLevel: number = 100;
  export let level: number = 1;
  export let showLabel: boolean = true;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let animated: boolean = true;
  
  const dispatch = createEventDispatcher();
  
  // Calculate percentage
  $: percentage = xpToNextLevel > 0 ? Math.min(100, Math.max(0, (currentXp / (currentXp + xpToNextLevel)) * 100)) : 100;
  
  // Size classes
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };
  
  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
</script>

<div class="w-full">
  {#if showLabel}
    <div class="flex justify-between items-center mb-1.5">
      <span class="text-obsidian-text-primary font-orbitron text-sm">
        Level {level}
      </span>
      <span class="text-obsidian-text-muted font-mono text-xs">
        {currentXp.toLocaleString()} / {(currentXp + xpToNextLevel).toLocaleString()} XP
      </span>
    </div>
  {/if}
  
  <div class="relative w-full bg-obsidian-surface rounded-full overflow-hidden border border-obsidian-accent/20 {sizeClasses[size]}">
    <!-- Progress fill with gradient and animation -->
    <div 
      class="absolute top-0 left-0 h-full bg-gradient-to-r from-cyber-bright to-obsidian-accent transition-all duration-500 ease-out"
      style="width: {percentage}%"
      class:animate-pulse={animated && percentage < 100}
    ></div>
    
    <!-- XP particles/shine effect on the progress edge -->
    {#if animated && percentage < 100}
      <div 
        class="absolute top-0 h-full w-1 bg-white/30 blur-[1px]"
        style="left: {percentage}%"
      ></div>
    {/if}
  </div>
</div>
