<script lang="ts">
  import { Lightbulb } from "lucide-svelte";

  export let hints: string[] = [];
</script>

<div class="p-4 space-y-2">
  {#each hints as hint}
    <div
      class="flex items-start gap-2 p-3 bg-[#0a0e1a]/60 rounded-lg border border-[#27272a] shadow-[0_0_15px_rgba(7,165,201,0.03)]"
    >
      <Lightbulb class="w-4 h-4 text-[#07a5c9] flex-shrink-0 mt-0.5" />
      <p class="text-xs text-[#d0d7dd]/70 leading-relaxed">{hint}</p>
    </div>
  {/each}
</div>
