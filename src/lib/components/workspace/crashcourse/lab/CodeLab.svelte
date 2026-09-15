<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let code: string = "";
  export let feedback: string = "";
  export let isPassed: boolean = false;
  export let starterCode: string = "";
  export let editableRegions: Array<{
    placeholder: string;
    caseSensitive?: boolean;
  }> = [];

  const dispatch = createEventDispatcher<{ check: void }>();

  function isLockedMode(): boolean {
    return starterCode.length > 0 && editableRegions.length > 0;
  }

  type Segment =
    | { type: "locked"; text: string }
    | { type: "editable"; index: number };

  // Split the starter code into locked text + editable slots. Uses the same
  // first-occurrence semantics as labValidation.evaluateEditableRegionsLab so
  // the reconstructed `code` validates identically.
  function buildSegments(): Segment[] | null {
    let rest = starterCode;
    const result: Segment[] = [];
    for (let i = 0; i < editableRegions.length; i += 1) {
      const placeholder = editableRegions[i].placeholder;
      const at = rest.indexOf(placeholder);
      if (at === -1) return null;
      if (at > 0) result.push({ type: "locked", text: rest.slice(0, at) });
      result.push({ type: "editable", index: i });
      rest = rest.slice(at + placeholder.length);
    }
    if (rest) result.push({ type: "locked", text: rest });
    return result;
  }

  function compose(vals: string[]): string {
    if (!segments) return starterCode;
    return segments
      .map((s) => (s.type === "locked" ? s.text : vals[s.index] ?? ""))
      .join("");
  }

  // Editable values, seeded from the placeholders. Reset whenever the active
  // lab section (starter code / regions) changes.
  let segments: Segment[] | null = null;
  let values: string[] = [];
  let lockedKey = "";
  $: {
    const key = `${starterCode}::${editableRegions
      .map((r) => r.placeholder)
      .join("::")}`;
    if (isLockedMode() && key !== lockedKey) {
      lockedKey = key;
      segments = buildSegments();
      values = editableRegions.map((r) => r.placeholder);
      code = compose(values);
    }
  }

  function handleRegionInput(index: number, event: Event) {
    const target = event.currentTarget as HTMLTextAreaElement;
    // `bind:value` already wrote values[index]; reassign to refresh reactive
    // consumers (e.g. the .pristine class) and recompose the bound code.
    values = values;
    code = compose(values);
    autosize(target);
  }

  function autosize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    el.style.width = "0px";
    el.style.width = `${Math.max(el.scrollWidth, 18)}px`;
  }

  // svelte action: size the field to its content on mount.
  function autosizeAction(el: HTMLTextAreaElement) {
    autosize(el);
  }

  // Free-editing labs (e.g. function test-case labs) keep a plain textarea.
  function handleTextareaInput(event: Event) {
    code = (event.currentTarget as HTMLTextAreaElement).value;
  }

  function isPristine(index: number): boolean {
    return values[index] === editableRegions[index]?.placeholder;
  }
</script>

<div class="mini-editor">
  {#if isLockedMode() && segments}
    <p class="lab-hint">
      <span class="lab-hint-dot" aria-hidden="true"></span>
      Fill in the <strong>highlighted field{editableRegions.length > 1 ? "s" : ""}</strong> below. The surrounding code is locked.
    </p>
    {#key lockedKey}
      <pre class="locked-code" aria-label="Editable code lab">{#each segments as seg}{#if seg.type === "locked"}<span class="locked-text">{seg.text}</span>{:else}<textarea class="editable-field" class:pristine={isPristine(seg.index)} rows="1" wrap="off" spellcheck="false" aria-label={`Editable field ${seg.index + 1}`} title={`Editable field ${seg.index + 1} — replace this text`} bind:value={values[seg.index]} on:input={(e) => handleRegionInput(seg.index, e)} use:autosizeAction></textarea>{/if}{/each}</pre>
    {/key}
  {:else}
    <textarea class="free-editor" value={code} spellcheck="false" on:input={handleTextareaInput}></textarea>
    {#if isLockedMode()}
      <p class="structure-note">Structure lock enabled: edit only the target text region(s).</p>
    {/if}
  {/if}
  <div class="editor-actions">
    <button type="button" on:click={() => dispatch("check")}>Check</button>
    {#if feedback}
      <p class={`practice-feedback ${isPassed ? "pass" : "pending"}`}>{feedback}</p>
    {/if}
  </div>
</div>

<style>
  .mini-editor .free-editor {
    width: 100%;
    min-height: 180px;
    max-height: 180px;
    box-sizing: border-box;
    background: rgba(0, 0, 0, 0.38);
    border: 1px solid rgba(136, 146, 160, 0.38);
    color: #d7f5ff;
    padding: 0.55rem;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    resize: vertical;
  }

  .lab-hint {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0 0 0.4rem;
    color: #bfe9f6;
    font-family: var(--font-body);
    font-size: 0.74rem;
  }

  .lab-hint strong {
    color: #6fe3ff;
    font-weight: 600;
  }

  .lab-hint-dot {
    width: 0.62rem;
    height: 0.62rem;
    flex: none;
    border-radius: 2px;
    background: rgba(7, 165, 201, 0.32);
    border: 1px solid rgba(7, 165, 201, 0.85);
    box-shadow: 0 0 8px rgba(7, 165, 201, 0.55);
  }

  /* Locked editor: read-only code with highlighted editable fields. */
  .locked-code {
    width: 100%;
    min-height: 180px;
    max-height: 220px;
    overflow: auto;
    box-sizing: border-box;
    margin: 0;
    background: rgba(0, 0, 0, 0.38);
    border: 1px solid rgba(136, 146, 160, 0.38);
    color: #8ba2b3;
    padding: 0.55rem;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    line-height: 1.55;
    white-space: pre;
    tab-size: 2;
  }

  .locked-text {
    color: #8ba2b3;
    user-select: none;
  }

  .editable-field {
    display: inline-block;
    vertical-align: top;
    box-sizing: content-box;
    min-width: 2ch;
    height: auto;
    min-height: 0;
    max-height: none;
    margin: 0;
    padding: 0 0.2rem;
    background: rgba(125, 214, 236, 0.28);
    border: none;
    border-bottom: 1.5px solid #8fe3f6;
    border-radius: 2px 2px 0 0;
    color: #f3fdff;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    line-height: 1.55;
    white-space: pre;
    overflow: hidden;
    resize: none;
    caret-color: #aef3ff;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .editable-field:focus {
    outline: none;
    background: rgba(150, 224, 244, 0.42);
    border-bottom-color: #d4f7ff;
  }

  /* Untouched fields read as a fill-in-the-blank via a dashed underline. */
  .editable-field.pristine {
    background: rgba(125, 214, 236, 0.2);
    border-bottom-style: dashed;
    border-bottom-color: rgba(160, 232, 247, 0.9);
    color: #e6f9ff;
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
    font-family: var(--font-body);
    font-size: 0.72rem;
  }

  .editor-actions p {
    margin: 0;
    color: #d0d7dd;
    font-family: var(--font-body);
    font-size: 0.76rem;
  }

  .editor-actions button {
    border: 1px solid rgba(7, 165, 201, 0.45);
    background: rgba(7, 165, 201, 0.12);
    color: #dff8ff;
    padding: 0.34rem 0.52rem;
    font-family: var(--font-mono);
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
