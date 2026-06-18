<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Clock } from 'lucide-svelte';
  
  export let endDate: string | Date;
  export let showIcon: boolean = true;
  export let compact: boolean = false;
  
  type TimeLeft = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  };
  
  let timeLeft: TimeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  };
  
  let intervalId: ReturnType<typeof setInterval>;
  
  function calculateTimeLeft(): TimeLeft {
    const difference = new Date(endDate).getTime() - Date.now();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false
    };
  }
  
  function updateTimer() {
    timeLeft = calculateTimeLeft();
  }
  
  onMount(() => {
    updateTimer();
    intervalId = setInterval(updateTimer, 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  });
  
  // Format number with leading zero
  function pad(num: number): string {
    return num.toString().padStart(2, '0');
  }
</script>

{#if timeLeft.expired}
  <div class="text-cyber-alert font-orbitron text-sm">
    Season Ended
  </div>
  {:else}
   <div class:flex={showIcon} class:items-center={showIcon} class:gap-2={showIcon} class="font-mono">
     {#if showIcon}
       <Clock class="w-4 h-4 text-obsidian-accent flex-shrink-0" />
     {/if}
     
     <div class:flex={!compact} class:gap-1={!compact} class:text-sm={!compact} class:text-base={!compact} class="text-obsidian-text-primary">
       <span class="font-semibold text-cyber-bright">{timeLeft.days}</span>
       <span class="text-obsidian-text-muted">{compact ? 'd' : 'days'}</span>
       <span class="text-obsidian-text-muted">:</span>
       <span class="font-semibold text-cyber-bright">{pad(timeLeft.hours)}</span>
       <span class="text-obsidian-text-muted">{compact ? 'h' : 'hrs'}</span>
       <span class="text-obsidian-text-muted">:</span>
       <span class="font-semibold text-cyber-bright">{pad(timeLeft.minutes)}</span>
       <span class="text-obsidian-text-muted">{compact ? 'm' : 'min'}</span>
       {#if !compact}
         <span class="text-obsidian-text-muted">:</span>
         <span class="font-semibold text-cyber-bright">{pad(timeLeft.seconds)}</span>
         <span class="text-obsidian-text-muted">sec</span>
       {/if}
     </div>
   </div>
 {/if}
