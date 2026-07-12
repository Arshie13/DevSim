<script lang="ts">
  import mark from "$assets/devsim-logo.svg";

  let {
    markClass = "w-9 h-9",
    textClass = "text-xl",
    subtitle = "",
    stacked = false,
  }: {
    /** Tailwind size classes for the D mark */
    markClass?: string;
    /** Tailwind text-size class for the DEVSIM wordmark */
    textClass?: string;
    /** Optional mono tagline under the wordmark */
    subtitle?: string;
    /** Stack the mark above the wordmark (e.g. auth pages) */
    stacked?: boolean;
  } = $props();
</script>

<!--
  Shared DevSim logo lockup: cyan "D" mark + gradient DEVSIM wordmark.
  Use this everywhere the brand appears so all pages stay uniform.
-->
<div class="flex items-center gap-2 {stacked ? 'flex-col' : ''}">
  <img src={mark} alt="" class="{markClass} object-contain select-none" />
  <div class={stacked ? "text-center" : ""}>
    <div class="logo-wordmark font-heading font-bold tracking-widest leading-none {textClass}">
      DEVSIM
    </div>
    {#if subtitle}
      <p class="font-label text-[0.6rem] text-[var(--text-muted)] uppercase tracking-widest mt-1">
        {subtitle}
      </p>
    {/if}
  </div>
</div>

<style>
  .logo-wordmark {
    background: linear-gradient(90deg, #fff 0%, var(--accent) 50%, var(--cyan-bright) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
</style>
