<script lang="ts">
  import { FileCode2, Info, Terminal } from "lucide-svelte";
  import CodeSnippet from "./CodeSnippet.svelte";
  import type {
    CheatsheetSnippet,
    CheatsheetTaskView,
    ResolvedSolutionFile,
  } from "$types/cheatsheets";

  export let task: CheatsheetTaskView;

  /**
   * Steps embed inline code in backticks (`pnpm install`). Split so those runs
   * can be styled as code without pulling in a markdown renderer.
   */
  function tokenize(step: string): { text: string; code: boolean }[] {
    return step
      .split("`")
      .map((text, index) => ({ text, code: index % 2 === 1 }))
      .filter((part) => part.text.length > 0);
  }

  /** Present a file-backed solution as a copy-pasteable snippet. */
  function fileSnippet(file: ResolvedSolutionFile): CheatsheetSnippet {
    return {
      label: file.action === "create" ? `Create ${file.filename}` : `Edit ${file.filename}`,
      language: file.language,
      filename: file.path,
      code: file.code,
      note: file.note,
    };
  }

  $: snippets = [...task.snippets, ...task.resolvedFiles.map(fileSnippet)];
</script>

<article
  id={`level-${task.level}-task-${task.task}`}
  class="card-cyber scroll-mt-24"
>
  <div class="card-cyber-body flex flex-col gap-4">
    <header>
      <span class="tag-cyber tag-cyan">Task {task.level}.{task.task}</span>
      <h3 class="text-lg font-heading font-semibold text-[var(--text-primary)] mt-2">
        {task.title}
      </h3>
      <p class="text-sm font-body text-[var(--text-muted)] mt-1">{task.summary}</p>
    </header>

    {#if task.targetFiles.length > 0}
      <div class="flex flex-wrap gap-2">
        {#each task.targetFiles as file}
          <span class="tag-cyber tag-purple inline-flex items-center gap-1.5">
            <FileCode2 size={11} />
            {file}
          </span>
        {/each}
      </div>
    {/if}

    {#if task.steps && task.steps.length > 0}
      <ol class="flex flex-col gap-2">
        {#each task.steps as step, index}
          <li class="flex gap-3 text-sm font-body text-obsidian-text-primary">
            <span
              class="shrink-0 w-5 h-5 rounded-chrome bg-obsidian-surface/60 border border-[var(--card-border)] flex items-center justify-center font-label text-xs text-obsidian-accent"
            >
              {index + 1}
            </span>
            <span>
              {#each tokenize(step) as part}
                {#if part.code}<code class="font-mono text-obsidian-accent">{part.text}</code>{:else}{part.text}{/if}
              {/each}
            </span>
          </li>
        {/each}
      </ol>
    {/if}

    {#if snippets.length > 0}
      <div class="flex flex-col gap-4">
        {#each snippets as snippet}
          <CodeSnippet {snippet} />
        {/each}
      </div>
    {/if}

    {#if task.notes && task.notes.length > 0}
      <div class="rounded-card border border-[rgb(var(--warn-rgb)/0.3)] bg-[rgb(var(--warn-rgb)/0.06)] p-4">
        <p class="flex items-center gap-2 font-label text-xs uppercase tracking-wider text-cyber-warn mb-2">
          <Info size={13} />
          Watch out for
        </p>
        <ul class="flex flex-col gap-1.5 list-disc list-outside pl-4">
          {#each task.notes as note}
            <li class="text-sm font-body text-obsidian-text-primary">{note}</li>
          {/each}
        </ul>
      </div>
    {/if}

    <footer class="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--card-border)]">
      <Terminal size={13} class="shrink-0 text-[var(--text-muted)]" />
      <span class="font-label text-xs text-[var(--text-muted)]">Graded by</span>
      <span class="font-label text-xs text-obsidian-text-primary">{task.testLabel}</span>
      <span class="font-mono text-xs text-[var(--text-muted)] break-all">{task.testPath}</span>
    </footer>
  </div>
</article>
