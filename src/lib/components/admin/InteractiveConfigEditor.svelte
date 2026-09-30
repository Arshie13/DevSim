<script lang="ts">
  import {
    INTERACTIVE_CONFIG_FIELDS,
    configFieldName,
    configValueToInput,
    type ConfigField,
    type InteractiveMode,
  } from "$lib/utils/interactive-config";

  /** Selected interactive mode. Empty string means "none" (plain text sections). */
  export let mode: InteractiveMode | '' | null = "";
  /** Existing config to prefill from (edit form). */
  export let config: Record<string, unknown> | null = null;
  export let disabled = false;

  const uid = `cfg${Math.random().toString(36).slice(2, 8)}`;

  const INPUT_CLASS =
    "w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-2 py-1 text-sm text-[var(--text-primary)] font-mono disabled:cursor-not-allowed disabled:opacity-40";
  const KEY_CELL_CLASS =
    "flex items-start rounded border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-2 py-1 text-xs font-mono text-[var(--accent)] break-all";
  const HINT_CLASS = "text-[0.6rem] font-mono text-[var(--text-muted)]";

  $: fields = mode ? INTERACTIVE_CONFIG_FIELDS[mode] ?? [] : [];
  $: source = (config ?? {}) as Record<string, unknown>;

  function fieldId(field: ConfigField): string {
    return `${uid}-${field.key}`;
  }
</script>

{#if fields.length > 0}
  <div class="col-span-2 space-y-1.5">
    <div class="flex items-center justify-between">
      <span class="text-xs text-[var(--text-muted)]">Interactive Config</span>
      <span class={HINT_CLASS}>interactive_config · {mode}</span>
    </div>

    {#each fields as field (field.key)}
      <div class="grid grid-cols-2 items-start gap-2">
        <label class={KEY_CELL_CLASS} for={fieldId(field)}>{field.key}</label>

        {#if field.kind === "text"}
          <input
            id={fieldId(field)}
            type="text"
            name={configFieldName(field.key, field.kind)}
            value={configValueToInput(source[field.key], field.kind)}
            placeholder={field.placeholder}
            class={INPUT_CLASS}
            {disabled}
          />
        {:else}
          <textarea
            id={fieldId(field)}
            name={configFieldName(field.key, field.kind)}
            rows={field.rows ?? 3}
            placeholder={field.placeholder}
            class={INPUT_CLASS}
            {disabled}
          >{configValueToInput(source[field.key], field.kind)}</textarea>
        {/if}
      </div>
    {/each}

    <p class={HINT_CLASS}>
      {#if mode === "TERMINAL_CD" || mode === "TERMINAL_CMD"}
        expected_commands: one command per line
      {:else if mode === "CODE_EDITOR"}
        hints: one per line · starter_code: raw source
      {/if}
    </p>
  </div>
{:else}
  <div class="col-span-2">
    <p class="text-xs italic text-[var(--text-muted)]">
      {disabled
        ? "Not applicable to plain text sections."
        : "Select an interactive mode to configure it."}
    </p>
  </div>
{/if}
