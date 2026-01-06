<!-- Minimal MD layout -->
<script>
  export let title;
  export let content;
</script>

<article class="prose prose-lg max-w-4xl mx-auto py-8 px-4">
  {#if title}
    <h1 class="text-3xl font-bold mb-4">{title}</h1>
  {/if}
  <slot />
</article>