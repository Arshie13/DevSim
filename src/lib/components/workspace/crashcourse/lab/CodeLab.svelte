<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let code: string = "";
  export let feedback: string = "";
  export let isPassed: boolean = false;
  export let starterCode: string = "";
  export let editableRegions: Array<{
    placeholder: string;
    mustContain: string;
    caseSensitive?: boolean;
  }> = [];

  let textareaEl: HTMLTextAreaElement | null = null;
  let lastValidLockedCode = "";

  function isLockedMode(): boolean {
    return starterCode.length > 0 && editableRegions.length > 0;
  }

  function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function buildTemplate() {
    let template = starterCode;
    const tokens: string[] = [];

    for (let index = 0; index < editableRegions.length; index += 1) {
      const token = `__EDITABLE_REGION_${index}__`;
      const region = editableRegions[index];
      const replacement = template.replace(region.placeholder, token);
      if (replacement === template) {
        return null;
      }
      template = replacement;
      tokens.push(token);
    }

    return { template, tokens };
  }

  function extractEditableValues(content: string): string[] | null {
    const built = buildTemplate();
    if (!built) return null;

    let pattern = escapeRegExp(built.template);
    for (const token of built.tokens) {
      pattern = pattern.replace(escapeRegExp(token), "([\\s\\S]*?)");
    }

    const match = new RegExp(`^\\s*${pattern}\\s*$`).exec(content);
    if (!match) return null;
    return match.slice(1, editableRegions.length + 1);
  }

  function composeFromEditableValues(values: string[]): string {
    const built = buildTemplate();
    if (!built) return starterCode;

    let next = built.template;
    for (let index = 0; index < values.length; index += 1) {
      next = next.replace(`__EDITABLE_REGION_${index}__`, values[index] ?? "");
    }

    return next;
  }

  function enforceLockedStructure(nextValue: string) {
    const values = extractEditableValues(nextValue);

    if (!values) {
      code = lastValidLockedCode || starterCode;
      if (textareaEl) {
        textareaEl.value = code;
      }
      return;
    }

    const normalized = composeFromEditableValues(values);
    lastValidLockedCode = normalized;
    code = normalized;
    if (textareaEl && textareaEl.value !== normalized) {
      textareaEl.value = normalized;
    }
  }

  function handleInput(event: Event) {
    const target = event.currentTarget as HTMLTextAreaElement;
    const nextValue = target.value;

    if (!isLockedMode()) {
      code = nextValue;
      return;
    }

    enforceLockedStructure(nextValue);
  }

  $: if (!isLockedMode()) {
    lastValidLockedCode = code;
  }

  $: if (isLockedMode()) {
    const values = extractEditableValues(code);
    if (!values) {
      code = starterCode;
      lastValidLockedCode = starterCode;
    } else {
      const normalized = composeFromEditableValues(values);
      if (code !== normalized) {
        code = normalized;
      }
      lastValidLockedCode = normalized;
    }
  }

  const dispatch = createEventDispatcher<{ check: void }>();
</script>

<div class="mini-editor">
  <textarea bind:this={textareaEl} value={code} spellcheck="false" on:input={handleInput}></textarea>
  {#if isLockedMode()}
    <p class="structure-note">Structure lock enabled: edit only the target text region(s).</p>
  {/if}
  <div class="editor-actions">
    <button type="button" on:click={() => dispatch("check")}>Check</button>
    {#if feedback}
      <p class={`practice-feedback ${isPassed ? "pass" : "pending"}`}>{feedback}</p>
    {/if}
  </div>
</div>

<style>
  .mini-editor textarea {
    width: 100%;
    min-height: 180px;
    max-height: 180px;
    box-sizing: border-box;
    background: rgba(0, 0, 0, 0.38);
    border: 1px solid rgba(136, 146, 160, 0.38);
    color: #d7f5ff;
    padding: 0.55rem;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.72rem;
    resize: vertical;
  }

  .editor-actions {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .structure-note {
    margin: 0.35rem 0 0;
    color: #9db6c7;
    font-family: "Exo 2", sans-serif;
    font-size: 0.72rem;
  }

  .editor-actions p {
    margin: 0;
    color: #d0d7dd;
    font-family: "Exo 2", sans-serif;
    font-size: 0.76rem;
  }

  .editor-actions button {
    border: 1px solid rgba(7, 165, 201, 0.45);
    background: rgba(7, 165, 201, 0.12);
    color: #dff8ff;
    padding: 0.34rem 0.52rem;
    font-family: "Share Tech Mono", monospace;
    font-size: 0.68rem;
    cursor: pointer;
  }

  .practice-feedback.pass {
    color: #c9ffde;
  }

  .practice-feedback.pending {
    color: #ffdca8;
  }
</style>
