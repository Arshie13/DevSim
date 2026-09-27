<script lang="ts">
  import { Check, Copy, FileCode2 } from "lucide-svelte";
  import type { CheatsheetSnippet } from "$types/cheatsheets";

  export let snippet: CheatsheetSnippet;

  let copied = false;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet.code);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2000);
    } catch {
      copied = false;
    }
  }
</script>

<div class="rounded-card border border-[var(--card-border)] bg-[var(--terminal-bg)] overflow-hidden">
  <div class="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--card-border)]">
    <div class="flex items-center gap-2 min-w-0">
      <span class="font-label text-xs uppercase tracking-wider text-[var(--text-muted)] truncate">
        {snippet.label}
      </span>
      {#if snippet.filename}
        <span class="tag-cyber tag-cyan inline-flex items-center gap-1.5 shrink-0">
          <FileCode2 size={11} />
          {snippet.filename}
        </span>
      {/if}
    </div>

    <button
      type="button"
      on:click={handleCopy}
      class="shrink-0 inline-flex items-center gap-1.5 font-heading text-xs uppercase tracking-widest transition-colors
        {copied ? 'text-obsidian-accent' : 'text-[var(--text-muted)] hover:text-obsidian-accent'}"
      aria-label={copied ? "Snippet copied" : "Copy snippet"}
    >
      {#if copied}
        <Check size={14} />
        <span>Copied</span>
      {:else}
        <Copy size={14} />
        <span>Copy</span>
      {/if}
    </button>
  </div>

  <!-- No whitespace between <pre> and <code>: it would render inside the block. -->
  <pre class="overflow-x-auto p-4 text-xs leading-relaxed"><code class="font-mono text-obsidian-text-primary">{snippet.code}</code></pre>

  {#if snippet.note}
    <p class="px-4 py-2.5 border-t border-[var(--card-border)] font-body text-xs text-[var(--text-muted)]">
      {snippet.note}
    </p>
  {/if}
</div>
