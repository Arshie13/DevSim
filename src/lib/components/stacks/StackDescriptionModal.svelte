<script lang="ts">
  import type { StackSelection } from "$types";
  import { X, Sparkles, Loader } from "lucide-svelte";
  import {
    FRONTEND_OPTIONS,
    BACKEND_OPTIONS,
    DATABASE_OPTIONS,
    SERVICES_OPTIONS,
  } from "$mocks";

  export let show: boolean = false;
  export let selection: StackSelection;
  export let description: string = "";
  export let isLoading: boolean = false;
  export let onClose: () => void = () => {};

  function getOption(options: any[], id: string | null): any | null {
    if (!id) return null;
    return options.find((o) => o.id === id) || null;
  }

  $: frontendOption = getOption(FRONTEND_OPTIONS, selection.frontend);
  $: backendOption = getOption(BACKEND_OPTIONS, selection.backend);
  $: databaseOption = getOption(DATABASE_OPTIONS, selection.database);
  $: servicesOption = getOption(SERVICES_OPTIONS, selection.services);

  // ✅ Count tags
  $: tagCount = [
    frontendOption,
    backendOption,
    databaseOption,
    servicesOption
  ].filter(Boolean).length;

  // ✅ Force bigger tags - disable compact mode
  $: isCompact = false;

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
    }
  }
</script>

{#if show}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
  >
    <!-- Card -->
    <div
      class="relative w-full max-w-xl mx-4 flex flex-col"
      style="background:#12192a;border:1px solid rgba(7,165,201,0.25);border-radius:6px;padding:1.25rem;max-height:80vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 0 0 1px rgba(7,165,201,0.1),0 0 60px rgba(7,165,201,0.15),0 32px 80px rgba(0,0,0,0.6);"
    >
      <!-- Ambient glow -->
      <div
        class="absolute inset-x-0 top-0 h-px"
        style="background:linear-gradient(90deg,transparent,rgba(7,165,201,0.6),transparent);"
      ></div>

      <!-- Header -->
      <div class="flex items-start justify-between gap-3 mb-6 pb-4 border-b border-[rgba(7,165,201,0.15)] flex-shrink-0">
        <div>
          <h3 class="text-lg font-bold tracking-wide text-[#d0d7dd]" style="font-family:'Orbitron',monospace;">
            Your Stack Analysis
          </h3>
          <p class="text-sm text-[#8892a0] mt-1" style="font-family:'Rajdhani',sans-serif;">
            AI-powered insights about your technology combination
          </p>
        </div>

        <button
          on:click={onClose}
          class="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#8892a0] hover:text-[#ff3860] transition-colors rounded mt-1"
          style="background:rgba(40,55,80,0.5);"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- ✅ TAGS -->
      <div class="mb-6 flex-shrink-0">
        <div class="flex flex-nowrap justify-center gap-1">

          {#if frontendOption}
            <div class={`stack-preview-pill ${isCompact ? 'compact' : ''}`}>
              <span class="text-base">{frontendOption.icon}</span>
              <span class="pill-name">{frontendOption.name.split(' ')[0]}</span>
            </div>
          {/if}

          {#if backendOption}
            <div class={`stack-preview-pill ${isCompact ? 'compact' : ''}`}>
              <span class="text-base">{backendOption.icon}</span>
              <span class="pill-name">{backendOption.name.split(' ')[0]}</span>
            </div>
          {/if}

          {#if databaseOption}
            <div class={`stack-preview-pill ${isCompact ? 'compact' : ''}`}>
              <span class="text-base">{databaseOption.icon}</span>
              <span class="pill-name">{databaseOption.name.split(' ')[0]}</span>
            </div>
          {/if}

          {#if servicesOption}
            <div class={`stack-preview-pill ${isCompact ? 'compact' : ''}`}>
              <span class="text-base">{servicesOption.icon}</span>
              <span class="pill-name">{servicesOption.name.split(' ')[0]}</span>
            </div>
          {/if}

        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 mb-6 overflow-y-auto min-h-0">
        {#if isLoading}
          <div class="flex items-center justify-center py-12">
            <div class="flex items-center gap-3">
              <Loader class="w-6 h-6 animate-spin" style="color:#07a5c9;" />
              <span class="text-[#d0d7dd]" style="font-family:'Rajdhani',sans-serif;">
                Analyzing your stack combination...
              </span>
            </div>
          </div>

        {:else if description}
          <div class="prose prose-invert max-w-none">
            <div
              class="text-[#d0d7dd] leading-relaxed text-justify"
              style="font-family:'Rajdhani',sans-serif;font-size:0.95rem;line-height:1.6;"
            >
              {@html description.replace(/\n/g, '<br>')}
            </div>
          </div>

        {:else}
          <div class="text-center py-8">
            <p class="text-[#8892a0]" style="font-family:'Rajdhani',sans-serif;">
              Failed to generate description. Please try again.
            </p>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex flex-col items-center justify-center pt-4 border-t border-[rgba(7,165,201,0.15)] flex-shrink-0 gap-2">
        <p class="text-xs text-[#8892a0] italic text-center">
          AI-generated analysis may contain inaccuracies.
        </p>
        <button
          on:click={onClose}
          class="px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-[#8892a0] bg-transparent hover:text-[#d0d7dd] hover:bg-[rgba(7,165,201,0.08)] border border-[rgba(40,55,80,0.9)] hover:border-[rgba(7,165,201,0.3)] transition-all rounded"
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* ✅ Bigger, clean tags */
  .stack-preview-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;

    padding: 0.5rem 1rem;
    font-size: 1rem;

    background: rgba(7, 165, 201, 0.08);
    border: 1px solid rgba(7, 165, 201, 0.2);
    border-radius: 6px;

    font-family: 'Share Tech Mono', monospace;
    color: #d0d7dd;
  }

  /* ✅ Smaller when many */
  .stack-preview-pill.compact {
    padding: 0.35rem 0.7rem;
    font-size: 0.8rem;
  }

  .pill-name {
    font-weight: 600;
    white-space: nowrap;
  }

  .prose :global(p) {
    margin-bottom: 1rem;
  }

  .prose :global(p:last-child) {
    margin-bottom: 0;
  }
</style>